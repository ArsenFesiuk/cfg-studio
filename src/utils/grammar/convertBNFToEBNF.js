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
  const inputStream = new antlr4.InputStream(input);
  const lexer = new BNFLexer(inputStream);
  lexer.removeErrorListeners();
  const tokenStream = new antlr4.CommonTokenStream(lexer);
  const parser = new BNFParser(tokenStream);
  parser.removeErrorListeners();

  const errors = [];
  parser.addErrorListener({
    syntaxError: (_r, _o, line, column, msg) => {
      errors.push(`Line ${line}:${column} ${msg}`);
    }
  });

  const tree = parser.bnf();
  if (errors.length > 0) throw new Error(errors.join('\n'));

  const lines = [];

  for (const pravidloCtx of tree.pravidlo()) {
    // NETERMINAL includes <>, strip to get bare name
    const nonterm = pravidloCtx.NETERMINAL().getText().slice(1, -1);
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
