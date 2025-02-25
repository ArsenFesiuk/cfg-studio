export class RemovingUnitRules {
  constructor() {
    this.nonTerminals = new Set();
    this.explanations = []; // Масив для пояснень
  }

  // Метод для видалення одиничних правил
  removeUnitRules(rules) {
    this.rules = rules;
    this.initializeNonTerminals(rules);

    // Карта для зберігання нетерміналів та їх альтернатив
    const alternativesMap = new Map();

    // Ініціалізація карти ключ нетермінал значення альтернативи
    rules.forEach(rule => {
      alternativesMap.set(rule.leftSide, new Set(rule.rightSide.map(JSON.stringify)));
    });

    let updated;
    do {
      updated = false;
      rules.forEach(rule => {
        const newRightSide = [];
        let unitReplacements = new Map(); // Для збору альтернатив одиничних правил

        rule.rightSide.forEach(alternative => {
          // Перевірка одиничних правил
          if (alternative.length === 1 && this.isNonTerminal(alternative[0])) { // чи є це одиничне правило
            const target = alternative[0];
            const targetAlternatives = alternativesMap.get(target);

            if (targetAlternatives) { // перевіряєм чи є альтернативи для цього нетерміналу
              targetAlternatives.forEach(targetAlternative => {
                const parsedTargetAlternative = JSON.parse(targetAlternative); //  ми їх зберігали як рядки ["\c\"] і JSON.parse перетворить ["c"] у масив щоб працювати
                if (!this.containsRightSide(rule.rightSide, parsedTargetAlternative)) { // перевіряєм чи є ця альтернатива в правій частині 
                  newRightSide.push(parsedTargetAlternative);
                  updated = true;

                  // для пояснення
                  if (!unitReplacements.has(target)) {
                    unitReplacements.set(target, []);
                  }

                  unitReplacements.get(target).push(parsedTargetAlternative.join(" "));
                }
              });
            }
          } else {
            newRightSide.push(alternative);
          }
        });

        // Оновлюємо праву частину правила
        rule.rightSide = newRightSide;
        alternativesMap.set(rule.leftSide, new Set(newRightSide.map(JSON.stringify)));

        unitReplacements.forEach((replacements, target) => {
          this.explanations.push(`Pravidlo ${rule.leftSide} → ${target} je jednoduche pravidlo, nahrádzame ho jeho alternatívami: ${replacements.join(" | ")}.`);
          this.explanations.push(this.toString());
        });

        // Додаємо поточний стан граматики після кожного важливого кроку
      });
    } while (updated);

    this.removeEmptyRules(rules);
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
