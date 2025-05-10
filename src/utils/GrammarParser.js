import { tokenize, TokenType } from './Lexer';
class Rule {
  constructor(leftSide, rightSide) {
    this.leftSide = leftSide;
    this.rightSide = rightSide;
  }
}

export function parseTokens(tokens, t) {
  const rules = [];
  const errors = [];
  let index = 0;

  function peek() {
    return tokens[index];
  }

  function consume(expectedType) {
    const token = tokens[index];
    if (!token || token.type !== expectedType) {
      errors.push(t("error", { expectedType: expectedType, token: token?.type })); 
      return null;
    }
    index++;
    return token;
  }

  // gramatika = pravidlo { "\n" pravidlo } 
  function parseGrammar() {
    let rule = parseRule();
    if (rule) {
      rules.push(rule);
    }

    while (peek()?.type === TokenType.NEWLINE) {
      consume(TokenType.NEWLINE);
      if (peek()?.type === TokenType.EOF) {
        break;
      }
      rule = parseRule();
      if (rule) {
        rules.push(rule);
      }
    }
  }

  //rule =  leftSide "->" rightSide
  function parseRule() {
    const left = parseLeftSide();
    if (!left) {
      skipToNextRule();
      return null;
    }

    const arrowToken = consume(TokenType.ARROW);
    if (!arrowToken) {
      skipToNextRule();
      return null;
    }

    const right = parseRightSide();
    if (!right) {
      skipToNextRule();
      return null;
    }

    return new Rule(left, right);
  }

  //leftSide = NONTERMINAL
  function parseLeftSide() {
    const token = consume(TokenType.NONTERMINAL);
    return token?.value || null;
  }

  //rightSide = alternative { "|" alternative } 
  function parseRightSide() {
    const alternatives = [];
    let currentAlt = parseAlternative();

    alternatives.push(currentAlt);

    while (peek()?.type === TokenType.PIPE) {
      consume(TokenType.PIPE);
      currentAlt = parseAlternative();
      alternatives.push(currentAlt);
    }

    return alternatives;
  }

  //alternative = "ε" | symbol { symbol } 
  function parseAlternative() {
    if (peek()?.type === TokenType.TERMINAL && peek().value === "ε") {
      consume(TokenType.TERMINAL); 
      return ["ε"];
    }

    if (!peek() || ![TokenType.TERMINAL, TokenType.NONTERMINAL].includes(peek().type)) {
      errors.push(t("error1", { token: peek()?.type }));
      return null;
    }

    const symbols = [];

    let symbol = parseSymbol();
    if (symbol) {
      symbols.push(symbol.value);
    }

    while (symbol) {
      symbol = parseSymbol();
      if (symbol) {
        symbols.push(symbol.value);
      }
    }

    return symbols;
  }

  //symbol = TERMINÁL | NONTERMINAL
  function parseSymbol() {
    const token = peek();

    if (token.type === TokenType.NONTERMINAL) {
      consume(TokenType.NONTERMINAL);
      return { value: token.value };
    }

    if (token.type === TokenType.TERMINAL) {
      consume(TokenType.TERMINAL);
      return { value: token.value };
    }
  }

  function skipToNextRule() {
    while (peek() && peek().type !== TokenType.NEWLINE && peek().type !== TokenType.EOF) {
      index++;
    }
  }

  parseGrammar();

  return { rules, errors };
}

export function parseGrammar(input, t) {
  const tokens = tokenize(input);
  return parseTokens(tokens, t);
}

export { Rule };
