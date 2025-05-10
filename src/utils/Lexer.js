export const TokenType = {
  NONTERMINAL: "NONTERMINAL",
  TERMINAL: "TERMINAL",
  ARROW: "ARROW",
  PIPE: "PIPE",
  NEWLINE: "NEWLINE",
  EOF: "EOF"
};

// Простий токенізатор, що відповідає визначеній граматиці
export function tokenize(input) {
  const tokens = [];
  const lines = input.split(/\r?\n/);

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex].trim();
    // Якщо порожній рядок — додаємо NEWLINE і переходимо до наступного рядка
    if (line === "") {
      tokens.push({ type: TokenType.NEWLINE });
      continue;
    }

    const parts = line.split(/\s+/);
    let isLeftSide = true;

    for (const part of parts) {
      if (part === "→") {
        tokens.push({ type: TokenType.ARROW });
        isLeftSide = false;
      } else if (part === "|") {
        tokens.push({ type: TokenType.PIPE });
      } else if (isLeftSide) {
        if (/^(?:[A-Z]$|[A-Za-z][A-Za-z0-9_]{1,})$/.test(part)) {
          tokens.push({ type: TokenType.NONTERMINAL, value: part });
        }
      } else {
        tokens.push({ type: TokenType.TERMINAL, value: part });
      }
    }
    tokens.push({ type: TokenType.NEWLINE });
  }
  tokens.push({ type: TokenType.EOF });
  return tokens;
}
