import { tegami } from "tegami";
import { runCli } from "tegami/cli";
import { cargo } from "tegami/plugins/cargo";
import { github } from "tegami/plugins/github";

const paper = tegami({
  plugins: [
    cargo({
      updateLockFile: true,
    }),
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
