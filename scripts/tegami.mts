import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { tegami } from "tegami";
import { runCli } from "tegami/cli";
import { cargo } from "tegami/plugins/cargo";
import { github } from "tegami/plugins/github";

const tauriConfPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../apps/desktop/src-tauri/tauri.conf.json",
);

const cargoTomlPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../apps/desktop/src-tauri/Cargo.toml",
);

const syncTauriConf = {
  name: "sync-tauri-conf",
  applyDraft() {
    const cargoToml = readFileSync(cargoTomlPath, "utf-8");
    const version = cargoToml.match(/^version = "(.+)"/m);
    if (!version) return;
    const conf = JSON.parse(readFileSync(tauriConfPath, "utf-8"));
    conf.version = version[1];
    writeFileSync(tauriConfPath, `${JSON.stringify(conf, null, 2)}\n`);
  },
};

const paper = tegami({
  plugins: [
    cargo({
      updateLockFile: true,
    }),
    syncTauriConf,
    github({
      repo: "CarlosEduJs/ets-vibes",
      release: false,
      createTags: true,
      pushTags: true,
      versionPr: {
        base: "main",
      },
    }),
  ],
  groups: {
    app: {
      syncBump: true,
      syncGitTag: true,
    },
  },
  packages: {
    "ets-vibes": { group: "app" },
  },
});

await runCli(paper);
