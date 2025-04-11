export class RemovingUselessSymbols {
  constructor(rules, t) {
    this.rules = rules;
    this.explanations = []; // Масив для пояснень
    this.t = t;
  }

  // Видалення символів, що не завершуються
  removeNotTerminatingSymbols() {
    this.terminatingSymbols = new Set();
    let nonTerminals = new Set();
    let rules = this.rules;
    
    // Крок 1: Ініціалізуємо N_T як порожню множину
    this.explanations.push({
      line: 0,
      message: this.t("Row1ForRemoveUselessSymbols", {N_T : [...this.terminatingSymbols].join(", ")})
    });    

    // Крок 2: Додаємо всі термінальні символи
    for (const rule of rules) {
      for (const alternative of rule.rightSide) {
        for (const symbol of alternative) {
          if (this.isTerminal(symbol) && symbol !== "ε") { 
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
        message: this.t("Row2ForRemoveUselessSymbols", {N_T : [...nonTerminals].join(", "), N_T_previous : [...previousTerminatingSet].join(", ")})
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
                message: this.t("Row3ForRemoveUselessSymbols", {leftSide : rule.leftSide, alternative : alternative.join(" ")})
              });
              break;
            }
          }
        }
      }

      this.explanations.push({
        line: 3,
        message: this.t("Row4ForRemoveUselessSymbols", {N_T : [...nonTerminals].join(", "), N_T_previous : [...previousTerminatingSet].join(", ")})
      });

    } while (added);

    this.explanations.push({
      line: 4,
      message: this.t("Row5ForRemoveUselessSymbols", {N_T : [...nonTerminals].join(", ")})
    });

    // Оновлення правил, видаляючи альтернативи з не завершеними символами
    let updatedRules = [];
    for (const rule of rules) {
      const newRightSide = rule.rightSide.filter((alternative) => 
        alternative.every((symbol) => this.terminatingSymbols.has(symbol))
      );
      
      if (newRightSide.length > 0) {
        updatedRules.push({ ...rule, rightSide: newRightSide });
      }
    }

    updatedRules = this.removeEmptyRules(updatedRules);
    this.rules = updatedRules;

    const formattedRules = this.rules
    .map(rule => `${rule.leftSide} → ${rule.rightSide.map(alt => alt.join(" ")).join(" | ")}`)
    .join("\n"); 
    this.explanations.push({
      line: 5,
      message: this.t("Row6ForRemoveUselessSymbols", {N_T : [...nonTerminals].join(", "), formattedRules : formattedRules})
    });
  }

  // Видалення недосяжних символів
  removeUnreachableSymbols() {
    const reachableSymbols = new Set();
    reachableSymbols.add(this.rules[0].leftSide); // Додаємо початковий символ

    this.explanations.push({
      line: 6,
      message: this.t("Row7ForRemoveUselessSymbols", {V_D : [...reachableSymbols].join(", ")})
    });

    const previousReachableSymbols = new Set(reachableSymbols);
      for (const rule of this.rules) {
        if (reachableSymbols.has(rule.leftSide)) { 
          for (const alternative of rule.rightSide) {
            for (const symbol of alternative) {
              if (!reachableSymbols.has(symbol)) {
                this.explanations.push({
                  line: 7,
                  message: this.t("Row8ForRemoveUselessSymbols", {V_D : [...reachableSymbols].join(", "), V_D_previous : [...previousReachableSymbols].join(", ")})
                });

                reachableSymbols.add(symbol);


                this.explanations.push({
                  line: 8,
                  message: this.t("Row9ForRemoveUselessSymbols", {symbol : symbol, leftSide : rule.leftSide, alternative : alternative.join(" ")})
                });

                this.explanations.push({
                  line: 9,
                  message: this.t("Row10ForRemoveUselessSymbols", {V_D : [...reachableSymbols].join(", "), V_D_previous : [...previousReachableSymbols].join(", ")})
                });

                previousReachableSymbols.clear();
                for (const s of reachableSymbols) {
                  previousReachableSymbols.add(s);
                }
              }
            }
          }
        }
      }
      this.explanations.push({
        line: 7,
        message: this.t("Row8ForRemoveUselessSymbols", {V_D : [...reachableSymbols].join(", "), V_D_previous : [...previousReachableSymbols].join(", ")})
      });

      this.explanations.push({
        line: 9,
        message: this.t("Row10ForRemoveUselessSymbols", {V_D : [...reachableSymbols].join(", "), V_D_previous : [...previousReachableSymbols].join(", ")})
      });
      

    // Видаляємо правила з недосяжними лівими частинами та оновлюємо rules

    this.rules = this.rules.filter((rule) => reachableSymbols.has(rule.leftSide));

    const formattedRules = this.rules
    .map(rule => `${rule.leftSide} → ${rule.rightSide.map(alt => alt.join(" ")).join(" | ")}`)
    .join("\n");

    this.explanations.push({
      line: 10,
      message: this.t("Row11ForRemoveUselessSymbols", {V_D : [...reachableSymbols].join(", "), formattedRules : formattedRules})
    });

    this.explanations.push({
      line: 11,
      message: this.t("Row12ForRemoveUselessSymbols", {formattedRules : formattedRules})
    });
  }

  // Перевірка, чи є символ терміналом
  isTerminal(symbol) {
    return symbol[0] === symbol[0].toLowerCase();
  }

  // Видалення порожніх правил
  removeEmptyRules(rules) {
    return rules.filter((rule) => rule.rightSide.length > 0);
  }

  // Виконання операцій для видалення непотрібних символів
  execute() {
    this.removeNotTerminatingSymbols();
    console.log("Rules після видалення незавершених символів:", this.rules);
    this.removeUnreachableSymbols();
    console.log("Rules після видалення недосяжних символів:", this.rules);
    return this.rules;
  }

  toString() {
    return this.rules.map(rule => {
      const alternatives = rule.rightSide.map(alt => alt.join(" ")).join(" | ");
      return `${rule.leftSide} → ${alternatives}`;
    }).join("\n");
  }
}
