import fs from "fs"
import path from "path"
import { directories, templateFiles, outputFiles, certConfig } from "./config.mjs"

const userCertPath = directories.certificates.user
const userKeyPath = path.join(directories.keys, 'user')

// Create directories if they don't exist
fs.mkdirSync(userCertPath, { recursive: true })
fs.mkdirSync(userKeyPath, { recursive: true })

console.log("Reading certificate from file")
const certificate_template = fs.readFileSync(templateFiles.certificate)
const cert = JSON.parse(certificate_template)

const today = new Date(new Date().setUTCHours(0, 0, 0, 0))

cert.certificate.validityPeriod.notBefore = today.toISOString().split(".").shift() + "Z"
cert.certificate.validityPeriod.notAfter =
    new Date(today.setMonth(today.getMonth() + certConfig.validityPeriod.user)).toISOString().split(".").shift() + "Z"

cert.certificate.keyUsage = certConfig.keyUsage.user
cert.certificate.permissions = certConfig.permissions.user
cert.certificate.subject = certConfig.subject.user

let data = fs.readFileSync(path.join(userKeyPath, "user.pub.json"))
let pubkey = JSON.parse(data)

cert.certificate.publicKey = pubkey

fs.writeFileSync(path.join(userCertPath, outputFiles.userCert), JSON.stringify(cert))

console.log("User certificate csr saved")