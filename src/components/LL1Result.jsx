import React from "react";
import { Box, Chip, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { cv } from "../theme/theme.js";
import DataTable from "./DataTable.jsx";

const setText = (items) => (items.length ? `{${items.join(", ")}}` : "∅");

const sectionTitle = {
  fontSize: "0.72rem",
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: cv.primaryText,
  mt: 1.5,
  mb: 0.25,
};

// The LL(1) analysis result as tables (built up while the steps are walked):
// N_ε, FIRST / FOLLOW per non-terminal, PREDICT per rule and the verdict.
export default function LL1Result({ data }) {
  const { t } = useTranslation();
  if (!data) return null;

  const { nullable, first, follow, predict, isLL1, conflicts } = data;
  const followBySymbol = new Map((follow ?? []).map((entry) => [entry.symbol, entry.set]));

  return (
    <Box sx={{ fontFamily: "monospace" }}>
      {nullable && (
        <>
          <Typography sx={{ ...sectionTitle, mt: 0 }}>{t("ll1Nullable")}</Typography>
          <Typography component="div" sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
            N_ε = {setText(nullable)}
          </Typography>
        </>
      )}

      {first && (
        <>
          <Typography sx={sectionTitle}>FIRST / FOLLOW</Typography>
          <DataTable
            mono
            firstColumnStrong
            head={[t("ll1Symbol"), "FIRST", "FOLLOW"]}
            rows={first.map(({ symbol, set }) => [
              symbol,
              setText(set),
              followBySymbol.has(symbol) ? setText(followBySymbol.get(symbol)) : "—",
            ])}
          />
        </>
      )}

      {predict && (
        <>
          <Typography sx={sectionTitle}>PREDICT</Typography>
          <DataTable
            mono
            head={["#", t("ll1Rule"), "PREDICT"]}
            rows={predict.map(({ number, rule, set }) => [number, rule, setText(set)])}
          />
        </>
      )}

      {isLL1 !== undefined && (
        <Box sx={{ mt: 1.5 }}>
          <Chip
            size="small"
            color={isLL1 ? "success" : "error"}
            label={isLL1 ? t("ll1Yes") : t("ll1No")}
            sx={{ fontWeight: 700 }}
          />
          {!isLL1 && conflicts?.length > 0 && (
            <Typography component="div" sx={{ mt: 0.75, fontSize: "0.82rem", color: cv.errorText, fontFamily: "monospace" }}>
              {t("ll1Conflicts")}: {conflicts.join(", ")}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
