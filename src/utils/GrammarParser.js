// Клас Rule для зберігання правил граматики
export class Rule {
  constructor(leftSide, rightSide) {
    this.leftSide = leftSide;
    this.rightSide = rightSide; // Масив альтернатив
  }

  toString() {
    const alternatives = this.rightSide.map((alt) => alt.join(" ")).filter(Boolean);
    return `${this.leftSide} → ${alternatives.join(" | ")}`;
  }
}

// Функція для розбору введеної граматики з перевіркою на пробіли перед і після "->" і "|"
export function parseGrammar(input, t) {
  const rules = [];
  const errors = [];

  // Розбиваємо введений текст на рядки (одне правило на рядок)
  const lines = input.split("\n").map((line) => line.trim()).filter(Boolean);

  for (const line of lines) {
    // Розділяємо правило на ліву і праву частину за допомогою стрілочки
    const [leftSide, rightSide] = line.split("→").map((part) => part.trim());
    if (!leftSide || !rightSide) {
      errors.push(t("invalidRuleFormat"));
      errors.push(line);
      errors.push(t("correctRuleExample"));
      errors.push("A → B");
      errors.push("B → a | c");
      continue;
    }

    // Перевіряємо, чи ліва частина містить лише один токен
    const leftTokens = leftSide.split(/\s+/).filter(Boolean);
    if (leftTokens.length !== 1) {
      errors.push(t("singleTokenLeftSide"));
      errors.push(line);
      errors.push(t("correctRuleExample"));
      errors.push("A → B");
      errors.push("B → a | c");
      continue;
    }

    // Очищаємо праву частину і перетворюємо на масив альтернатив
    const alternatives = rightSide
      .split("|")
      .map((alt) => alt.trim().split(/\s+/).filter(Boolean));

    rules.push(new Rule(leftTokens[0], alternatives));
  }

  return { rules, errors };
}
