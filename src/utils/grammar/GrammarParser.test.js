import { parseBNF, parseEBNF, parseGrammar, Rule } from './GrammarParser';
import { convertBNFToEBNF } from './convertBNFToEBNF';
import { convertEBNFToBNF } from './convertEBNFToBNF';

// ─── helpers ─────────────────────────────────────────────────────────────────

function rhs(rules, lhs) {
  return rules.find(r => r.leftSide === lhs)?.rightSide ?? null;
}

// ─── parseBNF ────────────────────────────────────────────────────────────────

describe('parseBNF', () => {
  test('single rule, single terminal', () => {
    const { rules, errors } = parseBNF('<A> ::= a');
    expect(errors).toHaveLength(0);
    expect(rules).toHaveLength(1);
    expect(rules[0].leftSide).toBe('A');
    expect(rules[0].rightSide).toEqual([['a']]);
  });

  test('single rule, non-terminal on right side', () => {
    const { rules, errors } = parseBNF('<A> ::= <B>');
    expect(errors).toHaveLength(0);
    expect(rhs(rules, 'A')).toEqual([['B']]);
  });

  test('alternation  a | b', () => {
    const { rules, errors } = parseBNF('<A> ::= a | b');
    expect(errors).toHaveLength(0);
    expect(rhs(rules, 'A')).toEqual([['a'], ['b']]);
  });

  test('sequence  a b c', () => {
    const { rules, errors } = parseBNF('<A> ::= a b c');
    expect(errors).toHaveLength(0);
    expect(rhs(rules, 'A')).toEqual([['a', 'b', 'c']]);
  });

  test('epsilon production', () => {
    const { rules, errors } = parseBNF('<A> ::= epsilon');
    expect(errors).toHaveLength(0);
    expect(rhs(rules, 'A')).toEqual([['ε']]);
  });

  test('multiple alternatives including epsilon', () => {
    const { rules, errors } = parseBNF('<A> ::= a <B> | epsilon');
    expect(errors).toHaveLength(0);
    expect(rhs(rules, 'A')).toEqual([['a', 'B'], ['ε']]);
  });

  test('multiple rules', () => {
    const input = '<S> ::= <A> <B>\n<A> ::= a\n<B> ::= b';
    const { rules, errors } = parseBNF(input);
    expect(errors).toHaveLength(0);
    expect(rules).toHaveLength(3);
    expect(rhs(rules, 'S')).toEqual([['A', 'B']]);
    expect(rhs(rules, 'A')).toEqual([['a']]);
    expect(rhs(rules, 'B')).toEqual([['b']]);
  });

  test('Rule.toString()', () => {
    const r = new Rule('A', [['a', 'B'], ['ε']]);
    expect(r.toString()).toBe('A → a B | ε');
  });

  test('invalid syntax returns errors', () => {
    const { rules, errors } = parseBNF('not a grammar');
    expect(errors.length).toBeGreaterThan(0);
  });
});

// ─── parseEBNF ───────────────────────────────────────────────────────────────

describe('parseEBNF', () => {
  test('single rule, single terminal in quotes', () => {
    const { rules, errors } = parseEBNF('A ::= "a"');
    expect(errors).toHaveLength(0);
    expect(rules[0].leftSide).toBe('A');
    expect(rhs(rules, 'A')).toEqual([['a']]);
  });

  test('non-terminal on right side (no angle brackets)', () => {
    const { rules, errors } = parseEBNF('A ::= B');
    expect(errors).toHaveLength(0);
    expect(rhs(rules, 'A')).toEqual([['B']]);
  });

  test('alternation  "a" | "b"', () => {
    const { rules, errors } = parseEBNF('A ::= "a" | "b"');
    expect(errors).toHaveLength(0);
    expect(rhs(rules, 'A')).toEqual([['a'], ['b']]);
  });

  test('sequence  "a" B "c"', () => {
    const { rules, errors } = parseEBNF('A ::= "a" B "c"');
    expect(errors).toHaveLength(0);
    expect(rhs(rules, 'A')).toEqual([['a', 'B', 'c']]);
  });

  test('epsilon production', () => {
    const { rules, errors } = parseEBNF('A ::= epsilon');
    expect(errors).toHaveLength(0);
    expect(rhs(rules, 'A')).toEqual([['ε']]);
  });

  test('optional  [ "a" ]  expands to single alternative containing [a]', () => {
    const { rules, errors } = parseEBNF('A ::= ["a"]');
    expect(errors).toHaveLength(0);
    expect(rhs(rules, 'A')).toEqual([['[a]']]);
  });

  test('Kleene closure  { "a" }', () => {
    const { rules, errors } = parseEBNF('A ::= {"a"}');
    expect(errors).toHaveLength(0);
    expect(rhs(rules, 'A')).toEqual([['{a}']]);
  });

  test('grouping  ( "a" | "b" )', () => {
    const { rules, errors } = parseEBNF('A ::= ("a" | "b")');
    expect(errors).toHaveLength(0);
    expect(rhs(rules, 'A')).toEqual([['(a | b)']]);
  });

  test('complex rule  "a" { "b" } [ "c" ]', () => {
    const { rules, errors } = parseEBNF('A ::= "a" {"b"} ["c"]');
    expect(errors).toHaveLength(0);
    expect(rhs(rules, 'A')).toEqual([['a', '{b}', '[c]']]);
  });

  test('multiple rules', () => {
    const input = 'S ::= A "op" B\nA ::= "x"\nB ::= "y"';
    const { rules, errors } = parseEBNF(input);
    expect(errors).toHaveLength(0);
    expect(rules).toHaveLength(3);
    expect(rhs(rules, 'S')).toEqual([['A', 'op', 'B']]);
  });

  test('invalid syntax returns errors', () => {
    const { errors } = parseEBNF('"not" "valid"');
    expect(errors.length).toBeGreaterThan(0);
  });
});

