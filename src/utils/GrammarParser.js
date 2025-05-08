
// Клас Rule для зберігання правил граматики
class Rule {
  constructor(leftSide, rightSide) {
    this.leftSide = leftSide;
    this.rightSide = rightSide; // Масив альтернатив
  }

  toString() {
    const alternatives = this.rightSide.map((alt) => alt.join(" "));
    return `${this.leftSide} → ${alternatives.join(" | ")}`;
  }
}

// Функція для розбору введеної граматики з перевіркою на пробіли перед і після "→" і "|"
export function parseGrammar(input, t) {
  const rules = [];
  const errors = [];

  // grammar ::= rule { newline rule }
  // rule = line обовязкове newline = \n rule = line
  const lines = input.split("\n").map((line) => line.trim());

  for (const line of lines) {
    // Розділяємо правило на ліву і праву частину за допомогою стрілочки
    // rule ::= NONTERMINAL '→' alternatives
    // rule = line
    const parts = line.split("→");

    if (parts.length !== 2) {
      // Якщо більше або менше ніж одна стрілка — це помилка
      errors.push(t("invalidRuleFormat"));
      errors.push(line);
      errors.push(t("correctRuleExample"));
      errors.push("A → B");
      return { rules, errors };
    }
    
    // rule ::= NONTERMINAL '→' alternatives
    const leftSide = parts[0].trim(); // leftSide = NONTERMINAL
    const rightSide = parts[1].trim(); // rightSide = alternatives

    // Перевіряємо, чи ліва частина містить лише один токен
    // NONTERMINAL
    const leftTokens = leftSide.split(/\s+/);
    if (leftTokens.length !== 1) {
      errors.push(t("singleTokenLeftSide"));
      errors.push(line);
      errors.push(t("correctRuleExample"));
      errors.push("A → B");
      errors.push("B → a | c");
      break;
    }

    // Очищаємо праву частину і перетворюємо на масив альтернатив
    // alternatives ::= alternative { '|' alternative }
    const alternatives = rightSide
      .split("|")
      .map((alt) =>
        // alternative ::= symbol { symbol }
         alt.trim().split(/\s+/).filter(Boolean));

    // Якщо є порожні альтернативи після "|", додаємо помилку
    const hasEmptyAlternative = alternatives.some(alt => alt.length === 0);
    if (hasEmptyAlternative) {
      errors.push(t("invalidAlternativeAfterPipe"));
      errors.push(line);
      errors.push(t("correctRuleExample"));
      errors.push("A → B");
      errors.push("B → a | c");
      break;
    }

    rules.push(new Rule(leftTokens[0], alternatives));
  }

  return { rules, errors };
}