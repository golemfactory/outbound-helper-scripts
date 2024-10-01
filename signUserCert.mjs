import fs from "fs"
import canonicalize from "canonicalize"
import elliptic from "elliptic"
import path from "path"
import { directories, templateFiles, outputFiles } from "./config.mjs"

//signature template:

const signature_template = fs.readFileSync(templateFiles.signature)
const json_sign_template = JSON.parse(signature_template)

// read root cert to attach
console.log("Reading root certificate from file")

const rootCertPath = directories.certificates.root
const rootKeyPath = path.join(directories.keys, 'root')
const rootCertificate = fs.readFileSync(path.join(rootCertPath, outputFiles.rootSelfCertSigned))
const Rcert = JSON.parse(rootCertificate)

// read user cert to sign
console.log("Reading user csr from file")

const userCertPath = directories.certificates.user
const userKeyPath = path.join(directories.keys, 'user')
const userCertificate = fs.readFileSync(path.join(userCertPath, outputFiles.userCert))
const Ucert = JSON.parse(userCertificate)

let canonic_cert = canonicalize(Ucert.certificate)
const encoder = new TextEncoder()
const cert_as_bytes = encoder.encode(canonic_cert) // encode the string into bytes with UTF-8 encoding

// sign by root

// read secret
console.log("Reading secret from file")
let secret = JSON.parse(fs.readFileSync(path.join(rootKeyPath, "root.key.json"))).key

// Create key pair from secret
const ec = elliptic.eddsa("ed25519")
var key = ec.keyFromSecret(secret) // hex string, array or Buffer

// sign
var signature = key.sign(cert_as_bytes).toHex()

// Verify signature
console.log("Signature verified 1: ", key.verify(cert_as_bytes, signature))

//verify from root public key
let pub = JSON.parse(fs.readFileSync(path.join(rootKeyPath, "root.pub.json"))).key
var key = ec.keyFromPublic(pub, "hex")

// Verify signature
console.log("Signature verified 2: ", key.verify(cert_as_bytes, signature))

//verify by Attila'a way
console.log("Signature verified 3: ", elliptic.eddsa("ed25519").verify(cert_as_bytes, signature, pub))

// add signature to json structure
json_sign_template.value = signature

// add root cert as signer
json_sign_template.signer = Rcert

// add signature to cert
Ucert.signature = json_sign_template

fs.writeFileSync(path.join(userCertPath, outputFiles.userCertSigned), JSON.stringify(Ucert))