import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(fileURLToPath(dirname(import.meta.url)), "..");
const ico = resolve(root, "apps/desktop/src-tauri/icons/icon.ico");
const png = resolve(root, "apps/desktop/src-tauri/icons/icon.png");

execSync(`magick "${png}" -define icon:auto-resize=16,24,32,48,64,128,256 "${ico}"`, {
  stdio: "inherit",
});

console.log("Generated icon.ico"); // eslint-disable-line no-console
