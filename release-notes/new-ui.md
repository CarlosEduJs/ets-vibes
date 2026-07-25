---
bump: minor
---

### Modernized UI & Streamlined Navigation

- **Modern UI**: Completely modernized the user interface with rich glassmorphism backdrop blurs (`backdrop-blur-2xl`), deep dark mode contrast, clean typography, and aligned headers across the sidebar and main views.
- **Streamlined Single-View User Flow**: Replaced the legacy multi-step navigation flow (Profiles Grid → Saves List → Save Editor) with a unified, instant single-view workflow. Users no longer need to step back and forth between screens; profiles and saves are expanded inline in the sidebar, and clicking any save opens its details immediately — except for protected Steam Cloud binary BSII saves, which display a conversion dialog.
- **Unified Sidebar Tree Navigation**: Replaced legacy grid screens and top navigation tabs with an interactive tree view inside the sidebar. Profiles and their save files can now be searched, expanded, and selected directly from one place.
- **Steam Cloud Save Detection & Protection**: Added automated detection for Steam Cloud-synced profiles (`.steam` / `steamprofiles`). Intercepts clicks on binary BSII saves with an informative modal dialog explaining how to convert save files (`g_save_format 2`) for local editing.
- **Explicit Save Selection**: Eliminated stale save data persistence during profile switches. Save data is explicitly cleared upon changing profiles, requiring manual selection to inspect and edit saves safely.