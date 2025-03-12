export class RemovingEpsilonRules {
  constructor(rules,t) {
    this.t = t;
    this.rules = rules;
    this.explanations = [];
    this.history = [];
  }

  findNullableNonTerminals() {
    let nullableSet = new Set();
    let previousNullableSet;
    this.explanations.push({
      line: 0,
      message: this.t("Row1ForRemoveEpsilon", { nullableSet: [...nullableSet].join(", ") }),
    });

    previousNullableSet = new Set(nullableSet);
    this.explanations.push({
      line: 1,
      message: this.t("Row2ForRemoveEpsilon", { nullableSet: [...nullableSet].join(", "), previousNullableSet: [...previousNullableSet].join(", ") }),
    });

    for (const rule of this.rules) {
      for (const alternative of rule.rightSide) {
        if (alternative.includes("ε")) {
          nullableSet.add(rule.leftSide);
          this.explanations.push({
            line: 2,
            message: this.t("Row3ForRemoveEpsilon", { leftSide: rule.leftSide }),
          });
          break;
        }
      }
    }

    this.explanations.push({
      line: 3,
      message: this.t("Row4ForRemoveEpsilon", { nullableSet: [...nullableSet].join(", "), previousNullableSet: [...previousNullableSet].join(", ") }),
    });

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
            this.explanations.push({
              line: 2,
              message: this.t("Row3ForRemoveEpsilon2", { leftSide: rule.leftSide, alternative: alternative.join(" ") }),
            });
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
    //this.explanations.push("Крок 2: Видаляємо всі ε-альтернативи..");
    
    for (const rule of this.rules) {
      //const originalLength = rule.rightSide.length;
      rule.rightSide = rule.rightSide.filter(alt => !alt.includes("ε"));
      
      // if (rule.rightSide.length < originalLength) {
      //   this.explanations.push(`Видалено ε з ${rule.leftSide}.`);
      // }
    }

    this.explanations.push(this.toString());
  }

  addNullableCombinations(nullableSet) {
    //this.explanations.push("Крок 3: Генеруємо нові альтернативи без nullable-нетерміналів...");
    console.log("a");
    for (const rule of this.rules) {
      let existingAlternatives = new Set(rule.rightSide.map(alt => alt.join(" ")));
      for (const alternative of rule.rightSide) {
        const generated = this.generateCombinations(alternative, nullableSet);
        console.log("generated:", generated);
        for (const newAlt of generated) {
          const newAltStr = newAlt.join(" ");
          console.log("NewaltStr",newAltStr); // Перевірка альтернативи як рядка
          if (!existingAlternatives.has(newAltStr) && newAltStr !== rule.leftSide) {
            console.log("NewaltStr2",newAltStr);
            existingAlternatives.add(newAltStr);
            rule.rightSide.push(newAlt); // Додаємо нову альтернативу
          }
        }
      }
    }
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

  executeEpsilonRuleRemoval() {
    const nullableSet = this.findNullableNonTerminals();
    this.addNullableCombinations(nullableSet);
  }
}
