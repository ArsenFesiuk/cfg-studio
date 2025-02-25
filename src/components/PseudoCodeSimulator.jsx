import { useState, useEffect } from "react";

// Псевдокод алгоритму
const pseudoCodeFindNullableNotTerminal = [
  "1. Nε ← ∅; (Inicializácia množiny nulovatelnzch neterminalov)",
  "2. N̂ε ← Nε; (Kopírovať Nε у N̂ε)",
  "3. Nε ← N̂ε ∪ {A | A → α ∈ P і α ∈ N̂ε*};",
  "4. zatial Nε ≠ N̂ε, skok na krok 2.",
  "5. ExistingAlternatives ← všetky alternatívy;",
  "6. generatedAlternatives ← alternatívy bez nulovatelnych neterminalov;",
  "7. Ked generatedAlternatives nie su v ExistingAlternatives: pridať generatedAlternatives v ExistingAlternatives;",
  "8. Konec",
];

// Клас для роботи з граматикою
class Grammar {
  constructor(rules) {
    this.rules = rules;
    this.nullableSet = new Set();
    this.previousNullableSet = new Set();
    this.firstPassDone = false;
    this.allExistingAlternatives = [];  // Initialize the array here
    this.generatedCombinations = [];
    this.combinations = 0;
  }

  generateCombinations(alternative, nullableSet) {
    let result = [];
    let totalCombinations = Math.pow(2, alternative.length);
    
    for (let mask = 0; mask < totalCombinations; mask++) {
      let combination = alternative.filter((symbol, i) => (mask & (1 << i)) === 0 || !nullableSet.has(symbol));
      if (combination.length > 0) {
        result.push(combination);
      }
    }
    return result;
  }

  stepForFindNullableNonTerminals(index) {
    switch (index) {
      case 0:
        this.firstPassDone = false;
        return "Krok 1: Inicializujte množinu nulovatelnych neterminalov → Nε = {}";

      case 1:
        this.previousNullableSet = new Set(this.nullableSet);
        return `Krok 2: Skopírujte hodnotu Nε → N̂ε = {${[...this.nullableSet].join(", ")}}`;

      case 2:
        if (!this.firstPassDone) {
          // Перший прохід: додати всі нетермінали, які напряму ведуть до ε
          for (const rule of this.rules) {
            for (const alternative of rule.rightSide) {
              if (alternative.includes("ε")) {
                this.nullableSet.add(rule.leftSide);
              }
            }
          }
          this.firstPassDone = true;
        } else {
          // Оновлюємо `Nε`, додаючи нетермінали, всі альтернативи яких є nullable
          for (const rule of this.rules) {
            for (const alternative of rule.rightSide) {
              if (alternative.every(symbol => this.previousNullableSet.has(symbol))) {
                this.nullableSet.add(rule.leftSide);
              }
            }
          }
        }
        return `Krok 3: Aktualizácia Nε → {${[...this.nullableSet].join(", ")}}`;

      case 3:
        if (this.nullableSet.size !== this.previousNullableSet.size) {
          return "Krok 4: Nε ≠ N̂ε, opakujte krok 2";
        }
        return `Krok 4: Nε = N̂ε, algoritmus je dokončený! Nulovateľné neterminaly = {${[...this.nullableSet].join(", ")}}`;

      case 4:
        // Створюємо множину існуючих альтернатив
        let allExistingAlternatives = [];
        for (const rule of this.rules) {
          let existingAlternatives = new Set(rule.rightSide.map(alt => alt.join(" ")));
          allExistingAlternatives.push(`${rule.leftSide} → ${[...existingAlternatives].join(" | ")}`);
        }
        this.allExistingAlternatives = allExistingAlternatives;
        return `Krok 5: Vytvorte množinu existujúcich alternatív pre každý neterminál: ${allExistingAlternatives.join(", ")}\n`;

      case 5:
        // Генерація нових альтернатив
        for (const rule of this.rules) {
          let existingAlternatives = new Set(rule.rightSide.map(alt => alt.join(" ")));
          for (const alternative of rule.rightSide) {
            const generated = this.generateCombinations(alternative, this.nullableSet);
            for (const newAlt of generated) {
              if (!existingAlternatives.has(newAlt.join(" ")) && !newAlt.includes(rule.leftSide)) {
                existingAlternatives.add(newAlt.join(" "));
                rule.rightSide.push(newAlt);  // Додаємо нову альтернативу
                this.generatedCombinations.push(`${rule.leftSide} → ${newAlt.join(" ")}`);
              }
            }
          }
        }
        return `Krok 6: Vygenerujte novú alternatívu generatedAlternatives z nulovatelnych neterminalov. Vygenerovaná alternatíva: ${this.generatedCombinations[this.combinations]}`;

      case 6:
        this.allExistingAlternatives.push(this.generatedCombinations[this.combinations++]);
        return `Krok 7: Nové alternatívy pre neterminály: ${this.allExistingAlternatives.join(" , ")}`;
      

      default:
        return "";
    }
  }
}

