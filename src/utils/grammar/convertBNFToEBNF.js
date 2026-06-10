import antlr4 from 'antlr4';
import BNFLexer from './BNF/BNFLexer.js';
import BNFParser from './BNF/BNFParser.js';

/**
 * Конвертує BNF рядок в EBNF рядок.
 * BNF:  <expr> ::= <term> | a epsilon
 * EBNF: expr ::= term | "a" | epsilon
 *
 * NETERMINAL token text includes angle brackets (<A>), stripped here.
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
    const nonterm = _nt.getText().slice(1, -1);
    const pravaCtx = pravidloCtx.pravastrana();
    const postupnosti = pravaCtx.postupnost();

    const alternatives = postupnosti.map(p => {
      if (p.getText() === 'epsilon') return 'epsilon';
      return p.symbol().map(s => {
        const terminal = s.TERMINAL();
        if (terminal) return `"${terminal.getText()}"`;
        const nt = s.NETERMINAL();
        if (nt) return nt.getText().slice(1, -1); // strip <>
        return s.getText();
      }).join(' ');
    });

    lines.push(`${nonterm} ::= ${alternatives.join(' | ')}`);
  }

  return lines.join('\n');
}
