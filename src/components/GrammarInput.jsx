import React, { useState } from "react";
import { RemovingEpsilonRules } from "../utils/RemovingEpsilonRules";
import { RemovingUnitRules } from "../utils/RemovingUnitRules";
import { RemovingUselessSymbols } from "../utils/RemovingUselessSymbols";
import { RemovingLeftRecursion } from "../utils/RemovingLeftRecursion";
import { CNFConversion } from "../utils/CNFConversastion";
import { parseGrammar } from "../utils/GrammarParser";
import MyAppBar from "./MyAppBar";
import SupportedGrammars from "./SupportedGrammars";
import Examples from "./Examples";
import { TextField, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import { PseudoCodeRemoveEpsilonRules } from "./PseudoCodeRemoveEpsilonRules";
import { PseudoCodeRemoveLeftRecursion } from "./PseudocodeRemoveLeftRecursion";

const GrammarInput = () => {
  const { t, i18n } = useTranslation();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [errors, setErrors] = useState([]);
  const [explanation, setExplanation] = useState("");
  const [showPseudocodeForRemoveEpsilonRules, setshowPseudocodeForRemoveEpsilonRules] = useState(false); 
  const [showPseudocodeForRemoveLeftRecursion, setShowPseudocodeForRemoveLeftRecursion] = useState(false); 
  const fontSize = ["uk", "sk"].includes(i18n.language) ? "13px" : "14px";


  const handleInputChange = (e) => {
    const replacedInput = replaceEscapes(e.target.value);
    setInput(replacedInput);
    setOutput(""); // Очищаємо аутпут при зміні інпуту
    setExplanation(""); // Очищаємо пояснення при зміні інпуту
    setshowPseudocodeForRemoveEpsilonRules(false); // Ховаємо псевдокод при зміні інпуту
    setShowPseudocodeForRemoveLeftRecursion(false);
  
    const { errors } = parseGrammar(replacedInput);
    setErrors(errors.length > 0 ? errors : []);
  };

  const replaceEscapes = (text) => {
    return text
      .replace(/\\eps/g, "ε") // Замінює \e на ε
      .replace(/->/g, "→"); // Замінює -> на →
  };

  const formatGrammarOutput = (rules) => {
    return rules
      .map((rule) => {
        const alternatives = rule.rightSide.map((alt) => alt.join(" ")).join(" | ");
        return `${rule.leftSide} → ${alternatives}`;
      })
      .join("\n");
  };

  const handleRemoveEpsilon = () => {
    let { rules, errors } = parseGrammar(input);
    if (errors.length > 0) {
      setErrors(errors);
      return;
    }
  
    const transformer = new RemovingEpsilonRules(rules, t);
    transformer.executeEpsilonRuleRemoval();
    setOutput(formatGrammarOutput(rules));
    setExplanation(transformer.explanations.map(exp => `${exp.message}`).join("\n"));
    setshowPseudocodeForRemoveEpsilonRules(true);
  };
  
  const handleRemoveUnitRules = () => {
    let { rules, errors } = parseGrammar(input);
    if (errors.length > 0) {
      setErrors(errors);
      return;
    }
  
    const transformer = new RemovingUnitRules(rules);
    transformer.removeUnitRules(rules);
    setOutput(formatGrammarOutput(rules));
    setExplanation(transformer.explanations.join("\n"));
  };
  
  const handleRemoveUselessSymbols = () => {
    let { rules, errors } = parseGrammar(input);
    if (errors.length > 0) {
      setErrors(errors);
      return;
    }
  
    const transformer = new RemovingUselessSymbols();
    
    // Remove non-terminating symbols
    rules = transformer.removeNotTerminatingSymbols(rules);
    setOutput(formatGrammarOutput(rules));
    setExplanation(transformer.explanations.join("\n"));
    
    // Remove unreachable symbols
    rules = transformer.removeUnreachableSymbols(rules);
    setOutput(formatGrammarOutput(rules));
    setExplanation(transformer.explanations.join("\n"));
  };
  
  const handleRemoveLeftRecursion = () => {
    let { rules, errors } = parseGrammar(input);
    if (errors.length > 0) {
      setErrors(errors);
      return;
    }
  
    const removeLeftRecursion = new RemovingLeftRecursion(t);
    const explanations = removeLeftRecursion.eliminateLeftRecursion(rules); // Отримуємо масив об'єктів {line, message}
  
    // Формуємо текст з пояснень
    const formattedExplanation = explanations
      .map((exp) => exp.message)  // Доступ до тексту пояснення
      .join("\n");
  
    setOutput(formatGrammarOutput(rules));
    setExplanation(formattedExplanation); // Встановлюємо пояснення як рядок
    setShowPseudocodeForRemoveLeftRecursion(true);
  };
  
  
  const handleToCNF = () => {
    let { rules, errors } = parseGrammar(input);
    if (errors.length > 0) {
      setErrors(errors);
      return;
    }
  
    const cnfConversion = new CNFConversion();
    cnfConversion.addNewStartSymbol(rules);

    const removeEpsilonRules = new RemovingEpsilonRules(rules, t);
    removeEpsilonRules.executeEpsilonRuleRemoval();
    setExplanation(removeEpsilonRules.explanations.join("\n"));

    const removeUnitRules = new RemovingUnitRules(rules);
    removeUnitRules.removeUnitRules(rules);
    setExplanation(removeUnitRules.explanations.join("\n"));

    const removeUselessSymbols = new RemovingUselessSymbols();
    
    // Remove non-terminating symbols
    rules = removeUselessSymbols.removeNotTerminatingSymbols(rules);
    setExplanation(removeUselessSymbols.explanations.join("\n"));
    
    // Remove unreachable symbols
    rules = removeUselessSymbols.removeUnreachableSymbols(rules);
    setExplanation(removeUselessSymbols.explanations.join("\n"));

    cnfConversion.conversionToCNF(rules);
    setOutput(formatGrammarOutput(rules));

  };
  
  return (
    <div style={{ paddingTop: "64px" }}>
      <div id="MyAppBar" style={{ width: "100%" }}>
        <MyAppBar />
      </div>
  
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", padding: "10px" }}>
        <div id="SupportedGrammars" style={{ width: "30%", padding: "10px" }}>
          <SupportedGrammars />
        </div>
  
        <div id="Examples" style={{ width: "70%", padding: "10px" }}>
          <Examples />
        </div>
      </div>
  
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", padding: "10px" }}>
        {/* Ліва частина: input + кнопки + output */}
        <div id="input-container" style={{ width: "50%", padding: "10px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Поле вводу */}
          <TextField
            label={t("input")}
            multiline
            rows={9}
            variant="outlined"
            value={input}
            onChange={handleInputChange}
            fullWidth
            style={{ marginBottom: "20px" }}
          />
  
          {/* Кнопки між input і output */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "20px" }}>
            <Button variant="contained" onClick={handleRemoveEpsilon} disabled={errors.length > 0 || input.trim() === ""} sx={{
              padding: "5px 10px",
              minWidth: "auto",
              maxWidth: "155px",
              width: "155px",
              fontSize: fontSize,
              boxSizing: "border-box",
            }}>
              {t("removeEpsilon")}
            </Button>
            <Button variant="contained" onClick={handleRemoveUnitRules} disabled={errors.length > 0 || input.trim() === ""} sx={{
              padding: "5px 10px",
              minWidth: "auto",
              maxWidth: "195px",
              width: "195px",
              fontSize: fontSize,
              boxSizing: "border-box",
            }}>
              {t("removeUnitRules")}
            </Button>
            <Button variant="contained" onClick={handleRemoveUselessSymbols} disabled={errors.length > 0 || input.trim() === ""} sx={{
            padding: "5px 10px",
            minWidth: "auto",
            maxWidth: "205px",
            width: "205px",
            fontSize: fontSize,
            boxSizing: "border-box",
          }}>
              {t("removeUselessSymbols")}
            </Button>
            <Button variant="contained" onClick={handleRemoveLeftRecursion} disabled={errors.length > 0 || input.trim() === ""} sx={{
            padding: "5px 10px",
            minWidth: "auto",
            maxWidth: "185px",
            width: "185px",
            fontSize: fontSize,
            boxSizing: "border-box",
          }}>
              {t("removeLeftRecursion")}
            </Button>
            <Button variant="contained" onClick={handleToCNF} disabled={errors.length > 0 || input.trim() === ""} sx={{
            padding: "5px 10px",
            minWidth: "auto",
            maxWidth: "145px",
            width: "145px",
            fontSize: fontSize,
            boxSizing: "border-box",
          }}>
              {t("convertToCNF")}
            </Button>
          </div>
  
          {/* Поле output */}
          <TextField
            label={t("output")}
            multiline
            rows={9}
            variant="outlined"
            value={output}
            fullWidth
            disabled
          />
        </div>
  
        {/* Права частина: пояснення */}
        <div id="explanation" style={{ width: "50%", padding: "10px" }}>
          <TextField
            label={t("explanation")}
            multiline
            rows={23}
            variant="outlined"
            value={explanation}
            fullWidth
            disabled
          />
        </div>
      </div>

      {/* Інтегруємо PseudocodeSimulator, передаємо дані з граматики та поточний крок */}
      <div>
        {showPseudocodeForRemoveEpsilonRules && <PseudoCodeRemoveEpsilonRules inputText={input} />}
      </div>

      <div>
        {showPseudocodeForRemoveLeftRecursion && < PseudoCodeRemoveLeftRecursion inputText={input} />}
      </div>
  
  
      <div style={{ color: "red" }}>
        {errors.map((error, index) => (
          <p key={index}>{error}</p>
        ))}
      </div>
    </div>
  );
}

export default GrammarInput;
