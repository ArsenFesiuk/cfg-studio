import { useState, useEffect } from "react";
import { MathJax } from "better-react-mathjax";
import { useTranslation } from "react-i18next";

export function PseudoCodeViewer({ inputText, ProcessingClass, translationKey }) {
  const [currentLine, setCurrentLine] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [steps, setSteps] = useState([]);
  const [currentExplanation, setCurrentExplanation] = useState(0);
  const { t } = useTranslation();
  const pseudoCodeSteps = t(translationKey, { returnObjects: true });

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
      setExplanation(processor.explanations[0]?.message || "");
    }
  }, [inputText, ProcessingClass, t]);

  const handleNextStep = () => {
    if (currentExplanation < steps.length - 1) {
      const nextStep = steps[currentExplanation + 1];
      setCurrentLine(nextStep.line);
      setCurrentExplanation(currentExplanation + 1);
      setExplanation(nextStep.message);
    }
  };

  const handlePreviousStep = () => {
    if (currentExplanation > 0) {
      const prevStep = steps[currentExplanation - 1];
      setCurrentLine(prevStep.line);
      setCurrentExplanation(currentExplanation - 1);
      setExplanation(prevStep.message);
    }
  };

  return (
    <div>
      {/* Контейнер для псевдокоду */}
      <div style={{ padding: "16px", fontFamily: "Arial, sans-serif", border: "1px solid #ddd", backgroundColor: "#fafafa"}}>
        <MathJax>
          {pseudoCodeSteps.map((line, index) => (
            <div
              key={index}
              style={{
                padding: "4px 8px",
                fontWeight: index === currentLine ? "bold" : "normal",
                backgroundColor: index === currentLine ? "#FFD700" : "transparent",
                transition: "background-color 0.3s ease-in-out",
                whiteSpace: "pre-wrap"
              }}
            >
              {line}
            </div>
          ))}
        </MathJax>
      </div>

      {/* Кнопки для навігації */}
      <div style={{ display: "flex", justifyContent: "center", gap: "80px", marginBottom: "20px" }}>
        <button onClick={handlePreviousStep} disabled={currentExplanation <= 0} style={buttonStyle}>
          {t("previous")}
        </button>
        <button onClick={handleNextStep} disabled={currentExplanation >= steps.length - 1} style={buttonStyle}>
          {t("next")}
        </button>
      </div>

      {/* Контейнер для пояснення */}
      <div style={{ padding: "16px", fontFamily: "Arial, sans-serif", border: "1px solid #ddd", backgroundColor: "#fafafa" }}>
        <MathJax>
          <h3 style={{ marginTop: "16px" }}>{t("explanation")}:</h3>
          <p dangerouslySetInnerHTML={{ __html: explanation.replace(/\n/g, "<br />") }}></p>
        </MathJax>
      </div>
    </div>
  );
}

const buttonStyle = {
  marginTop: "20px",
  padding: "8px 24px",
  backgroundColor: "#007BFF",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "16px",
};
