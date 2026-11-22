import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { GlobalStyles, ThemeProvider } from "@mui/material";
import { buildMuiTheme, cssVariables, cv } from "./theme.js";

const STORAGE_KEY = "cfg-studio-theme";

// Without a provider (e.g. in tests) components still work, in the light theme.
const ThemeModeContext = createContext({ mode: "light", toggle: () => {} });

export const useThemeMode = () => useContext(ThemeModeContext);

// A saved choice wins; otherwise follow the operating system setting.
function initialMode() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // storage can be blocked (private mode); fall through to the OS preference
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(initialMode);

  const toggle = useCallback(() => {
    setMode((current) => {
      const next = current === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // choice just won't persist
      }
      return next;
    });
  }, []);

  const muiTheme = useMemo(() => buildMuiTheme(mode), [mode]);
  const value = useMemo(() => ({ mode, toggle }), [mode, toggle]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={muiTheme}>
        <GlobalStyles
          styles={{
            ":root": { ...cssVariables(mode), colorScheme: mode },
            body: { margin: 0, backgroundColor: cv.bg, color: cv.text },
            "textarea.cfg-textarea:focus-visible": { boxShadow: `0 0 0 3px ${cv.focusRing}` },
          }}
        />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
