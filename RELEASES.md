# Release Strategy

## Packages

This monorepo contains multiple packages with independent versioning:

### 1. CLI (`apps/cli`)
- **Package**: `ets-vibes` on PyPI
- **Tags**: `cli-v1.0.0`, `cli-v1.1.0`, etc.
- **Distribution**:
  - PyPI: `pip install ets-vibes`
  - Binaries: GitHub Releases (Linux, Windows, macOS)

### 2. Desktop (`apps/desktop`)
- **Tags**: `desktop-v1.0.0`, `desktop-v1.1.0`, etc.
- **Distribution**:
  - Installers via GitHub Releases
  - `.deb`, `.msi`, `.dmg` packages

### 3. Core Library (`packages/core`)
- **Package**: `ets-vibes-core` on crates.io
- **Tags**: `core-v1.0.0`, `core-v1.1.0`, etc.
- **Distribution**: crates.io

## Creating Releases

### CLI Release
```bash
git tag cli-v1.0.0
git push origin cli-v1.0.0
```

This triggers:
1. Build binaries for Linux, Windows, macOS
2. Publish to PyPI
3. Create GitHub Release with binaries

### Desktop Release
```bash
git tag desktop-v1.0.0
git push origin desktop-v1.0.0
```

This triggers:
1. Build Tauri installers
2. Create GitHub Release with installers

## Version Bumping

Each package maintains its own version:
- `apps/cli/pyproject.toml` → `version = "1.0.0"`
- `apps/desktop/package.json` → `"version": "1.0.0"`
- `packages/core/Cargo.toml` → `version = "1.0.0"`

## Changelog

Maintain separate changelogs:
- `apps/cli/CHANGELOG.md`
- `apps/desktop/CHANGELOG.md`
- `packages/core/CHANGELOG.md`
