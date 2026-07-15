import { useState } from "react";
import { AppShell } from "./components/AppShell";
import { Header } from "./components/Header";
import { StatusBar } from "./components/StatusBar";
import { SaveEditorPage } from "./components/save-editor/SaveEditorPage";
import { ConfigEditorPage } from "./components/config-editor/ConfigEditorPage";

function App() {
  const [tab, setTab] = useState<"saves" | "config">("saves");
  const [readOnly, setReadOnly] = useState(true);
  const [status, setStatus] = useState("");

  return (
    <AppShell
      header={
        <Header
          readOnly={readOnly}
          onToggleReadOnly={() => setReadOnly(!readOnly)}
          activeTab={tab}
          onTabChange={setTab}
        />
      }
      main={
        tab === "saves" ? (
          <SaveEditorPage readOnly={readOnly} onStatusChange={setStatus} />
        ) : (
          <ConfigEditorPage readOnly={readOnly} onStatusChange={setStatus} />
        )
      }
      status={<StatusBar message={status} />}
    />
  );
}

export default App;
