import fs from "fs"
import path from "path"
import { directories, templateFiles, outputFiles, nodeDescriptorConfig } from "./config.mjs"

const nodeKeyPath = directories.nodeDescriptors

// Create the directory if it doesn't exist
if (!fs.existsSync(nodeKeyPath)) {
  console.log(`Creating directory: ${nodeKeyPath}`)
  fs.mkdirSync(nodeKeyPath, { recursive: true })
}

console.log("Reading node description template from file")
const node_desc_template = fs.readFileSync(templateFiles.nodeDescriptor)
const desc = JSON.parse(node_desc_template)

const today = new Date(new Date().setUTCHours(0, 0, 0, 0))

desc.nodeDescriptor.validityPeriod.notBefore = today.toISOString().split(".").shift() + "Z"
desc.nodeDescriptor.validityPeriod.notAfter = new Date(today.setMonth(today.getMonth() + 1)).toISOString().split(".").shift() + "Z"

desc.nodeDescriptor.nodeId = nodeDescriptorConfig.nodeId
desc.nodeDescriptor.permissions = nodeDescriptorConfig.permissions

fs.writeFileSync(path.join(nodeKeyPath, outputFiles.nodeDescriptor), JSON.stringify(desc))

console.log("Node descriptor saved")

/*
{
  "$schema": "https://schemas.golem.network/v1/node-descriptor.schema.json",
  "nodeDescriptor": {
    "nodeId": "0x338e02f29b63155beec8253af7ad367dd44b40c6",
    "validityPeriod": {
      "notBefore": "2023-01-01T00:00:00Z",
      "notAfter": "2025-01-01T00:00:00Z"
    },
    "permissions": {
      "urls": [
        "https://huggingface.cdn-lfs.huggingface.co.",
        "https://huggingface.co.",
        "https://cdn-lfs-us-1.huggingface.co."
      ]
    }
  }
}
*/
