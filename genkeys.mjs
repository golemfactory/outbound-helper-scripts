import crypto from "crypto";
import fs from "fs";

const rootKeyPath = "./root/";
const intmKeyPath = "./intm/";
const userKeyPath = "./user/";

const key_template = fs.readFileSync("./" + "key.template");
const json_key_template = JSON.parse(key_template);

// Generate root cert key pair

const root_keypair = crypto.generateKeyPairSync("ed25519", {
  privateKeyEncoding: { format: "der", type: "pkcs8" },
  publicKeyEncoding: { format: "der", type: "spki" },
});

json_key_template.key = root_keypair.publicKey.toString("hex").slice(-64);
fs.writeFileSync(
  rootKeyPath + "root.pub.json",
  JSON.stringify(json_key_template)
);

json_key_template.key = root_keypair.privateKey.toString("hex").slice(-64);
fs.writeFileSync(
  rootKeyPath + "root.key.json",
  JSON.stringify(json_key_template)
);

// intermediate key

const intm_keypair = crypto.generateKeyPairSync("ed25519", {
  privateKeyEncoding: { format: "der", type: "pkcs8" },
  publicKeyEncoding: { format: "der", type: "spki" },
});

json_key_template.key = intm_keypair.publicKey.toString("hex").slice(-64);
fs.writeFileSync(
  intmKeyPath + "intm.pub.json",
  JSON.stringify(json_key_template)
);

json_key_template.key = intm_keypair.privateKey.toString("hex").slice(-64);
fs.writeFileSync(
  intmKeyPath + "intm.key.json",
  JSON.stringify(json_key_template)
);

// user key
const user_keypair = crypto.generateKeyPairSync("ed25519", {
  privateKeyEncoding: { format: "der", type: "pkcs8" },
  publicKeyEncoding: { format: "der", type: "spki" },
});

json_key_template.key = user_keypair.publicKey.toString("hex").slice(-64);
fs.writeFileSync(
  userKeyPath + "user.pub.json",
  JSON.stringify(json_key_template)
);

json_key_template.key = user_keypair.privateKey.toString("hex").slice(-64);
fs.writeFileSync(
  userKeyPath + "user.key.json",
  JSON.stringify(json_key_template)
);
