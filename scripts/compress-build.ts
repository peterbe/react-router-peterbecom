import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { brotliCompressSync, constants } from "node:zlib"

const DIRECTORIES = ["build/client/assets"]

const MIN_SIZE = 100 // bytes

main()
function main() {
  for (const dir of DIRECTORIES) {
    compressDirectory(dir)
  }
}

function compressDirectory(directory: string) {
  for (const ent of readdirSync(directory, { withFileTypes: true })) {
    if (ent.isDirectory()) {
      compressDirectory(`${directory}/${ent.name}`)
    } else if (ent.name.endsWith(".js") || ent.name.endsWith(".css")) {
      const filePath = `${directory}/${ent.name}`
      const content = readFileSync(filePath)
      if (content.length < MIN_SIZE) {
        console.log("SKIP", filePath, content.length)
        continue
      }
      const destination = `${filePath}.br`
      if (existsSync(destination)) {
        console.log("SKIP", filePath, "already compressed")
        continue
      }
      const compressed = brotliCompressSync(content, {
        params: {
          [constants.BROTLI_PARAM_QUALITY]: 11, // Maximum compression level
        },
      })
      console.log("COMPRESSED", filePath, content.length, compressed.length)
      writeFileSync(destination, compressed)
    }
  }
}
