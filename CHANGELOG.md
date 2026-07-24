# Changelog

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
