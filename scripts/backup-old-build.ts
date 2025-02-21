import fs from "node:fs"
import path from "node:path"

function copyDirectory(src: string, dest: string) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest)
  }

  // Read the contents of the source directory
  const files = fs.readdirSync(src)

  // Iterate through each file in the source directory
  files.forEach((file) => {
    const srcPath = path.join(src, file)
    const destPath = path.join(dest, file)

    // Check if the current item is a directory
    if (fs.statSync(srcPath).isDirectory()) {
      // If it is a directory, recursively copy its contents
      copyDirectory(srcPath, destPath)
    } else {
      // If it is a file, copy the file to the destination
      fs.copyFileSync(srcPath, destPath)
      console.log("COPY", ljust(srcPath, 70), "-->", destPath)
    }
  })
}

function ljust(s: string, n: number) {
  return s + " ".repeat(n - s.length)
}

const ROOT = "build/client"
const DESTINATION = "/tmp/_old_build"
if (fs.existsSync(DESTINATION)) fs.rmdirSync(DESTINATION, { recursive: true })

copyDirectory(ROOT, DESTINATION)
