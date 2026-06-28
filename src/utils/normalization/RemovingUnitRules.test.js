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

  test('builds one N_A iteration table per non-terminal (Tabuľka 8.4–8.8)', () => {
    const algo = new RemovingUnitRules(buildRules(), t);
    algo.execute();
    const tables = algo.blocks[0].tables;
    expect(tables.map((tb) => tb.setLabel)).toEqual([
      'N_{S}', 'N_{A}', 'N_{B}', 'N_{C}', 'N_{D}',
    ]);
    expect(tables[0].rows).toEqual([            // Tabuľka 8.4 (N_S)
      { set: '{S, A, B}', prev: '{S}', condition: true },
      { set: '{S, A, B, C, D}', prev: '{S, A, B}', condition: true },
      { set: '{S, A, B, C, D}', prev: '{S, A, B, C, D}', condition: false },
    ]);
    expect(tables[1].rows).toEqual([            // Tabuľka 8.5 (N_A)
      { set: '{A, C}', prev: '{A}', condition: true },
      { set: '{A, C}', prev: '{A, C}', condition: false },
    ]);
    expect(tables[2].rows).toEqual([            // Tabuľka 8.6 (N_B)
      { set: '{B, D}', prev: '{B}', condition: true },
      { set: '{B, D}', prev: '{B, D}', condition: false },
    ]);
    expect(tables[3].rows).toEqual([            // Tabuľka 8.7 (N_C)
      { set: '{C}', prev: '{C}', condition: false },
    ]);
    expect(tables[4].rows).toEqual([            // Tabuľka 8.8 (N_D)
      { set: '{D}', prev: '{D}', condition: false },
    ]);
  });

  test('steps carry snapshots that evolve to the final grammar', () => {
    const algo = new RemovingUnitRules(buildRules(), t);
    algo.execute();
    const steps = algo.steps;

    expect(steps.every((s) => typeof s.snapshot === 'string' && s.snapshot.length > 0)).toBe(true);
    // the rewrite evolves the grammar: last snapshot is the final grammar, not the original
    expect(steps[steps.length - 1].snapshot).toBe(algo.toString());
    expect(steps[steps.length - 1].snapshot).not.toBe(steps[0].snapshot);
    // copying a non-unit production is an 'add' change
    const adds = steps.filter((s) => s.change && s.change.kind === 'add');
    expect(adds.length).toBeGreaterThan(0);
  });

  test('emits steps for both pseudocode blocks 8.5 and 8.6', () => {
    const algo = new RemovingUnitRules(buildRules(), t);
    algo.execute();
    const blocks = new Set(algo.steps.map((s) => s.block));
    expect(blocks.has(0)).toBe(true);
    expect(blocks.has(1)).toBe(true);
  });

  test('removes each unit rule as its own amber step', () => {
    const algo = new RemovingUnitRules(buildRules(), t);
    algo.execute();
    const removes = algo.steps.filter((s) => s.change && s.change.kind === 'remove');
    // unit rules: S→A, S→B, A→C, B→D  → four separate removal steps
    expect(removes.length).toBe(4);
    const removed = removes.map((s) => `${s.change.leftSide}→${s.change.alt}`);
    expect(removed).toEqual(
      expect.arrayContaining(['S→A', 'S→B', 'A→C', 'B→D'])
    );
  });
});
