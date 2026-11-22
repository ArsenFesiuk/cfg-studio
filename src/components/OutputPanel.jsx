import React, { useMemo, useState } from "react";
import { Box, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { cv } from "../theme/theme.js";
import { diffGrammars } from "../utils/grammar/diffGrammars.js";
import GrammarView from "./GrammarView.jsx";
import GrammarDiffView from "./GrammarDiffView.jsx";
import LL1Result from "./LL1Result.jsx";

const monoArea = {
  flex: 1,
  minHeight: 80,
  width: "100%",
  border: `1px solid ${cv.border}`,
  borderRadius: "6px",
  padding: "10px",
  fontFamily: "monospace",
  fontSize: "0.9rem",
  outline: "none",
  backgroundColor: cv.surfaceAlt,
  color: cv.text,
  lineHeight: "1.6",
  boxSizing: "border-box",
  overflow: "auto",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};

const toggleSx = {
  textTransform: "none",
  fontSize: "0.72rem",
  py: 0.1,
  px: 1.25,
  color: cv.textMuted,
  borderColor: cv.border,
  "&.Mui-selected": { color: cv.onPrimary, backgroundColor: cv.primary },
  "&.Mui-selected:hover": { backgroundColor: cv.primaryHover },
};

function Legend() {
  const { t } = useTranslation();
  const chip = (background, label) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: background }} />
      {label}
    </span>
  );
  return (
    <Box sx={{ display: "flex", gap: 2, fontSize: "0.72rem", color: cv.textMuted, mt: 0.75 }}>
      {chip(cv.highlightAdd, t("legendAdded"))}
      {chip(cv.highlightRemove, t("legendRemoved"))}
    </Box>
  );
}

// Output card. Shows the grammar produced by the algorithm (for stepwise
// algorithms: as of the current step), or — switchable — the input grammar and
// the current grammar side by side with the differences marked. Analysis
// results (LL(1)) are drawn as tables instead.
export default function OutputPanel({ grammar, change, before, comparable = false, data = null }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState("result");

  const showCompare = comparable && mode === "compare" && Boolean(grammar);
  const diff = useMemo(
    () => (showCompare ? diffGrammars(before, grammar) : null),
    [showCompare, before, grammar]
  );

  let body;
  if (data) {
    body = <LL1Result data={data} />;
  } else if (showCompare) {
    body = (
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 1.5 }}>
        <Box>
          <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: cv.textFaint, mb: 0.5 }}>
            {t("compareBefore")}
          </Typography>
          <GrammarDiffView rows={diff.before} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: cv.textFaint, mb: 0.5 }}>
            {t("compareAfter")}
          </Typography>
          <GrammarDiffView rows={diff.after} />
        </Box>
      </Box>
    );
  } else if (grammar) {
    body = <GrammarView grammar={grammar} change={change} />;
  } else {
    body = <span style={{ color: cv.textFaint }}>{t("noOutput") || "No output yet"}</span>;
  }

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
        minHeight: { xs: 200, md: 0 },
        overflow: "hidden",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5, gap: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: cv.primaryText, fontSize: "0.78rem" }}>
          {t("output")}
        </Typography>
        {comparable && !data && (
          <ToggleButtonGroup
            exclusive
            size="small"
            value={mode}
            onChange={(_, next) => next && setMode(next)}
            aria-label={t("output")}
          >
            <ToggleButton value="result" sx={toggleSx}>
              {t("outputResult")}
            </ToggleButton>
            <ToggleButton value="compare" sx={toggleSx}>
              {t("outputCompare")}
            </ToggleButton>
          </ToggleButtonGroup>
        )}
      </Box>
      <div aria-live="polite" style={monoArea}>
        {body}
      </div>
      {showCompare && <Legend />}
    </Box>
  );
}