export function PseudoCodeFindNullableNotTerminals({ inputText }) {
  const [currentLine, setCurrentLine] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [grammar, setGrammar] = useState(null);

  useEffect(() => {
    if (inputText) {
      const rules = inputText.split("\n").map(line => {
        const [left, right] = line.split("→").map(part => part.trim());
        return { leftSide: left, rightSide: right.split("|").map(alt => alt.trim().split(" ")) };
      });

      const newGrammar = new Grammar(rules);
      setGrammar(newGrammar);
      setCurrentLine(0);
      setExplanation(newGrammar.stepForFindNullableNonTerminals(0));
    }
  }, [inputText]);

  const handleNextStep = () => {
    if (!grammar) return;

    let nextLine = currentLine + 1;
    const explanation = grammar.stepForFindNullableNonTerminals(nextLine);

    if (explanation.includes("opakujte krok 2")) {
      nextLine = 0; // Якщо треба повторити, йдемо назад на 2-й рядок
    }

    if (currentLine === 6 && grammar.combinations < grammar.generatedCombinations.length) {
      nextLine = 4; // Повернення на крок 6, якщо не згенеровані всі альтернативи
    }
    setCurrentLine(nextLine);
    setExplanation(explanation);
  };

  return (
    <div style={{ padding: "16px", fontFamily: "Arial, sans-serif" }}>
      <h2>Алгоритм шукаєм nullable nonterminal</h2>

      <pre style={{
        backgroundColor: "#f5f5f5",
        padding: "16px",
        borderRadius: "8px",
        border: "1px solid #ccc"
      }}>
        {pseudoCodeFindNullableNotTerminal.map((line, index) => (
          <div
            key={index}
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              fontWeight: index === currentLine ? "bold" : "normal",
              backgroundColor: index === currentLine ? "#FFD700" : "transparent",
              transition: "background-color 0.3s ease-in-out"
            }}
          >
            {line}
          </div>
        ))}
      </pre>

      <button
        onClick={handleNextStep}
        disabled={currentLine >= pseudoCodeFindNullableNotTerminal.length - 1}
        style={{
          marginTop: "16px",
          padding: "8px 16px",
          backgroundColor: currentLine < pseudoCodeFindNullableNotTerminal.length - 1 ? "#007BFF" : "#ccc",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: currentLine < pseudoCodeFindNullableNotTerminal.length - 1 ? "pointer" : "not-allowed",
          fontSize: "16px"
        }}
      >
        Далі
      </button> 

      <h3 style={{ marginTop: "16px" }}>Пояснення:</h3>
      <p>{explanation}</p>

      <div style={{
        marginTop: "32px",
        padding: "16px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        backgroundColor: "#f9f9f9"
      }}>
        <h4>Стан Nε та N̂ε:</h4>
        <p><strong>Nε(Nulovatelny neterminaly):</strong> {grammar && [...grammar.nullableSet].join(", ")}</p>
        <p><strong>N̂ε:</strong> {grammar && [...grammar.previousNullableSet].join(", ")}</p>
        <p><strong>ExistingAlternatives:</strong></p>
        <ul>
          {grammar && grammar.allExistingAlternatives.map((alt, index) => (
            <li key={index}>{alt}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
