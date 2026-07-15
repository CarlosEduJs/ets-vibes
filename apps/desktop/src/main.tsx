import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "ui";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
