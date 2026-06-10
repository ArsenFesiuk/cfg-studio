import { RemovingEpsilonRules } from './RemovingEpsilonRules.js';

const t = (key) => key;

function rule(leftSide, ...alts) {
  return { leftSide, rightSide: alts.map((a) => a.split(' ')) };
}

// set of "a b" strings for a non-terminal's alternatives
function altSet(rules, lhs) {
  const r = rules.find((x) => x.leftSide === lhs);
  return new Set(r.rightSide.map((a) => a.join(' ')));
}

describe('RemovingEpsilonRules', () => {
  test('N_ε detects directly and indirectly nullable non-terminals', () => {
    // S → B C ; B → b | ε ; C → c | ε
    const algo = new RemovingEpsilonRules(
      [rule('S', 'B C'), rule('B', 'b', 'ε'), rule('C', 'c', 'ε')],
      t
    );
    algo.buildNEps();
    expect([...algo.nullable].sort()).toEqual(['B', 'C', 'S']);
  });

  test('generates all nullable combinations and keeps ε only for the start symbol', () => {
    const algo = new RemovingEpsilonRules(
      [rule('S', 'B C'), rule('B', 'b', 'ε'), rule('C', 'c', 'ε')],
      t
    );
    const final = algo.execute();
    // start S keeps ε; B and C lose their ε
    expect(altSet(final, 'S')).toEqual(new Set(['B C', 'C', 'B', 'ε']));
    expect(altSet(final, 'B')).toEqual(new Set(['b']));
    expect(altSet(final, 'C')).toEqual(new Set(['c']));
  });

  test('non-start nullable symbol drops ε after expansion', () => {
    // S → A B ; A → a | ε ; B → b
    const algo = new RemovingEpsilonRules(
      [rule('S', 'A B'), rule('A', 'a', 'ε'), rule('B', 'b')],
      t
    );
    const final = algo.execute();
    expect(altSet(final, 'S')).toEqual(new Set(['A B', 'B']));
    expect(altSet(final, 'A')).toEqual(new Set(['a']));
  });

  test('introduces a new start symbol when S → ε and S is used', () => {
    // S → a S | ε  (S is used on a right-hand side and has a direct ε-rule)
    const algo = new RemovingEpsilonRules([rule('S', 'a S', 'ε')], t);
    const final = algo.execute();
    const newStart = final.find((r) => r.leftSide === 'S_0');
    expect(newStart).toBeTruthy();
    expect(altSet(final, 'S_0')).toEqual(new Set(['S', 'ε']));
    // original S no longer derives ε directly
    expect(altSet(final, 'S').has('ε')).toBe(false);
  });

  test('emits steps for both pseudocode blocks 8.3 and 8.4', () => {
    const algo = new RemovingEpsilonRules([rule('S', 'A'), rule('A', 'a', 'ε')], t);
    algo.execute();
    const blocks = new Set(algo.steps.map((s) => s.block));
    expect(blocks.has(0)).toBe(true);
    expect(blocks.has(1)).toBe(true);
  });
});
