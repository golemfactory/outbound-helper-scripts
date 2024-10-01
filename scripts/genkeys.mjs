import crypto from "crypto"
import fs from "fs"
import path from "path"
import { directories, templateFiles } from "./config.mjs"

const keyTypes = ['root', 'intermediate', 'user']

const key_template = fs.readFileSync(templateFiles.key)
const json_key_template = JSON.parse(key_template)

keyTypes.forEach(keyType => {
    const keyPair = crypto.generateKeyPairSync("ed25519", {
        privateKeyEncoding: { format: "der", type: "pkcs8" },
        publicKeyEncoding: { format: "der", type: "spki" },
    })

    const keyPath = path.join(directories.keys, keyType)
    fs.mkdirSync(keyPath, { recursive: true })

    json_key_template.key = keyPair.publicKey.toString("hex").slice(-64)
    fs.writeFileSync(path.join(keyPath, `${keyType}.pub.json`), JSON.stringify(json_key_template))

    json_key_template.key = keyPair.privateKey.toString("hex").slice(-64)
    fs.writeFileSync(path.join(keyPath, `${keyType}.key.json`), JSON.stringify(json_key_template))

    console.log(`Generated ${keyType} key pair`)
})
