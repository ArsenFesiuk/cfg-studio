import { useState, useEffect, useRef } from "react";
import { MathJax } from "better-react-mathjax";
import { useTranslation } from "react-i18next";

export function PseudoCodeViewer({ inputText, ProcessingClass, translationKey }) {
  const [currentLine, setCurrentLine] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [steps, setSteps] = useState([]);
  const [currentExplanation, setCurrentExplanation] = useState(0);
  const { t } = useTranslation();
  const pseudoCodeSteps = t(translationKey, { returnObjects: true });

  const pseudoCodeContainerRef = useRef(null);
  const lineRefs = useRef([]);

  //const [algorithmTitle, setAlgorithmTitle] = useState("");
  
  // Reference for MathJax container
  const mathJaxRef = useRef(null);

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

      // Зміна заголовку залежно від класу
      // if (ProcessingClass.name === "RemovingEpsilonRules") {
      //   setAlgorithmTitle(t("PseudoCodeRemoveEpsilonRules"));
      // } else if (ProcessingClass.name === "RemovingUnitRules") {
      //   setAlgorithmTitle(t("PseudoCodeRemoveUnitRules"));
      // } else if (ProcessingClass.name === "RemovingUselessSymbols") {
      //   setAlgorithmTitle(t("PseudoCodeRemoveUselessSymbols"));
      // } else if (ProcessingClass.name === "RemovingLeftRecursion") {
      //   setAlgorithmTitle(t("PseudoCodeRemoveLeftRecursion"));
      // } else if (ProcessingClass.name === "CNFConversion") {
      //   setAlgorithmTitle(t("PseudoCodeRemoveCNFConversation"));
      // }
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

  // This function forces MathJax to render after content change
  useEffect(() => {
    if (mathJaxRef.current) {
      window.MathJax.typeset(); // Trigger MathJax re-render
    }
  }, [explanation]); // Trigger on explanation change

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
      setCurrentExplanation(0); // 👈 додано
      setExplanation(processor.explanations[0]?.message || "");
    }
  }, [inputText, ProcessingClass, t]);
  

  return (
    <div>
      {/* Контейнер для псевдокоду */}
      <div
        ref={pseudoCodeContainerRef}
        style={{
          position: "relative",
          padding: "16px",
          fontFamily: "Arial, sans-serif",
          border: "1px solid #ddd",
          backgroundColor: "#fafafa",
          height: "254px",
          overflowY: "auto",
          overflowX : "hidden",
          borderRadius: "4px",
        }}
      >
        <h3 style={{ marginTop: "0px" }}>{t("pseudocode")}:</h3>
        <MathJax>
  {pseudoCodeSteps.map((line, index) => (
    <div
      key={index}
      ref={(el) => (lineRefs.current[index] = el)}
      style={{
        padding: "4px 8px",
        fontWeight: index === currentLine ? "bold" : "normal",
        backgroundColor: index === currentLine ? "#FFD700" : "transparent",
        transition: "background-color 0.3s ease-in-out",
        whiteSpace: "pre-wrap",       // перенос по \n
        wordBreak: "break-word",      // перенос довгих слів і формул
        overflowWrap: "break-word",   // сумісність із браузерами
        borderRadius: "4px",
        textAlign: "left",
      }}
    >
      {line}
    </div>
  ))}
</MathJax>

        {/* Стрілки завжди в правому нижньому куті */}
        <div
          style={{
            position: "sticky",
            bottom: "8px",
            right: "8px",
            display: "flex",
            gap: "8px",
            justifyContent: "flex-end",
            pointerEvents: "none", // Запобігає блокуванню тексту
          }}
        >
          <button
            onClick={handlePreviousStep}
            disabled={currentExplanation <= 0}
            style={{ ...arrowButtonStyle, pointerEvents: "auto" }} // Дозволяє клікати по кнопках
          >
            🔼
          </button>
          <button
            onClick={handleNextStep}
            disabled={currentExplanation >= steps.length - 1}
            style={{ ...arrowButtonStyle, pointerEvents: "auto" }} // Дозволяє клікати по кнопках
          >
            🔽
          </button>
        </div>
      </div>

      {/* Контейнер для пояснення */}
      <div
        style={{
          padding: "16px",
          fontFamily: "Arial, sans-serif",
          border: "1px solid #ddd",
          backgroundColor: "#fafafa",
          height: "254px",
          overflowY: "auto",
          borderRadius: "4px",
          marginTop: "16px",
        }}
      >
        <MathJax>
          <h3 style={{ marginTop: "0px" }}>{t("explanation")}:</h3>
          <p
            ref={mathJaxRef}
            dangerouslySetInnerHTML={{ __html: explanation.replace(/\n/g, "<br />") }}
          ></p>
        </MathJax>
      </div>
    </div>
  );
}

const arrowButtonStyle = {
  background: "#007BFF",
  color: "white",
  border: "none",
  borderRadius: "4px",
  padding: "6px 10px",
  fontSize: "16px",
  cursor: "pointer",
  transition: "opacity 0.2s ease-in-out",
  opacity: 1,
};

export default PseudoCodeViewer;
