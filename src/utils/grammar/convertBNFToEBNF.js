import antlr4 from 'antlr4';
import BNFLexer from './BNF/BNFLexer.js';
import BNFParser from './BNF/BNFParser.js';
import { factorLeftRecursion } from './factorLeftRecursion.js';

/**
 * Конвертує BNF рядок в EBNF рядок.
 *
 * Конвеєр: парс ANTLR → IR → factorLeftRecursion → рендер.
 *
 * Окрім косметики (нетермінали без <>, термінали в лапках) згортає
 * безпосередню ліву рекурсію в EBNF-конструкції [ ] / { }:
 *   <E> ::= <E> + <T> | <T>   →   E ::= [E "+"] T
 *   <A> ::= <A> a | b         →   A ::= "b" {"a"}   (Kleene-фолбек)
 *
 * IR: rule = { lhs, alts }, alt = symbol[], symbol = { text, isTerminal }.
 * isTerminal береться з типу ANTLR-токена (TERMINAL vs NETERMINAL),
 * щоб рендер правильно брав термінали в лапки, а нетермінали лишав голими.
 */
export function convertBNFToEBNF(input) {
  const errors = [];
  const errorListener = {
    syntaxError: (_r, _o, line, column, msg) => {
      errors.push(`Line ${line}:${column} ${msg}`);
    }
  };

  const inputStream = new antlr4.InputStream(input);
  const lexer = new BNFLexer(inputStream);
  lexer.removeErrorListeners();
  lexer.addErrorListener(errorListener);
  const tokenStream = new antlr4.CommonTokenStream(lexer);
  const parser = new BNFParser(tokenStream);
  parser.removeErrorListeners();
  parser.addErrorListener(errorListener);

  const tree = parser.bnf();
  if (errors.length > 0) {
    throw new Error(
      'Invalid BNF. Format: <NonTerminal> ::= <NonTerminal> terminal | epsilon\n' +
      errors.join('\n')
    );
  }

  const lines = [];

  for (const pravidloCtx of tree.pravidlo()) {
    const _nt = pravidloCtx.NETERMINAL();
    if (!_nt) continue;
    // NETERMINAL includes <>, strip to get bare name
    const lhs = _nt.getText().slice(1, -1);
    const postupnosti = pravidloCtx.pravastrana().postupnost();

    const alts = postupnosti.map(p => {
      const symbols = p.symbol();
      // 'ε' branch has no symbol children → treat as epsilon (word form)
      if (symbols.length === 0) {
        return [{ text: 'epsilon', isTerminal: true }];
      }
      return symbols.map(s => {
        const terminal = s.TERMINAL();
        if (terminal) return { text: terminal.getText(), isTerminal: true };
        const nt = s.NETERMINAL();
        return { text: nt.getText().slice(1, -1), isTerminal: false }; // strip <>
      });
    });

    lines.push(`${lhs} ::= ${factorLeftRecursion(lhs, alts)}`);
  }

  return lines.join('\n');
}
