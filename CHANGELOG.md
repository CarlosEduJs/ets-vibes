# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-01-11

### Fixed
- PyPI Trusted Publisher configuration for automated releases

## [1.0.0] - 2026-01-11

### Added
- Initial CLI release
- Command `list` to display all profiles and saves
- Command `edit` to modify money and XP in specific saves
- Command `quick` to set money across all saves
- Command `version` to show version info
- Support for Euro Truck Simulator 2 (ETS2)
- Support for American Truck Simulator (ATS)
- Multi-platform support (Linux, Windows, macOS)
- Automatic save backup before editing
- ScsC format decryption (AES-256-CBC + zlib)
- Plain text save output (game compatible)
- Profile detection across multiple locations (native, Steam, Flatpak)
- Rich CLI with colored tables and progress indicators

### Technical
- Python 3.10+ support
- Dependencies: Rich, Typer, cryptography
- PyInstaller binaries for all platforms
- GitHub Actions CI/CD
- PyPI Trusted Publisher integration

[1.0.1]: https://github.com/CarlosEduJs/ets-vibes/releases/tag/cli-v1.0.1
[1.0.0]: https://github.com/CarlosEduJs/ets-vibes/releases/tag/cli-v1.0.0
