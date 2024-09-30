import fs from "fs"

const rootKeyPath = "./root/"

const filename = "cert.template"
console.log("Reading certificate template from file")

const certificate_template = fs.readFileSync(filename)
const cert = JSON.parse(certificate_template)

const today = new Date(new Date().setUTCHours(0, 0, 0, 0))

cert.certificate.validityPeriod.notBefore = today.toISOString().split(".").shift() + "Z"
cert.certificate.validityPeriod.notAfter = new Date(today.setMonth(today.getMonth() + 3)).toISOString().split(".").shift() + "Z"

cert.certificate.keyUsage = "all"
cert.certificate.permissions = "all"
cert.certificate.subject = {
    displayName: "Crypd",
    contact: {
        email: "crypd@somedomain.com",
    },
}

let data = fs.readFileSync(rootKeyPath + "root.pub.json")
let pubkey = JSON.parse(data)

cert.certificate.publicKey = pubkey

fs.writeFileSync(rootKeyPath + "root_self_cert.json", JSON.stringify(cert))

console.log("Certificate crs saved")
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
