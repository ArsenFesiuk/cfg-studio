import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem } from "@mui/material";
import { useTranslation } from "react-i18next";
import MenuIcon from "@mui/icons-material/Menu"; // Import the hamburger menu icon

const MyAppBar = () => {
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar sx={{ width: "100%" }}>
      <Toolbar>
        {/* Hamburger menu icon */}
        <Button
          color="inherit"
          onClick={handleMenuClick}
          sx={{ minWidth: "auto", padding: "8px" }}
        >
          <MenuIcon />
        </Button>

        {/* Text for the app, like "Normalising context-free grammar" */}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {t("appBarTitle")}
        </Typography>

        {/* Menu for Repository, Documentation, Contacts */}
        <Menu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={handleMenuClose}
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.1)", // Make menu almost transparent
            borderRadius: "8px", // Optional: to give the menu rounded corners
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" // Optional: soft shadow for the menu
          }}
        >
          <MenuItem onClick={handleMenuClose}>
            <a
              href="https://github.com/ArsenFesiuk/cfg-studio/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {t("repository")}
            </a>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>{t("documentation")}</MenuItem>
        </Menu>

        {/* Language Switcher */}
        <Box sx={{ marginLeft: 2, display: "flex", gap: 1 }}>
          {["en", "uk", "sk"].map((lang) => (
            <Button
              key={lang}
              variant={i18n.language === lang ? "contained" : "outlined"}
              color={i18n.language === lang ? "primary" : "inherit"}
              onClick={() => i18n.changeLanguage(lang)}
              sx={{
                borderRadius: "20px",
                minWidth: "50px",
                textTransform: "uppercase",
                fontWeight: i18n.language === lang ? "bold" : "normal",
                backgroundColor: i18n.language === lang ? "black" : "transparent",
                color: i18n.language === lang ? "white" : "black",
                border: "1px solid black",
                transition: "0.3s",
                "&:hover": {
                  backgroundColor: i18n.language === lang ? "black" : "rgba(0, 0, 0, 0.1)",
                },
              }}
            >
              {lang}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default MyAppBar;
