import React, { useState, useRef, useLayoutEffect, useMemo, useCallback } from "react";
import { RemovingEpsilonRules } from "../utils/normalization/RemovingEpsilonRules.js";
import { RemovingUnitRules } from "../utils/normalization/RemovingUnitRules.js";
import { RemovingUselessSymbols } from "../utils/normalization/RemovingUselessSymbols.js";
import { RemovingLeftRecursion } from "../utils/normalization/RemovingLeftRecursion.js";
import { CNFConversion } from "../utils/normalization/CNFConversastion.js";
import { parseGrammar, getPlainRules, detectGrammarType } from "../utils/grammar/GrammarParser.js";
import MyAppBar from "./MyAppBar.jsx";
import SupportedGrammars from "./SupportedGrammars.jsx";
import Examples from "./Examples.jsx";
import { Button, Tooltip, Typography, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { PseudoCodeViewer } from "./PseudoCodeViewer.jsx";
import ImportFile from "./ImportFile.jsx";
import ExportMenu from "./ExportMenu.jsx";
import FormatSwitch from "./FormatSwitch.jsx";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import FlagIcon from "@mui/icons-material/Flag";
import RefreshIcon from "@mui/icons-material/Refresh";

// Each tab maps to its algorithm class. Algorithms that expose their own
// `blocks` (8.1–8.6 pseudocode) need nothing more; legacy ones get a
// `legacyLinesKey` pointing at their single flat pseudocode array.
// `stepwiseOutput` algorithms emit a grammar snapshot per step, so the output
// panel builds up the result progressively while stepping instead of showing
// the final grammar immediately.
const TAB_CONFIG = {
  removeEpsilon: { ProcessingClass: RemovingEpsilonRules, legacyLinesKey: "stepsForRemoveEpsilonRules", stepwiseOutput: true },
  removeUnitRules: { ProcessingClass: RemovingUnitRules, legacyLinesKey: "stepsForRemoveUnitRules", stepwiseOutput: true },
  removeUselessSymbols: { ProcessingClass: RemovingUselessSymbols, stepwiseOutput: true },
  removeLeftRecursion: { ProcessingClass: RemovingLeftRecursion, legacyLinesKey: "stepsForLeftRecursion" },
  convertToCNF: { ProcessingClass: CNFConversion, legacyLinesKey: "stepsForGrammarTransformation" },
};

const GrammarInput = () => {
  const { t } = useTranslation();

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [errors, setErrors] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [resultReady, setResultReady] = useState(false);
  const [stepInfo, setStepInfo] = useState(null);
  const [format, setFormat] = useState("bnf"); // 'bnf' | 'ebnf'

  const pseudoCodeViewerRef = useRef(null);
  const textareaRef = useRef(null);
  const cursorPosRef = useRef(null);

  const replaceEscapes = (text) =>
    text.replace(/\\eps/g, "ε").replace(/\bepsilon\b/g, "ε");

  const formatGrammarOutput = (rules) =>
    rules
      .map((rule) => {
        const alternatives = rule.rightSide.map((alt) => alt.join(" ")).join(" | ");
        return `${rule.leftSide} → ${alternatives}`;
      })
      .join("\n");

  // Render a grammar string line by line. When `change` is set, the line of the
  // affected rule is highlighted: an added alternative glows green, while a rule
  // that just lost a production (e.g. A → ε) is tinted amber.
  const renderGrammar = (grammar, change) => {
    const lines = grammar.split("\n");
    return lines.map((line, i) => {
      const arrowIdx = line.indexOf("→");
      const lhs = arrowIdx === -1 ? null : line.slice(0, arrowIdx).trim();
      const isChangedRule = change && lhs === change.leftSide;

      if (!isChangedRule) {
        return <div key={i}>{line || " "}</div>;
      }
      // whole-line highlight: removals (amber) or a brand-new rule with no single alt
      if (change.kind === "remove" || !change.alt) {
        const bg = change.kind === "remove" ? "#FFE9B8" : "#C8E6C9";
        return (
          <div key={i} style={{ backgroundColor: bg, borderRadius: 4, padding: "0 2px" }}>
            {line}
          </div>
        );
      }
      // an added alternative: highlight just that token in green
      const head = line.slice(0, arrowIdx + 1);
      const alts = line.slice(arrowIdx + 1).split("|");
      return (
        <div key={i}>
          {head}
          {alts.map((a, j) => {
            const hit = a.trim() === change.alt;
            return (
              <span key={j}>
                {j > 0 ? "|" : ""}
                <span
                  style={
                    hit
                      ? { backgroundColor: "#C8E6C9", borderRadius: 4, padding: "0 2px", fontWeight: 700 }
                      : undefined
                  }
                >
                  {a}
                </span>
              </span>
            );
          })}
        </div>
      );
    });
  };

  // Plain CFG rules for the current input (EBNF is expanded to BNF first).
  // Memoised so the viewer doesn't re-run on every render.
  const plainRules = useMemo(() => getPlainRules(input, t).rules, [input, t]);

  // Stable identity so PseudoCodeViewer's notify effect doesn't loop
  const handleStepChange = useCallback((info) => setStepInfo(info), []);

  // Restore cursor position after React re-renders with transformed text
  useLayoutEffect(() => {
    if (cursorPosRef.current !== null && textareaRef.current) {
      textareaRef.current.selectionStart = cursorPosRef.current;
      textareaRef.current.selectionEnd = cursorPosRef.current;
      cursorPosRef.current = null;
    }
  }, [input]);

  const validate = (text) => {
    try {
      const { errors: parseErrors } = parseGrammar(text, t);
      setErrors(parseErrors.length > 0 ? parseErrors : []);
    } catch (error) {
      setErrors([error.message]);
    }
  };

  const handleInputChange = (e) => {
    const rawValue = e.target.value;
    const rawCursor = e.target.selectionStart;
    const replacedInput = replaceEscapes(rawValue);

    // Compute where the cursor lands after replacements before it
    const replacedBeforeCursor = replaceEscapes(rawValue.substring(0, rawCursor));
    cursorPosRef.current = replacedBeforeCursor.length;

    setInput(replacedInput);
    setOutput("");
    setResultReady(false);
    setStepInfo(null);
    syncFormat(replacedInput);
    validate(replacedInput);
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setOutput("");
    setResultReady(false);
    setStepInfo(null);
    if (input.trim()) validate(input);
  };

  const handleFormatSwitch = (newFormat, newText, errorMsg) => {
    setFormat(newFormat);
    setInput(newText);
    setOutput("");
    setResultReady(false);
    setStepInfo(null);
    if (errorMsg) {
      setErrors([errorMsg]);
    } else if (newText.trim()) {
      validate(newText);
    } else {
      setErrors([]);
    }
  };

  const runTransformation = () => {
    if (!activeTab) return;
    const config = TAB_CONFIG[activeTab];
    if (!config) return;

    const { rules, errors: parseErrors } = getPlainRules(input, t);
    if (parseErrors.length > 0) {
      setErrors(parseErrors);
      return;
    }
    setErrors([]);

    const transformer = new config.ProcessingClass(rules, t);
    transformer.execute();
    // every algorithm keeps the final grammar in `transformer.rules`
    const resultRules = Array.isArray(transformer.rules) ? transformer.rules : rules;
    setOutput(formatGrammarOutput(resultRules));
    setResultReady(true);
  };

  const handleReset = () => {
    setInput("");
    setOutput("");
    setErrors([]);
    setActiveTab(null);
    setResultReady(false);
    setStepInfo(null);
  };

  const syncFormat = (text) => {
    const type = detectGrammarType(text);
    if (type === "bnf" || type === "ebnf") setFormat(type);
  };

  const handleExampleSelect = (exampleText, targetTab) => {
    const replaced = replaceEscapes(exampleText);
    setInput(replaced);
    setOutput("");
    setErrors([]);
    setResultReady(false);
    setStepInfo(null);
    if (targetTab) setActiveTab(targetTab);
    syncFormat(replaced);
    if (replaced.trim()) validate(replaced);
  };

  const hasErrors = errors.length > 0;
  const isEmpty = input.trim() === "";
  const resultDisabled = !activeTab || hasErrors || isEmpty;

  const showPseudoCode =
    resultReady && activeTab && TAB_CONFIG[activeTab] && plainRules.length > 0;

  // For stepwise algorithms the output panel mirrors the grammar at the current
  // step (built up progressively); other algorithms show the final result string.
  // `output` always holds the final grammar for export, regardless.
  const stepwise = showPseudoCode && TAB_CONFIG[activeTab]?.stepwiseOutput;
  const panelGrammar = stepwise ? (stepInfo?.grammar ?? "") : output;
  const panelChange = stepwise ? (stepInfo?.change ?? null) : null;

  return (
    <Box sx={{ backgroundColor: "#EEF2F7", minHeight: "100vh", pt: "56px" }}>
      <MyAppBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        tabsDisabled={isEmpty}
      />

      {/* Main content */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          height: "calc(100vh - 56px)",
          overflow: "hidden",
        }}
      >
        {/* ── Left panel ── */}
        <Box
          sx={{
            width: "38%",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            p: "12px",
            overflow: "hidden",
          }}
        >
          {/* Action buttons row */}
          <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <Examples onExampleSelect={handleExampleSelect} />
            <ImportFile
              onFileImport={(fileContent) => {
                const replaced = replaceEscapes(fileContent);
                const { errors: importErrors } = parseGrammar(replaced, t);
                setInput(replaced);
                setOutput("");
                syncFormat(replaced);
                if (importErrors.length > 0) {
                  setErrors([t("fileImportError"), ...importErrors]);
                  return;
                }
                setErrors([]);
              }}
            />
            <ExportMenu
              inputText={input}
              outputText={output}
              isValidGrammar={!hasErrors && !isEmpty}
            />
          </Box>

          {/* Grammar input card */}
          <Box
            sx={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #DDE3EA",
              borderRadius: "8px",
              p: "14px",
              display: "flex",
              flexDirection: "column",
              flex: 1,
              overflow: "hidden",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: "#1565C0", fontSize: "0.78rem" }}
              >
                {t("input")}
              </Typography>
              <FormatSwitch format={format} value={input} onSwitch={handleFormatSwitch} />
            </Box>
            <Tooltip
              title={hasErrors ? errors.map((err, i) => <div key={i}>{err}<br /></div>) : ""}
              arrow
              componentsProps={{
                tooltip: {
                  sx: { fontSize: "14px", padding: "10px 14px", maxWidth: "400px", borderRadius: "8px" },
                },
              }}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                placeholder={t("inputPlaceholder")}
                style={{
                  flex: 1,
                  width: "100%",
                  border: hasErrors ? "1px solid #EF5350" : "1px solid #DDE3EA",
                  borderRadius: "6px",
                  padding: "10px",
                  fontFamily: "monospace",
                  fontSize: "0.9rem",
                  resize: "none",
                  outline: "none",
                  backgroundColor: hasErrors ? "#FFF8F8" : "#FAFBFC",
                  color: "#2C2C2C",
                  lineHeight: "1.6",
                  boxSizing: "border-box",
                }}
              />
            </Tooltip>
          </Box>

          {/* Output card */}
          <Box
            sx={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #DDE3EA",
              borderRadius: "8px",
              p: "14px",
              display: "flex",
              flexDirection: "column",
              flex: 1,
              overflow: "hidden",
            }}
          >
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: "#1565C0", mb: 0.5, fontSize: "0.78rem" }}
            >
              {t("output")}
            </Typography>
            <div
              style={{
                flex: 1,
                width: "100%",
                border: "1px solid #DDE3EA",
                borderRadius: "6px",
                padding: "10px",
                fontFamily: "monospace",
                fontSize: "0.9rem",
                outline: "none",
                backgroundColor: "#F5F7FA",
                color: "#2C2C2C",
                lineHeight: "1.6",
                boxSizing: "border-box",
                overflow: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {panelGrammar
                ? renderGrammar(panelGrammar, panelChange)
                : <span style={{ color: "#9AA7B4" }}>{t("noOutput") || "No output yet"}</span>}
            </div>
          </Box>
        </Box>

        {/* Vertical divider */}
        <Box sx={{ width: "1px", backgroundColor: "#DDE3EA", flexShrink: 0 }} />

        {/* ── Right panel ── */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            p: "12px",
            overflow: "hidden",
          }}
        >
          {/* Navigation buttons */}
          <Box sx={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ArrowBackIosNewIcon sx={{ fontSize: "12px !important" }} />}
              onClick={() => pseudoCodeViewerRef.current?.goPrev && pseudoCodeViewerRef.current.goPrev()}
              disabled={!showPseudoCode || !stepInfo?.canGoPrev}
              sx={{
                borderColor: "#DDE3EA",
                color: "#555",
                textTransform: "none",
                fontSize: "0.78rem",
                px: 1.5,
                "&:hover": { borderColor: "#B0BEC5", backgroundColor: "#F5F7FA" },
                "&.Mui-disabled": { borderColor: "#ECEFF1", color: "#B0BEC5" },
              }}
            >
              {t("back") || "Back"}
            </Button>

            <Button
              variant="outlined"
              size="small"
              endIcon={<ArrowForwardIosIcon sx={{ fontSize: "12px !important" }} />}
              onClick={() => pseudoCodeViewerRef.current?.goNext && pseudoCodeViewerRef.current.goNext()}
              disabled={!showPseudoCode || !stepInfo?.canGoNext}
              sx={{
                borderColor: "#DDE3EA",
                color: "#555",
                textTransform: "none",
                fontSize: "0.78rem",
                px: 1.5,
                "&:hover": { borderColor: "#B0BEC5", backgroundColor: "#F5F7FA" },
                "&.Mui-disabled": { borderColor: "#ECEFF1", color: "#B0BEC5" },
              }}
            >
              {t("next") || "Next"}
            </Button>

            <Button
              variant="contained"
              size="small"
              startIcon={<FlagIcon sx={{ fontSize: "16px !important" }} />}
              onClick={runTransformation}
              disabled={resultDisabled}
              sx={{
                backgroundColor: "#43A047",
                textTransform: "none",
                fontSize: "0.78rem",
                px: 1.5,
                fontWeight: 700,
                "&:hover": { backgroundColor: "#388E3C" },
                "&.Mui-disabled": { backgroundColor: "#C8E6C9", color: "#FFFFFF" },
              }}
            >
              {t("result") || "Result"}
            </Button>

            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon sx={{ fontSize: "16px !important" }} />}
              onClick={handleReset}
              sx={{
                borderColor: "#DDE3EA",
                color: "#777",
                textTransform: "none",
                fontSize: "0.78rem",
                px: 1.5,
                "&:hover": { borderColor: "#B0BEC5", backgroundColor: "#F5F7FA" },
              }}
            >
              {t("reset") || "Reset"}
            </Button>
          </Box>

          {/* Status chip */}
          <Box
            sx={{
              display: "inline-flex",
              alignSelf: "flex-start",
              border: "1px solid #C5CCD5",
              borderRadius: "20px",
              px: "14px",
              py: "4px",
              backgroundColor: "#FFFFFF",
            }}
          >
            <Typography sx={{ fontSize: "0.8rem", color: "#555" }}>
              <Box component="span" sx={{ fontWeight: 700, color: "#1565C0" }}>
                {t("currentStep") || "Current step"}:{" "}
              </Box>
              {showPseudoCode && stepInfo
                ? `${stepInfo.current} / ${stepInfo.total}`
                : t("waitingForAlgorithm") || "Waiting for algorithm to start."}
            </Typography>
          </Box>

          {/* Content area */}
          <Box
            sx={{
              flex: 1,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {showPseudoCode ? (
              <PseudoCodeViewer
                ref={pseudoCodeViewerRef}
                rules={plainRules}
                ProcessingClass={TAB_CONFIG[activeTab].ProcessingClass}
                legacyLinesKey={TAB_CONFIG[activeTab].legacyLinesKey}
                onStepChange={handleStepChange}
              />
            ) : (
              <Box
                sx={{
                  flex: 1,
                  overflow: "auto",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #DDE3EA",
                  borderRadius: "8px",
                  p: 2,
                }}
              >
                <SupportedGrammars />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default GrammarInput;
