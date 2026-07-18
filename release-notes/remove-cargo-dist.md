---
bump: patch
---

## Changed

- Removed cargo-dist completely: no more useless binary archives and install scripts in the release
- Created own release workflow that builds only Tauri native installers (.dmg, .AppImage/.deb, .msi)
- Release page now shows only changelog + platform installers
