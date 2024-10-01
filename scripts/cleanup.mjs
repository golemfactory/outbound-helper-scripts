import fs from "fs/promises"
import path from "path"
import { directories, outputFiles } from "./config.mjs"

async function removeDirectory(dir) {
    try {
        await fs.rm(dir, { recursive: true, force: true })
        console.log(`Removed directory: ${dir}`)
    } catch (error) {
        console.error(`Error removing directory ${dir}:`, error)
    }
}

async function cleanup() {
    // Remove directories
    await removeDirectory(directories.keys)
    await removeDirectory(directories.certificates.root)
    await removeDirectory(directories.certificates.user)
    await removeDirectory(directories.certificates.intermediate)
    await removeDirectory(directories.certificatesDir)
    await removeDirectory(directories.nodeDescriptors)

    // Remove output files from the base directory
    const baseDir = path.dirname(directories.keys)
    for (const file of Object.values(outputFiles)) {
        try {
            await fs.unlink(path.join(baseDir, file))
            console.log(`Removed file: ${file}`)
        } catch (error) {
            if (error.code !== "ENOENT") {
                console.error(`Error removing file ${file}:`, error)
            }
        }
    }

    console.log("Cleanup completed.")
}

cleanup()
