import fs from "fs"
import canonicalize from "canonicalize"
import elliptic from "elliptic"
import path from "path"
import { directories, templateFiles, outputFiles } from "./config.mjs"

const rootCertPath = directories.certificates.root
const rootKeyPath = path.join(directories.keys, 'root')

//signature template:

const signature_template = fs.readFileSync(templateFiles.signature)
const json_sign_template = JSON.parse(signature_template)

console.log("Reading certificate CSR from file")
const rootCertificateCSR = fs.readFileSync(path.join(rootCertPath, outputFiles.rootSelfCert))
const cert = JSON.parse(rootCertificateCSR)

let canonic_cert = canonicalize(cert.certificate)

const encoder = new TextEncoder()
const cert_as_bytes = encoder.encode(canonic_cert) // encode the string into bytes with UTF-8 encoding

// read secret
console.log("Reading secret from file")
let secret = JSON.parse(fs.readFileSync(path.join(rootKeyPath, "root.key.json"))).key

// Create key pair from secret
const ec = elliptic.eddsa("ed25519")
var key = ec.keyFromSecret(secret) // hex string, array or Buffer

// Sign the certs
var signature = key.sign(cert_as_bytes).toHex()

// Verify signature
console.log("Signature verified 1: ", key.verify(cert_as_bytes, signature))

//verify from public key
let pub = JSON.parse(fs.readFileSync(path.join(rootKeyPath, "root.pub.json"))).key
var key = ec.keyFromPublic(pub, "hex")

// Verify signature
console.log("Signature verified 2: ", key.verify(cert_as_bytes, signature))

//verify by Attila'a way
console.log("Signature verified 3: ", elliptic.eddsa("ed25519").verify(cert_as_bytes, signature, pub))

// add signature to json structure and cert
json_sign_template.value = signature
cert.signature = json_sign_template

fs.writeFileSync(path.join(rootCertPath, outputFiles.rootSelfCertSigned), JSON.stringify(cert))

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
  },
  "signature": {
    "algorithm": {
      "hash": "sha512",
      "encryption": "EdDSA"
    },
    "value": "b9b2d783d4dc7f6b139a74c01ef6340aeed19dc0e3fd117eefe7fe109f8686da9ec2b942cb18c7d3c705c9d28f6e13b579903b6f3c1595dbe5ce24da3501bc0e",
    "signer": "self"
  }
}
*/