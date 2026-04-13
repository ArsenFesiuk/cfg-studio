import React, { useState, useRef } from "react";
import { RemovingEpsilonRules } from "../utils/normalization/RemovingEpsilonRules.js";
import { RemovingUnitRules } from "../utils/normalization/RemovingUnitRules.js";
import { RemovingUselessSymbols } from "../utils/normalization/RemovingUselessSymbols.js";
import { RemovingLeftRecursion } from "../utils/normalization/RemovingLeftRecursion.js";
import { CNFConversion } from "../utils/normalization/CNFConversastion.js";
import { parseGrammar } from "../utils/grammar/GrammarParser.js";
import { convertBNFToEBNF } from "../utils/grammar/convertBNFToEBNF.js";
import { convertEBNFToBNF } from "../utils/grammar/convertEBNFToBNF.js";
import MyAppBar from "./MyAppBar.jsx";
import SupportedGrammars from "./SupportedGrammars.jsx";
import Examples from "./Examples.jsx";
import { Button, Tooltip, Typography, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { PseudoCodeViewer } from "./PseudoCodeViewer.jsx";
import ImportFile from "./ImportFile.jsx";
import ExportMenu from "./ExportMenu.jsx";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import FlagIcon from "@mui/icons-material/Flag";
import RefreshIcon from "@mui/icons-material/Refresh";

const TAB_CONFIG = {
  removeEpsilon: { ProcessingClass: RemovingEpsilonRules, translationKey: "stepsForRemoveEpsilonRules" },
  removeUnitRules: { ProcessingClass: RemovingUnitRules, translationKey: "stepsForRemoveUnitRules" },
  removeUselessSymbols: { ProcessingClass: RemovingUselessSymbols, translationKey: "stepsForRemoveUselessSymbols" },
  removeLeftRecursion: { ProcessingClass: RemovingLeftRecursion, translationKey: "stepsForLeftRecursion" },
  convertToCNF: { ProcessingClass: CNFConversion, translationKey: "stepsForGrammarTransformation" },
};

const GrammarInput = () => {
  const { t } = useTranslation();

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [errors, setErrors] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [resultReady, setResultReady] = useState(false);
  const [stepInfo, setStepInfo] = useState(null);

  const pseudoCodeViewerRef = useRef(null);

  const replaceEscapes = (text) =>
    text.replace(/\\eps/g, "ε").replace(/->/g, "→");

  const formatGrammarOutput = (rules) =>
    rules
      .map((rule) => {
        const alternatives = rule.rightSide.map((alt) => alt.join(" ")).join(" | ");
        return `${rule.leftSide} → ${alternatives}`;
      })
      .join("\n");

  const isBnfEbnfMode = (tab) => tab === "bnfToEbnf" || tab === "ebnfToBnf";

  const handleInputChange = (e) => {
    const replacedInput = replaceEscapes(e.target.value);
    setInput(replacedInput);
    setOutput("");
    setResultReady(false);
    setStepInfo(null);

    // Skip CFG grammar validation for formal BNF/EBNF conversion tabs
    if (isBnfEbnfMode(activeTab)) {
      setErrors([]);
      return;
    }

    try {
      const { errors } = parseGrammar(replacedInput, t);
      setErrors(errors.length > 0 ? errors : []);
    } catch (error) {
      setErrors([error.message]);
    }
  };

  // ε ↔ epsilon helpers for the formal BNF/EBNF parsers
  const epsilonToWord = (text) => text.replace(/ε/g, "epsilon");
  const wordToEpsilon = (text) => text.replace(/\bepsilon\b/g, "ε");

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setOutput("");
    setResultReady(false);
    setStepInfo(null);
  };

  const runTransformation = () => {
    if (!activeTab) return;

    if (activeTab === "bnfToEbnf") {
      try {
        const result = convertBNFToEBNF(epsilonToWord(input));
        setOutput(wordToEpsilon(result));
        setErrors([]);
        setResultReady(true);
        setStepInfo(null);
      } catch (err) {
        setErrors([err.message]);
      }
      return;
    }

    if (activeTab === "ebnfToBnf") {
      try {
        const result = convertEBNFToBNF(epsilonToWord(input));
        setOutput(wordToEpsilon(result));
        setErrors([]);
        setResultReady(true);
        setStepInfo(null);
      } catch (err) {
        setErrors([err.message]);
      }
      return;
    }

    const config = TAB_CONFIG[activeTab];
    if (!config) return;

    const { rules, errors: parseErrors } = parseGrammar(input, t);
    if (parseErrors.length > 0) {
      setErrors(parseErrors);
      return;
    }
    setErrors([]);

    if (activeTab === "removeUselessSymbols") {
      const transformer = new RemovingUselessSymbols(rules, t);
      const finalRules = transformer.execute();
      setOutput(formatGrammarOutput(finalRules));
    } else if (activeTab === "convertToCNF") {
      const cnfConversion = new CNFConversion(rules, t);
      const finalRules = cnfConversion.execute();
      setOutput(formatGrammarOutput(finalRules));
    } else {
      const transformer = new config.ProcessingClass(rules, t);
      transformer.execute();
      setOutput(formatGrammarOutput(rules));
    }

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

  const handleExampleSelect = (exampleText, targetTab) => {
    const replaced = replaceEscapes(exampleText);
    setInput(replaced);
    setOutput("");
    setErrors([]);
    setResultReady(false);
    setStepInfo(null);
    if (targetTab) setActiveTab(targetTab);
  };

  const hasErrors = errors.length > 0;
  const isEmpty = input.trim() === "";
  const isBnfEbnfTab = activeTab === "bnfToEbnf" || activeTab === "ebnfToBnf";
  const resultDisabled = !activeTab || (hasErrors && !isBnfEbnfTab) || isEmpty;

  const showPseudoCode =
    resultReady && activeTab && TAB_CONFIG[activeTab];

  return (
    <Box sx={{ backgroundColor: "#EEF2F7", minHeight: "100vh", pt: "56px" }}>
      <MyAppBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        tabsDisabled={hasErrors || isEmpty}
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
                const { errors } = parseGrammar(replaced, t);
                if (errors.length > 0) {
                  setErrors([t("fileImportError"), ...errors]);
                  setInput(replaced);
                  setOutput("");
                  return;
                }
                setInput(replaced);
                setOutput("");
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
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: "#1565C0", mb: 0.5, fontSize: "0.78rem" }}
            >
              {t("input")}
            </Typography>
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
            <textarea
              value={output}
              readOnly
              placeholder={t("noOutput") || "No output yet"}
              style={{
                flex: 1,
                width: "100%",
                border: "1px solid #DDE3EA",
                borderRadius: "6px",
                padding: "10px",
                fontFamily: "monospace",
                fontSize: "0.9rem",
                resize: "none",
                outline: "none",
                backgroundColor: "#F5F7FA",
                color: "#2C2C2C",
                lineHeight: "1.6",
                boxSizing: "border-box",
              }}
            />
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
              onClick={() => pseudoCodeViewerRef.current?.goNext && pseudoCodeViewerRef.current.goPrev()}
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
                inputText={input}
                ProcessingClass={TAB_CONFIG[activeTab].ProcessingClass}
                translationKey={TAB_CONFIG[activeTab].translationKey}
                onStepChange={(info) => setStepInfo(info)}
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
