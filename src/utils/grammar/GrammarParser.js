import antlr4 from 'antlr4';
import BNFLexer from './BNF/BNFLexer.js';
import BNFParser from './BNF/BNFParser.js';
import EBNFLexer from './EBNF/EBNFLexer.js';
import EBNFParser from './EBNF/EBNFParser.js';

export class Rule {
  constructor(leftSide, rightSide) {
    this.leftSide = leftSide;
    this.rightSide = rightSide;
  }
  toString() {
    const right = this.rightSide
      .map((alt) => (Array.isArray(alt) ? alt.join(' ') : alt))
      .join(' | ');
    return `${this.leftSide} → ${right}`;
  }
}

// ─── BNF helpers ─────────────────────────────────────────────────────────────
// NETERMINAL token text includes angle brackets: <A> → strip to get A

function bnfStripAngle(token) {
  const t = token.getText();
  return t.startsWith('<') ? t.slice(1, -1) : t;
}

function bnfExtractSymbol(symCtx) {
  const terminal = symCtx.TERMINAL();
  if (terminal) return terminal.getText();
  const nonterm = symCtx.NETERMINAL();
  if (nonterm) return bnfStripAngle(nonterm);
  return symCtx.getText();
}

function bnfExtractPostupnost(ctx) {
  if (ctx.getText() === 'epsilon') return ['ε'];
  const symbols = ctx.symbol();
  if (!symbols || symbols.length === 0) return null;
  return symbols.map(bnfExtractSymbol);
}

function bnfExtractPravastrana(ctx) {
  const postupnosti = ctx.postupnost();
  if (!postupnosti || postupnosti.length === 0) return [];
  const alternatives = [];
  for (const p of postupnosti) {
    const alt = bnfExtractPostupnost(p);
    if (alt !== null) alternatives.push(alt);
  }
  return alternatives;
}

// ─── EBNF helpers ────────────────────────────────────────────────────────────
// TERMINAL token text includes surrounding quotes: "a" → strip to get a

function ebnfStripQuotes(token) {
  const t = token.getText();
  return t.startsWith('"') ? t.slice(1, -1) : t;
}

function ebnfExtractElement(ctx) {
  const terminal = ctx.TERMINAL();
  if (terminal) return ebnfStripQuotes(terminal);

  const nonterm = ctx.NETERMINAL();
  if (nonterm) return nonterm.getText();

  // ( pravastrana ) | [ pravastrana ] | { pravastrana }
  const ps = ctx.pravastrana();
  if (ps) {
    const seqs = ps.postupnost()
      .map(ebnfExtractPostupnost)
      .filter(Boolean)
      .map(seq => seq.join(' '));
    const inner = seqs.join(' | ');
    const text = ctx.getText(); // e.g. "(...)", "[...]", "{...}"
    if (text.startsWith('(')) return `(${inner})`;
    if (text.startsWith('[')) return `[${inner}]`;
    if (text.startsWith('{')) return `{${inner}}`;
    return inner;
  }

  return ctx.getText();
}

function ebnfExtractPostupnost(ctx) {
  if (ctx.getText() === 'epsilon') return ['ε'];
  const elements = ctx.element();
  if (!elements || elements.length === 0) return null;
  return elements.map(ebnfExtractElement);
}

function ebnfExtractPravastrana(ctx) {
  const postupnosti = ctx.postupnost();
  if (!postupnosti || postupnosti.length === 0) return [];
  return postupnosti.map(ebnfExtractPostupnost).filter(Boolean);
}

// ─── parseBNF ─────────────────────────────────────────────────────────────────

export function parseBNF(input, t) {
  try {
    const inputStream = new antlr4.InputStream(input);
    const lexer = new BNFLexer(inputStream);
    lexer.removeErrorListeners();
    const tokenStream = new antlr4.CommonTokenStream(lexer);
    const parser = new BNFParser(tokenStream);
    parser.removeErrorListeners();

    const errors = [];
    parser.addErrorListener({
      syntaxError: (_r, _o, line, column, msg) => {
        errors.push(t
          ? t('error', { expectedType: 'grammar', token: msg })
          : `Line ${line}:${column} ${msg}`);
      }
    });

    const tree = parser.bnf();
    if (errors.length > 0) return { rules: [], errors };

    const rules = [];
    for (const pravidloCtx of tree.pravidlo()) {
      const nonterm = pravidloCtx.NETERMINAL();
      if (!nonterm) continue;
      const pravaCtx = pravidloCtx.pravastrana();
      if (!pravaCtx) continue;
      const rightSide = bnfExtractPravastrana(pravaCtx);
      if (rightSide.length > 0)
        rules.push(new Rule(bnfStripAngle(nonterm), rightSide));
    }
    return { rules, errors: [] };
  } catch (error) {
    return { rules: [], errors: [error.message] };
  }
}

// ─── parseEBNF ────────────────────────────────────────────────────────────────

export function parseEBNF(input, t) {
  try {
    const inputStream = new antlr4.InputStream(input);
    const lexer = new EBNFLexer(inputStream);
    lexer.removeErrorListeners();
    const tokenStream = new antlr4.CommonTokenStream(lexer);
    const parser = new EBNFParser(tokenStream);
    parser.removeErrorListeners();

    const errors = [];
    parser.addErrorListener({
      syntaxError: (_r, _o, line, column, msg) => {
        errors.push(t
          ? t('error', { expectedType: 'grammar', token: msg })
          : `Line ${line}:${column} ${msg}`);
      }
    });

    const tree = parser.ebnf();
    if (errors.length > 0) return { rules: [], errors };

    const rules = [];
    for (const pravidloCtx of tree.pravidlo()) {
      const nonterm = pravidloCtx.NETERMINAL();
      if (!nonterm) continue;
      const pravaCtx = pravidloCtx.pravastrana();
      if (!pravaCtx) continue;
      const rightSide = ebnfExtractPravastrana(pravaCtx);
      if (rightSide.length > 0)
        rules.push(new Rule(nonterm.getText(), rightSide));
    }
    return { rules, errors: [] };
  } catch (error) {
    return { rules: [], errors: [error.message] };
  }
}

// ─── detectGrammarType ────────────────────────────────────────────────────────

function detectGrammarType(input) {
  const lines = input.trim().split('\n').filter(l => l.trim());
  const isBNF  = lines.every(l => /^\s*<[^>]+>\s*::=/.test(l));
  const isEBNF = lines.every(l => /^\s*[a-zA-Z][a-zA-Z0-9_\-]*\s*::=/.test(l));
  if (isBNF)  return 'bnf';
  if (isEBNF) return 'ebnf';
  return 'unknown';
}

// ─── parseGrammar (unified) ───────────────────────────────────────────────────

export function parseGrammar(input, t) {
  const type = detectGrammarType(input);
  if (type === 'bnf')  return parseBNF(input, t);
  if (type === 'ebnf') return parseEBNF(input, t);
  // fallback — try both
  const bnfResult = parseBNF(input, t);
  if (bnfResult.errors.length === 0) return bnfResult;
  return parseEBNF(input, t);
}
