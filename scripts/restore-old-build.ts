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
    } else if (!fs.existsSync(destPath)) {
      // If it is a file, copy the file to the destination
      fs.copyFileSync(srcPath, destPath)
      const ageSeconds = (Date.now() - fs.statSync(srcPath).mtimeMs) / 1000
      console.log(
        "COPY",
        ljust(srcPath, 70),
        "-->",
        destPath,
        formatSeconds(ageSeconds),
        "old",
      )
    }
  })
}

function ljust(s: string, n: number) {
  return s + " ".repeat(n - s.length)
}

function deleteTempRoot(root: string) {
  if (fs.existsSync(root)) fs.rmSync(root, { recursive: true })
}

const ROOT = "/tmp/_old_build"
const DESTINATION = "build/client"

copyDirectory(ROOT, DESTINATION)

deleteTempRoot(ROOT)

function formatSeconds(seconds: number) {
  const minutes = seconds / 60
  const hours = minutes / 60
  const days = hours / 24
  const weeks = days / 7
  if (weeks > 1) return `${weeks.toFixed(1)} weeks`
  if (days > 1) return `${days.toFixed(1)} days`
  if (hours > 1) return `${hours.toFixed(1)} hours`
  if (minutes > 1) return `${minutes.toFixed(1)} minutes`
  return `${seconds.toFixed(0)} seconds`
}
