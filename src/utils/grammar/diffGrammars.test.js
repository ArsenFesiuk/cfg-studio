import { diffGrammars } from './diffGrammars.js';

const statuses = (rows) => rows.map((r) => [r.lhs, r.status, r.alts.map((a) => `${a.text}:${a.status}`)]);

describe('diffGrammars', () => {
  test('identical grammars have no changes', () => {
    const text = 'S → a S | b\nA → c';
    const { before, after } = diffGrammars(text, text);
    expect(statuses(before)).toEqual(statuses(after));
    expect([...before, ...after].every((r) => r.status === 'same' && r.alts.every((a) => a.status === 'same'))).toBe(true);
  });

  test('an added alternative is marked on the after side only', () => {
    const { before, after } = diffGrammars('S → a', 'S → a | b');
    expect(statuses(before)).toEqual([['S', 'same', ['a:same']]]);
    expect(statuses(after)).toEqual([['S', 'same', ['a:same', 'b:added']]]);
  });

  test('a removed alternative is marked on the before side only', () => {
    const { before, after } = diffGrammars('S → a | ε', 'S → a');
    expect(statuses(before)).toEqual([['S', 'same', ['a:same', 'ε:removed']]]);
    expect(statuses(after)).toEqual([['S', 'same', ['a:same']]]);
  });

  test('a whole new rule is added, a whole dropped rule is removed', () => {
    const { before, after } = diffGrammars('S → A\nB → b', 'S_0 → S\nS → A');
    expect(statuses(before)).toEqual([
      ['S', 'same', ['A:same']],
      ['B', 'removed', ['b:removed']],
    ]);
    expect(statuses(after)).toEqual([
      ['S_0', 'added', ['S:added']],
      ['S', 'same', ['A:same']],
    ]);
  });

  test('whitespace differences are ignored, alternative order is not a change', () => {
    const { before, after } = diffGrammars('S → a  b |  c', 'S → c | a b');
    expect(before[0].alts.every((a) => a.status === 'same')).toBe(true);
    expect(after[0].alts.every((a) => a.status === 'same')).toBe(true);
  });

  test('empty input on either side is fine', () => {
    expect(diffGrammars('', '').before).toEqual([]);
    const { after } = diffGrammars('', 'S → a');
    expect(statuses(after)).toEqual([['S', 'added', ['a:added']]]);
  });
});
