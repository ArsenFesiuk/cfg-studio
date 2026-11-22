import React, { useState, useEffect, useRef, useLayoutEffect, useMemo, useCallback } from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { getAlgorithm } from "../algorithms/registry.js";
import { cv } from "../theme/theme.js";
import { analyzeGrammar, detectGrammarType } from "../utils/grammar/GrammarParser.js";
import { useDebouncedValue } from "../hooks/useDebouncedValue.js";
import MyAppBar from "./MyAppBar.jsx";
import SupportedGrammars from "./SupportedGrammars.jsx";
import Examples from "./Examples.jsx";
import ImportFile from "./ImportFile.jsx";
import ExportMenu from "./ExportMenu.jsx";
import GrammarEditor from "./GrammarEditor.jsx";
import OutputPanel from "./OutputPanel.jsx";
import StepControls from "./StepControls.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";
import { PseudoCodeViewer } from "./PseudoCodeViewer.jsx";

const PARSE_DEBOUNCE_MS = 250;

const replaceEscapes = (text) =>
  text.replace(/\\eps/g, "ε").replace(/\bepsilon\b/g, "ε");

const formatGrammarOutput = (rules) =>
  rules
    .map((rule) => {
      const alternatives = rule.rightSide.map((alt) => alt.join(" ")).join(" | ");
      return `${rule.leftSide} → ${alternatives}`;
    })
    .join("\n");

const cloneRules = (rules) =>
  rules.map((r) => ({ leftSide: r.leftSide, rightSide: r.rightSide.map((alt) => [...alt]) }));

