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
import { isSteamSynced } from "./utils/steam";

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
    setSaveData,
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
        const storeSelected = useSaveEditorStore.getState().selectedConfigPath;
        if (paths.length > 0 && !storeSelected) {
          const first = paths[0];
          if (first != null) {
            setSelectedConfigPath(first);
          }
        }
      })
      .catch(() => {});
  }, [customGamePath, setSelectedConfigPath]);

  // Load profiles & fetch saves for active profile (NO auto-select save)
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

        // Select initial profile, but leave save unselected for user manual choice
        if (fetchedProfiles.length > 0) {
          const currentPath = useSaveEditorStore.getState().selectedProfile?.path;
          const targetProf =
            fetchedProfiles.find((p) => p.path === currentPath) || fetchedProfiles[0];
          if (targetProf) {
            setSelectedProfile(targetProf);
            setSelectedSave(null);
            setSaveData(null);

            setLoadingSaves(true);
            const fetchedSaves = await invoke<SaveInfo[]>("get_saves", {
              profilePath: targetProf.path,
            });
            setSaves(fetchedSaves);
            setLoadingSaves(false);
          }
        } else {
          setSelectedProfile(null);
          setSelectedSave(null);
          setSaveData(null);
          setSaves([]);
        }
      } catch (e) {
        toast.error(String(e));
        setStatus(`Error: ${e}`);
      } finally {
        setLoadingProfiles(false);
      }
    },
    [customGamePath, setProfiles, setSelectedProfile, setSaves, setSelectedSave, setSaveData],
  );

  useEffect(() => {
    loadProfiles(false);
  }, [loadProfiles]);

  // Select profile handler (resets save selection)
  const onSelectProfile = useCallback(
    async (profile: ProfileInfo) => {
      setSelectedProfile(profile);
      setSelectedSave(null);
      setSaveData(null);
      setLoadingSaves(true);
      setStatus("Loading saves...");
      try {
        const fetchedSaves = await invoke<SaveInfo[]>("get_saves", {
          profilePath: profile.path,
        });
        setSaves(fetchedSaves);
        setStatus(`Found ${fetchedSaves.length} saves`);
      } catch (e) {
        toast.error(String(e));
        setStatus(`Error: ${e}`);
      } finally {
        setLoadingSaves(false);
      }
    },
    [setSelectedProfile, setSelectedSave, setSaveData, setSaves],
  );

  // Select save handler (called when user clicks save in sidebar or command palette)
  const onSelectSave = useCallback(
    (save: SaveInfo) => {
      setSelectedSave(save);
      setActiveWorkspace("saves");
    },
    [setSelectedSave, setActiveWorkspace],
  );

  // Select config handler
  const onSelectConfig = useCallback(
    (path: string) => {
      setSelectedConfigPath(path);
      setActiveWorkspace("config");
    },
    [setSelectedConfigPath, setActiveWorkspace],
  );

  // Shortcut for Ctrl+, (Open Settings)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "," && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSettingsOpen(true);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
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
          onSelectProfile={onSelectProfile}
          onSelectSave={onSelectSave}
          onSelectConfig={onSelectConfig}
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
            onReloadSaves={() => selectedProfile && onSelectProfile(selectedProfile)}
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
          onSelectProfile(prof)
            .then(() => {
              if (save && !isSteamSynced(save.path) && !isSteamSynced(prof.path)) {
                onSelectSave(save);
              } else if (save && (isSteamSynced(save.path) || isSteamSynced(prof.path))) {
                toast("Steam Cloud-synced save cannot be edited directly");
              }
            })
            .catch((e) => {
              toast.error(String(e));
            });
        }}
        onSelectConfig={onSelectConfig}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />
      <KeyboardShortcutsDialog open={isShortcutsOpen} onOpenChange={setIsShortcutsOpen} />
    </AppShell>
  );
}

export default App;
