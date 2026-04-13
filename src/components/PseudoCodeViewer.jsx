import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { MathJax } from "better-react-mathjax";
import { useTranslation } from "react-i18next";

export const PseudoCodeViewer = forwardRef(function PseudoCodeViewer(
  { inputText, ProcessingClass, translationKey, onStepChange },
  ref
) {
  const [currentLine, setCurrentLine] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [steps, setSteps] = useState([]);
  const [currentExplanation, setCurrentExplanation] = useState(0);
  const { t } = useTranslation();
  const pseudoCodeSteps = t(translationKey, { returnObjects: true });

  const pseudoCodeContainerRef = useRef(null);
  const lineRefs = useRef([]);
  const mathJaxRef = useRef(null);

  const handleNextStep = () => {
    if (currentExplanation < steps.length - 1) {
      const nextStep = steps[currentExplanation + 1];
      setCurrentLine(nextStep.line);
      setCurrentExplanation((prev) => prev + 1);
      setExplanation(nextStep.message);
    }
  };

  const handlePreviousStep = () => {
    if (currentExplanation > 0) {
      const prevStep = steps[currentExplanation - 1];
      setCurrentLine(prevStep.line);
      setCurrentExplanation((prev) => prev - 1);
      setExplanation(prevStep.message);
    }
  };

  useImperativeHandle(ref, () => ({
    goNext: handleNextStep,
    goPrev: handlePreviousStep,
    canGoNext: () => currentExplanation < steps.length - 1,
    canGoPrev: () => currentExplanation > 0,
    currentStep: currentExplanation + 1,
    totalSteps: steps.length,
  }));

  useEffect(() => {
    if (inputText) {
      const rules = inputText.split("\n").map((line) => {
        const [left, right] = line.split("→").map((part) => part.trim());
        return {
          leftSide: left,
          rightSide: right.split("|").map((alt) => alt.trim().split(" ")),
        };
      });

      const processor = new ProcessingClass(rules, t);
      processor.execute();
      setSteps(processor.explanations);
      setCurrentLine(0);
      setCurrentExplanation(0);
      const firstMsg = processor.explanations[0]?.message || "";
      setExplanation(firstMsg);
      if (onStepChange) {
        onStepChange({
          current: 1,
          total: processor.explanations.length,
          message: firstMsg,
          canGoNext: processor.explanations.length > 1,
          canGoPrev: false,
        });
      }
    }
  }, [inputText, ProcessingClass, t]);

  useEffect(() => {
    if (lineRefs.current[currentLine]) {
      lineRefs.current[currentLine].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentLine]);

  useEffect(() => {
    if (onStepChange) {
      onStepChange({
        current: currentExplanation + 1,
        total: steps.length,
        message: explanation,
        canGoNext: currentExplanation < steps.length - 1,
        canGoPrev: currentExplanation > 0,
      });
    }
  }, [currentExplanation, steps.length, explanation]);

  useEffect(() => {
    if (mathJaxRef.current && window.MathJax) {
      window.MathJax.typeset();
    }
  }, [explanation]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", height: "100%" }}>
      {/* Pseudocode container */}
      <div
        ref={pseudoCodeContainerRef}
        style={{
          flex: 1,
          position: "relative",
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
        <MathJax>
          {pseudoCodeSteps.map((line, index) => (
            <div
              key={index}
              ref={(el) => (lineRefs.current[index] = el)}
              style={{
                padding: "4px 8px",
                fontWeight: index === currentLine ? "bold" : "normal",
                backgroundColor: index === currentLine ? "#FFF3CD" : "transparent",
                border: index === currentLine ? "1px solid #FFD700" : "1px solid transparent",
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
          ))}
        </MathJax>
      </div>

      {/* Explanation container */}
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
        <MathJax>
          <h3 style={{ marginTop: "0px", color: "#1565C0", fontSize: "0.95rem" }}>
            {t("explanation")}:
          </h3>
          <p
            ref={mathJaxRef}
            style={{ fontSize: "0.9rem", lineHeight: "1.6", margin: 0 }}
            dangerouslySetInnerHTML={{ __html: explanation.replace(/\n/g, "<br />") }}
          />
        </MathJax>
      </div>
    </div>
  );
});

export default PseudoCodeViewer;
