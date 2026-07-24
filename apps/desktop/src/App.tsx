import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AppShell } from "./components/AppShell";
import { Header } from "./components/Header";
import { StatusBar } from "./components/StatusBar";
import { SaveEditorPage } from "./components/save-editor/SaveEditorPage";
import { ConfigEditorPage } from "./components/config-editor/ConfigEditorPage";
import { SettingsPage } from "./components/settings/SettingsPage";
import { useSettingsStore } from "./stores/settings";
import type { TabId } from "./components/TabBar";

interface AppVersionInfo {
  app_version: string;
  game_version: string | null;
  tested_game_version: string;
  compatibility_warning: string | null;
}

function App() {
  const { readOnly, lastTab, customGamePath, setReadOnly, setLastTab } = useSettingsStore();
  const [tab, setTab] = useState<TabId>(lastTab);
  const [status, setStatus] = useState("");
  const [appInfo, setAppInfo] = useState<AppVersionInfo | null>(null);

  useEffect(() => {
    invoke<AppVersionInfo>("get_app_info", { customPath: customGamePath || null })
      .then(setAppInfo)
      .catch(() => {});
  }, [customGamePath]);

  function handleTabChange(newTab: TabId) {
    setTab(newTab);
    setLastTab(newTab);
  }

  return (
    <AppShell
      header={
        <Header
          readOnly={readOnly}
          onToggleReadOnly={() => setReadOnly(!readOnly)}
          activeTab={tab}
          onTabChange={handleTabChange}
          appInfo={appInfo}
        />
      }
      main={
        tab === "saves" ? (
          <SaveEditorPage readOnly={readOnly} onStatusChange={setStatus} />
        ) : tab === "config" ? (
          <ConfigEditorPage readOnly={readOnly} onStatusChange={setStatus} />
        ) : (
          <SettingsPage appInfo={appInfo} />
        )
      }
      status={<StatusBar message={status} />}
    />
  );
}

export default App;
