import fs from "fs";
import canonicalize from "canonicalize";
import elliptic from "elliptic";

const userKeyPath = "./jackla_test/";
const nodeKeyPath = "./node/";

//signature template:

const signature_template = fs.readFileSync("signature.template");
const json_sign_template = JSON.parse(signature_template);

// read user cert to attach
console.log("Reading user certificate from file");

const userCertificate = fs.readFileSync(userKeyPath + "user_cert.signed.json");
const Ucert = JSON.parse(userCertificate);

// read node desc to sign
console.log("Reading node desc from file");

const nodeDesc = fs.readFileSync(nodeKeyPath + "node_desc.json");
const desc = JSON.parse(nodeDesc);

let canonic_cert = canonicalize(desc.nodeDescriptor);

const encoder = new TextEncoder();
const desc_as_bytes = encoder.encode(canonic_cert); // encode the string into bytes with UTF-8 encoding

// sign by user

// read secret
console.log("Reading secret from file");
let secret = JSON.parse(fs.readFileSync(userKeyPath + "user.key.json")).key;

// Create key pair from secret
const ec = elliptic.eddsa("ed25519");
var key = ec.keyFromSecret(secret); // hex string, array or Buffer

// sign
var signature = key.sign(desc_as_bytes).toHex();

// Verify signature
console.log("Signature verified 1: ", key.verify(desc_as_bytes, signature));

//verify from user public key
let pub = JSON.parse(fs.readFileSync(userKeyPath + "user.pub.json")).key;
var key = ec.keyFromPublic(pub, "hex");

// Verify signature
console.log("Signature verified 2: ", key.verify(desc_as_bytes, signature));

//verify by Attila'a way
console.log(
  "Signature verified 3: ",
  elliptic.eddsa("ed25519").verify(desc_as_bytes, signature, pub)
);

// add signature value

json_sign_template.value = signature;

// add user cert as signer
json_sign_template.signer = Ucert;

// add signature to node desc
desc.signature = json_sign_template;

fs.writeFileSync(nodeKeyPath + "node_desc.signed.json", JSON.stringify(desc));

/*

          "signature": {
            "algorithm": {
              "hash": "sha512",
              "encryption": "EdDSA"
            },
            "value": "b9b2d783d4dc7f6b139a74c01ef6340aeed19dc0e3fd117eefe7fe109f8686da9ec2b942cb18c7d3c705c9d28f6e13b579903b6f3c1595dbe5ce24da3501bc0e",
            "signer": "self"
          }
*/
