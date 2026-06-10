import antlr4 from 'antlr4';
import BNFLexer from './BNF/BNFLexer.js';
import BNFParser from './BNF/BNFParser.js';
import EBNFLexer from './EBNF/EBNFLexer.js';
import EBNFParser from './EBNF/EBNFParser.js';
import { convertEBNFToBNF } from './convertEBNFToBNF.js';

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

// ─── helpers ─────────────────────────────────────────────────────────────────

function isEpsilonText(text) {
  return text === 'ε' || text === 'epsilon';
}

// ─── BNF helpers ─────────────────────────────────────────────────────────────

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
  if (isEpsilonText(ctx.getText())) return ['ε'];
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

function ebnfStripQuotes(token) {
  const t = token.getText();
  return t.startsWith('"') ? t.slice(1, -1) : t;
}

function ebnfExtractElement(ctx) {
  const terminal = ctx.TERMINAL();
  if (terminal) return ebnfStripQuotes(terminal);

  const nonterm = ctx.NETERMINAL();
  if (nonterm) return nonterm.getText();

  const ps = ctx.pravastrana();
  if (ps) {
    const seqs = ps.postupnost()
      .map(ebnfExtractPostupnost)
      .filter(Boolean)
      .map(seq => seq.join(' '));
    const inner = seqs.join(' | ');
    const text = ctx.getText();
    if (text.startsWith('(')) return `(${inner})`;
    if (text.startsWith('[')) return `[${inner}]`;
    if (text.startsWith('{')) return `{${inner}}`;
    return inner;
  }

  return ctx.getText();
}

function ebnfExtractPostupnost(ctx) {
  if (isEpsilonText(ctx.getText())) return ['ε'];
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

const BNF_FORMAT_HINT = 'BNF format: <NonTerminal> ::= <NonTerminal> terminal | epsilon';

export function parseBNF(input, t) {
  try {
    const errors = [];
    const errorListener = {
      syntaxError: (_r, _o, line, column, msg) => {
        const detail = t
          ? t('error', { expectedType: 'grammar', token: msg })
          : `Line ${line}:${column} — ${msg}`;
        errors.push(detail);
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
      return { rules: [], errors: [BNF_FORMAT_HINT, ...errors] };
    }

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
    return { rules: [], errors: [BNF_FORMAT_HINT, error.message] };
  }
}

// ─── parseEBNF ────────────────────────────────────────────────────────────────

const EBNF_FORMAT_HINT = 'EBNF format: NonTerminal ::= "terminal" | NonTerminal | [optional] | {repeat} | (group)';

export function parseEBNF(input, t) {
  try {
    const errors = [];
    const errorListener = {
      syntaxError: (_r, _o, line, column, msg) => {
        const detail = t
          ? t('error', { expectedType: 'grammar', token: msg })
          : `Line ${line}:${column} — ${msg}`;
        errors.push(detail);
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
      return { rules: [], errors: [EBNF_FORMAT_HINT, ...errors] };
    }

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
    return { rules: [], errors: [EBNF_FORMAT_HINT, error.message] };
  }
}

// ─── detectGrammarType ────────────────────────────────────────────────────────
// The app now accepts only the two formal notations: BNF and EBNF.
// BNF non-terminals are angle-bracketed (<A>); EBNF non-terminals are bare
// identifiers. Both use ::= as the rule separator.

export function detectGrammarType(input) {
  const lines = input.trim().split('\n').filter(l => l.trim());
  if (lines.length === 0) return 'empty';
  const isBNF  = lines.every(l => /^\s*<[^>]+>\s*::=/.test(l));
  const isEBNF = lines.every(l => /^\s*[a-zA-Z][a-zA-Z0-9_-]*\s*::=/.test(l));
  if (isBNF)  return 'bnf';
  if (isEBNF) return 'ebnf';
  return 'unknown';
}

// ─── parseGrammar (unified) ───────────────────────────────────────────────────

export function parseGrammar(input, t) {
  const type = detectGrammarType(input);
  if (type === 'bnf')   return parseBNF(input, t);
  if (type === 'ebnf')  return parseEBNF(input, t);
  if (type === 'empty') return { rules: [], errors: [] };

  // 'unknown' — try each parser in order
  const bnfResult = parseBNF(input, t);
  if (bnfResult.errors.length === 0) return bnfResult;

  const ebnfResult = parseEBNF(input, t);
  if (ebnfResult.errors.length === 0) return ebnfResult;

  // Both failed — return a single helpful message
  return {
    rules: [],
    errors: [
      'Unrecognised format. Supported formats:',
      '  • BNF:   <S> ::= <A> | a | epsilon',
      '  • EBNF:  S ::= "a" | B | ["c"] | {B}',
    ]
  };
}

// ─── getPlainRules ────────────────────────────────────────────────────────────
// Returns plain context-free rules (no EBNF extensions) ready for the
// normalization algorithms. BNF is parsed directly; EBNF is first expanded to
// BNF (so {}, [], () become helper rules) and then parsed.

export function getPlainRules(input, t) {
  const type = detectGrammarType(input);
  if (type === 'empty') return { rules: [], errors: [] };

  if (type === 'ebnf') {
    try {
      // convertEBNFToBNF expects the word "epsilon", not the ε glyph
      const bnfText = convertEBNFToBNF(input.replace(/ε/g, 'epsilon'));
      return parseBNF(bnfText, t);
    } catch (err) {
      return { rules: [], errors: [err.message] };
    }
  }

  // bnf or unknown → let parseBNF try
  return parseBNF(input, t);
}
