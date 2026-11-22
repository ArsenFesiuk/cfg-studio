import { RemovingEpsilonRules } from "./RemovingEpsilonRules.js";
import { RemovingUnitRules } from "./RemovingUnitRules.js";
import { RemovingUselessSymbols } from "./RemovingUselessSymbols.js";

// Conversion to Chomsky normal form.
//
// The result is built exactly as before (start symbol → ε → unit → useless →
// terminals → long rules). What is new is the step list: besides its own steps
// (`block` 0, the overall procedure) it now contains the full step lists of the
// three sub-algorithms, so the viewer and the output panel can walk through them
// one by one. The sub-algorithms' pseudocode blocks follow the overall block.
export class CNFConversion {
  constructor(rules, t) {
    this.t = t;
    // own copy: the conversion adds rules and rewrites alternatives in place
    this.rules = rules.map((r) => ({
      leftSide: r.leftSide,
      rightSide: r.rightSide.map((alt) => [...alt]),
    }));
    this.explanations = [];
    this.steps = [];
    this.blocks = [{ titleKey: "algoTitle_cnf", linesKey: "stepsForGrammarTransformation" }];
  }

  // every symbol that already occurs in the grammar, so generated names
  // (S_0, T1, N1) can never collide with one of the user's own symbols
  usedSymbols() {
    const used = new Set();
    for (const rule of this.rules) {
      used.add(rule.leftSide);
      for (const alt of rule.rightSide) for (const s of alt) used.add(s);
    }
    return used;
  }

  // One step of the overall procedure: kept in `explanations` (the original
  // format) and in `steps` together with the grammar as it stands right now.
  note(line, message) {
    this.explanations.push({ line, message });
    this.steps.push({ block: 0, line, message, snapshot: this.toString(), change: null });
  }

  // Runs a sub-algorithm and appends its steps (and pseudocode blocks) to ours.
  runSubAlgorithm(algorithm) {
    const result = algorithm.execute();
    const offset = this.blocks.length;
    this.blocks.push(...algorithm.blocks);
    for (const step of algorithm.steps) {
      this.steps.push({ ...step, block: step.block + offset });
    }
    return result;
  }

  // Основна функція, що виконує всі кроки
  execute() {
    // Add new start symbol
    this.addNewStartSymbol(this.rules);

    // Remove epsilon rules (new class returns the transformed rule set)
    this.rules = this.runSubAlgorithm(new RemovingEpsilonRules(this.rules, this.t));
    this.note(1, this.t("Row2ForCNF", {grammatik : this.toString()}));

    // Remove unit rules
    this.rules = this.runSubAlgorithm(new RemovingUnitRules(this.rules, this.t));
    this.note(2, this.t("Row3ForCNF", {grammatik : this.toString()}));

    // Remove useless symbols
    this.rules = this.runSubAlgorithm(new RemovingUselessSymbols(this.rules, this.t)); // Оновлення правил
    this.note(3, this.t("Row4ForCNF", {grammatik : this.toString()}));

    // Convert to CNF
    this.conversionToCNF(this.rules);

    return this.rules; // Return the final rules
  }


  addNewStartSymbol(rules) {
    const rule = rules[0];
    const startSymbol = rule.leftSide;
    const used = this.usedSymbols();
    let newStartSymbol = startSymbol + "_0";
    while (used.has(newStartSymbol)) newStartSymbol += "_0";

    const alternative1 = [startSymbol];

    const rightSideForNewStartSymbol = [alternative1];
    rules.unshift({ leftSide: newStartSymbol, rightSide: rightSideForNewStartSymbol });

    // Додаємо пояснення
    this.note(0, this.t("Row1ForCNF", {newStartSymbol : newStartSymbol,grammatik : this.toString()}));
  }

  conversionToCNF(rules) {
    const newRules = [];
    const terminalToNonTerminal = new Map(); // Зберігає відповідність термінал → новий нетермінал
    const uniqueRightSides = new Map(); // Унікальні пари правих частин для нових нетерміналів
    let terminalCounter = 1;
    let nonTerminalCounter = 1;
    const used = this.usedSymbols();
    const freshName = (prefix, next) => {
      let name;
      do {
        name = prefix + next();
      } while (used.has(name));
      used.add(name);
      return name;
    };
    const nextTerminalId = () => terminalCounter++;
    const nextNonTerminalId = () => nonTerminalCounter++;

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
                    if (!terminalToNonTerminal.has(symbol)) {

                      this.note(4, this.t("Row5ForCNF", {leftSide : rule.leftSide, production : production, symbol : symbol, grammatik : this.toString()}));

                        const newNonTerminal = freshName("T", nextTerminalId);
                        terminalToNonTerminal.set(symbol, newNonTerminal);
                        newRules.push({ leftSide: newNonTerminal, rightSide: [[symbol]] });
                        this.note(5, this.t("Row6ForCNF", {leftSide : rule.leftSide, production : production, newNonTerminal : newNonTerminal, productionWithout1 : production.slice(1)}));

                        this.note(6, this.t("Row7ForCNF", {newNonTerminal : newNonTerminal, symbol : symbol}));
                    }
                    return terminalToNonTerminal.get(symbol);
                }
                return symbol;
            });

            updatedRightSide.push(updatedProduction);
        });
        rule.rightSide = updatedRightSide;

    });

    // Додаємо всі нові правила для заміни терміналів
    rules.push(...newRules);
    this.note(7, this.t("Row8ForCNF", {grammatik : this.toString()}));
    // Етап 2: Розбиваємо довгі правила (n ≥ 3) на правила з двома нетерміналами
    const additionalRules = [];

    rules.forEach((rule) => {
        const updatedRightSide = [];

        rule.rightSide.forEach((production) => {
            while (production.length > 2) {
                this.note(8, this.t("Row9ForCNF", {leftSide : rule.leftSide, production : production.join(' '), grammatik : this.toString()}));

                const first = production.shift();
                const second = production[0];

                const pair = [first, second];
                let newNonTerminal;

                const pairKey = pair.join(' ');

                if (uniqueRightSides.has(pairKey)) {
                    newNonTerminal = uniqueRightSides.get(pairKey);
                } else {
                    newNonTerminal = freshName("N", nextNonTerminalId);
                    uniqueRightSides.set(pairKey, newNonTerminal);
                    additionalRules.push({ leftSide: newNonTerminal, rightSide: [pair] });
                }
                this.note(9, this.t("Row10ForCNF", {leftSide : rule.leftSide, first : first, production : production.join(' '), newNonTerminal : newNonTerminal, productionWithout1 : production.slice(1)}));
                this.note(10, this.t("Row11ForCNF", { newNonTerminal : newNonTerminal, pair : pair.join(' ')}));

                production[0] = newNonTerminal;
            }

            updatedRightSide.push(production);
        });

        rule.rightSide = updatedRightSide;
    });

    // Додаємо всі нові правила для скорочення правих частин
    rules.push(...additionalRules);
    this.note(11, this.t("Row12ForCNF", {grammatik : this.toString()}));
}


  toString() {
    return this.rules.map(rule => {
      const alternatives = rule.rightSide.map(alt => alt.join(" ")).join(" | ");
      return `${rule.leftSide} → ${alternatives}`;
    }).join("\n");
  }
}
