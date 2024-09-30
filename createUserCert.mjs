import fs from "fs";

const userKeyPath = "./user/";

const filename = "cert.template";
console.log("Reading certificate from file");

const certificate_template = fs.readFileSync(filename);
const cert = JSON.parse(certificate_template);

const today = new Date(new Date().setUTCHours(0, 0, 0, 0));

cert.certificate.validityPeriod.notBefore =
  today.toISOString().split(".").shift() + "Z";
cert.certificate.validityPeriod.notAfter =
  new Date(today.setMonth(today.getMonth() + 2))
    .toISOString()
    .split(".")
    .shift() + "Z";

cert.certificate.keyUsage = ["signNode"];

cert.certificate.permissions = {
  outbound: {
    urls: ["https://www.gazeta.pl", "https://ipfs.io"],
  },
};
cert.certificate.subject = {
  displayName: "Jackla User",
  contact: {
    email: "jacek@golem.network",
  },
};

let data = fs.readFileSync(userKeyPath + "user.pub.json");
let pubkey = JSON.parse(data);

cert.certificate.publicKey = pubkey;

fs.writeFileSync(userKeyPath + "user_cert.json", JSON.stringify(cert));

console.log("User certificate crs saved");

/*
{
  "$schema": "https://schemas.golem.network/v1/certificate.schema.json",
  "certificate": {
    "validityPeriod": {
      "notBefore": "2023-01-01T00:00:00Z",
      "notAfter": "2025-01-01T00:00:00Z"
    },
    "keyUsage": [
      "signNode"
    ],
    "permissions": {
      "outbound": "unrestricted"
    },
    "subject": {
      "displayName": "Example leaf cert",
      "contact": {
        "email": "example@leaf.tld"
      }
    },
    "publicKey": {
      "algorithm": "EdDSA",
      "key": "c6cd286a2474d13ffc8dcd417a446df461751a78dec46d039603ca53a373ac52",
      "parameters": {
        "scheme": "Ed25519"
      }
    }
  }
}
*/
