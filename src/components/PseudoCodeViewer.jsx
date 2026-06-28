import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { MathJax } from "better-react-mathjax";
import { useTranslation } from "react-i18next";

// Renders an algorithm's pseudocode as one or more "blocks" (e.g. Algoritmus 8.1
// and 8.2) and walks through its steps. Each step says which block + line is
// active. Algorithms expose:
//   processor.blocks = [{ titleKey, linesKey }]   (optional; legacy fallback used otherwise)
//   processor.steps  = [{ block, line, message }] (or legacy processor.explanations = [{line, message}])
export const PseudoCodeViewer = forwardRef(function PseudoCodeViewer(
  { rules, ProcessingClass, legacyLinesKey, onStepChange },
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
  }));

  // Build steps + blocks whenever the input grammar or algorithm changes
  useEffect(() => {
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

    const processor = new ProcessingClass(rulesCopy, t);
    processor.execute();

    const builtBlocks = processor.blocks ?? [{ titleKey: null, linesKey: legacyLinesKey }];
    const builtSteps =
      processor.steps ??
      (processor.explanations || []).map((e) => ({ block: 0, line: e.line, message: e.message }));

    setBlocks(builtBlocks);
    setSteps(builtSteps);
    setCurrent(0);
  }, [rules, ProcessingClass, legacyLinesKey, t]);

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
  // are visible so far, computed from the steps walked up to `current`.
  const tableProgress = (bi, tj) => {
    let maxIter = -1;
    let referenced = false;
    for (let i = 0; i <= current && i < steps.length; i++) {
      const s = steps[i];
      if (s.block === bi && s.table === tj) {
        referenced = true;
        if (typeof s.iter === "number" && s.iter > maxIter) maxIter = s.iter;
      }
    }
    return { referenced, maxIter };
  };

  const cellStyle = {
    border: "1px solid #DDE3EA",
    padding: "4px 10px",
    fontSize: "0.82rem",
    textAlign: "left",
    whiteSpace: "nowrap",
  };
  const headStyle = { ...cellStyle, fontWeight: 700, color: "#1E3A5F", backgroundColor: "#F5F7FA" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", height: "100%" }}>
      {/* Pseudocode blocks */}
      <div
        style={{
          flex: 1,
          padding: "16px",
          fontFamily: "Arial, sans-serif",
          border: "1px solid #DDE3EA",
          backgroundColor: "#FFFFFF",
          overflowY: "auto",
          overflowX: "auto",
          borderRadius: "8px",
        }}
      >
        <h3 style={{ marginTop: "0px", color: "#1565C0", fontSize: "0.95rem" }}>
          {t("pseudocode")}:
        </h3>
        <MathJax dynamic>
          {blocks.map((block, bi) => {
            const lines = t(block.linesKey, { returnObjects: true }) || [];
            return (
              <div key={bi} style={{ marginBottom: "14px" }}>
                {block.titleKey && (
                  <div style={{ fontWeight: 700, color: "#1E3A5F", fontSize: "0.82rem", margin: "6px 0" }}>
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
                          backgroundColor: isActive ? "#FFF3CD" : "transparent",
                          border: isActive ? "1px solid #FFD700" : "1px solid transparent",
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
                  const visibleRows = tbl.rows.slice(0, maxIter + 1);
                  return (
                    <table
                      key={`tbl-${tj}`}
                      style={{ borderCollapse: "collapse", margin: "8px 0 4px", fontFamily: "Arial, sans-serif" }}
                    >
                      <thead>
                        <tr>
                          <th style={headStyle}>{t("tableIter")}</th>
                          <th style={headStyle}>{`${t("tableSet")} \\(${tbl.setLabel}\\)`}</th>
                          <th style={headStyle}>{`${t("tableSet")} \\(${tbl.prevLabel}\\)`}</th>
                          <th style={headStyle}>{`${t("tableCond")} \\(${tbl.setLabel} \\neq ${tbl.prevLabel}\\)`}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleRows.map((row, r) => {
                          const active =
                            activeStep &&
                            activeStep.block === bi &&
                            activeStep.table === tj &&
                            activeStep.iter === r;
                          return (
                            <tr key={r} style={{ backgroundColor: active ? "#FFF3CD" : "transparent" }}>
                              <td style={cellStyle}>{r + 1}.</td>
                              <td style={cellStyle}>{row.set}</td>
                              <td style={cellStyle}>{row.prev}</td>
                              <td style={{ ...cellStyle, fontStyle: "italic" }}>{String(row.condition)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
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
          padding: "16px",
          fontFamily: "Arial, sans-serif",
          border: "1px solid #DDE3EA",
          backgroundColor: "#FFFFFF",
          overflowY: "auto",
          borderRadius: "8px",
        }}
      >
        <MathJax dynamic>
          <h3 style={{ marginTop: "0px", color: "#1565C0", fontSize: "0.95rem" }}>
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
