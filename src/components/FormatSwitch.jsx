import { Box, Tooltip } from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { convertBNFToEBNF } from "../utils/grammar/convertBNFToEBNF.js";
import { convertEBNFToBNF } from "../utils/grammar/convertEBNFToBNF.js";

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
        color: active ? "#1565C0" : "#9AA7B4",
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
        onClick={handleClick}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          cursor: "pointer",
          border: "1px solid #DDE3EA",
          borderRadius: "16px",
          px: "10px",
          py: "2px",
          backgroundColor: "#FFFFFF",
          userSelect: "none",
          "&:hover": { backgroundColor: "#F5F7FA", borderColor: "#B0BEC5" },
        }}
      >
        <Label name="BNF" active={format === "bnf"} />
        <SwapHorizIcon sx={{ fontSize: "16px", color: "#1565C0" }} />
        <Label name="EBNF" active={format === "ebnf"} />
      </Box>
    </Tooltip>
  );
}