const GrammarInput = () => {
  const { t } = useTranslation();

  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState(null);
  const [resultRequested, setResultRequested] = useState(false);
  const [stepInfo, setStepInfo] = useState(null);
  const [format, setFormat] = useState("bnf"); // 'bnf' | 'ebnf'
  // messages that don't come from parsing the current text
  const [conversionError, setConversionError] = useState(null);
  const [importFailed, setImportFailed] = useState(false);

  // The grammar is parsed once per pause in typing (not per keystroke), and the
  // same parse feeds both the error display and the algorithms.
  const [parseInput, setParseInputNow] = useDebouncedValue(input, PARSE_DEBOUNCE_MS);
  const parsePending = input !== parseInput;
  const parsed = useMemo(() => analyzeGrammar(parseInput, t), [parseInput, t]);

  const pseudoCodeViewerRef = useRef(null);
  const textareaRef = useRef(null);
  const cursorPosRef = useRef(null);

  const algorithm = getAlgorithm(activeTab);

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

  // The algorithm runs exactly once per "Result" click. Both the output panel
  // and the step viewer read from this single run; it is rebuilt when the
  // language changes so explanations are re-translated.
  const run = useMemo(() => {
    if (!resultRequested || !algorithm || parsed.plainErrors.length > 0) return null;
    try {
      const processor = new algorithm.ProcessingClass(cloneRules(parsed.rules), t);
      processor.execute();
      // analysis-only algorithms (e.g. LL1Analysis) report a text summary instead
      // of a rewritten grammar; everything else keeps the final grammar in `rules`.
      const outputText =
        typeof processor.summary === "string"
          ? processor.summary
          : formatGrammarOutput(Array.isArray(processor.rules) ? processor.rules : parsed.rules);
      return { processor, outputText };
    } catch (error) {
      return { error: error.message };
    }
  }, [resultRequested, algorithm, parsed, t]);

  const output = run?.outputText ?? "";

  const errors = useMemo(() => {
    if (conversionError) return [conversionError];
    if (parsed.errors.length > 0) {
      return importFailed ? [t("fileImportError"), ...parsed.errors] : parsed.errors;
    }
    if (resultRequested && parsed.plainErrors.length > 0) return parsed.plainErrors;
    if (run?.error) return [run.error];
    return [];
  }, [conversionError, importFailed, parsed, resultRequested, run, t]);

  const resetResult = () => {
    setResultRequested(false);
    setStepInfo(null);
  };

  const clearNotices = () => {
    setConversionError(null);
    setImportFailed(false);
  };

  // Replace the text programmatically (example, import, format switch, reset):
  // parse right away instead of waiting for the typing debounce.
  const replaceInput = (text) => {
    setInput(text);
    setParseInputNow(text);
    resetResult();
  };

  const syncFormat = (text) => {
    const type = detectGrammarType(text);
    if (type === "bnf" || type === "ebnf") setFormat(type);
  };

  const handleInputChange = (e) => {
    const rawValue = e.target.value;
    const rawCursor = e.target.selectionStart;
    const replacedInput = replaceEscapes(rawValue);

    // Compute where the cursor lands after replacements before it
    const replacedBeforeCursor = replaceEscapes(rawValue.substring(0, rawCursor));
    cursorPosRef.current = replacedBeforeCursor.length;

    setInput(replacedInput);
    resetResult();
    clearNotices();
    syncFormat(replacedInput);
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    resetResult();
    clearNotices();
  };

  const handleFormatSwitch = (newFormat, newText, errorMsg) => {
    setFormat(newFormat);
    replaceInput(newText);
    setImportFailed(false);
    setConversionError(errorMsg || null);
  };

  const handleResult = () => {
    if (algorithm) setResultRequested(true);
  };

  const handleReset = () => {
    replaceInput("");
    clearNotices();
    setActiveTab(null);
  };

  const handleExampleSelect = (exampleText, targetTab) => {
    const replaced = replaceEscapes(exampleText);
    replaceInput(replaced);
    clearNotices();
    if (targetTab) setActiveTab(targetTab);
    syncFormat(replaced);
  };

  const handleFileImport = (fileContent) => {
    const replaced = replaceEscapes(fileContent);
    replaceInput(replaced);
    setConversionError(null);
    setImportFailed(true);
    syncFormat(replaced);
  };

  const hasErrors = errors.length > 0;
  const isEmpty = input.trim() === "";
  const resultDisabled = !activeTab || hasErrors || isEmpty || parsePending;

  const showPseudoCode = Boolean(run?.processor) && parsed.rules.length > 0;

  // ← / → step through the algorithm. Ignored while typing and inside menus or
  // dialogs, where the arrow keys already mean something else.
  useEffect(() => {
    if (!showPseudoCode) return undefined;
    const onKeyDown = (e) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const target = e.target;
      if (target?.closest?.('textarea, input, [contenteditable="true"], [role="menu"], [role="dialog"], [role="listbox"]')) {
        return;
      }
      if (e.key === "ArrowRight") {
        pseudoCodeViewerRef.current?.goNext?.();
        e.preventDefault();
      } else if (e.key === "ArrowLeft") {
        pseudoCodeViewerRef.current?.goPrev?.();
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showPseudoCode]);

  // For stepwise algorithms the output panel mirrors the grammar at the current
  // step (built up progressively); other algorithms show the final result string.
  // `output` always holds the final grammar for export, regardless.
  const stepwise = showPseudoCode && algorithm?.stepwiseOutput;
  const panelGrammar = stepwise ? (stepInfo?.grammar ?? "") : output;
  const panelChange = stepwise ? (stepInfo?.change ?? null) : null;

  // Analysis algorithms (LL(1)) produce a report, not a rewritten grammar: they
  // are drawn as tables and have nothing to compare against the input.
  const isGrammarResult = showPseudoCode && typeof run.processor.summary !== "string";
  const panelData = showPseudoCode && !isGrammarResult ? (stepInfo?.data ?? null) : null;
  const beforeGrammar = useMemo(() => formatGrammarOutput(parsed.rules), [parsed.rules]);

  return (
    <Box sx={{ backgroundColor: cv.bg, color: cv.text, minHeight: "100vh", pt: "56px" }}>
      <MyAppBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        tabsDisabled={isEmpty}
      />

      {/* Wide screens: two panels side by side, each scrolling on its own.
          Narrow screens: panels stack and the page scrolls. */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          height: { xs: "auto", md: "calc(100vh - 56px)" },
          overflow: { xs: "visible", md: "hidden" },
        }}
      >
        {/* ── Left panel ── */}
        <Box
          sx={{
            width: { xs: "100%", md: "38%" },
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            p: "12px",
            overflow: { xs: "visible", md: "hidden" },
          }}
        >
          <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <Examples onExampleSelect={handleExampleSelect} />
            <ImportFile onFileImport={handleFileImport} />
            <ExportMenu
              inputText={input}
              outputText={output}
              isValidGrammar={!hasErrors && !isEmpty}
            />
          </Box>

          <GrammarEditor
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            errors={errors}
            format={format}
            onFormatSwitch={handleFormatSwitch}
          />

          <OutputPanel
            grammar={panelGrammar}
            change={panelChange}
            before={beforeGrammar}
            comparable={isGrammarResult}
            data={panelData}
          />
        </Box>

        <Box
          sx={{
            width: { xs: "100%", md: "1px" },
            height: { xs: "1px", md: "auto" },
            backgroundColor: cv.border,
            flexShrink: 0,
          }}
        />

        {/* ── Right panel ── */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            height: { xs: "85vh", md: "auto" },
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            p: "12px",
            overflow: "hidden",
          }}
        >
          <StepControls
            running={showPseudoCode}
            stepInfo={stepInfo}
            resultDisabled={resultDisabled}
            onPrev={() => pseudoCodeViewerRef.current?.goPrev?.()}
            onNext={() => pseudoCodeViewerRef.current?.goNext?.()}
            onGoTo={(index) => pseudoCodeViewerRef.current?.goTo?.(index)}
            onResult={handleResult}
            onReset={handleReset}
          />

          <Box
            sx={{
              flex: 1,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {showPseudoCode ? (
              <ErrorBoundary resetKey={run}>
                <PseudoCodeViewer
                  ref={pseudoCodeViewerRef}
                  processor={run.processor}
                  legacyLinesKey={algorithm.legacyLinesKey}
                  onStepChange={handleStepChange}
                />
              </ErrorBoundary>
            ) : (
              <Box
                sx={{
                  flex: 1,
                  overflow: "auto",
                  backgroundColor: cv.surface,
                  border: `1px solid ${cv.border}`,
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
