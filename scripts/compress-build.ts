import { writeFileSync } from "node:fs"
import { readdir } from "node:fs/promises"
import { brotliCompressSync, constants } from "node:zlib"

const DIRECTORIES = ["build/client/assets"]

const MIN_SIZE = 100 // bytes

main()
async function main() {
  for (const dir of DIRECTORIES) {
    await compressDirectory(dir)
  }
}

async function compressDirectory(directory: int) {
  const files = await readdir(directory, {
    recursive: true,
    withFileTypes: true,
  })
  for (const ent of files) {
    if (ent.isDirectory()) throw new Error("Unexpected directory")
    if (ent.name.endsWith(".js") || ent.name.endsWith(".css")) {
      const filePath = `${directory}/${ent.name}`
      const file = Bun.file(filePath)
      if (file.size < MIN_SIZE) {
        console.log("SKIP", filePath, file.size)
        continue
      }
      const destination = `${filePath}.br`
      const destinationFile = Bun.file(destination)
      if (await destinationFile.exists()) {
        console.log("SKIP", filePath, "already compressed")
        continue
      }
      const content = await file.arrayBuffer()
      const compressed = brotliCompressSync(content, {
        params: {
          [constants.BROTLI_PARAM_QUALITY]: 11, // Maximum compression level
        },
      })
      console.log("COMPRESSED", filePath, file.size, compressed.length)
      writeFileSync(destination, compressed)
    }
  }
}
