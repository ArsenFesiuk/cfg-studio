export class RemovingUnitRules {
  constructor(rules, t) {
    this.rules = rules;
    this.nonTerminals = new Set();
    this.explanations = []; // Масив для пояснень
    this.t = t;
  }

  // Метод для видалення одиничних правил
  execute() {
    this.initializeNonTerminals(this.rules);
    let N_A = new Set();

    const alternativesMap = new Map();

    // Створюємо мапу альтернатив для кожного нетермінала
    this.rules.forEach(rule => {
      alternativesMap.set(rule.leftSide, new Set(rule.rightSide.map(JSON.stringify)));
    });

    this.rules.forEach(rule => {
      this.explanations.push({
        line: 0,
        message: this.t("Row1ForRemoveUnitRules", {leftSide : rule.leftSide})
      });

      this.explanations.push({
        line: 1,
        message: this.t("Row2ForRemoveUnitRules", {N_A : [...N_A]})
      });

      const newRightSide = [];
      const unitQueue = []; // Черга для обробки одиничних правил

      rule.rightSide.forEach(alternative => {
        if (alternative.length === 1 && this.isNonTerminal(alternative[0])) {
          unitQueue.push(alternative[0]); // Додаємо одиничне правило в чергу
        } else {
          newRightSide.push(alternative); // Якщо не одиничне, залишаємо як є
        }
      });

      let previousN_A;
      // Обробка всіх одиничних правил для поточного нетермінала
      do {
        previousN_A = new Set(N_A);

        this.explanations.push({
          line: 2,
          message: this.t("Row3ForRemoveUnitRules", {N_A : [...N_A].join(' | '), previousN_A : [...previousN_A].join(' | ')})
        });

        N_A = new Set([...N_A].filter(item => !this.isNonTerminal(item)));

        const target = unitQueue.shift();
        const targetAlternatives = alternativesMap.get(target);

        if (targetAlternatives && typeof targetAlternatives[Symbol.iterator] === 'function') {
          targetAlternatives.forEach(unitAlternative => {
            const parsedAlternative = JSON.parse(unitAlternative);

            // Додаємо альтернативи одиничного правила в N_A
            N_A.add(parsedAlternative.join(" "));  // Зберігаємо альтернативи в N_A

            // Якщо нова альтернатива теж одиничне правило, додаємо в чергу
            if (parsedAlternative.length === 1 && this.isNonTerminal(parsedAlternative[0])) {
              unitQueue.push(parsedAlternative[0]);
            }

            // Якщо альтернатива не міститься у правій частині правила, додаємо її в newRightSide
            if (!this.containsRightSide(rule.rightSide, parsedAlternative)) {
              newRightSide.push(parsedAlternative);
            }
          });
          this.explanations.push({
            line: 3,
            message: this.t("Row4ForRemoveUnitRules", {leftSide : rule.leftSide, target : target,N_A : [...N_A].join(' | ')})
          });
        }

        this.explanations.push({
          line: 4,
          message: this.t("Row5ForRemoveUnitRules", {N_A : [...N_A].join(' | '), previousN_A : [...previousN_A].join(' | ')})
        });

      } while (unitQueue.length > 0 || previousN_A.size !== N_A.size);

      if (newRightSide.length > 0) {
        rule.rightSide = newRightSide.filter(alt => !(alt.length === 1 && this.isNonTerminal(alt[0])));
        alternativesMap.set(rule.leftSide, new Set(newRightSide.map(JSON.stringify)));
        this.explanations.push({
          line: 5,
          message: this.t("Row6ForRemoveUnitRules", {leftSide : rule.leftSide, N_A : [...N_A].join(' | '), rightSide : rule.rightSide.map(alt => alt.join(" ")).join(" | ")})
        });
      }

      this.explanations.push({
        line: 6,
        message: this.t("Row7ForRemoveUnitRules", {leftSide : rule.leftSide, grammatik : this.toString()})
      });

      N_A.clear();
    });
    this.removeEmptyRules(this.rules);
    return this.rules;
  }

  // Ініціалізація нетерміналів
  initializeNonTerminals(rules) {
    rules.forEach(rule => {
      this.nonTerminals.add(rule.leftSide);
    });
  }

  // Перевірка, чи є символ нетерміналом
  isNonTerminal(symbol) {
    return this.nonTerminals.has(symbol);
  }

  // Видалення правил з порожніми правими частинами
  removeEmptyRules(rules) {
    rules = rules.filter(rule => rule.rightSide.length > 0);
  }

  // Перевірка, чи є альтернатива вже в правій частині правила
  containsRightSide(rightSide, alternative) {
    return rightSide.some(existingAlt => JSON.stringify(existingAlt) === JSON.stringify(alternative));
  }

  toString() {
    return this.rules.map(rule => {
      const alternatives = rule.rightSide.map(alt => alt.join(" ")).join(" | ");
      return `${rule.leftSide} → ${alternatives}`;
    }).join("\n");
  }
}