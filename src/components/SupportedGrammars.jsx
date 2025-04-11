import React from 'react';
import { Typography, Paper, Box } from "@mui/material";
import { useTranslation } from "react-i18next";

const SupportedGrammars = () => {
  const { t } = useTranslation();

  const grammarText = `
    • A → A c | A a d | b d | ε
    ${t("guideExample1")}
    • A → A c | A a d | b d
    ${t("guideExample2")}
    • S → A a | b | ε
    ${t("guideExample3")}
  `;

  // Заміна переносів рядків на <br /> для HTML
  const formattedGrammarText = grammarText.replace(/\n/g, '<br />');

  return (
    <Paper elevation={3} style={{ padding: "20px", borderRadius: "8px", backgroundColor: "#fafafa" }}>
      <Box mb={3} textAlign="center">
        <Typography variant="h5" style={{ fontWeight: 'bold', color: "#333" }}>
          {t("guideTitle")}
        </Typography>
      </Box>

      <Typography variant="h6" style={{ fontWeight: 'bold', color: "#333", marginBottom: "16px", }}>
        {t("guideIntroduction")}
      </Typography>
      <Typography variant="body1" style={{ paddingLeft: "20px", marginBottom: "16px", lineHeight: "1.6" }}>
        {t("guideIntroduction2")}
      </Typography>

      <Typography variant="h6" style={{ fontWeight: 'bold', color: "#333" }}>
        {t("guideInput")}
      </Typography>
      <Typography
        variant="body1"
        style={{ paddingLeft: "20px", marginBottom: "16px", lineHeight: "1.7" }}
        dangerouslySetInnerHTML={{ __html: formattedGrammarText }}
      />
      
      <Typography variant="h6" style={{ fontWeight: 'bold', color: "#333", marginBottom: "16px" }}>
        {t("guideExplanation")}
      </Typography>
      <Typography variant="body1" style={{ paddingLeft: "20px", marginBottom: "16px", lineHeight: "1.6" }}>
        {t("guideExplanation1")}
      </Typography>
    </Paper>
  );
};

export default SupportedGrammars;
