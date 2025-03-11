import { useState, useEffect } from "react";
import { RemovingEpsilonRules } from "../utils/RemovingEpsilonRules";
import { t } from "i18next";

// Pseudocode for epsilon rule removal
const pseudoCodeRemoveEpsilonRules = [
  "1. Nε ← ∅; (Inicializácia množiny nulovatelnzch neterminalov)",
  "2. N̂ε ← Nε; (Kopírovať Nε у N̂ε)",
  "3. Nε ← N̂ε ∪ {A | A → α ∈ P і α ∈ N̂ε*};",
  "4. zatial Nε ≠ N̂ε, skok na krok 2.",
];

export function PseudoCodeRemoveEpsilonRules({ inputText }) {
  const [currentLine, setCurrentLine] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [steps, setSteps] = useState([]);
  const [currentExplanation, setCurrentExplanation] = useState(0);

  useEffect(() => {
    if (inputText) {
      const rules = inputText.split("\n").map((line) => {
        const [left, right] = line.split("→").map((part) => part.trim());
        return {
          leftSide: left,
          rightSide: right.split("|").map((alt) => alt.trim().split(" ")),
        };
      });
  
      const newRemover = new RemovingEpsilonRules(rules, t);
      newRemover.executeEpsilonRuleRemoval();
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
    <div style={{ padding: "16px", fontFamily: "Arial, sans-serif" }}>
      <h2>Algorithm for Removing Epsilon Rules</h2>

      <pre style={preStyle}>
        {pseudoCodeRemoveEpsilonRules.map((line, index) => (
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

