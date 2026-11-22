import { CNFConversion } from './CNFConversastion.js';
import { RemovingLeftRecursion } from './RemovingLeftRecursion.js';
import { RemovingEpsilonRules, MAX_NULLABLE_PER_ALTERNATIVE } from './RemovingEpsilonRules.js';

const t = (key) => key;
const text = (rules) =>
  rules.map((r) => `${r.leftSide} → ${r.rightSide.map((a) => a.join(' ')).join(' | ')}`).join('\n');

describe('CNFConversion', () => {
  test('produces Chomsky normal form for a plain grammar', () => {
    const cnf = new CNFConversion(
      [
        { leftSide: 'S', rightSide: [['A', 'B', 'A']] },
        { leftSide: 'A', rightSide: [['a', 'A'], ['a']] },
        { leftSide: 'B', rightSide: [['b']] },
      ],
      t
    );
    cnf.execute();
    for (const rule of cnf.rules) {
      for (const alt of rule.rightSide) {
        const isTerminalOnly = alt.length === 1;
        const isTwoNonTerminals = alt.length === 2;
        expect(isTerminalOnly || isTwoNonTerminals).toBe(true);
      }
    }
  });

  test('generated names never collide with symbols already in the grammar', () => {
    const cnf = new CNFConversion(
      [
        { leftSide: 'S', rightSide: [['T1', 'a', 'b'], ['a', 'b', 'c']] },
        { leftSide: 'T1', rightSide: [['x']] },
      ],
      t
    );
    cnf.execute();
    const t1 = cnf.rules.filter((r) => r.leftSide === 'T1');
    expect(t1).toHaveLength(1);
    expect(t1[0].rightSide).toEqual([['x']]);
  });

  test('a start-symbol name that is taken gets a different generated name', () => {
    const cnf = new CNFConversion(
      [
        { leftSide: 'S', rightSide: [['S_0', 'a'], ['a']] },
        { leftSide: 'S_0', rightSide: [['b']] },
      ],
      t
    );
    cnf.execute();
    const starts = cnf.rules.filter((r) => r.leftSide.startsWith('S_0'));
    expect(new Set(cnf.rules.map((r) => r.leftSide)).size).toBe(cnf.rules.length);
    expect(starts.length).toBeGreaterThan(1);
  });

  test('terminals named like Object.prototype members are handled', () => {
    const cnf = new CNFConversion(
      [{ leftSide: 'S', rightSide: [['constructor', 'toString', 'S'], ['a']] }],
      t
    );
    expect(() => cnf.execute()).not.toThrow();
    expect(text(cnf.rules)).toContain('constructor');
  });

  test('does not modify the rules it was given', () => {
    const rules = [{ leftSide: 'S', rightSide: [['a', 'S', 'b'], ['ε']] }];
    const before = JSON.stringify(rules);
    new CNFConversion(rules, t).execute();
    expect(JSON.stringify(rules)).toBe(before);
  });
});

describe('RemovingLeftRecursion', () => {
  test('removes direct left recursion', () => {
    const lr = new RemovingLeftRecursion(
      [{ leftSide: 'A', rightSide: [['A', 'a'], ['b']] }],
      t
    );
    lr.execute();
    expect(text(lr.rules)).toBe("A → b | b A'\nA' → a | a A'");
  });

  test('does not modify the rules it was given', () => {
    const rules = [{ leftSide: 'A', rightSide: [['A', 'a'], ['b']] }];
    const before = JSON.stringify(rules);
    new RemovingLeftRecursion(rules, t).execute();
    expect(JSON.stringify(rules)).toBe(before);
  });
});

describe('RemovingEpsilonRules limits', () => {
  const nullableGrammar = (k) => [
    { leftSide: 'S', rightSide: [Array.from({ length: k }, (_, i) => `A${i}`)] },
    ...Array.from({ length: k }, (_, i) => ({ leftSide: `A${i}`, rightSide: [['a'], ['ε']] })),
  ];

  test('an alternative at the limit is still processed', () => {
    const algo = new RemovingEpsilonRules(nullableGrammar(MAX_NULLABLE_PER_ALTERNATIVE), t);
    expect(() => algo.execute()).not.toThrow();
  });

  test('an alternative over the limit is refused with a readable error', () => {
    const algo = new RemovingEpsilonRules(nullableGrammar(MAX_NULLABLE_PER_ALTERNATIVE + 1), t);
    expect(() => algo.execute()).toThrow('eps_too_many_nullable');
  });

  test('a fresh start symbol does not reuse an existing name', () => {
    const algo = new RemovingEpsilonRules(
      [
        { leftSide: 'S', rightSide: [['a', 'S'], ['ε']] },
        { leftSide: 'S_0', rightSide: [['b']] },
      ],
      t
    );
    algo.execute();
    const names = algo.rules.map((r) => r.leftSide);
    expect(new Set(names).size).toBe(names.length);
  });
});
