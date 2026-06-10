import { Button, Menu, MenuItem, ListSubheader, Divider } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";

// ── Formal BNF notation (<NonTerm> ::= ...) ─────────────────────────────────
// Same grammars rewritten with <> non-terminals, ::= separator, `epsilon` keyword
const BNF_FORMAL_EXAMPLES = [
  {
    labelKey: "testForEpsilon",
    tab: "removeEpsilon",
    text: "<S> ::= <A> <B> <C> <D>\n<A> ::= <C> <D> | <A> <C>\n<B> ::= <C> b\n<C> ::= a | epsilon\n<D> ::= b <D> | epsilon",
  },
  {
    labelKey: "testForUnit",
    tab: "removeUnitRules",
    text: "<S> ::= <A> <B> | <A> | <B>\n<A> ::= a <A> <A> | a <A> | a\n<B> ::= b <B> <B> | b <B> | b",
  },
  {
    labelKey: "testForUseless",
    tab: "removeUselessSymbols",
    // Textbook example 8.1.1: B is non-terminating, A and D become unreachable
    text: "<S> ::= <A> <B> | <C>\n<A> ::= a <A> | a\n<B> ::= b <B>\n<C> ::= c\n<D> ::= b c",
  },
  {
    labelKey: "testForLeftRecursion",
    tab: "removeLeftRecursion",
    text: "<A> ::= <B> a | <A> a | c\n<B> ::= <B> b | <A> b | d",
  },
  {
    labelKey: "testForCNF",
    tab: "convertToCNF",
    text: "<S> ::= <A> <B> <A>\n<A> ::= a <A> | epsilon\n<B> ::= b <B> c | epsilon",
  },
];

// ── EBNF notation (NonTerm ::= ..., "terminal", {}, [], ()) — for EBNF → BNF ─
// Same grammars using EBNF constructs where possible:
//   C → a | ε        →  C ::= ["a"]          (optional)
//   D → b D | ε      →  D ::= {"b"}           (Kleene star)
//   A → C D | A C    →  A ::= C D {C}         (left-rec → iteration)
//   A → B a | A a | c → A ::= ("c" | B "a") {"a"}
const EBNF_EXAMPLES = [
  {
    labelKey: "testForEpsilon",
    tab: "removeEpsilon",
    // C → a | ε  ⟹  C ::= ["a"]
    // D → b D | ε  ⟹  D ::= {"b"}
    // A → C D | A C  ⟹  A ::= C D {C}  (left-rec removed via iteration)
    text: 'S ::= A B C D\nA ::= C D {C}\nB ::= C "b"\nC ::= ["a"]\nD ::= {"b"}',
  },
  {
    labelKey: "testForUnit",
    tab: "removeUnitRules",
    // No obvious EBNF simplification; just reformat syntax
    text: 'S ::= A B | A | B\nA ::= "a" A A | "a" A | "a"\nB ::= "b" B B | "b" B | "b"',
  },
  {
    labelKey: "testForUseless",
    tab: "removeUselessSymbols",
    // Textbook example 8.1.1: B is non-terminating, A and D become unreachable
    text: 'S ::= A B | C\nA ::= "a" A | "a"\nB ::= "b" B\nC ::= "c"\nD ::= "b" "c"',
  },
  {
    labelKey: "testForLeftRecursion",
    tab: "removeLeftRecursion",
    // A → B a | A a | c  ⟹  A ::= ("c" | B "a") {"a"}
    // B → B b | A b | d  ⟹  B ::= ("d" | A "b") {"b"}
    text: 'A ::= ("c" | B "a") {"a"}\nB ::= ("d" | A "b") {"b"}',
  },
  {
    labelKey: "testForCNF",
    tab: "convertToCNF",
    // A → a A | ε  ⟹  A ::= {"a"}
    // B → b B c | ε  ⟹  cannot be simplified further with EBNF constructs
    text: 'S ::= A B A\nA ::= {"a"}\nB ::= "b" B "c" | epsilon',
  },
];

const SUBHEADER_SX = {
  lineHeight: "28px",
  fontSize: "0.7rem",
  fontWeight: 700,
  color: "#1565C0",
  backgroundColor: "#EEF2F7",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const Examples = ({ onExampleSelect }) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleSelect = (text, tab) => {
    setAnchorEl(null);
    if (onExampleSelect) onExampleSelect(text, tab);
  };

  return (
    <>
      <Button
        variant="contained"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          backgroundColor: "#1565C0",
          color: "white",
          height: "36px",
          fontSize: "0.78rem",
          textTransform: "none",
          px: 2,
          "&:hover": { backgroundColor: "#0D47A1" },
        }}
      >
        {t("examples")}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { maxHeight: 520, minWidth: 240 } }}
      >
        {/* ── BNF format ── */}
        <ListSubheader sx={SUBHEADER_SX}>{t("sectionBNFtoEBNF")}</ListSubheader>
        {BNF_FORMAL_EXAMPLES.map((ex) => (
          <MenuItem key={`bnf-${ex.labelKey}`} onClick={() => handleSelect(ex.text, ex.tab)}>
            {t(ex.labelKey)}
          </MenuItem>
        ))}

        <Divider sx={{ my: 0.5 }} />

        {/* ── EBNF → BNF ── */}
        <ListSubheader sx={SUBHEADER_SX}>{t("sectionEBNFtoBNF")}</ListSubheader>
        {EBNF_EXAMPLES.map((ex) => (
          <MenuItem key={`ebnf-${ex.labelKey}`} onClick={() => handleSelect(ex.text, ex.tab)}>
            {t(ex.labelKey)}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default Examples;
