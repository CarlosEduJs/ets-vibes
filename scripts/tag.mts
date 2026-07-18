import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { execSync } from "node:child_process";

const root = resolve(fileURLToPath(dirname(import.meta.url)), "..");
const cargo = resolve(root, "apps/desktop/src-tauri/Cargo.toml");
const cargoContent = readFileSync(cargo, "utf-8");
const version = cargoContent.match(/^version = "(.+)"/m)?.[1];
if (!version) { console.error("Could not read version from Cargo.toml"); process.exit(1); } // eslint-disable-line no-console

execSync(`git tag v${version}`, { stdio: "inherit" });
execSync(`git push origin v${version}`, { stdio: "inherit" });
console.log(`Tagged and pushed v${version}`); // eslint-disable-line no-console
