import fs from "fs";
import canonicalize from "canonicalize";
import elliptic from "elliptic";

const rootPath = "./root/";
const nodePath = "./node/";
const userPath = "./user/";
const intmPath = "./intm/";

// script will check if the user cert is valid to sign a descriptor or cert
// including the whole chain

// read object to be signed
const chileFile = "child_c.json";
console.log("Reading child from file");

const childData = fs.readFileSync(chileFile);
const child = JSON.parse(childData);

//console.log(child);

let childType = child.certificate
  ? "cert"
  : child.nodeDescriptor
  ? "desc"
  : "error";

if (childType == "error") throw "Input data must be cert or desc";

// input data: the content of the cert (dates of validity, permissions and usage: only for cert )
let inputdata = { type: childType };
if (childType == "desc") {
  // if desc extract dates and permission

  inputdata.beforeDate = child.nodeDescriptor.validityPeriod.notBefore;
  inputdata.afterDate = child.nodeDescriptor.validityPeriod.notAfter;
  inputdata.permission = child.nodeDescriptor.permissions;
}

if (childType == "cert") {
  // if cert add usage

  inputdata.beforeDate = child.certificate.validityPeriod.notBefore;
  inputdata.afterDate = child.certificate.validityPeriod.notAfter;
  inputdata.permission = child.certificate.permissions;
  inputdata.keyUsage = child.certificate.keyUsage;
}

//console.log(inputdata);

// read the cert to be used tosign the one above.

// cert structure
const certFileName = "test_cert_2.json";
console.log("Reading cert from file");

const certificate = fs.readFileSync(certFileName);
const cert = JSON.parse(certificate);
//console.log(cert);

const parseTimedateString = (str) => {
  let c = str.split(/\D+/);
  return new Date(Date.UTC(c[0], --c[1], c[2], c[3], c[4], c[5]));
};

const limitSpace = (allowedSpace, newGen) => {
  const outputSpace = [
    limitNotBeforeDate(allowedSpace[0], newGen[0]),
    limitNotAfterDate(allowedSpace[1], newGen[1]),
    limitkeyUsage(allowedSpace[2], newGen[2]),
    limitPermissions(allowedSpace[3], newGen[3]),
  ];

  return outputSpace;
};

const limitNotBeforeDate = (pDate, cDate) => {
  return parseTimedateString(pDate) > parseTimedateString(cDate)
    ? pDate
    : cDate;
};

const limitNotAfterDate = (pDate, cDate) => {
  return parseTimedateString(pDate) < parseTimedateString(cDate)
    ? pDate
    : cDate;
};

const validateUsage = (usage) => {
  //console.log("usage", usage);
  // unrestricted?
  if (usage == "all") {
    return true;
  }

  //usage us an array
  const hasUsageArray = usage && usage.length > 0 ? true : false;
  //console.log(hasUsageArray);
  // [ "signCertificate", "signManifest", "signNode" ]

  const u = ["signCertificate", "signManifest", "signNode"];

  // will exit false if error is found
  if (hasUsageArray) {
    for (const elem of usage) {
      const check = u.includes(elem);
      //console.log(elem, check);
      if (!check) {
        console.log(elem, "is not valid usage");
        return false;
      }
    }
  }

  return hasUsageArray;
};

const validatePermissions = (perm) => {
  //console.log("perm", perm);
  // all?
  if (perm == "all") {
    return true;
  }

  // outbound.unrestricted?
  if (perm.outbound == "unrestricted") {
    return true;
  }

  // urls = array
  const hasUrlsArray =
    perm.urls && perm.urls.constructor === Array && perm.urls.length > 0
      ? true
      : false;
  //console.log(hasUrlsArray);
  // all https/http

  const hs = "https://";
  const h_ = "http://";

  // will exit false if error is fnid
  if (hasUrlsArray) {
    for (const url of perm.urls) {
      const check =
        url.slice(0, 8) == hs || url.slice(0, 7) == h_ ? true : false;
      //console.log(url, check);
      if (!check) {
        console.log(url, "is not valid");
        return false;
      }
    }
  }

  return hasUrlsArray;
};

const limitkeyUsage = (pUsage, cUsage) => {
  const validusage = validateUsage(pUsage) && validateUsage(cUsage);
  if (!validusage) throw "Check Usage!";

  // if previous usage is all, new usage is ok
  if (pUsage == "all") return cUsage;

  // if previous was limited and contained signCert , new usage is ok
  if (pUsage.includes("signCertificate")) return cUsage;
  let errMsg =
    `Cert usage path is broken: parent:` + pUsage + "child " + cUsage;
  throw errMsg;
};

const limitPermissions = (pPerm, cPerm) => {
  // note: only outbound perm checked in this version

  const validPermission =
    validatePermissions(pPerm) && validatePermissions(cPerm);
  if (!validatePermissions) throw "Check Permissions!";

  // if parent permission in all, new perm is ok
  if (pPerm == "all") return cPerm;

  // if parent permission outbound.unrestricted, new perm is ok
  if (pPerm.outbound == "unrestricted") return cPerm;

  // if parent perm is a list, each url of new must be in parent
  if (cPerm.outbound == "unrestricted")
    throw "Child permission broader than parrent's!";

  //console.log("cPerm before loop", pPerm, cPerm);
  for (const url of cPerm.outbound.urls) {
    let msg = `Parent perm does not include ` + url;
    if (!pPerm.outbound.urls.includes(url)) throw msg;
  }

  return cPerm;
};

