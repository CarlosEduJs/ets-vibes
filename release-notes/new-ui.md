---
bump: minor
---

### Modernized UI & Streamlined Navigation

- **Modern UI**: Completely modernized the user interface with rich glassmorphism backdrop blurs (`backdrop-blur-2xl`), deep dark mode contrast, clean typography, and aligned headers across the sidebar and main views.
- **Unified Sidebar Tree Navigation**: Replaced legacy grid screens and top navigation tabs with an interactive tree view inside the sidebar. Profiles and their save files can now be searched, expanded, and selected directly from one place.
- **Steam Cloud Save Detection & Protection**: Added automated detection for Steam Cloud-synced profiles (`.steam` / `steamprofiles`). Intercepts clicks on binary BSII saves with an informative modal dialog explaining how to convert save files (`g_save_format 2`) for local editing.
- **Explicit Save Selection**: Eliminated stale save data persistence during profile switches. Save data is explicitly cleared upon changing profiles, requiring manual selection to inspect and edit saves safely.