import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useTranslation } from "react-i18next";

const MyAppBar = () => {
  const { t, i18n } = useTranslation();

  return (
    <AppBar sx={{ width: "100%" }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {t("appBarTitle")}
        </Typography>
        <Button color="inherit">{t("repository")}</Button>
        <Button color="inherit">{t("documentation")}</Button>
        <Button color="inherit">{t("contacts")}</Button>

        {/* Перемикач мов */}
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
