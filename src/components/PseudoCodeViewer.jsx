import { useState, useEffect, useMemo, useRef, forwardRef, useImperativeHandle } from "react";
import { MathJax } from "better-react-mathjax";
import { useTranslation } from "react-i18next";
import { cv } from "../theme/theme.js";
import DataTable from "./DataTable.jsx";

// Renders an algorithm's pseudocode as one or more "blocks" (e.g. Algoritmus 8.1
// and 8.2) and walks through its steps. Each step says which block + line is
// active. Algorithms expose:
//   processor.blocks = [{ titleKey, linesKey }]   (optional; legacy fallback used otherwise)
//   processor.steps  = [{ block, line, message }] (or legacy processor.explanations = [{line, message}])
export const PseudoCodeViewer = forwardRef(function PseudoCodeViewer(
  { rules, ProcessingClass, legacyLinesKey, processor: finishedProcessor, onStepChange },
  ref
) {
  const { t } = useTranslation();
  const [steps, setSteps] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [current, setCurrent] = useState(0);

  const lineRefs = useRef({}); // key: `${block}:${line}` -> element

  const handleNext = () => setCurrent((c) => Math.min(c + 1, steps.length - 1));
  const handlePrev = () => setCurrent((c) => Math.max(c - 1, 0));

  useImperativeHandle(ref, () => ({
    goNext: handleNext,
    goPrev: handlePrev,
    goTo: (index) => setCurrent(Math.max(0, Math.min(Math.floor(index), steps.length - 1))),
  }));

  // Build steps + blocks whenever the input grammar or algorithm changes.
  // Callers that already ran the algorithm pass the finished `processor`, so it
  // is not executed a second time; otherwise it is built here from `rules`.
  useEffect(() => {
    let processor = finishedProcessor;
    if (!processor) {
      if (!rules || rules.length === 0) {
        setSteps([]);
        setBlocks([]);
        return;
      }
      // deep copy so the algorithm never mutates the caller's rules
      const rulesCopy = rules.map((r) => ({
        leftSide: r.leftSide,
        rightSide: r.rightSide.map((alt) => [...alt]),
      }));

      processor = new ProcessingClass(rulesCopy, t);
      processor.execute();
    }

    const builtBlocks = processor.blocks ?? [{ titleKey: null, linesKey: legacyLinesKey }];
    const builtSteps =
      processor.steps ??
      (processor.explanations || []).map((e) => ({ block: 0, line: e.line, message: e.message }));

    setBlocks(builtBlocks);
    setSteps(builtSteps);
    setCurrent(0);
  }, [finishedProcessor, rules, ProcessingClass, legacyLinesKey, t]);

  const activeStep = steps[current] || null;

  // Keep the latest onStepChange in a ref so the notify effect below does NOT
  // depend on its identity. The parent passes a fresh inline callback every
  // render; depending on it here would re-run the effect → setState in parent
  // → re-render → new callback → loop ("Maximum update depth exceeded").
  const onStepChangeRef = useRef(onStepChange);
  useEffect(() => {
    onStepChangeRef.current = onStepChange;
  });

  // Notify parent about step position — only when the step actually changes.
  useEffect(() => {
    // Effective grammar = the most recent snapshot at or before the current step
    // (steps without a grammar change carry the previous state forward).
    let grammar = null;
    for (let i = Math.min(current, steps.length - 1); i >= 0; i--) {
      if (typeof steps[i]?.snapshot === "string" && steps[i].snapshot) {
        grammar = steps[i].snapshot;
        break;
      }
    }
    onStepChangeRef.current?.({
      current: steps.length ? current + 1 : 0,
      total: steps.length,
      message: steps[current]?.message || "",
      grammar,
      data: steps[current]?.data ?? null,
      change: steps[current]?.change || null,
      canGoNext: current < steps.length - 1,
      canGoPrev: current > 0,
    });
  }, [current, steps]);

  // Scroll active line into view
  useEffect(() => {
    if (!activeStep) return;
    const el = lineRefs.current[`${activeStep.block}:${activeStep.line}`];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeStep]);

  // Re-typeset MathJax when explanation changes
  useEffect(() => {
    if (window.MathJax && window.MathJax.typeset) window.MathJax.typeset();
  }, [activeStep]);

  // Progressive reveal of an iteration table (block bi, table tj): how many rows
  // are visible so far, computed from the steps walked up to `current`. One pass
  // over the steps serves every table (unit rules can have one table per symbol).
  const progressByTable = useMemo(() => {
    const progress = new Map();
    for (let i = 0; i <= current && i < steps.length; i++) {
      const s = steps[i];
      if (typeof s.table !== "number") continue;
      const key = `${s.block}:${s.table}`;
      const entry = progress.get(key) ?? { referenced: true, maxIter: -1 };
      if (typeof s.iter === "number" && s.iter > entry.maxIter) entry.maxIter = s.iter;
      progress.set(key, entry);
    }
    return progress;
  }, [steps, current]);

  const tableProgress = (bi, tj) =>
    progressByTable.get(`${bi}:${tj}`) ?? { referenced: false, maxIter: -1 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", height: "100%" }}>
      {/* Pseudocode blocks */}
      <div
        style={{
          flex: 1,
          minHeight: 160,
          padding: "16px",
          fontFamily: "Arial, sans-serif",
          border: `1px solid ${cv.border}`,
          backgroundColor: cv.surface,
          color: cv.text,
          overflowY: "auto",
          overflowX: "auto",
          borderRadius: "8px",
        }}
      >
        <h3 style={{ marginTop: "0px", color: cv.primaryText, fontSize: "0.95rem" }}>
          {t("pseudocode")}:
        </h3>
        <MathJax dynamic>
          {blocks.map((block, bi) => {
            const lines = t(block.linesKey, { returnObjects: true }) || [];
            return (
              <div key={bi} style={{ marginBottom: "14px" }}>
                {block.titleKey && (
                  <div style={{ fontWeight: 700, color: cv.heading, fontSize: "0.82rem", margin: "6px 0" }}>
                    {t(block.titleKey)}
                  </div>
                )}
                {Array.isArray(lines) &&
                  lines.map((line, li) => {
                    const isActive = activeStep && activeStep.block === bi && activeStep.line === li;
                    return (
                      <div
                        key={li}
                        ref={(el) => (lineRefs.current[`${bi}:${li}`] = el)}
                        style={{
                          padding: "4px 8px",
                          fontWeight: isActive ? "bold" : "normal",
                          backgroundColor: isActive ? cv.activeLine : "transparent",
                          border: isActive ? `1px solid ${cv.activeLineBorder}` : "1px solid transparent",
                          transition: "background-color 0.3s ease-in-out",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                          borderRadius: "4px",
                          textAlign: "left",
                          fontSize: "0.88rem",
                        }}
                      >
                        {line}
                      </div>
                    );
                  })}

                {/* Iteration tables (Tabuľka 8.1–8.8) built progressively */}
                {(block.tables || []).map((tbl, tj) => {
                  const { referenced, maxIter } = tableProgress(bi, tj);
                  if (!referenced) return null;

                  // "grid" tables are a one-shot LL(1) parse table RT[A, t]: rows are
                  // non-terminals, columns are terminals (+ $), cells hold rule
                  // numbers — conflicting cells (more than one rule) are highlighted.
                  if (tbl.kind === "grid") {
                    return (
                      <DataTable
                        key={`tbl-${tj}`}
                        firstColumnStrong
                        head={["RT", ...tbl.columns]}
                        rows={tbl.rows.map((row) => [
                          row.label,
                          ...row.cells.map((cell) => ({
                            content: cell.numbers.join(", "),
                            sx: {
                              color: cell.conflict ? cv.errorText : cv.okText,
                              fontWeight: cell.conflict ? 700 : 400,
                              backgroundColor: cell.conflict ? cv.errorBg : undefined,
                            },
                          })),
                        ])}
                      />
                    );
                  }

                  const visibleRows = tbl.rows.slice(0, maxIter + 1);
                  // the row being filled in by the current step, if it is in this table
                  const activeRow =
                    activeStep && activeStep.block === bi && activeStep.table === tj ? activeStep.iter : -1;

                  // "multi" tables track several sets at once (one column per
                  // non-terminal), e.g. FST_A / FLW_A — one row per outer iteration.
                  if (tbl.kind === "multi") {
                    return (
                      <DataTable
                        key={`tbl-${tj}`}
                        activeRow={activeRow}
                        head={[t("tableIter"), ...tbl.columns]}
                        rows={visibleRows.map((row, r) => [`${r + 1}.`, ...tbl.columns.map((col) => row.values[col])])}
                      />
                    );
                  }

                  return (
                    <DataTable
                      key={`tbl-${tj}`}
                      activeRow={activeRow}
                      head={[
                        t("tableIter"),
                        `${t("tableSet")} \\(${tbl.setLabel}\\)`,
                        `${t("tableSet")} \\(${tbl.prevLabel}\\)`,
                        `${t("tableCond")} \\(${tbl.setLabel} \\neq ${tbl.prevLabel}\\)`,
                      ]}
                      rows={visibleRows.map((row, r) => [
                        `${r + 1}.`,
                        row.set,
                        row.prev,
                        {
                          content: String(row.condition),
                          sx: { fontStyle: "italic", color: row.condition ? cv.primaryText : cv.okText },
                        },
                      ])}
                    />
                  );
                })}
              </div>
            );
          })}
        </MathJax>
      </div>

      {/* Explanation */}
      <div
        style={{
          flex: 1,
          minHeight: 160,
          padding: "16px",
          fontFamily: "Arial, sans-serif",
          border: `1px solid ${cv.border}`,
          borderLeft: `4px solid ${cv.primary}`,
          backgroundColor: cv.surface,
          color: cv.text,
          overflowY: "auto",
          borderRadius: "8px",
        }}
      >
        <MathJax dynamic>
          <h3 style={{ marginTop: "0px", color: cv.primaryText, fontSize: "0.95rem" }}>
            {t("explanation")}:
          </h3>
          <p
            style={{ fontSize: "0.9rem", lineHeight: "1.6", margin: 0 }}
            dangerouslySetInnerHTML={{ __html: (activeStep?.message || "").replace(/\n/g, "<br />") }}
          />
        </MathJax>
      </div>
    </div>
  );
});

export default PseudoCodeViewer;
