import { useState, useEffect } from "react";
import { RemovingLeftRecursion } from "../utils/RemovingLeftRecursion";
import { t } from "i18next";

const pseudoCodeRemoveLeftRecursion = [
  "1. Pre všetky i ∈ {1,2,...,n} rob",
  "2. Pre všetky j ∈ {1,...,i-1} rob",
  "3. Nahrad každé pravidlo tvaru Aᵢ → Aⱼα pravidlami",
  "4. Aᵢ → B₁α | B₂α | ... | Bₘα,",
  "5. pričom ak Aⱼ → β₁ | β₂ | ... | βₘ, sú všetky Aⱼ-pravidlá",
  "6. Koniec pre",
  "7. Odstráň prípadnú priamu ľavú rekurziu v netermináli Aᵢ pomocou (2)",
  "8. Koniec pre",
];

export function PseudoCodeRemoveLeftRecursion({ inputText }) {
  const [currentLine, setCurrentLine] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [steps, setSteps] = useState([]);
  const [currentExplanation, setCurrentExplanation] = useState(0);  // використовуємо useState для currentExplanation

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
  }, [inputText]);

  const handleNextStep = () => {
    if (currentExplanation < steps.length - 1) {
      const nextStep = steps[currentExplanation + 1];
  
      setCurrentLine(nextStep.line); 
      setCurrentExplanation(currentExplanation + 1);
      setExplanation(nextStep.message); // Передаємо тільки текст
    }
  };
  
  

  return (
    <div style={{ padding: "16px", fontFamily: "Arial, sans-serif" }}>
      <h2>Algoritmus na odstránenie ľavej rekurzie</h2>
      <pre style={preStyle}>
        {pseudoCodeRemoveLeftRecursion.map((line, index) => (
          <div
            key={index}
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              fontWeight: index === currentLine ? "bold" : "normal",
              backgroundColor: index === currentLine ? "#FFD700" : "transparent",
              transition: "background-color 0.3s ease-in-out",
            }}
          >
            {line}
          </div>
        ))}
      </pre>
      <button onClick={handleNextStep} disabled={currentLine >= steps.length - 1} style={buttonStyle}>
        Next
      </button>
      <h3 style={{ marginTop: "16px" }}>Explanation:</h3>
      <p dangerouslySetInnerHTML={{ __html: explanation.replace(/\n/g, "<br />") }}></p>
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

const preStyle = {
  backgroundColor: "#f5f5f5",
  padding: "16px",
  borderRadius: "8px",
  border: "1px solid #ccc",
};

