import React from 'react';
import { Typography, Paper, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { cv } from "../theme/theme.js";

const heading = { fontWeight: "bold", color: cv.heading };
const paragraph = { pl: "20px", mb: "16px", lineHeight: 1.6 };

const SupportedGrammars = () => {
  const { t } = useTranslation();

  const examples = [
    { code: "<A> ::= <A> c | <A> a d | b d | ε", note: t("guideExample1") },
    { code: "<S> ::= <A> a | b | ε", note: t("guideExample2") },
    { code: null, note: t("guideExample3") },
  ];

  return (
    <Paper
      elevation={3}
      sx={{ p: "20px", borderRadius: "8px", backgroundColor: cv.surfaceAlt, color: cv.text, backgroundImage: "none" }}
    >
      <Box mb={3} textAlign="center">
        <Typography variant="h5" component="h2" sx={heading}>
          {t("guideTitle")}
        </Typography>
      </Box>

      <Typography variant="h6" component="h3" sx={{ ...heading, mb: "16px" }}>
        {t("guideIntroduction")}
      </Typography>
      <Typography variant="body1" sx={paragraph}>
        {t("guideIntroduction2")}
      </Typography>

      <Typography variant="h6" component="h3" sx={heading}>
        {t("guideInput")}
      </Typography>
      <Box sx={{ ...paragraph, lineHeight: 1.7 }}>
        {examples.map(({ code, note }, i) => (
          <Typography key={i} variant="body1" component="div" sx={{ mb: 0.5 }}>
            {code && (
              <Box component="code" sx={{ fontFamily: "monospace", display: "block" }}>
                • {code}
              </Box>
            )}
            {note}
          </Typography>
        ))}
      </Box>

      <Typography variant="h6" component="h3" sx={{ ...heading, mb: "16px" }}>
        {t("guideExplanation")}
      </Typography>
      <Typography variant="body1" sx={paragraph}>
        {t("guideExplanation1")}
      </Typography>
      <Typography variant="body1" sx={{ ...paragraph, mb: 0 }}>
        {t("guideShortcuts")}
      </Typography>
    </Paper>
  );
};

export default SupportedGrammars;
