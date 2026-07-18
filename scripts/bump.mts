import { readFileSync, writeFileSync, readdirSync, renameSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(fileURLToPath(dirname(import.meta.url)), "..");
const cargo = resolve(root, "apps/desktop/src-tauri/Cargo.toml");
const tauri = resolve(root, "apps/desktop/src-tauri/tauri.conf.json");
const changelog = resolve(root, "CHANGELOG.md");
const notesDir = resolve(root, "release-notes");

function bumpSemver(current: string, kind: "major" | "minor" | "patch"): string {
  const [major = 0, minor = 0, patch = 0] = current.split(".").map(Number);
  if (kind === "major") return `${major + 1}.0.0`;
  if (kind === "minor") return `${major}.${ minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

const notes = readdirSync(notesDir).filter(f => f.endsWith(".md") && f !== "README.md");
if (notes.length === 0) {
  console.log("No release notes found in release-notes/"); // eslint-disable-line no-console 
  process.exit(0);
}

let highest: "major" | "minor" | "patch" | null = null;
const entries: string[] = [];
for (const file of notes) {
  const content = readFileSync(resolve(notesDir, file), "utf-8");
  const bumpMatch = content.match(/^---\n\s*bump:\s*(major|minor|patch)\s*\n---\n/);
  if (bumpMatch) {
    const b = bumpMatch[1] as "major" | "minor" | "patch";
    if (!highest || (b === "major") || (b === "minor" && highest !== "major") || (b === "patch" && highest === null)) {
      highest = b;
    }
  }
  const body = content.replace(/^---[\s\S]*?---\n/, "").trim();
  if (body) entries.push(body);
}

if (!highest) highest = "patch";

const cargoContent = readFileSync(cargo, "utf-8");
const currentVersion = cargoContent.match(/^version = "(.+)"/m)?.[1];
if (!currentVersion) { console.error("Could not read version from Cargo.toml"); process.exit(1); } // eslint-disable-line no-console

const newVersion = bumpSemver(currentVersion, highest);
const versionLine = `version = "${currentVersion}"`;

const updatedCargo = cargoContent.replace(versionLine, `version = "${newVersion}"`);
writeFileSync(cargo, updatedCargo);

const tauriConf = JSON.parse(readFileSync(tauri, "utf-8"));
tauriConf.version = newVersion;
writeFileSync(tauri, `${JSON.stringify(tauriConf, null, 2)}\n`);

const date = new Date().toISOString().slice(0, 10);
const changelogEntry = `\n## ets-vibes@${newVersion} (${date})\n\n${entries.join("\n\n")}\n`;
if (existsSync(changelog)) {
  const existing = readFileSync(changelog, "utf-8");
  writeFileSync(changelog, changelogEntry + existing);
} else {
  writeFileSync(changelog, `# Changelog\n${changelogEntry}`);
}

mkdirSync(resolve(notesDir, "processed"), { recursive: true });
for (const file of notes) {
  renameSync(resolve(notesDir, file), resolve(notesDir, "processed", file));
}

console.log(`Bumped ${currentVersion} → ${newVersion} (${highest})`); // eslint-disable-line no-console
