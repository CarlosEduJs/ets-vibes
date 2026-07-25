# Changelog

## ets-vibes@0.3.0 (2026-07-25)

### Modernized UI & Streamlined Navigation

- **Modern UI**: Completely modernized the user interface with rich glassmorphism backdrop blurs (`backdrop-blur-2xl`), deep dark mode contrast, clean typography, and aligned headers across the sidebar and main views.
- **Streamlined Single-View User Flow**: Replaced the legacy multi-step navigation flow (Profiles Grid → Saves List → Save Editor) with a unified, instant single-view workflow. Users no longer need to step back and forth between screens; profiles and saves are expanded inline in the sidebar, and clicking any save opens its details immediately — except for protected Steam Cloud binary BSII saves, which display a conversion dialog.
- **Unified Sidebar Tree Navigation**: Replaced legacy grid screens and top navigation tabs with an interactive tree view inside the sidebar. Profiles and their save files can now be searched, expanded, and selected directly from one place.
- **Steam Cloud Save Detection & Protection**: Added automated detection for Steam Cloud-synced profiles (`.steam` / `steamprofiles`). Intercepts clicks on binary BSII saves with an informative modal dialog explaining how to convert save files (`g_save_format 2`) for local editing.
- **Explicit Save Selection**: Eliminated stale save data persistence during profile switches. Save data is explicitly cleared upon changing profiles, requiring manual selection to inspect and edit saves safely.
## ets-vibes@0.2.0 (2026-07-24)

### New Features

- Added a configurable game directory in Settings, with folder selection, manual editing, and reset controls.
- Profiles, configuration files, and game information now load from the selected directory.
- Added refresh controls for reloading profiles and configuration data.
- Improved profile discovery for custom directory layouts and clarified profile counts and empty states.

### Bug Fixes

- Prevented duplicate configuration files and profiles from appearing in results.
- Save compatibility checks now use the relevant save directory when available.
## ets-vibes@0.1.3 (2026-07-24)

### Added

- Keyboard shortcuts: Ctrl+S / Cmd+S to save (config editor and save editor), Ctrl+F / Cmd+F to focus search (config editor).
## ets-vibes@0.1.2 (2026-07-18)

### Changed

- Removed cargo-dist completely: no more useless binary archives and install scripts in the release
- Created own release workflow that builds only Tauri native installers (.dmg, .AppImage/.deb, .msi)
- Release page now shows only changelog + platform installers

## ets-vibes@0.1.1 (2026-07-18)

### Fixed

- Windows build: properly generated ICO file using ImageMagick for RC.EXE compatibility
- macOS x86_64 build: added missing Rust target installation step
- Upload step: fixed `--clobber` flag position and filtered to installer files only

## ets-vibes@0.1.0 (2026-07-18)

### Thanks for using the app!

This is just the first version of many. Contribute, report problems, and support. Thank you.

### Save editor

Browse your profiles and save files, edit money and XP, manage trucks, unlock cities, max out skills, repair vehicles, and refuel in just a few clicks. Every change is automatically backed up with a timestamp, so you can always restore a previous version if needed.

### Config editor

Quickly find and edit any config.cfg setting with built-in search, clear descriptions for every option, value validation, and category filters that make advanced settings easy to navigate.

### Game detection

No manual setup required. The app automatically detects your Euro Truck Simulator 2 installation on Windows, Linux, and macOS, supporting both Steam and local installations.

### Built with safety in mind

Your original files stay protected. The app opens saves in read-only mode by default, validates every value before saving, and automatically creates a timestamped backup for every edit.
