import { formatRules, createSnapshotter } from './formatRules.js';

const plain = (rules) =>
  rules.map((r) => `${r.leftSide} → ${r.rightSide.map((a) => a.join(' ')).join(' | ')}`).join('\n');

describe('createSnapshotter', () => {
  test('returns the same string while the grammar is unchanged', () => {
    const snap = createSnapshotter();
    const rules = [{ leftSide: 'S', rightSide: [['a'], ['b']] }];
    const first = snap(rules);
    expect(snap(rules)).toBe(first);
    expect(first).toBe('S → a | b');
  });

  test('produces a new snapshot when an alternative is added or a rule removed', () => {
    const snap = createSnapshotter();
    const rules = [
      { leftSide: 'S', rightSide: [['a']] },
      { leftSide: 'A', rightSide: [['b']] },
    ];
    expect(snap(rules)).toBe('S → a\nA → b');
    rules[0].rightSide.push(['c']);
    expect(snap(rules)).toBe('S → a | c\nA → b');
    expect(snap(rules.slice(0, 1))).toBe('S → a | c');
    expect(snap([])).toBe('');
  });

  test('snapshots stay equal to plain formatting across a sequence of edits', () => {
    const snap = createSnapshotter();
    const rules = [{ leftSide: 'S', rightSide: [['a'], ['ε']] }];
    expect(snap(rules)).toBe(plain(rules));
    rules[0].rightSide = rules[0].rightSide.filter((alt) => alt[0] !== 'ε');
    expect(snap(rules)).toBe(plain(rules));
    rules.unshift({ leftSide: 'S_0', rightSide: [['S'], ['ε']] });
    expect(snap(rules)).toBe(plain(rules));
  });
});

describe('formatRules', () => {
  test('matches the uncached formatting', () => {
    const rules = [
      { leftSide: 'S', rightSide: [['A', 'b'], ['ε']] },
      { leftSide: 'A', rightSide: [['a']] },
    ];
    expect(formatRules(rules)).toBe(plain(rules));
  });

  test('reflects alternatives added with push', () => {
    const rule = { leftSide: 'S', rightSide: [['a']] };
    expect(formatRules([rule])).toBe('S → a');
    rule.rightSide.push(['b']);
    expect(formatRules([rule])).toBe('S → a | b');
  });

  test('reflects an alternatives array that was replaced', () => {
    const rule = { leftSide: 'S', rightSide: [['a'], ['ε']] };
    expect(formatRules([rule])).toBe('S → a | ε');
    rule.rightSide = rule.rightSide.filter((alt) => alt[0] !== 'ε');
    expect(formatRules([rule])).toBe('S → a');
  });

  test('empty grammar gives an empty string', () => {
    expect(formatRules([])).toBe('');
  });
});
