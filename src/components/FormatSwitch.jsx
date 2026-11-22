import { Box, Tooltip } from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { convertBNFToEBNF } from "../utils/grammar/convertBNFToEBNF.js";
import { convertEBNFToBNF } from "../utils/grammar/convertEBNFToBNF.js";
import { cv } from "../theme/theme.js";

// ε ↔ epsilon: the formal converters work with the word "epsilon"
const epsilonToWord = (s) => s.replace(/ε/g, "epsilon");
const wordToEpsilon = (s) => s.replace(/\bepsilon\b/g, "ε");

// Small toggle shown in the top-right corner of the grammar box.
// Clicking converts the current grammar text in place between BNF and EBNF.
export default function FormatSwitch({ format, value, onSwitch }) {
  const target = format === "bnf" ? "ebnf" : "bnf";

  const handleClick = () => {
    if (!value.trim()) {
      onSwitch(target, value);
      return;
    }
    try {
      const src = epsilonToWord(value);
      const converted =
        format === "bnf" ? convertBNFToEBNF(src) : convertEBNFToBNF(src);
      onSwitch(target, wordToEpsilon(converted));
    } catch (err) {
      // invalid grammar for conversion — flip the label, keep the text, report error
      onSwitch(target, value, err.message);
    }
  };

  const Label = ({ name, active }) => (
    <Box
      component="span"
      sx={{
        fontWeight: active ? 800 : 500,
        color: active ? cv.primaryText : cv.textFaint,
        fontSize: "0.7rem",
        letterSpacing: "0.04em",
      }}
    >
      {name}
    </Box>
  );

  return (
    <Tooltip title={`${format.toUpperCase()} → ${target.toUpperCase()}`} arrow>
      <Box
        component="button"
        type="button"
        onClick={handleClick}
        aria-label={`${format.toUpperCase()} → ${target.toUpperCase()}`}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          cursor: "pointer",
          font: "inherit",
          color: "inherit",
          border: `1px solid ${cv.border}`,
          borderRadius: "16px",
          px: "10px",
          py: "2px",
          backgroundColor: cv.surface,
          userSelect: "none",
          "&:hover": { backgroundColor: cv.surfaceAlt, borderColor: cv.borderHover },
          "&:focus-visible": { outline: `2px solid ${cv.primaryText}`, outlineOffset: "2px" },
        }}
      >
        <Label name="BNF" active={format === "bnf"} />
        <SwapHorizIcon sx={{ fontSize: "16px", color: cv.primaryText }} />
        <Label name="EBNF" active={format === "ebnf"} />
      </Box>
    </Tooltip>
  );
}
