import React from 'react';
import { Typography, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";

const SupportedGrammars = () => {
  const { t } = useTranslation();

  return(
    <Paper elevation={2} style={{ padding: "10px", whiteSpace: "pre-wrap"}}>
      <Typography variant="h6" gutterBottom>
        {t("guideTitle")}
      </Typography>
      <Typography variant="body1">
        • A → A c | A a d | b d | ε{"\n"}
          {t("guideExample1")}{"\n"}
        • A → A c | A a d | b d{"\n"}
          {t("guideExample2")}{"\n"}
        • S → A a | b | ε{"\n"}
          {t("guideExample3")}
      </Typography>
    </Paper>
  );
};

export default SupportedGrammars;