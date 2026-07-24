# Contributing

## Architecture

```
apps/desktop/
├── src/                          # React frontend
│   ├── App.tsx                   # Root component, tab routing
│   ├── types.ts                  # Shared TypeScript types
│   ├── components/               # UI components
│   │   ├── save-editor/          # Save browser & editor views
│   │   ├── config-editor/        # Config file editor
│   │   └── settings/             # Settings page
│   └── stores/                   # Zustand stores
└── src-tauri/src/
    ├── main.rs / lib.rs          # Tauri entry point, plugin registration
    ├── commands/                 # IPC command handlers
    │   ├── profile.rs            # list_profiles, get_saves, delete_profile
    │   ├── save.rs               # load_save, edit_save, quick actions
    │   ├── config.rs             # list_configs, load_config, save_config
    │   └── manage.rs             # rename_save, clone_save, delete_save
    ├── core/                     # Domain logic
    │   ├── detection.rs          # Auto-detect game install paths (Win/Linux/Mac)
    │   ├── profile.rs            # Profile & save file discovery
    │   ├── profile_ops.rs        # Profile CRUD
    │   ├── backup.rs             # Timestamped file backups
    │   ├── compatibility.rs      # Game version parsing & compatibility check
    │   └── config_category.rs    # Config key categorization
    └── save_parser/              # SII/SCS file format handling
        ├── sii.rs                # SII document parsing and manipulation
        ├── editor.rs             # SaveEditor — high-level edit operations
        ├── compression.rs        # SCS compression/decompression
        └── config.rs             # Config file (.cfg) parser
```

The app follows a **layered architecture**:

1. **Frontend** (React + TypeScript) calls Tauri IPC commands via `invoke()`
2. **Commands** (Rust) receive requests, delegate to domain logic, return serialized results
3. **Core** (Rust) handles game detection, profiles, backups, version checking
4. **Parser** (Rust) reads/writes SII documents and config files, handles compression

## Stack

| Layer    | Tech                                              |
| -------- | ------------------------------------------------- |
| Frontend | React 19, TypeScript 7, TailwindCSS v4, shadcn/ui |
| Backend  | Rust, Tauri v2                                    |
| Build    | pnpm workspace, Vite, Cargo                       |
| Tooling  | oxlint/oxfmt, `tsc --noEmit`                      |

## Getting started

```bash
# Install dependencies
pnpm install

# Start the desktop dev server
pnpm dev
```

Both the Vite dev server (port 5173) and the Tauri Rust backend hot-reload. Make a change in either `src/` or `src-tauri/` and it recompiles.

## Code examples

### Calling a Rust command from the frontend

Every feature flows through Tauri's `invoke`. Adding a new command is three steps:

**1. Define the command in Rust** (`src-tauri/src/commands/`):

```rust
#[tauri::command]
pub fn refuel_all(game_sii_path: String) -> Result<EditResult, String> {
    let file_path = Path::new(&game_sii_path);
    let save_file = save_file_from_game_sii(&game_sii_path)?;

    let mut editor = SaveEditor::new(save_file);
    editor.load().map_err(|e| e.to_string())?;
    let changes = editor.refuel_all().map_err(|e| e.to_string())?;

    let (message, backup) = if changes.is_empty() {
        ("Everything already refueled.".into(), None)
    } else {
        let bp = backup_file(file_path).map_err(|e| e.to_string())?;
        editor.save().map_err(|e| e.to_string())?;
        (
            format!("Refueled (backup: {})", bp.display()),
            Some(bp.to_string_lossy().to_string()),
        )
    };

    Ok(EditResult { message, backup })
}
```

**2. Register the handler** (`src-tauri/src/lib.rs`):

```rust
.invoke_handler(tauri::generate_handler![
    // ... existing commands ...
    commands::save::refuel_all,
])
```

**3. Call it from TypeScript**:

```typescript
import { invoke } from "@tauri-apps/api/core";
import type { EditResult } from "../../types";

const result = await invoke<EditResult>("refuel_all", {
  gameSiiPath: "/path/to/game.sii",
});
```

### Editing a save programmatically

```rust
use crate::save_parser::editor::SaveEditor;
use crate::core::profile::SaveFile;

let save = SaveFile::new(profile_path, "autosave".into());
let mut editor = SaveEditor::new(save);
editor.load()?;

editor.edit_money(999_999)?;
editor.edit_xp(50_000)?;
editor.max_skills()?;
editor.repair_all()?;
editor.refuel_all()?;
editor.unlock_all_cities()?;

editor.save()?;
```

### Working with SII documents directly

```rust
use crate::save_parser::sii::SiiDocument;

let doc = SiiDocument::new(content);

let money = doc.get_property("money_account");
let trucks = doc.get_array_property("trucks");

doc.set_property("money_account", "500000")?;
doc.set_array_property("visited_cities", &cities)?;
```

### Manipulating config files

```rust
use crate::save_parser::config::ConfigDocument;

let doc = ConfigDocument::parse(file_content);

let entry = doc.get("r_scale_x");
let graphics = doc.get_by_category(Graphics);
let results = doc.search("traffic");

doc.set("g_traffic", "0");
let output = doc.to_string();
```

## Running tests

```bash
cargo test --workspace --all-features --locked
pnpm check-types
pnpm check
pnpm prepush
```

The Rust test suite includes golden-file integration tests in `src-tauri/tests/` that auto-bootstrap missing golden files on the first run.

## Project conventions

- **TypeScript**: `verbatimModuleSyntax` is on — always use `import type` for type-only imports.
- **Rust**: Clippy lints are strict (`unwrap_used`, `expect_used`, `todo`, `dbg_macro`, `print_stdout`, `print_stderr` all warn). Tests have relaxed rules via `.clippy.toml`.
- **Iteration order**: `cargo check` → `pnpm check-types` → `pnpm check` → `cargo test`.
- **Path aliases**: `@/*` → `apps/desktop/src/*`, `@ui/*` → `packages/ui/src/*`.
- **Package manager**: pnpm only. The catalog in `pnpm-workspace.yaml` pins shared dependencies.

## Pull request process

1. Fork the repo and create a feature branch.
2. Make your changes — frontend, backend, or both.
3. Run `pnpm prepush` (checks types, lints, formats, and runs tests).
4. Open a pull request.

Bug reports and feature requests welcome at [GitHub Issues](https://github.com/carlosedujs/ets-vibes/issues).
