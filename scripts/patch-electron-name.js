const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

if (process.platform !== 'darwin') process.exit(0)

const electronDir = path.join(__dirname, '../node_modules/electron')
const distDir = path.join(electronDir, 'dist')
const oldAppPath = path.join(distDir, 'Electron.app')
const newAppPath = path.join(distDir, 'Axon.app')

if (!fs.existsSync(oldAppPath) && !fs.existsSync(newAppPath)) process.exit(0)

// Rename Electron.app → Axon.app
if (fs.existsSync(oldAppPath) && !fs.existsSync(newAppPath)) {
  fs.renameSync(oldAppPath, newAppPath)
}

const appPath = newAppPath

// Patch Info.plist
const plistPath = path.join(appPath, 'Contents/Info.plist')
let plist = fs.readFileSync(plistPath, 'utf8')

plist = plist.replace(
  /<key>CFBundleDisplayName<\/key>\s*<string>[^<]*<\/string>/,
  '<key>CFBundleDisplayName</key>\n\t<string>Axon</string>'
)
plist = plist.replace(
  /<key>CFBundleName<\/key>\s*<string>[^<]*<\/string>/,
  '<key>CFBundleName</key>\n\t<string>Axon</string>'
)

fs.writeFileSync(plistPath, plist)

// Update path.txt so electron module can find the executable
const pathTxtFile = path.join(electronDir, 'path.txt')
fs.writeFileSync(pathTxtFile, 'Axon.app/Contents/MacOS/Electron')

// Re-register with Launch Services
try {
  execSync(`/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f "${appPath}"`)
} catch (e) {}

console.log('Patched: Electron.app → Axon.app, name updated, path.txt fixed')
