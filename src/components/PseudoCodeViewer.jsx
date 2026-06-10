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

  // Notify parent about step position
  useEffect(() => {
    if (!onStepChange) return;
    onStepChange({
      current: steps.length ? current + 1 : 0,
      total: steps.length,
      message: activeStep?.message || "",
      canGoNext: current < steps.length - 1,
      canGoPrev: current > 0,
    });
  }, [current, steps, activeStep, onStepChange]);

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
