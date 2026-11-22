import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";

import { ALGORITHMS } from "../algorithms/registry.js";
import { cv } from "../theme/theme.js";
import { useThemeMode } from "../theme/ThemeModeProvider.jsx";
import HelpDialog from "./HelpDialog.jsx";

const TABS = ALGORITHMS.map(({ key }) => ({ key, labelKey: key }));
const LANGUAGES = ["en", "sk", "uk"];

const roundIconButton = {
  color: cv.textMuted,
  border: `1px solid ${cv.border}`,
  borderRadius: "50%",
  p: 0.6,
};

const MyAppBar = ({ activeTab, onTabChange, tabsDisabled }) => {
  const { t, i18n } = useTranslation();
  const { mode, toggle } = useThemeMode();
  const [helpOpen, setHelpOpen] = useState(false);

  const isDark = mode === "dark";
  const themeLabel = isDark ? t("switchToLight") : t("switchToDark");

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: cv.surface,
        backgroundImage: "none",
        borderBottom: `1px solid ${cv.border}`,
        color: cv.appBarText,
      }}
    >
      <Toolbar sx={{ gap: 1, minHeight: "56px !important", px: "12px !important" }}>
        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center", mr: 1, minWidth: "fit-content" }}>
          <Typography
            variant="h6"
            component="h1"
            sx={{
              fontWeight: 800,
              color: cv.primaryText,
              fontSize: "1.05rem",
              letterSpacing: "-0.3px",
              lineHeight: 1,
            }}
          >
            CFG
            <Box component="span" sx={{ color: cv.success, fontWeight: 800 }}>
              {" "}Studio
            </Box>
          </Typography>
        </Box>

        {/* Transformation Tabs — scroll sideways when they don't fit */}
        <Box
          component="nav"
          sx={{
            display: "flex",
            gap: 0.5,
            flexGrow: 1,
            minWidth: 0,
            flexWrap: "nowrap",
            overflowX: "auto",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                disabled={tabsDisabled}
                aria-pressed={isActive}
                sx={{
                  fontSize: "0.68rem",
                  fontWeight: isActive ? 700 : 500,
                  px: 1.2,
                  py: 0.4,
                  minWidth: "auto",
                  flexShrink: 0,
                  borderRadius: "4px",
                  textTransform: "none",
                  whiteSpace: "nowrap",
                  backgroundColor: isActive ? cv.tabActive : "transparent",
                  color: isActive ? cv.onPrimary : cv.tabText,
                  "&:hover": {
                    backgroundColor: isActive ? cv.tabActive : cv.hover,
                  },
                  "&.Mui-disabled": {
                    color: cv.textDisabled,
                    backgroundColor: "transparent",
                  },
                }}
              >
                {t(tab.labelKey)}
              </Button>
            );
          })}
        </Box>

        {/* Right utilities */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, ml: 1, flexShrink: 0 }}>
          <Tooltip title={t("help")}>
            <IconButton
              size="small"
              aria-label={t("help")}
              onClick={() => setHelpOpen(true)}
              sx={roundIconButton}
            >
              <HelpOutlineIcon sx={{ fontSize: "18px" }} />
            </IconButton>
          </Tooltip>

          <Tooltip title={themeLabel}>
            <IconButton size="small" aria-label={themeLabel} onClick={toggle} sx={roundIconButton}>
              {isDark ? (
                <LightModeOutlinedIcon sx={{ fontSize: "18px" }} />
              ) : (
                <DarkModeOutlinedIcon sx={{ fontSize: "18px" }} />
              )}
            </IconButton>
          </Tooltip>

          {/* Language switcher */}
          <Box
            role="group"
            aria-label={t("language")}
            sx={{
              display: "flex",
              border: `1px solid ${cv.border}`,
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            {LANGUAGES.map((lang) => {
              const selected = i18n.language === lang;
              return (
                <Button
                  key={lang}
                  onClick={() => i18n.changeLanguage(lang)}
                  aria-pressed={selected}
                  sx={{
                    minWidth: "36px",
                    px: 1,
                    py: 0.4,
                    fontSize: "0.72rem",
                    fontWeight: selected ? 700 : 400,
                    borderRadius: 0,
                    textTransform: "uppercase",
                    backgroundColor: selected ? cv.primary : "transparent",
                    color: selected ? cv.onPrimary : cv.textMuted,
                    "&:hover": {
                      backgroundColor: selected ? cv.primary : cv.hover,
                    },
                  }}
                >
                  {lang}
                </Button>
              );
            })}
          </Box>
        </Box>
      </Toolbar>

      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </AppBar>
  );
};

export default MyAppBar;
