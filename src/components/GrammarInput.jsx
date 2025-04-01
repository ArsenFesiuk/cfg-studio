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
import { PseudoCodeViewer } from "./PseudoCodeViewer";
import Tooltip from "@mui/material/Tooltip";

const GrammarInput = () => {
  const { t, i18n } = useTranslation();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [errors, setErrors] = useState([]);
  const [showPseudocodeForRemoveEpsilonRules, setshowPseudocodeForRemoveEpsilonRules] = useState(false); 
  const [showPseudocodeForRemoveLeftRecursion, setShowPseudocodeForRemoveLeftRecursion] = useState(false); 
  const [showPseudocodeForRemoveUselessSymbols, setshowPseudocodeForRemoveUselessSymbols] = useState(false); 
  const [showPseudocodeForRemoveUnitRules, setshowPseudocodeForRemoveUnitRules] = useState(false); 
  const [showPseudocodeForCNFConversation, setshowPseudocodeForCNFConversation] = useState(false); 
  const fontSize = ["uk", "sk"].includes(i18n.language) ? "13px" : "14px";


  const handleInputChange = (e) => {
    
    const replacedInput = replaceEscapes(e.target.value);
    setInput(replacedInput);
    setOutput(""); // Очищаємо аутпут при зміні інпуту
    setshowPseudocodeForRemoveEpsilonRules(false); // Ховаємо псевдокод при зміні інпуту
    setShowPseudocodeForRemoveLeftRecursion(false);
    setshowPseudocodeForRemoveUselessSymbols(false);
    setshowPseudocodeForRemoveUnitRules(false);
    setshowPseudocodeForCNFConversation(false);
  
    const { errors } = parseGrammar(replacedInput, t);
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
    transformer.execute();
    setOutput(formatGrammarOutput(rules));
    setshowPseudocodeForRemoveEpsilonRules(true);
  };
  
  const handleRemoveUnitRules = () => {
    let { rules, errors } = parseGrammar(input);
    if (errors.length > 0) {
      setErrors(errors);
      return;
    }
  
    const transformer = new RemovingUnitRules(rules, t);
    transformer.execute();
    setOutput(formatGrammarOutput(rules));
    setshowPseudocodeForRemoveUnitRules(true);
  };
  
  const handleRemoveUselessSymbols = () => {
    let { rules, errors } = parseGrammar(input);
    if (errors.length > 0) {
      setErrors(errors);
      return;
    }
  
    const transformer = new RemovingUselessSymbols(rules, t);
  
    // Викликаємо функцію, яка одночасно видаляє непотрібні символи
    rules = transformer.execute();  // викликаємо комбіновану функцію
    setOutput(formatGrammarOutput(rules));
    setshowPseudocodeForRemoveUselessSymbols(true);
  };
  
  const handleRemoveLeftRecursion = () => {
    let { rules, errors } = parseGrammar(input);
    if (errors.length > 0) {
      setErrors(errors);
      return;
    }
  
    const transformer = new RemovingLeftRecursion(rules,t);
    transformer.execute(); // Отримуємо масив об'єктів {line, message}

    setOutput(formatGrammarOutput(rules));
    setShowPseudocodeForRemoveLeftRecursion(true);
  };
  
  
  const handleToCNF = () => {
    let { rules, errors } = parseGrammar(input);
    if (errors.length > 0) {
      setErrors(errors);
      return;
    }
  
    const cnfConversion = new CNFConversion(rules, t);
    const finalRules = cnfConversion.execute();  // Capture the returned rules
    setOutput(formatGrammarOutput(finalRules));  // Pass the final rules to formatGrammarOutput
    setshowPseudocodeForCNFConversation(true);
  };
  
  
  return (
    <div style={{ paddingTop: "64px" }}>
      <div id="MyAppBar" style={{ width: "100%" }}>
        <MyAppBar />
      </div>
  
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", padding: "10px" }}>
        {/* <div id="SupportedGrammars" style={{ width: "30%", padding: "10px" }}>
          <SupportedGrammars />
        </div> */}
  
        <div id="Examples" style={{ width: "100%", padding: "10px"}}>
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
            style={{ marginBottom: "20px", backgroundColor: "#fafafa"}}
          />
  
          {/* Кнопки між input і output */}
          <Tooltip title={errors.length > 0 ? errors.map((err, i) => <div key={i}>{err}<br /></div>) : ""} 
  arrow
  componentsProps={{
    tooltip: {
      sx: {
        fontSize: "16px", // Збільшуємо розмір тексту
        padding: "12px 16px", // Збільшуємо відступи (робить тултіп більшим)
        maxWidth: "400px", // Максимальна ширина тултіпа
        borderRadius: "8px", // Закруглені кути
      }
    },
    arrow: { sx: { color: "gray" } } // Колір стрілочки тултіпа
  }} >
            <span style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "20px" }}>
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
            </span>
          </Tooltip>
  
          {/* Поле output */}
          <TextField
            label={t("output")}
            multiline
            rows={9}
            variant="outlined"
            value={output}
            fullWidth
            disabled
            style={{ backgroundColor: "#fafafa"}}
          />
        </div>
  
        {/* Права частина: пояснення */}
        <div id="explanation" style={{ width: "50%", padding: "10px", fontSize: "16px", lineHeight: "1.5" }}>
        {showPseudocodeForRemoveLeftRecursion ? (
          <PseudoCodeViewer 
            inputText={input}
            ProcessingClass={RemovingLeftRecursion} 
            translationKey="stepsForLeftRecursion" 
          />
        ) : showPseudocodeForRemoveEpsilonRules ? (
          <PseudoCodeViewer 
            inputText={input}
            ProcessingClass={RemovingEpsilonRules} 
            translationKey="stepsForRemoveEpsilonRules" 
          />
        ) : showPseudocodeForRemoveUselessSymbols ? (
          <PseudoCodeViewer 
            inputText={input}
            ProcessingClass={RemovingUselessSymbols} 
            translationKey="stepsForRemoveUselessSymbols" 
          />
        ) : showPseudocodeForRemoveUnitRules ? (
          <PseudoCodeViewer 
            inputText={input}
            ProcessingClass={RemovingUnitRules} 
            translationKey="stepsForRemoveUnitRules" 
          />
        ) : showPseudocodeForCNFConversation ? (
          <PseudoCodeViewer 
            inputText={input}
            ProcessingClass={CNFConversion} 
            translationKey="stepsForGrammarTransformation" 
          />
        ) :
            <SupportedGrammars />
        }
    </div>
  </div>
</div>
  );
}

export default GrammarInput;
