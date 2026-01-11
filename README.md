# ETS-Vibes

**Save Editor for Euro Truck Simulator 2 and American Truck Simulator**

> This project, created using AI, may contain several errors. Feel free to contribute. I'm conducting a case study testing Google's antigravity tool.

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20Windows-lightgrey.svg)]()

A simple and powerful save editor for ETS2 and ATS.

## Apps

- **[CLI](apps/cli)** - Command-line interface (Python) - **Available Now**
- **Desktop** - GUI application (Tauri) - Coming soon

## Quick Start (CLI)

```bash
# Install from PyPI
pip install ets-vibes

# Or download binary from Releases

# List saves
ets-vibes list

# Edit money
ets-vibes edit 1 --money 50000000

# Quick edit all saves
ets-vibes quick 100000000
```

## Releases

This monorepo uses independent versioning for each package:

- **CLI**: Tags like `cli-v1.0.0` → PyPI + binaries
- **Desktop**: Tags like `desktop-v1.0.0` → Installers
- **Core**: Tags like `core-v1.0.0` → crates.io

See [RELEASES.md](RELEASES.md) for details.

## Development

```bash
# CLI
cd apps/cli
python -m venv .venv
source .venv/bin/activate
pip install -e .
```

## Features

- Edit money and XP
- Multi-platform support (Windows, Linux, macOS)
- Automatic save backup
- Support for ETS2 and ATS

## License

MIT License - see [LICENSE](LICENSE)

## Disclaimer

Developed with AI assistance (Gemini 3 Flash, Claude Sonnet 4.5, Claude Opus 4.5 (thinking mode)).
