import antlr4 from 'antlr4';
import EBNFLexer from './EBNF/EBNFLexer.js';
import EBNFParser from './EBNF/EBNFParser.js';

let counter = 0;
function freshName(base) {
  return `${base}_${++counter}`;
}

function convertPostupnost(postCtx, extraRules) {
  const elements = postCtx.element();
  const symbols = [];
  for (const el of elements) {
    const sym = convertElement(el, extraRules);
    symbols.push(...sym);
  }
  return { symbols };
}

function convertElement(elCtx, extraRules) {
  const text = elCtx.getText();

  // TERMINAL token text includes quotes: "a" → strip to get bare terminal
  const terminal = elCtx.TERMINAL();
  if (terminal) return [terminal.getText().slice(1, -1)];

  // NETERMINAL → wrap in <> for BNF output
  const nonterm = elCtx.NETERMINAL();
  if (nonterm) return [`<${nonterm.getText()}>`];

  // Groups use pravastrana() in the new grammar (no more alternativa())
  const ps = elCtx.pravastrana();

  // '(' pravastrana ')' → grouping: new non-terminal
  if (text.startsWith('(')) {
    const name = freshName('G');
    const inner = ps.postupnost().map(p => {
      const r = convertPostupnost(p, extraRules);
      return r.symbols.join(' ');
    }).join(' | ');
    extraRules.push(`<${name}> ::= ${inner}`);
    return [`<${name}>`];
  }

  // '[' pravastrana ']' → optional: N ::= inner | epsilon
  if (text.startsWith('[')) {
    const name = freshName('Opt');
    const inner = ps.postupnost().map(p => {
      const r = convertPostupnost(p, extraRules);
      return r.symbols.join(' ');
    }).join(' | ');
    extraRules.push(`<${name}> ::= ${inner} | epsilon`);
    return [`<${name}>`];
  }

  // '{' pravastrana '}' → Kleene (ліво-рекурсивно, навмисно): N ::= N inner | epsilon
  if (text.startsWith('{')) {
    const name = freshName('Rep');
    const inner = ps.postupnost().map(p => {
      const r = convertPostupnost(p, extraRules);
      return r.symbols.join(' ');
    }).join(' | ');
    extraRules.push(`<${name}> ::= <${name}> ${inner} | epsilon`);
    return [`<${name}>`];
  }

  return [text];
}

/**
 * Конвертує EBNF рядок в BNF рядок.
 * EBNF: expr ::= term {"+" term}
 * BNF:  <expr> ::= <term> <Rep_1>
 *       <Rep_1> ::= <Rep_1> "+" <term> | epsilon   (ліво-рекурсивно, навмисно)
 *
 * TERMINAL token text includes quotes ("a"), stripped here.
 * Groups use pravastrana() context (no more alternativa()).
 */
export function convertEBNFToBNF(input) {
  counter = 0; // reset between calls

  const errors = [];
  const errorListener = {
    syntaxError: (_r, _o, line, column, msg) => {
      errors.push(`Line ${line}:${column} ${msg}`);
    }
  };

  const inputStream = new antlr4.InputStream(input);
  const lexer = new EBNFLexer(inputStream);
  lexer.removeErrorListeners();
  lexer.addErrorListener(errorListener);
  const tokenStream = new antlr4.CommonTokenStream(lexer);
  const parser = new EBNFParser(tokenStream);
  parser.removeErrorListeners();
  parser.addErrorListener(errorListener);

  const tree = parser.ebnf();
  if (errors.length > 0) {
    throw new Error(
      'Invalid EBNF. Format: NonTerminal ::= "terminal" | NonTerminal | [optional] | {repeat}\n' +
      errors.join('\n')
    );
  }

  const mainRules = [];
  const extraRules = [];

  for (const pravidloCtx of tree.pravidlo()) {
    const _nt = pravidloCtx.NETERMINAL();
    if (!_nt) continue;
    const nonterm = _nt.getText();
    const pravaCtx = pravidloCtx.pravastrana();

    const alternatives = [];
    for (const p of pravaCtx.postupnost()) {
      if (p.getText() === 'epsilon') {
        alternatives.push('epsilon');
        continue;
      }
      const r = convertPostupnost(p, extraRules);
      alternatives.push(r.symbols.join(' '));
    }

    mainRules.push(`<${nonterm}> ::= ${alternatives.join(' | ')}`);
  }

  return [...mainRules, ...extraRules].join('\n');
}
