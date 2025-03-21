export class RemovingLeftRecursion {
  constructor(t) {
    this.t = t;
    this.rules = [];
    this.explanations = [];
  }

  eliminateLeftRecursion(rules) {
    this.rules = [...rules];
    const size = rules.length;

    for (let i = 0; i < size; i++) {
      const currentRule = this.rules[i];
      
      // Додавання пояснень
      this.addExplanation(0, this.t("Row1ForLeftRecursion", { i: i + 1, rule: this.ruleToString(currentRule) }));

      // Перевірка непрямої лівої рекурсії
      for (let j = 0; j < i; j++) {
        const previousRule = this.rules[j];
        const newRightSide = [];
        let changed = false;

        this.addExplanation(1, this.t("Row2ForLeftRecursion", { j: j + 1, rule: this.ruleToString(previousRule) }));

        // Перевірка всіх альтернатив для кожного правила
        for (const alternatives of currentRule.rightSide) {
          console.log("Previous rule:",previousRule.leftSide);
          console.log("alternative:",alternatives[0]);
          if (alternatives[0] && alternatives[0] === previousRule.leftSide){
            console.log("aaa");
            changed = true;
            this.addExplanation(2, this.t("Row3ForLeftRecursion", {
              currentRule: this.ruleToString(currentRule),
              previousRule: this.ruleToString(previousRule),
              i: currentRule.leftSide,
              j: previousRule.leftSide
            }));

            // Створення нових альтернатив на основі попередніх правил
            for (const alternativesPreviousRule of previousRule.rightSide) {
              const newAlternative = [...alternativesPreviousRule, ...alternatives.slice(1)];
              newRightSide.push(newAlternative);
            }
            this.addExplanation(3, this.t("Row4ForLeftRecursion", {
              leftSide: currentRule.leftSide,
              newRightSide: this.rightSideToString(newRightSide),
              i: currentRule.leftSide,
              j: previousRule.leftSide
            }));
          } else {
            newRightSide.push(alternatives);
          }
        }

        if (changed) {
          currentRule.rightSide = newRightSide;
          this.rules[i] = currentRule;
          this.addExplanation(4, this.t("Row5ForLeftRecursion"));
        }

        this.addExplanation(5, this.t("Row6ForLeftRecursion", { j: j + 1, rule: previousRule.leftSide, rules: this.toString() }));
      }

      // Далі ми перевіряємо на пряму ліву рекурсію та її виправлення
      const newRightSide = [];
      const recursiveAlternatives = [];
      const newNonTerminal = currentRule.leftSide + "'";
      let hasLeftRecursion = false;

      for (const alternatives of currentRule.rightSide) {
        if (currentRule.leftSide === alternatives[0]) {
          hasLeftRecursion = true;
          const newAlternativeWithoutNonTerminal = alternatives.slice(1);
          const newAlternativeWithNonTerminal = [...newAlternativeWithoutNonTerminal, newNonTerminal];
          recursiveAlternatives.push(newAlternativeWithoutNonTerminal);
          recursiveAlternatives.push(newAlternativeWithNonTerminal);
        } else {
          newRightSide.push(alternatives);
        }
      }

      if (hasLeftRecursion) {
        // Заміна правої частини для непрямої рекурсії
        for (const alternatives of currentRule.rightSide) {
          if (currentRule.leftSide !== alternatives[0]) {
            const newAlternativeWithNonTerminal = [...alternatives, newNonTerminal];
            newRightSide.push(newAlternativeWithNonTerminal);
          }
        }

        currentRule.rightSide = newRightSide;
        this.rules[i] = currentRule;
      }

      // Додаємо нове правило для рекурсії
      if (recursiveAlternatives.length > 0) {
        const newRule = { leftSide: newNonTerminal, rightSide: recursiveAlternatives };
        this.addExplanation(6, this.t("Row7ForLeftRecursion", {
          rules: this.toString(),
          newRule: this.ruleToString(newRule),
          i: currentRule.leftSide
        }));
        rules.push(newRule);
        this.rules.push(newRule);
      }

      this.addExplanation(7, this.t("Row8ForLeftRecursion", { i: i + 1, rule: currentRule.leftSide, rules: this.toString() }));
    }

    return this.explanations;
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

  ruleToString(rule) {
    const alternatives = rule.rightSide.map(alt => alt.join(" ")).join(" | ");
    return `${rule.leftSide} → ${alternatives}`;
  }

  rightSideToString(rightSide) {
    return rightSide.map(alt => alt.join(" ")).join(" | ");
  }
}
