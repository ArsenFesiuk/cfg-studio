import { factorLeftRecursion } from './factorLeftRecursion';

// symbol constructors for readable IR in tests
const nt = (text) => ({ text, isTerminal: false });
const t = (text) => ({ text, isTerminal: true });
const eps = { text: 'epsilon', isTerminal: true };

describe('factorLeftRecursion', () => {
  test('[] form: base is a suffix of the recursive alternative', () => {
    // E ::= E + T | T   →   [E "+"] T
    const rhs = factorLeftRecursion('E', [
      [nt('E'), t('+'), nt('T')],
      [nt('T')],
    ]);
    expect(rhs).toBe('[E "+"] T');
  });

  test('[] form: multiple recursive prefixes sharing the same suffix', () => {
    // E ::= E + T | E - T | T   →   [E "+" | E "-"] T
    const rhs = factorLeftRecursion('E', [
      [nt('E'), t('+'), nt('T')],
      [nt('E'), t('-'), nt('T')],
      [nt('T')],
    ]);
    expect(rhs).toBe('[E "+" | E "-"] T');
  });

  test('Kleene {} fallback when there is no common suffix', () => {
    // A ::= A a | b   →   "b" {"a"}
    const rhs = factorLeftRecursion('A', [
      [nt('A'), t('a')],
      [t('b')],
    ]);
    expect(rhs).toBe('"b" {"a"}');
  });

  test('no left recursion: cosmetic render only', () => {
    // F ::= num | E   →   "num" | E
    const rhs = factorLeftRecursion('F', [
      [t('num')],
      [nt('E')],
    ]);
    expect(rhs).toBe('"num" | E');
  });

  test('right recursion with epsilon base folds into {α}', () => {
    // D ::= b D | epsilon   →   {"b"}
    const rhs = factorLeftRecursion('D', [
      [t('b'), nt('D')],
      [eps],
    ]);
    expect(rhs).toBe('{"b"}');
  });

  test('right recursion with non-epsilon base: {α} β', () => {
    // A ::= a A | b   →   {"a"} "b"
    const rhs = factorLeftRecursion('A', [
      [t('a'), nt('A')],
      [t('b')],
    ]);
    expect(rhs).toBe('{"a"} "b"');
  });

  test('left recursion with epsilon base drops ε: {α}', () => {
    // A ::= A a | epsilon   →   {"a"}
    const rhs = factorLeftRecursion('A', [
      [nt('A'), t('a')],
      [eps],
    ]);
    expect(rhs).toBe('{"a"}');
  });

  test('epsilon alternative is preserved as the bare word', () => {
    // A ::= a | epsilon   →   "a" | epsilon
    const rhs = factorLeftRecursion('A', [
      [t('a')],
      [eps],
    ]);
    expect(rhs).toBe('"a" | epsilon');
  });
});
