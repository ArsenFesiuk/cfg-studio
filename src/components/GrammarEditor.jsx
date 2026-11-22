import React from "react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { cv } from "../theme/theme.js";
import FormatSwitch from "./FormatSwitch.jsx";

// The grammar card: caption + BNF/EBNF switch above a textarea. Errors are
// listed under the textarea (visible without hovering, so they also work on
// touch screens and for screen readers) and tint the textarea.
const GrammarEditor = React.forwardRef(function GrammarEditor(
  { value, onChange, errors, format, onFormatSwitch },
  textareaRef
) {
  const { t } = useTranslation();
  const hasErrors = errors.length > 0;

  return (
    <Box
      sx={{
        backgroundColor: cv.surface,
        border: `1px solid ${cv.border}`,
        borderRadius: "8px",
        p: "14px",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: { xs: 260, md: 0 },
        overflow: "hidden",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
        <Typography variant="caption" component="label" htmlFor="grammar-input" sx={{ fontWeight: 700, color: cv.primaryText, fontSize: "0.78rem" }}>
          {t("input")}
        </Typography>
        <FormatSwitch format={format} value={value} onSwitch={onFormatSwitch} />
      </Box>
      <textarea
        id="grammar-input"
        className="cfg-textarea"
        ref={textareaRef}
        value={value}
        onChange={onChange}
        placeholder={t("inputPlaceholder")}
        spellCheck={false}
        aria-invalid={hasErrors}
        aria-describedby={hasErrors ? "grammar-errors" : undefined}
        style={{
          flex: 1,
          minHeight: 120,
          width: "100%",
          border: `1px solid ${hasErrors ? cv.errorBorder : cv.border}`,
          borderRadius: "6px",
          padding: "10px",
          fontFamily: "monospace",
          fontSize: "0.9rem",
          resize: "none",
          outline: "none",
          backgroundColor: hasErrors ? cv.errorBg : cv.inputBg,
          color: cv.text,
          lineHeight: "1.6",
          boxSizing: "border-box",
        }}
      />
      {hasErrors && (
        <Box
          id="grammar-errors"
          component="ul"
          aria-live="polite"
          sx={{
            m: 0,
            mt: 1,
            pl: 2.5,
            maxHeight: "6.5rem",
            overflowY: "auto",
            color: cv.errorText,
            fontSize: "0.8rem",
            lineHeight: 1.45,
            overflowWrap: "anywhere",
          }}
        >
          {errors.map((error, i) => (
            <li key={i}>{error}</li>
          ))}
        </Box>
      )}
    </Box>
  );
});

export default GrammarEditor;