const validateSignature = (doc) => {
  const cert = doc.certificate;
  const key =
    doc.signature.signer == "self"
      ? doc.certificate.publicKey.key
      : doc.signature.signer.certificate.publicKey.key;
  const signature = doc.signature.value;

  console.log(cert, key, signature);
  let canonic_cert = canonicalize(cert);
  const encoder = new TextEncoder();
  const cert_as_bytes = encoder.encode(canonic_cert);
  let output = elliptic.eddsa("ed25519").verify(cert_as_bytes, signature, key);

  if (!output) throw "Signature invalid!";

  return output;
};

// get the max boundaries of the certificate
const getSpace = (doc) => {
  let space = [
    doc.certificate.validityPeriod.notBefore,
    doc.certificate.validityPeriod.notAfter,
    doc.certificate.keyUsage,
    doc.certificate.permissions,
  ];

  return space;
};

// traverce cert goes through the signing cert to establish the what can be signed
const traverseCert = (doc) => {
  //console.log(doc.certificate);
  if (doc.signature && doc.signature.signer) {
    if (doc.signature.signer == "self") {
      // root level reached
      //console.log("do the level checks");
      let allowedSpace = getSpace(doc); // check what the root cert could do.
      validateSignature(doc); // check if it was correctly signed
      return Array.from(allowedSpace);
    } else {
      // this is not the root, need to go level down
      //console.log("do the lower level");
      const data = traverseCert(doc.signature.signer);
      let requestedSpace = getSpace(doc);
      let allowedSpace = limitSpace(data, requestedSpace);
      validateSignature(doc);
      return allowedSpace;
    }
  }
};

const signingCertData = traverseCert(cert);

const parentdata = {
  beforeDate: signingCertData[0],
  afterDate: signingCertData[1],
  keyUsage: signingCertData[2],
  permission: signingCertData[3],
};
//console.log("c", signingCertData);

//console.log("i", inputdata);

console.log(
  "--------------------------------------------------------------------------------"
);

if (inputdata.type == "desc") {
  console.log(
    inputdata.beforeDate ==
      limitNotBeforeDate(parentdata.beforeDate, inputdata.beforeDate),
    parentdata.beforeDate,
    inputdata.beforeDate
  );
  console.log(
    inputdata.afterDate ==
      limitNotAfterDate(parentdata.afterDate, inputdata.afterDate),
    parentdata.afterDate,
    inputdata.afterDate
  );
  console.log(
    inputdata.permission ==
      limitPermissions(parentdata.permission, inputdata.permission),
    parentdata.permission,
    inputdata.permission
  );
  console.log(parentdata.keyUsage.includes("signNode"), parentdata.keyUsage);
}

if (inputdata.type == "cert") {
  console.log("checkng cert");
  console.log(
    inputdata.beforeDate ==
      limitNotBeforeDate(parentdata.beforeDate, inputdata.beforeDate),
    parentdata.beforeDate,
    inputdata.beforeDate
  );
  console.log(
    inputdata.afterDate ==
      limitNotAfterDate(parentdata.afterDate, inputdata.afterDate),
    parentdata.afterDate,
    inputdata.afterDate
  );
  console.log(
    inputdata.permission ==
      limitPermissions(parentdata.permission, inputdata.permission),
    parentdata.permission,
    inputdata.permission
  );
  console.log(
    parentdata.keyUsage.includes("signCertificate"),
    parentdata.keyUsage
  );
  console.log(
    inputdata.keyUsage ==
      limitkeyUsage(parentdata.keyUsage, inputdata.keyUsage),
    parentdata.keyUsage,
    inputdata.keyUsage
  );
}

if (inputdata.type == "desc")
  console.log(
    "Checking desc: ",
    inputdata.beforeDate ==
      limitNotBeforeDate(parentdata.beforeDate, inputdata.beforeDate) &&
      inputdata.afterDate ==
        limitNotAfterDate(parentdata.afterDate, inputdata.afterDate) &&
      inputdata.permission ==
        limitPermissions(parentdata.permission, inputdata.permission) &&
      parentdata.keyUsage.includes("signNode")
  );

if (inputdata.type == "cert")
  console.log(
    "Checking cert: ",
    inputdata.beforeDate ==
      limitNotBeforeDate(parentdata.beforeDate, inputdata.beforeDate) &&
      inputdata.afterDate ==
        limitNotAfterDate(parentdata.afterDate, inputdata.afterDate) &&
      inputdata.permission ==
        limitPermissions(parentdata.permission, inputdata.permission) &&
      parentdata.keyUsage.includes("signCertificate") &&
      inputdata.keyUsage ==
        limitkeyUsage(parentdata.keyUsage, inputdata.keyUsage)
  );
