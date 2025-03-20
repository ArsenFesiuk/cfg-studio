export class RemovingUselessSymbols {
  constructor() {
    this.explanations = []; // Масив для пояснень
  }

  // Видалення символів, що не завершуються
  removeNotTerminatingSymbols(rules) {
    this.terminatingSymbols = new Set();
    let nonTerminals = new Set();
    
    // Крок 1: Ініціалізуємо N_T як порожню множину
    this.explanations.push({
      line: 0,
      message: `Create N_T = {${[...this.terminatingSymbols].join(", ")}}`,
    });    

    // Крок 2: Додаємо всі термінальні символи
    for (const rule of rules) {
      for (const alternative of rule.rightSide) {
        for (const symbol of alternative) {
          if (this.isTerminal(symbol, rules) && symbol !== "ε") { 
            this.terminatingSymbols.add(symbol);
          }
        }
      }
    }

    // Крок 3-5: Ітеративно шукаємо нетермінали, що завершуються термінальною послідовністю
    let added;
    do {
      let previousTerminatingSet = new Set(nonTerminals);
      this.explanations.push({
        line: 1,
        message: `Copy N_T to N'_T \nN_T: { ${[...nonTerminals].join(", ")} }\nN'_T: { ${[...previousTerminatingSet].join(", ")} }`,
      });

      added = false;
      for (const rule of rules) {
        if (!this.terminatingSymbols.has(rule.leftSide)) {
          for (const alternative of rule.rightSide) {
            if (alternative.every(symbol => this.terminatingSymbols.has(symbol))) { 
              this.terminatingSymbols.add(rule.leftSide);
              nonTerminals.add(rule.leftSide);
              added = true;

              this.explanations.push({
                line: 2,
                message: `Pridávame ( ${rule.leftSide} ) do ( N_T ), pretože existuje pravidlo ( ${rule.leftSide} to ${alternative.join("")} ), kde všetky symboly sú v N_T.`,
              });
              break;
            }
          }
          break;
        }
      }

      this.explanations.push({
        line: 3,
        message: `N_T = {${[...nonTerminals].join(", ")}} \nN'_T = {${[...previousTerminatingSet].join(", ")}}`,
      });

    } while (added);

    this.explanations.push({
      line: 4,
      message: `N_T = {${[...nonTerminals].join(", ")}}`,
    });

    // Оновлення правил, видаляючи альтернативи з не завершеними символами
    let updatedRules = [];
    for (const rule of rules) {
      const newRightSide = rule.rightSide.filter((alternative) => 
        alternative.every((symbol) => this.terminatingSymbols.has(symbol))
      );
      
      if (newRightSide.length < rule.rightSide.length) {
        rule.rightSide = newRightSide;
      }

      // Додаємо тільки ті правила, у яких є непорожні праві частини
      if (newRightSide.length > 0) {
        updatedRules.push(rule);
      }
    }

    // Після видалення порожніх правил
    updatedRules = this.removeEmptyRules(updatedRules);
    const formattedRules = updatedRules.map(rule => `${rule.leftSide} → ${rule.rightSide.map(alt => alt.join(" ")).join(" | ")}`).join("\n");
    this.explanations.push({
      line: 5,
      message: `Rules after removing nonterminals not in N_T = {${[...nonTerminals].join(", ")}}:\n${formattedRules}`,
    });

    return updatedRules;
  }

  // Видалення недосяжних символів
  removeUnreachableSymbols(rules) {
    const reachableSymbols = new Set();
    reachableSymbols.add(rules[0].leftSide); // Додаємо початковий символ


    this.explanations.push({
      line: 6,
      message: `Create V_D = {${[...reachableSymbols].join(", ")}}`,
    });

    let added;
    do {

      const previousReachableSymbols = new Set(reachableSymbols);
      this.explanations.push({
        line: 7,
        message: `Copy V_D to V'_D \nV_D: { ${[...reachableSymbols].join(", ")} }\nV'_D: { ${[...previousReachableSymbols].join(", ")} }`,
      });

      added = false;
      for (const rule of rules) {
        if (reachableSymbols.has(rule.leftSide)) { 
          for (const alternative of rule.rightSide) {
            for (const symbol of alternative) {
              if (!reachableSymbols.has(symbol)) {
                reachableSymbols.add(symbol);
                added = true;

                this.explanations.push({
                  line: 8,
                  message: `Pridávame (${symbol}) do množiny dosiahnuteľných symbolov, pretože existuje pravidlo (${rule.leftSide} → ${alternative.join(" ")}), kde všetky symboly sú v V_D.`,
                });
                break;
              }
            }
            break;
          }
          break;
        }
      }

      this.explanations.push({
        line: 9,
        message: `V_D = {${[...reachableSymbols].join(", ")}} \nV'_D = {${[...previousReachableSymbols].join(", ")}}`,
      });

    } while (added);


    // Видаляємо правила з недосяжними лівими частинами та оновлюємо rules
    const updatedRules = rules.filter((rule) => reachableSymbols.has(rule.leftSide));
    
    const formattedRules = updatedRules.map(rule => `${rule.leftSide} → ${rule.rightSide.map(alt => alt.join(" ")).join(" | ")}`).join("\n");
    this.explanations.push({
      line: 10,
      message: `Rules after removing symbols not in V_D = {${[...reachableSymbols].join(", ")}}:\n${formattedRules}`,
    });

    this.explanations.push({
      line: 11,
      message: `Output:\n${formattedRules}`,
    });
    
    return updatedRules;
  }

  // Перевірка, чи є символ терміналом
  isTerminal(symbol, rules) {
    return rules.every(rule => rule.leftSide !== symbol && symbol[0] === symbol[0].toLowerCase());
  }

  // Видалення порожніх правил
  removeEmptyRules(rules) {
    const updatedRules = rules.filter((rule) => rule.rightSide.length > 0);
    return updatedRules;
  }

  // Виконання операцій для видалення непотрібних символів
  executeRemovingUselessSymbols(rules) {
    // Викликаємо метод для видалення нетермінальних символів
    let updatedRules = this.removeNotTerminatingSymbols(rules);

    // Викликаємо метод для видалення недосяжних символів
    updatedRules = this.removeUnreachableSymbols(updatedRules);

    return updatedRules;
  }

  toString() {
    return this.rules.map(rule => {
      const alternatives = rule.rightSide.map(alt => alt.join(" ")).join(" | ");
      return `${rule.leftSide} → ${alternatives}`;
    }).join("\n");
  }
}
