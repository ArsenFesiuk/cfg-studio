import React from 'react';
import { AppBar, Toolbar, Typography, Button} from '@mui/material';
import { useTranslation } from "react-i18next";

const MyAppBar = () => {
  const { t } = useTranslation();

  return (
    <AppBar sx={{ width: '100%' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {t("appBarTitle")}
        </Typography>
        <Button color="inherit">{t("repository")}</Button>
        <Button color="inherit">{t("documentation")}</Button>
        <Button color="inherit">{t("contacts")}</Button>
      </Toolbar>
    </AppBar>
  );
};

export default MyAppBar;
