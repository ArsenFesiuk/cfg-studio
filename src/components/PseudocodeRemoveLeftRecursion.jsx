import { useState, useEffect } from "react";
import { RemovingLeftRecursion } from "../utils/RemovingLeftRecursion";
import { useTranslation } from "react-i18next";
import { MathJax } from "better-react-mathjax";

const pseudoCodeRemoveLeftRecursion = [
  "1: pre všetky \\( i \\in \\{1,2,\\dots,n\\} \\) vykon",
  "2:   pre všetky \\( j \\in \\{1,\\dots,i-1\\} \\) vykon",
  "3:     nahrad každé pravidlo tvaru \\( A_i \\to A_j\\alpha \\) pravidlami",
  "4:     \\( A_i \\to \\beta_1\\alpha \\mid \\beta_2\\alpha \\mid \\dots \\mid \\beta_m\\alpha \\),",
  "5:     pričom ak \\( A_j \\to \\beta_1 \\mid \\beta_2 \\mid \\dots \\mid \\beta_m \\), sú všetky \\( A_j \\)-pravidlá",
  "6:   koniec pre",
  "7:   odstráň prípadnú priamu ľavú rekurziu v netermináli \\( A_i \\) pomocou (2)",
  "8: koniec pre",
];

export function PseudoCodeRemoveLeftRecursion({ inputText }) {
  const [currentLine, setCurrentLine] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [steps, setSteps] = useState([]);
  const [currentExplanation, setCurrentExplanation] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    if (inputText) {
      const rules = inputText.split("\n").map((line) => {
        const [left, right] = line.split("→").map((part) => part.trim());
        return {
          leftSide: left,
          rightSide: right.split("|").map((alt) => alt.trim().split(" ")),
        };
      });

      const newRemover = new RemovingLeftRecursion(t);
      const stepwiseExplanations = newRemover.eliminateLeftRecursion(rules);

      setSteps(stepwiseExplanations);
      setCurrentLine(0);
      setExplanation(stepwiseExplanations[0]?.message || "");
    }
  }, [inputText, t]);

  const handleNextStep = () => {
    if (currentExplanation < steps.length - 1) {
      const nextStep = steps[currentExplanation + 1];
      setCurrentLine(nextStep.line);
      setCurrentExplanation(currentExplanation + 1);
      setExplanation(nextStep.message);
    }
  };

  return (
    <div>
      {/* Контейнер для псевдокоду */}
      <div style={{ padding: "16px", fontFamily: "Arial, sans-serif", border: "1px solid #ddd", backgroundColor: "#fafafa"}}>
        <MathJax>
          {pseudoCodeRemoveLeftRecursion.map((line, index) => (
            <div
              key={index}
              style={{
                padding: "4px 8px",
                fontWeight: index === currentLine ? "bold" : "normal",
                backgroundColor: index === currentLine ? "#FFD700" : "transparent",
                transition: "background-color 0.3s ease-in-out",
              }}
            >
              {line}
            </div>
          ))}
        </MathJax>
      </div>
  
      {/* Кнопка між блоками */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <button onClick={handleNextStep} disabled={currentLine >= steps.length - 1} style={buttonStyle}>
          {t("next")}
        </button>
      </div>
  
      {/* Контейнер для пояснення */}
      <div style={{ padding: "16px", fontFamily: "Arial, sans-serif", border: "1px solid #ddd", backgroundColor: "#fafafa"}}>
        <h3 style={{ marginTop: "16px" }}>{t("explanation")}:</h3>
        <p dangerouslySetInnerHTML={{ __html: explanation.replace(/\n/g, "<br />") }}></p>
      </div>
    </div>
  );
  
  
}

const buttonStyle = {
  marginTop: "16px",
  padding: "8px 16px",
  backgroundColor: "#007BFF",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "16px",
};
