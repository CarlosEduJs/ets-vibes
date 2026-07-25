import { useEffect, useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "ui";
import { AppShell } from "./components/AppShell";
import { SidebarNav } from "./components/sidebar/SidebarNav";
import { Header } from "./components/Header";
import { StatusBar } from "./components/StatusBar";
import { SaveEditorPage } from "./components/save-editor/SaveEditorPage";
import { ConfigEditorPage } from "./components/config-editor/ConfigEditorPage";
import { SettingsDialog } from "./components/settings/SettingsDialog";
import { CommandPalette } from "./components/CommandPalette";
import { KeyboardShortcutsDialog } from "./components/KeyboardShortcutsDialog";
import { useSettingsStore } from "./stores/settings";
import { useSaveEditorStore } from "./stores/save-editor";
import type { ProfileInfo, SaveInfo } from "./types";

interface AppVersionInfo {
  app_version: string;
  game_version: string | null;
  tested_game_version: string;
  compatibility_warning: string | null;
}

function App() {
  const { readOnly, customGamePath, setIsSettingsOpen } = useSettingsStore();
  const {
    profiles,
    saves,
    selectedProfile,
    selectedSave,
    activeWorkspace,
    selectedConfigPath,
    setProfiles,
    setSaves,
    setSelectedProfile,
    setSelectedSave,
    setActiveWorkspace,
    setSelectedConfigPath,
  } = useSaveEditorStore();

  const [status, setStatus] = useState("");
  const [appInfo, setAppInfo] = useState<AppVersionInfo | null>(null);
  const [configPaths, setConfigPaths] = useState<string[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [loadingSaves, setLoadingSaves] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // App version info
  useEffect(() => {
    let active = true;
    invoke<AppVersionInfo>("get_app_info", { customPath: customGamePath || null })
      .then((info) => {
        if (active) setAppInfo(info);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [customGamePath]);

  // List configs
  useEffect(() => {
    invoke<string[]>("list_configs", { customPath: customGamePath || null })
      .then((paths) => {
        setConfigPaths(paths);
        if (paths.length > 0 && !selectedConfigPath) {
          const first = paths[0];
          if (first != null) {
            setSelectedConfigPath(first);
          }
        }
      })
      .catch(() => {});
  }, [customGamePath, selectedConfigPath, setSelectedConfigPath]);

  // Load profiles & auto-select first profile & save
  const loadProfiles = useCallback(
    async (showToast = false) => {
      setLoadingProfiles(true);
      setStatus("Loading profiles...");
      try {
        const fetchedProfiles = await invoke<ProfileInfo[]>("list_profiles", {
          customPath: customGamePath || null,
        });
        setProfiles(fetchedProfiles);
        const msg = `Found ${fetchedProfiles.length} profile${fetchedProfiles.length !== 1 ? "s" : ""}`;
        if (showToast) toast.success(msg);
        setStatus(msg);

        // Auto-select first profile if non-selected or current profile deleted
        if (fetchedProfiles.length > 0) {
          const targetProf =
            fetchedProfiles.find((p) => p.path === selectedProfile?.path) || fetchedProfiles[0];
          if (targetProf) {
            setSelectedProfile(targetProf);
            // Fetch saves for target profile
            setLoadingSaves(true);
            const fetchedSaves = await invoke<SaveInfo[]>("get_saves", {
              profilePath: targetProf.path,
            });
            setSaves(fetchedSaves);
            setLoadingSaves(false);

            if (fetchedSaves.length > 0 && !selectedSave) {
              const firstSave = fetchedSaves[0];
              if (firstSave != null) {
                setSelectedSave(firstSave);
              }
            }
          }
        } else {
          setSelectedProfile(null);
          setSelectedSave(null);
          setSaves([]);
        }
      } catch (e) {
        toast.error(String(e));
        setStatus(`Error: ${e}`);
      } finally {
        setLoadingProfiles(false);
      }
    },
    [
      customGamePath,
      selectedProfile?.path,
      selectedSave,
      setProfiles,
      setSelectedProfile,
      setSaves,
      setSelectedSave,
    ],
  );

  useEffect(() => {
    loadProfiles(false);
  }, [loadProfiles]);

  // Select profile handler
  const handleSelectProfile = useCallback(
    async (profile: ProfileInfo) => {
      setSelectedProfile(profile);
      setLoadingSaves(true);
      setStatus("Loading saves...");
      try {
        const fetchedSaves = await invoke<SaveInfo[]>("get_saves", {
          profilePath: profile.path,
        });
        setSaves(fetchedSaves);
        if (fetchedSaves.length > 0) {
          const firstSave = fetchedSaves[0];
          if (firstSave != null) {
            setSelectedSave(firstSave);
          }
        } else {
          setSelectedSave(null);
        }
        setStatus(`Found ${fetchedSaves.length} saves`);
      } catch (e) {
        toast.error(String(e));
        setStatus(`Error: ${e}`);
      } finally {
        setLoadingSaves(false);
      }
    },
    [setSelectedProfile, setSaves, setSelectedSave],
  );

  // Select save handler
  const handleSelectSave = useCallback(
    (save: SaveInfo) => {
      setSelectedSave(save);
      setActiveWorkspace("saves");
    },
    [setSelectedSave, setActiveWorkspace],
  );

  // Select config handler
  const handleSelectConfig = useCallback(
    (path: string) => {
      setSelectedConfigPath(path);
      setActiveWorkspace("config");
    },
    [setSelectedConfigPath, setActiveWorkspace],
  );

  // Shortcut for Ctrl+, (Open Settings)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "," && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSettingsOpen(true);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setIsSettingsOpen]);

  return (
    <AppShell
      sidebar={
        <SidebarNav
          appInfo={appInfo}
          profiles={profiles}
          saves={saves}
          selectedProfile={selectedProfile}
          selectedSave={selectedSave}
          configPaths={configPaths}
          selectedConfigPath={selectedConfigPath}
          loadingProfiles={loadingProfiles}
          loadingSaves={loadingSaves}
          onSelectProfile={handleSelectProfile}
          onSelectSave={handleSelectSave}
          onSelectConfig={handleSelectConfig}
          onRefreshProfiles={() => loadProfiles(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
        />
      }
      header={
        <Header
          activeWorkspace={activeWorkspace}
          selectedProfile={selectedProfile}
          selectedSave={selectedSave}
          selectedConfigPath={selectedConfigPath}
          appInfo={appInfo}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />
      }
      main={
        activeWorkspace === "saves" ? (
          <SaveEditorPage
            readOnly={readOnly}
            onStatusChange={setStatus}
            onReloadSaves={() => selectedProfile && handleSelectProfile(selectedProfile)}
            onReloadProfiles={() => loadProfiles(true)}
          />
        ) : (
          <ConfigEditorPage
            readOnly={readOnly}
            onStatusChange={setStatus}
            selectedConfigPath={selectedConfigPath}
          />
        )
      }
      status={<StatusBar message={status} />}
    >
      <SettingsDialog appInfo={appInfo} />
      <CommandPalette
        open={isCommandPaletteOpen}
        onOpenChange={setIsCommandPaletteOpen}
        configPaths={configPaths}
        onSelectSave={(prof, save) => {
          handleSelectProfile(prof).then(() => {
            if (save) handleSelectSave(save);
          });
        }}
        onSelectConfig={handleSelectConfig}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />
      <KeyboardShortcutsDialog open={isShortcutsOpen} onOpenChange={setIsShortcutsOpen} />
    </AppShell>
  );
}

export default App;
