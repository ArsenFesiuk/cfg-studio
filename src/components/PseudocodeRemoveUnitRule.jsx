import { useState, useEffect } from "react";
import { RemovingUnitRules } from "../utils/RemovingUnitRules";
import { MathJax } from "better-react-mathjax";
import { useTranslation } from "react-i18next";

export function PseudoCodeRemoveUnitRules({ inputText }) {
    const [currentLine, setCurrentLine] = useState(0);
    const [explanation, setExplanation] = useState("");
    const [steps, setSteps] = useState([]);
    const [currentExplanation, setCurrentExplanation] = useState(0);
    const { t } = useTranslation();
    const pseudoCodeRemoveUnitRules = t("stepsForRemoveUnitRules", { returnObjects: true });
  
    useEffect(() => {
      if (inputText) {
        const rules = inputText.split("\n").map((line) => {
          const [left, right] = line.split("→").map((part) => part.trim());
          return {
            leftSide: left,
            rightSide: right.split("|").map((alt) => alt.trim().split(" ")),
          };
        });
    
        const newRemover = new RemovingUnitRules();
        newRemover.removeUnitRules(rules);
        setSteps(newRemover.explanations);
        setCurrentLine(0);
        // Set explanation to the message directly
        setExplanation(newRemover.explanations[0]?.message || "");
      }
    }, [inputText]);
    
    const handleNextStep = () => {
      if (currentExplanation < steps.length - 1) {
        const nextStep = steps[currentExplanation + 1];
        setCurrentLine(nextStep.line);
        setCurrentExplanation(currentExplanation + 1);
        // Access the message directly here
        setExplanation(nextStep.message);
      }
    };
  
    return (
      <div>
            {/* Контейнер для псевдокоду */}
            <div style={{ padding: "16px", fontFamily: "Arial, sans-serif", border: "1px solid #ddd", backgroundColor: "#fafafa"}}>
              <MathJax>
                {pseudoCodeRemoveUnitRules.map((line, index) => (
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
        
            {/* Кнопка між блоками */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
              <button onClick={handleNextStep} disabled={currentLine >= steps.length - 1} style={buttonStyle}>
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
  marginTop: "16px",
  padding: "8px 16px",
  backgroundColor: "#007BFF",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "16px",
};