// ─── parseGrammar (auto-detect) ──────────────────────────────────────────────

describe('parseGrammar', () => {
  test('auto-detects BNF', () => {
    const { rules, errors } = parseGrammar('<A> ::= a');
    expect(errors).toHaveLength(0);
    expect(rules[0].leftSide).toBe('A');
  });

  test('auto-detects EBNF', () => {
    const { rules, errors } = parseGrammar('A ::= "a"');
    expect(errors).toHaveLength(0);
    expect(rules[0].leftSide).toBe('A');
  });
});

// ─── convertBNFToEBNF ────────────────────────────────────────────────────────

describe('convertBNFToEBNF', () => {
  test('wraps terminals in quotes, strips <> from non-terminals', () => {
    const result = convertBNFToEBNF('<A> ::= a <B>');
    expect(result).toBe('A ::= "a" B');
  });

  test('preserves alternation', () => {
    const result = convertBNFToEBNF('<A> ::= a | b');
    expect(result).toBe('A ::= "a" | "b"');
  });

  test('preserves epsilon', () => {
    const result = convertBNFToEBNF('<A> ::= epsilon');
    expect(result).toBe('A ::= epsilon');
  });

  test('multiple rules', () => {
    const input = '<S> ::= <A>\n<A> ::= a';
    const result = convertBNFToEBNF(input);
    expect(result).toBe('S ::= A\nA ::= "a"');
  });

  test('folds immediate left recursion into [] form', () => {
    const result = convertBNFToEBNF('<E> ::= <E> + <T> | <T>');
    expect(result).toBe('E ::= [E "+"] T');
  });

  test('folds whole arithmetic grammar into [] forms', () => {
    const input =
      '<E> ::= <E> + <T> | <T>\n' +
      '<T> ::= <T> * <F> | <F>\n' +
      '<F> ::= num | <E>';
    const result = convertBNFToEBNF(input);
    expect(result).toBe(
      'E ::= [E "+"] T\n' +
      'T ::= [T "*"] F\n' +
      'F ::= "num" | E'
    );
  });

  test('falls back to Kleene {} when no common suffix', () => {
    const result = convertBNFToEBNF('<A> ::= <A> a | b');
    expect(result).toBe('A ::= "b" {"a"}');
  });

  test('folds right recursion into leading Kleene (epsilon base dropped)', () => {
    const result = convertBNFToEBNF('<D> ::= b <D> | ε');
    expect(result).toBe('D ::= {"b"}');
  });
});

// ─── convertEBNFToBNF ────────────────────────────────────────────────────────

describe('convertEBNFToBNF', () => {
  test('wraps non-terminals in <>, strips quotes from terminals', () => {
    const result = convertEBNFToBNF('A ::= "a" B');
    expect(result).toBe('<A> ::= a <B>');
  });

  test('preserves alternation', () => {
    const result = convertEBNFToBNF('A ::= "a" | "b"');
    expect(result).toBe('<A> ::= a | b');
  });

  test('preserves epsilon', () => {
    const result = convertEBNFToBNF('A ::= epsilon');
    expect(result).toBe('<A> ::= epsilon');
  });

  test('expands optional [ ... ] with new non-terminal', () => {
    const result = convertEBNFToBNF('A ::= ["a"]');
    expect(result).toContain('<A> ::=');
    expect(result).toContain('epsilon');
    expect(result).toContain('a');
  });

  test('expands Kleene closure { ... } with a left-recursive helper (book method)', () => {
    const result = convertEBNFToBNF('A ::= {"a"}');
    const lines = result.split('\n');
    expect(lines.length).toBeGreaterThan(1);
    // helper must be left-recursive: <Rep_N> ::= <Rep_N> a | epsilon
    const helper = lines.find(l => /^<Rep/.test(l));
    expect(helper).toMatch(/<Rep\w+> ::= <Rep\w+> a \| epsilon/);
  });

  test('round-trip BNF → EBNF → BNF preserves structure', () => {
    const original = '<S> ::= <A> <B>\n<A> ::= a\n<B> ::= b';
    const ebnf = convertBNFToEBNF(original);
    const backToBNF = convertEBNFToBNF(ebnf);
    // parse both and compare rule count and left sides
    const { rules: r1 } = parseBNF(original);
    const { rules: r2 } = parseBNF(backToBNF);
    const lhs1 = r1.map(r => r.leftSide).sort();
    const lhs2 = r2.map(r => r.leftSide).sort();
    expect(lhs1).toEqual(lhs2);
  });

  test('round-trip on left-recursive grammar: [] folds, then expands back to valid BNF', () => {
    const original =
      '<E> ::= <E> + <T> | <T>\n' +
      '<T> ::= <T> * <F> | <F>\n' +
      '<F> ::= num';
    const ebnf = convertBNFToEBNF(original);
    expect(ebnf).toBe(
      'E ::= [E "+"] T\n' +
      'T ::= [T "*"] F\n' +
      'F ::= "num"'
    );
    // expanding the EBNF back must yield a parseable BNF grammar (no errors)
    const backToBNF = convertEBNFToBNF(ebnf);
    const { errors } = parseBNF(backToBNF);
    expect(errors).toHaveLength(0);
  });
});
