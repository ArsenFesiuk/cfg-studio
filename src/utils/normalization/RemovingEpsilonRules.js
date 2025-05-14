export class RemovingEpsilonRules {
  constructor(rules,t) {
    this.t = t;
    this.rules = rules;
    this.explanations = [];
  }

  findNullableNonTerminals() {
    let nullableSet = new Set();
    let previousNullableSet;
    this.explanations.push({
      line: 0,
      message: this.t("Row1ForRemoveEpsilon", { nullableSet: [...nullableSet].join(", ") }),
    });

    for (const rule of this.rules) {
      for (const alternative of rule.rightSide) {
        previousNullableSet = new Set(nullableSet);
        if (alternative.includes("ε")) {

          this.explanations.push({
            line: 1,
            message: this.t("Row2ForRemoveEpsilon", { nullableSet: [...nullableSet].join(", "), previousNullableSet: [...previousNullableSet].join(", ") }),
          });

          nullableSet.add(rule.leftSide);

          this.explanations.push({
            line: 2,
            message: this.t("Row3ForRemoveEpsilon", { leftSide: rule.leftSide , grammatik: this.toString()}),
          });

          this.explanations.push({
            line: 3,
            message: this.t("Row4ForRemoveEpsilon", { nullableSet: [...nullableSet].join(", "), previousNullableSet: [...previousNullableSet].join(", ") }),
          });

          break;
        }
      }

    }

    do {
      previousNullableSet = new Set(nullableSet);
      this.explanations.push({
        line: 1,
        message: this.t("Row2ForRemoveEpsilon", { nullableSet: [...nullableSet].join(", "), previousNullableSet: [...previousNullableSet].join(", ") }),
      });

      for (const rule of this.rules) {
        for (const alternative of rule.rightSide) {
          if (alternative.every(symbol => nullableSet.has(symbol))) {
            nullableSet.add(rule.leftSide);
            if (nullableSet.size !== previousNullableSet.size && ![...previousNullableSet].includes(rule.leftSide)){
              this.explanations.push({
                line: 2,
                message: this.t("Row3ForRemoveEpsilon2", { leftSide: rule.leftSide, alternative: alternative.join(" "), previousNullableSet: [...previousNullableSet].join(", "), grammatik: this.toString()}),
              });
            }
            break;
          }
        }
      }

      this.explanations.push({
        line: 3,
        message: this.t("Row4ForRemoveEpsilon", { nullableSet: [...nullableSet].join(", "), previousNullableSet: [...previousNullableSet].join(", ") }),
      });

    } while (nullableSet.size !== previousNullableSet.size);

    this.removeEpsilonAlternatives();
    return nullableSet;
  }
  

  removeEpsilonAlternatives() {
    for (const rule of this.rules) {
      rule.rightSide = rule.rightSide.filter(alt => !alt.includes("ε"));
    }
  }

  addNullableCombinations(nullableSet) {
    let batchExplanations = []; // Масив для тимчасового збереження пояснень
    for (const rule of this.rules) {
        let existingAlternatives = new Set(rule.rightSide.map(alt => alt.join(" ")));

        for (const alternative of rule.rightSide) {
            const generated = this.generateCombinations(alternative, nullableSet);

            for (const newAlt of generated) {
                const newAltStr = newAlt.join(" ");

                if (!existingAlternatives.has(newAltStr) && newAltStr !== rule.leftSide) {
                    existingAlternatives.add(newAltStr);
                    rule.rightSide.push(newAlt); // Додаємо нову альтернативу

                    let originalRule = `${rule.leftSide} → ${alternative.join("")}`;
                    let newRule = `${rule.leftSide} → ${newAlt.join("")}`;
                    batchExplanations.push(
                        this.t("Row5ForRemoveEpsilon", {originalRule : originalRule, newRule : newRule, nullableSet : [...nullableSet].join(", ")})
                    );
                    
                }
            }
        }
    } 

    const startSymbol = this.rules[0].leftSide;
    const startRule = this.rules.find(rule => rule.leftSide === startSymbol);
    
    const nullableAlt = startRule.rightSide.find(
      alt => alt.every(symbol => nullableSet.has(symbol))
    );
    
    if (nullableAlt && !startRule.rightSide.some(alt => alt.length === 1 && alt[0] === "ε")) {
      startRule.rightSide.push(["ε"]);
      let originalRule = `${startSymbol} → ${nullableAlt.join("")}`;
      let newRule = `${startSymbol} → ε`;
      batchExplanations.push(
        this.t("Row5ForRemoveEpsilon", {
          originalRule: originalRule,
          newRule: newRule,
          nullableSet: [...nullableSet].join(", ")
        })
      );
    }
    

    // Додаємо всі пояснення за раз після досягнення line: 4
    this.explanations.push({
        line: 4,
        message: batchExplanations.join("\n") + `\n${this.toString()}` // Об'єднуємо всі пояснення в один блок
    });

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

  addExplanation(line, message) {
    this.explanations.push({ line, message });
  }
  
  toString() {
    return this.rules.map(rule => {
      const alternatives = rule.rightSide.map(alt => alt.join(" ")).join(" | ");
      return `${rule.leftSide} → ${alternatives}`;
    }).join("\n");
  } 

  execute() {
    const nullableSet = this.findNullableNonTerminals();
    this.addNullableCombinations(nullableSet);
    return this.history;
}
}
