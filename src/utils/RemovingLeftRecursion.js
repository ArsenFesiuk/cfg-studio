export class RemovingLeftRecursion {
  eliminateLeftRecursion(rules) {
    this.rules = [...rules]; // Копіюємо правила, щоб уникнути мутацій
    const size = rules.length;
    let explanations = [];

    for (let i = 0; i < size; i++) {
      const currentRule = this.rules[i];

      // Обробка непрямої лівої рекурсії через попередні правила
      for (let j = 0; j < i; j++) {
        const previousRule = this.rules[j];
        const newRightSide = [];
        let changed = false;

        for (const alternatives of currentRule.rightSide) {
          if (previousRule.leftSide === alternatives[0]) { // якщо ліва сторона поперднього правила така сама як перший символ альтернативи теперішнього правила
            changed = true;
            for (const alternativesPreviousRule of previousRule.rightSide) {
              const newAlternative = [...alternativesPreviousRule, ...alternatives.slice(1)];// тут ми обєднуєм дві альтернативи і з теперішньої альтернативи забираєм перший символ і вставляєм замість того першого символу альтренативу попереднього правила
              newRightSide.push(newAlternative);
            }
            explanations.push(`Nepriama ľavá rekurzia v pravej časti pravidla ${currentRule.leftSide} → ${alternatives.join(" ")}, nahradené alternatívami z pravidla ${previousRule.leftSide}`);
          } else {
            newRightSide.push(alternatives);
          }
        }

        if (changed) {
          currentRule.rightSide = newRightSide;
          this.rules[i] = currentRule;
          explanations.push(this.toString());
        }
      }

      // Обробка прямої лівої рекурсії
      const newRightSide = [];
      const recursiveAlternatives = [];
      const newNonTerminal = currentRule.leftSide + "'";
      let hasLeftRecursion = false;

      for (const alternatives of currentRule.rightSide) {
        if (currentRule.leftSide === alternatives[0]) {
          hasLeftRecursion = true;
          const newAlternativeWithoutNonTerminal = alternatives.slice(1); //альтернатива, де ми обрізаєм перший символ(ліву рекурсію)
          const newAlternativeWithNonTerminal = [...newAlternativeWithoutNonTerminal, newNonTerminal]; // додаємо новий нетермінал до поточної альтернативи
          recursiveAlternatives.push(newAlternativeWithoutNonTerminal);
          recursiveAlternatives.push(newAlternativeWithNonTerminal);
          explanations.push(`Priama ľavá rekurzia pre pravidlo ${currentRule.leftSide} → ${alternatives.join(" ")}, vytvorené nové alternatívy: ${newAlternativeWithoutNonTerminal.join(" ")} a ${newAlternativeWithNonTerminal.join(" ")}`);
        } else {
          newRightSide.push(alternatives);
        }
      }

      if (hasLeftRecursion) {
        for (const alternatives of currentRule.rightSide) {
          if (currentRule.leftSide !== alternatives[0]) {
            const newAlternativeWithNonTerminal = [...alternatives, newNonTerminal]; // додаєм до альтернативи новий нетермінал, якщо в тій альтернативі нема лівої рекурсії
            newRightSide.push(newAlternativeWithNonTerminal);
          }
        }
        explanations.push(`Pravidlo ${currentRule.leftSide} bolo modifikované na odstránenie priamej ľavej rekurzie.`);
        currentRule.rightSide = newRightSide;
        this.rules[i] = currentRule;
        explanations.push(this.toString());
      }

      if (recursiveAlternatives.length > 0) {
        const newRule = { leftSide: newNonTerminal, rightSide: recursiveAlternatives };
        rules.push(newRule);
        this.rules.push(newRule);
        explanations.push(`Pridané nové pravidlo ${newNonTerminal} s alternatívami: ${recursiveAlternatives.map(a => a.join(" ")).join(" | ")}`);
        explanations.push(this.toString());
      }
    }

    return explanations;
  }

  toString() {
    return this.rules.map(rule => {
      const alternatives = rule.rightSide.map(alt => alt.join(" ")).join(" | ");
      return `${rule.leftSide} → ${alternatives}`;
    }).join("\n");
  }
}
