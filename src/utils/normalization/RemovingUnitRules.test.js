import { RemovingUnitRules } from './RemovingUnitRules.js';

const t = (key) => key;

function rule(leftSide, ...alts) {
  return { leftSide, rightSide: alts.map((a) => a.split(' ')) };
}

function altSet(rules, lhs) {
  const r = rules.find((x) => x.leftSide === lhs);
  return new Set(r.rightSide.map((a) => a.join(' ')));
}

describe('RemovingUnitRules (textbook example 8.1.3)', () => {
  // S → A | B ; A → C | aA | bS ; B → D | cB | dS ; C → bC | a ; D → dD | c
  const buildRules = () => [
    rule('S', 'A', 'B'),
    rule('A', 'C', 'a A', 'b S'),
    rule('B', 'D', 'c B', 'd S'),
    rule('C', 'b C', 'a'),
    rule('D', 'd D', 'c'),
  ];

  test('N_S contains every non-terminal reachable through unit rules', () => {
    const algo = new RemovingUnitRules(buildRules(), t);
    expect([...algo.buildNA('S')].sort()).toEqual(['A', 'B', 'C', 'D', 'S']);
  });

  test('rewrites away unit rules, copying non-unit productions', () => {
    const final = new RemovingUnitRules(buildRules(), t).execute();

    expect(altSet(final, 'S')).toEqual(
      new Set(['a A', 'b S', 'c B', 'd S', 'b C', 'a', 'd D', 'c'])
    );
    expect(altSet(final, 'A')).toEqual(new Set(['a A', 'b S', 'b C', 'a']));
    expect(altSet(final, 'B')).toEqual(new Set(['c B', 'd S', 'd D', 'c']));
    expect(altSet(final, 'C')).toEqual(new Set(['b C', 'a']));
    expect(altSet(final, 'D')).toEqual(new Set(['d D', 'c']));
  });

  test('no unit rules remain in the result', () => {
    const final = new RemovingUnitRules(buildRules(), t).execute();
    const NT = new Set(final.map((r) => r.leftSide));
    const hasUnit = final.some((r) =>
      r.rightSide.some((alt) => alt.length === 1 && NT.has(alt[0]))
    );
    expect(hasUnit).toBe(false);
  });

  test('emits steps for both pseudocode blocks 8.5 and 8.6', () => {
    const algo = new RemovingUnitRules(buildRules(), t);
    algo.execute();
    const blocks = new Set(algo.steps.map((s) => s.block));
    expect(blocks.has(0)).toBe(true);
    expect(blocks.has(1)).toBe(true);
  });
});
