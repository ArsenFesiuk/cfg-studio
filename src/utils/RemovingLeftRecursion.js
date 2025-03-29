export class RemovingLeftRecursion {
  constructor(rules,t) {
    this.rules = rules;
    this.t = t;
    this.explanations = [];
  }

  execute() {
    const size = this.rules.length;

    for (let i = 0; i < size; i++) {
      const currentRule = this.rules[i];
      this.addExplanation(0, this.t("Row1ForLeftRecursion", { i: i + 1, rule: this.ruleToString(currentRule) }));

      for (let j = 0; j < i; j++) {
        const previousRule = this.rules[j];
        const newRightSide = [];
        let changed = false;

        this.addExplanation(1, this.t("Row2ForLeftRecursion", { j: j + 1, rule: this.ruleToString(previousRule) }));

        for (const alternatives of currentRule.rightSide) {
          if (alternatives[0] && alternatives[0] === previousRule.leftSide) {
            changed = true;
            this.addExplanation(2, this.t("Row3ForLeftRecursion", {
              currentRule: this.ruleToString(currentRule),
              previousRule: this.ruleToString(previousRule),
              i: currentRule.leftSide,
              j: previousRule.leftSide
            }));

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
        for (const alternatives of currentRule.rightSide) {
          if (currentRule.leftSide !== alternatives[0]) {
            const newAlternativeWithNonTerminal = [...alternatives, newNonTerminal];
            newRightSide.push(newAlternativeWithNonTerminal);
          }
        }
        currentRule.rightSide = newRightSide;
        this.rules[i] = currentRule;
      }

      if (recursiveAlternatives.length > 0) {
        const newRule = { leftSide: newNonTerminal, rightSide: recursiveAlternatives };
        this.addExplanation(6, this.t("Row7ForLeftRecursion", {
          rules: this.toString(),
          newRule: this.ruleToString(newRule),
          rule: currentRule.leftSide,
          i : i + 1
        }));
        this.rules.push(newRule);
      }

      this.addExplanation(7, this.t("Row8ForLeftRecursion", { i: i + 1, 
        rule: currentRule.leftSide, 
        rules: this.toString() }));
    }

    return this.explanations;
  }

  addExplanation(line, message) {
    this.explanations.push({ line, message });
  }

  toString() {
    return this.rules.map(rule => `${rule.leftSide} → ${rule.rightSide.map(alt => alt.join(" ")).join(" | ")}`).join("\n");
  }

  ruleToString(rule) {
    return `${rule.leftSide} → ${rule.rightSide.map(alt => alt.join(" ")).join(" | ")}`;
  }

  rightSideToString(rightSide) {
    return rightSide.map(alt => alt.join(" ")).join(" | ");
  }
}