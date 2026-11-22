import { createTheme } from "@mui/material/styles";

// Every colour the app paints itself with. Components never use hex values:
// they read `cv.<token>` (a CSS variable reference), and the active palette's
// values are published on :root by ThemeModeProvider. Switching theme therefore
// repaints everything without re-rendering the components.
const palettes = {
  light: {
    bg: "#EEF2F7",
    surface: "#FFFFFF",
    surfaceAlt: "#F5F7FA",
    inputBg: "#FAFBFC",
    border: "#DDE3EA",
    borderStrong: "#C5CCD5",
    borderHover: "#B0BEC5",
    borderDisabled: "#ECEFF1",
    text: "#2C2C2C",
    textMuted: "#555555",
    textFaint: "#5F6F7E",
    textDisabled: "#B0BEC5",
    appBarText: "#1A1A2E",
    heading: "#1E3A5F",
    primary: "#1565C0",
    primaryHover: "#0D47A1",
    primaryText: "#1565C0",
    onPrimary: "#FFFFFF",
    success: "#43A047",
    successHover: "#388E3C",
    successDisabled: "#C8E6C9",
    tabActive: "#1E3A5F",
    tabText: "#3A3A5C",
    hover: "#EEF2F7",
    errorBorder: "#EF5350",
    errorBg: "#FFF8F8",
    errorText: "#C62828",
    okText: "#2E7D32",
    highlightAdd: "#C8E6C9",
    highlightRemove: "#FFE9B8",
    activeLine: "#FFF3CD",
    activeLineBorder: "#FFD700",
    focusRing: "rgba(21, 101, 192, 0.35)",
  },
  dark: {
    bg: "#0F1620",
    surface: "#17212D",
    surfaceAlt: "#1D2938",
    inputBg: "#121B26",
    border: "#2C3A4B",
    borderStrong: "#3A4A5E",
    borderHover: "#52667D",
    borderDisabled: "#263445",
    text: "#E6EBF1",
    textMuted: "#B4C0CD",
    textFaint: "#93A3B3",
    textDisabled: "#5B6B7B",
    appBarText: "#E6EBF1",
    heading: "#A9C7EA",
    primary: "#1565C0",
    primaryHover: "#1976D2",
    primaryText: "#64B5F6",
    onPrimary: "#FFFFFF",
    success: "#388E3C",
    successHover: "#43A047",
    successDisabled: "#2E4A31",
    tabActive: "#2B4C7E",
    tabText: "#C5D0DC",
    hover: "#223144",
    errorBorder: "#EF5350",
    errorBg: "#2A1618",
    errorText: "#FF8A80",
    okText: "#81C784",
    highlightAdd: "#2E5A33",
    highlightRemove: "#6B5311",
    activeLine: "#4A3F12",
    activeLineBorder: "#B8960B",
    focusRing: "rgba(100, 181, 246, 0.45)",
  },
};

const kebab = (name) => name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const variableName = (token) => `--cfg-${kebab(token)}`;

export const cv = Object.fromEntries(
  Object.keys(palettes.light).map((token) => [token, `var(${variableName(token)})`])
);

export const cssVariables = (mode) =>
  Object.fromEntries(
    Object.entries(palettes[mode] ?? palettes.light).map(([token, value]) => [variableName(token), value])
  );

export const buildMuiTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: palettes.light.primary },
    },
  });

// Look shared by the Examples / Import / Export buttons.
export const actionButtonSx = {
  backgroundColor: cv.primary,
  color: cv.onPrimary,
  height: "36px",
  fontSize: "0.78rem",
  textTransform: "none",
  px: 2,
  "&:hover": { backgroundColor: cv.primaryHover },
};
