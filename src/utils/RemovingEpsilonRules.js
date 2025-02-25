export class RemovingEpsilonRules {
  constructor(rules) {
    this.rules = rules;
    this.explanations = [];
    this.history = [];
  }

  findNullableNonTerminals() {
    let nullableSet = new Set();
    let previousNullableSet;
    this.explanations.push(this.toString());
    this.explanations.push(`Крок 1: Шукаємо nullable нетермінали...`);
    for (const rule of this.rules) {
      for (const alternative of rule.rightSide) {
        if (alternative.includes("ε")) {
          nullableSet.add(rule.leftSide);
          this.explanations.push(`${rule.leftSide} додано в nullable, бо має ε.`);
          break;
        }
      }
    }
    
    //this.removeEpsilonAlternatives();

    do {
      previousNullableSet = new Set(nullableSet);
      for (const rule of this.rules) {
        for (const alternative of rule.rightSide) {
          if (alternative.every(symbol => nullableSet.has(symbol))) {
            nullableSet.add(rule.leftSide);
            this.explanations.push(`${rule.leftSide} додано в nullable, бо всі нетермінальні символи в альтернативі "${alternative.join(" ")}" є nullable.`);
            break;
          }
        }
      }
    } while (nullableSet.size !== previousNullableSet.size); 

    this.explanations.push(`Nullable нетермінали: ${[...nullableSet]}.`);

    this.removeEpsilonAlternatives();

    return nullableSet;
  }

  removeEpsilonAlternatives() {
    this.explanations.push("Крок 2: Видаляємо всі ε-альтернативи..");
    
    for (const rule of this.rules) {
      const originalLength = rule.rightSide.length;
      rule.rightSide = rule.rightSide.filter(alt => !alt.includes("ε"));
      
      if (rule.rightSide.length < originalLength) {
        this.explanations.push(`Видалено ε з ${rule.leftSide}.`);
      }
    }

    this.explanations.push(this.toString());
  }

  addNullableCombinations(nullableSet) {
    this.explanations.push("Крок 3: Генеруємо нові альтернативи без nullable-нетерміналів...");
    
    for (const rule of this.rules) {
      let existingAlternatives = new Set(rule.rightSide.map(alt => alt.join(" ")));
      for (const alternative of rule.rightSide) {
        const generated = this.generateCombinations(alternative, nullableSet);
        
        for (const newAlt of generated) {
          if (!existingAlternatives.has(newAlt.join(" ")) && !newAlt.includes(rule.leftSide)) {
            existingAlternatives.add(newAlt.join(" "));
            rule.rightSide.push(newAlt);
            this.explanations.push(`Додано нову альтернативу: ${rule.leftSide} → ${newAlt.join(" ")}`);
          }
        }
      }
    }
   this.explanations.push(this.toString()); 
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
