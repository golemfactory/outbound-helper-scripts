import fs from "fs"
import canonicalize from "canonicalize"
import elliptic from "elliptic"
import path from "path"
import { directories, templateFiles, outputFiles, certConfig } from "./config.mjs"

// Update paths
const userKeyPath = path.join(directories.keys, 'user')
const nodeKeyPath = directories.nodeDescriptors

// Signature template
console.log("Reading signature template")
const signature_template = fs.readFileSync(templateFiles.signature)
const json_sign_template = JSON.parse(signature_template)

// Read user cert to attach
console.log("Reading user certificate from file")
const userCertificate = fs.readFileSync(path.join(directories.certificates.user, outputFiles.userCertSigned))
const Ucert = JSON.parse(userCertificate)

// Read node desc to sign
console.log("Reading node desc from file")
const nodeDesc = fs.readFileSync(path.join(nodeKeyPath, outputFiles.nodeDescriptor))
const desc = JSON.parse(nodeDesc)

let canonic_cert = canonicalize(desc.nodeDescriptor)

const encoder = new TextEncoder()
const desc_as_bytes = encoder.encode(canonic_cert)

// Sign by user
console.log("Reading user secret key from file")
let secret = JSON.parse(fs.readFileSync(path.join(userKeyPath, "user.key.json"))).key

// Create key pair from secret
const ec = elliptic.eddsa("ed25519")
var key = ec.keyFromSecret(secret)

// Sign
var signature = key.sign(desc_as_bytes).toHex()

// Verify signature
console.log("Signature verified 1: ", key.verify(desc_as_bytes, signature))

// Verify from user public key
let pub = JSON.parse(fs.readFileSync(path.join(userKeyPath, "user.pub.json"))).key
var key = ec.keyFromPublic(pub, "hex")

// Verify signature
console.log("Signature verified 2: ", key.verify(desc_as_bytes, signature))

// Verify by Attila's way
console.log("Signature verified 3: ", elliptic.eddsa("ed25519").verify(desc_as_bytes, signature, pub))

// Add signature value
json_sign_template.value = signature

// Add user cert as signer
json_sign_template.signer = Ucert

// Add signature to node desc
desc.signature = json_sign_template

fs.writeFileSync(path.join(nodeKeyPath, outputFiles.nodeDescriptorSigned), JSON.stringify(desc))

console.log("Signed node descriptor saved")