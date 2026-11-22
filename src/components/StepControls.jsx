import React from "react";
import { Box, Button, Slider, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import FlagIcon from "@mui/icons-material/Flag";
import RefreshIcon from "@mui/icons-material/Refresh";
import { cv } from "../theme/theme.js";

const outlinedButton = {
  borderColor: cv.border,
  color: cv.textMuted,
  textTransform: "none",
  fontSize: "0.78rem",
  px: 1.5,
  "&:hover": { borderColor: cv.borderHover, backgroundColor: cv.surfaceAlt },
  "&.Mui-disabled": { borderColor: cv.borderDisabled, color: cv.textDisabled },
};

// Back / Next / Result / Reset buttons plus the "Current step" chip.
// `stepInfo` is what PseudoCodeViewer reports; it is only meaningful while a
// run is displayed (`running`).
export default function StepControls({
  running,
  stepInfo,
  resultDisabled,
  onPrev,
  onNext,
  onGoTo,
  onResult,
  onReset,
}) {
  const { t } = useTranslation();

  return (
    <>
      <Box sx={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ArrowBackIosNewIcon sx={{ fontSize: "12px !important" }} />}
          onClick={onPrev}
          disabled={!running || !stepInfo?.canGoPrev}
          sx={outlinedButton}
        >
          {t("back") || "Back"}
        </Button>

        <Button
          variant="outlined"
          size="small"
          endIcon={<ArrowForwardIosIcon sx={{ fontSize: "12px !important" }} />}
          onClick={onNext}
          disabled={!running || !stepInfo?.canGoNext}
          sx={outlinedButton}
        >
          {t("next") || "Next"}
        </Button>

        <Button
          variant="contained"
          size="small"
          startIcon={<FlagIcon sx={{ fontSize: "16px !important" }} />}
          onClick={onResult}
          disabled={resultDisabled}
          sx={{
            backgroundColor: cv.success,
            color: cv.onPrimary,
            textTransform: "none",
            fontSize: "0.78rem",
            px: 1.5,
            fontWeight: 700,
            "&:hover": { backgroundColor: cv.successHover },
            "&.Mui-disabled": { backgroundColor: cv.successDisabled, color: cv.onPrimary },
          }}
        >
          {t("result") || "Result"}
        </Button>

        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon sx={{ fontSize: "16px !important" }} />}
          onClick={onReset}
          sx={{ ...outlinedButton, color: cv.textFaint }}
        >
          {t("reset") || "Reset"}
        </Button>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <Box
          sx={{
            display: "inline-flex",
            border: `1px solid ${cv.borderStrong}`,
            borderRadius: "20px",
            px: "14px",
            py: "4px",
            backgroundColor: cv.surface,
          }}
        >
          <Typography sx={{ fontSize: "0.8rem", color: cv.textMuted }}>
            <Box component="span" sx={{ fontWeight: 700, color: cv.primaryText }}>
              {t("currentStep") || "Current step"}:{" "}
            </Box>
            {running && stepInfo
              ? `${stepInfo.current} / ${stepInfo.total}`
              : t("waitingForAlgorithm") || "Waiting for algorithm to start."}
          </Typography>
        </Box>

        {running && stepInfo && stepInfo.total > 1 && (
          <Slider
            size="small"
            min={1}
            max={stepInfo.total}
            step={1}
            value={stepInfo.current}
            onChange={(_, value) => onGoTo(value - 1)}
            aria-label={t("stepSlider")}
            sx={{ flex: 1, minWidth: 160, maxWidth: 480, color: cv.primary }}
          />
        )}
      </Box>
    </>
  );
}
