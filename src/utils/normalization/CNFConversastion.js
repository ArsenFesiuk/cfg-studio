import { RemovingEpsilonRules } from "./RemovingEpsilonRules";
import { RemovingUnitRules } from "./RemovingUnitRules";
import { RemovingUselessSymbols } from "./RemovingUselessSymbols";

export class CNFConversion {
  constructor(rules, t) {
    this.t = t;
    this.rules = rules;
    this.explanations = [];
  }

  // Основна функція, що виконує всі кроки
  execute() {
    // Add new start symbol
    this.addNewStartSymbol(this.rules);

    // Remove epsilon rules
    const removeEpsilonRules = new RemovingEpsilonRules(this.rules, this.t);
    removeEpsilonRules.execute(); // Оновлення правил
    this.explanations.push({
      line: 1,
      message: this.t("Row2ForCNF", {grammatik : this.toString()})
    });

    // Remove unit rules
    const removeUnitRules = new RemovingUnitRules(this.rules, this.t);
    removeUnitRules.execute(); // Оновлення правил
    this.explanations.push({
      line: 2,
      message: this.t("Row3ForCNF", {grammatik : this.toString()})
    });

    // Remove useless symbols
    const removeUselessSymbols = new RemovingUselessSymbols(this.rules, this.t);
    this.rules = removeUselessSymbols.execute(); // Оновлення правил
    this.explanations.push({
      line: 3,
      message: this.t("Row4ForCNF", {grammatik : this.toString()})
    });

    // Convert to CNF
    this.conversionToCNF(this.rules);

    return this.rules; // Return the final rules
  }
  

  addNewStartSymbol(rules) {
    const rule = rules[0];
    const startSymbol = rule.leftSide;
    const newStartSymbol = startSymbol + "_0";

    const alternative1 = [startSymbol];

    const rightSideForNewStartSymbol = [alternative1];
    rules.unshift({ leftSide: newStartSymbol, rightSide: rightSideForNewStartSymbol });

    // Додаємо пояснення
    this.explanations.push({
      line: 0,
      message: this.t("Row1ForCNF", {newStartSymbol : newStartSymbol,grammatik : this.toString()})
    });
  }

  conversionToCNF(rules) {
    const newRules = [];
    const terminalToNonTerminal = {}; // Зберігає відповідність термінал → новий нетермінал
    const uniqueRightSides = {}; // Унікальні пари правих частин для нових нетерміналів
    let terminalCounter = 1;
    let nonTerminalCounter = 1;

    const nonTerminals = new Set();
    rules.forEach((rule) => {
        nonTerminals.add(rule.leftSide);
    });

    // Етап 1: Замінюємо всі термінали, які зустрічаються разом з нетерміналами
    rules.forEach((rule) => {
        const updatedRightSide = [];

        rule.rightSide.forEach((production) => {
            const updatedProduction = production.map((symbol) => {
                if (!nonTerminals.has(symbol) && production.length > 1) {
                  // this.explanations.push({
                  //   line: 8,
                  //   message: `Terminal replacement in rule A → Y1Y2. Symbol: ${symbol}\n${this.toString()}`
                  // });
                    if (!terminalToNonTerminal[symbol]) {

                      this.explanations.push({
                        line: 4,
                        message: this.t("Row5ForCNF", {leftSide : rule.leftSide, production : production, symbol : symbol, grammatik : this.toString()})
                      });

                        const newNonTerminal = "T" + terminalCounter++;
                        terminalToNonTerminal[symbol] = newNonTerminal;
                        newRules.push({ leftSide: newNonTerminal, rightSide: [[symbol]] });
                        this.explanations.push({
                          line: 5,
                          message: this.t("Row6ForCNF", {leftSide : rule.leftSide, production : production, newNonTerminal : newNonTerminal, productionWithout1 : production.slice(1)})
                        })

                        this.explanations.push({
                          line: 6,
                          message: this.t("Row7ForCNF", {newNonTerminal : newNonTerminal, symbol : symbol})
                        });
                    }
                    return terminalToNonTerminal[symbol];
                }
                return symbol;
            });

            updatedRightSide.push(updatedProduction);
        });
        rule.rightSide = updatedRightSide;
        
    });

    // Додаємо всі нові правила для заміни терміналів
    rules.push(...newRules);
    this.explanations.push({
      line: 7,
      message: this.t("Row8ForCNF", {grammatik : this.toString()})
    });
    // Етап 2: Розбиваємо довгі правила (n ≥ 3) на правила з двома нетерміналами
    const additionalRules = [];

    rules.forEach((rule) => {
        const updatedRightSide = [];

        rule.rightSide.forEach((production) => {
            while (production.length > 2) {
                this.explanations.push({
                    line: 8,
                    message: this.t("Row9ForCNF", {leftSide : rule.leftSide, production : production.join(' '), grammatik : this.toString()})
                });

                const first = production.shift();
                const second = production[0];

                const pair = [first, second];
                let newNonTerminal;

                if (uniqueRightSides[pair]) {
                    newNonTerminal = uniqueRightSides[pair];
                    this.explanations.push({
                      line: 9,
                      message: this.t("Row10ForCNF", {leftSide : rule.leftSide, first : first, production : production.join(' '), newNonTerminal : newNonTerminal, productionWithout1 : production.slice(1)})
                  });
                  this.explanations.push({
                      line: 10,
                      message: this.t("Row11ForCNF", { newNonTerminal : newNonTerminal, pair : pair.join(' ')})
                  });
                } else {
                    newNonTerminal = "N" + nonTerminalCounter++;
                    uniqueRightSides[pair] = newNonTerminal;
                    additionalRules.push({ leftSide: newNonTerminal, rightSide: [pair] });
                    this.explanations.push({
                        line: 9,
                        message: this.t("Row10ForCNF", {leftSide : rule.leftSide, first : first, production : production.join(' '), newNonTerminal : newNonTerminal, productionWithout1 : production.slice(1)})
                    });
                    this.explanations.push({
                        line: 10,
                        message: this.t("Row11ForCNF", { newNonTerminal : newNonTerminal, pair : pair.join(' ')})
                    });
                }

                production[0] = newNonTerminal;
            }

            updatedRightSide.push(production);
        });

        rule.rightSide = updatedRightSide;
    });

    // Додаємо всі нові правила для скорочення правих частин
    rules.push(...additionalRules);
    //rules.push(...newRules);
    this.explanations.push({
      line: 11,
      message: this.t("Row12ForCNF", {grammatik : this.toString()})
    });
}


  toString() {
    return this.rules.map(rule => {
      const alternatives = rule.rightSide.map(alt => alt.join(" ")).join(" | ");
      return `${rule.leftSide} → ${alternatives}`;
    }).join("\n");
  }
}
