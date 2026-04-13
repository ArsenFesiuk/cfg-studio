import React from "react";
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import BedtimeIcon from "@mui/icons-material/Bedtime";

const TABS = [
  { key: "removeEpsilon", labelKey: "removeEpsilon" },
  { key: "removeUnitRules", labelKey: "removeUnitRules" },
  { key: "removeUselessSymbols", labelKey: "removeUselessSymbols" },
  { key: "removeLeftRecursion", labelKey: "removeLeftRecursion" },
  { key: "convertToCNF", labelKey: "convertToCNF" },
  { key: "bnfToEbnf", label: "BNF → EBNF" },
  { key: "ebnfToBnf", label: "EBNF → BNF" },
];

const MyAppBar = ({ activeTab, onTabChange, tabsDisabled }) => {
  const { t, i18n } = useTranslation();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #DDE3EA",
        color: "#1A1A2E",
      }}
    >
      <Toolbar sx={{ gap: 1, minHeight: "56px !important", px: "12px !important" }}>
        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center", mr: 2, minWidth: "fit-content" }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: "#1565C0",
              fontSize: "1.05rem",
              letterSpacing: "-0.3px",
              lineHeight: 1,
            }}
          >
            CFG
            <Box component="span" sx={{ color: "#43A047", fontWeight: 800 }}>
              {" "}Studio
            </Box>
          </Typography>
        </Box>

        {/* Transformation Tabs */}
        <Box sx={{ display: "flex", gap: 0.5, flexGrow: 1, flexWrap: "nowrap", overflow: "hidden" }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const isDisabled =
              tabsDisabled &&
              tab.key !== "bnfToEbnf" &&
              tab.key !== "ebnfToBnf";
            return (
              <Button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                disabled={isDisabled}
                sx={{
                  fontSize: "0.68rem",
                  fontWeight: isActive ? 700 : 500,
                  px: 1.2,
                  py: 0.4,
                  minWidth: "auto",
                  borderRadius: "4px",
                  textTransform: "none",
                  whiteSpace: "nowrap",
                  backgroundColor: isActive ? "#1E3A5F" : "transparent",
                  color: isActive ? "#FFFFFF" : "#3A3A5C",
                  "&:hover": {
                    backgroundColor: isActive ? "#1E3A5F" : "#EEF2F7",
                  },
                  "&.Mui-disabled": {
                    color: "#B0BEC5",
                    backgroundColor: "transparent",
                  },
                }}
              >
                {tab.label ?? t(tab.labelKey)}
              </Button>
            );
          })}
        </Box>

        {/* Right utilities */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, ml: 1 }}>
          <Tooltip title="Help">
            <IconButton
              size="small"
              sx={{
                color: "#555",
                border: "1px solid #DDE3EA",
                borderRadius: "50%",
                p: 0.6,
              }}
            >
              <HelpOutlineIcon sx={{ fontSize: "18px" }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Dark mode">
            <IconButton
              size="small"
              sx={{
                color: "#555",
                border: "1px solid #DDE3EA",
                borderRadius: "50%",
                p: 0.6,
              }}
            >
              <BedtimeIcon sx={{ fontSize: "18px" }} />
            </IconButton>
          </Tooltip>

          {/* Language switcher */}
          <Box
            sx={{
              display: "flex",
              border: "1px solid #DDE3EA",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            {["en", "sk", "uk"].map((lang) => (
              <Button
                key={lang}
                onClick={() => i18n.changeLanguage(lang)}
                sx={{
                  minWidth: "36px",
                  px: 1,
                  py: 0.4,
                  fontSize: "0.72rem",
                  fontWeight: i18n.language === lang ? 700 : 400,
                  borderRadius: 0,
                  textTransform: "uppercase",
                  backgroundColor: i18n.language === lang ? "#1565C0" : "transparent",
                  color: i18n.language === lang ? "#FFFFFF" : "#444",
                  "&:hover": {
                    backgroundColor:
                      i18n.language === lang ? "#1565C0" : "#EEF2F7",
                  },
                }}
              >
                {lang}
              </Button>
            ))}
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default MyAppBar;
