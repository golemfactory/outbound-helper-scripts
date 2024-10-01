import fs from "fs"
import path from "path"

import { directories, templateFiles, outputFiles, certConfig } from "./config.mjs"

const rootCertPath = directories.certificates.root
const rootKeyPath = path.join(directories.keys, 'root')

// Create directories if they don't exist
fs.mkdirSync(rootCertPath, { recursive: true })
fs.mkdirSync(rootKeyPath, { recursive: true })

console.log("Reading certificate template from file")
const certificate_template = fs.readFileSync(templateFiles.certificate)
const cert = JSON.parse(certificate_template)

const today = new Date(new Date().setUTCHours(0, 0, 0, 0))

cert.certificate.validityPeriod.notBefore = today.toISOString().split(".").shift() + "Z"
cert.certificate.validityPeriod.notAfter =
    new Date(today.setMonth(today.getMonth() + certConfig.validityPeriod.root)).toISOString().split(".").shift() + "Z"

cert.certificate.keyUsage = certConfig.keyUsage.root
cert.certificate.permissions = certConfig.permissions.root
cert.certificate.subject = certConfig.subject.root

let data = fs.readFileSync(path.join(rootKeyPath, "root.pub.json"))
let pubkey = JSON.parse(data)

cert.certificate.publicKey = pubkey

fs.writeFileSync(path.join(rootCertPath, outputFiles.rootSelfCert), JSON.stringify(cert))

console.log("Certificate csr saved")
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
