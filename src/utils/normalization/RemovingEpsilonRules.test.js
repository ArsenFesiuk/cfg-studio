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

  test('builds the N_ε iteration table exactly like Tabuľka 8.3', () => {
    // Príklad 8.1.2: S → A B ; A → a A | ε ; B → b B | ε
    const algo = new RemovingEpsilonRules(
      [rule('S', 'A B'), rule('A', 'a A', 'ε'), rule('B', 'b B', 'ε')],
      t
    );
    algo.execute();
    const tables = algo.blocks[0].tables;
    expect(tables).toHaveLength(1);
    expect(tables[0].rows).toEqual([
      { set: '{A, B}', prev: '∅', condition: true },
      { set: '{A, B, S}', prev: '{A, B}', condition: true },
      { set: '{A, B, S}', prev: '{A, B, S}', condition: false },
    ]);
  });

  test('does not reveal an iteration row until its union step (8.3 line 4) is reached', () => {
    // Príklad 8.1.2: S → A B ; A → a A | ε ; B → b B | ε
    // iter 0 adds {A, B}; iter 1 adds S → row index 1 must show {A, B, S}.
    const algo = new RemovingEpsilonRules(
      [rule('S', 'A B'), rule('A', 'a A', 'ε'), rule('B', 'b B', 'ε')],
      t
    );
    algo.execute();
    const steps = algo.steps;

    // Replicates PseudoCodeViewer.tableProgress: how many rows are visible at `current`.
    const visibleRowCount = (current) => {
      let maxIter = -1;
      for (let i = 0; i <= current; i++) {
        const s = steps[i];
        if (s.block === 0 && s.table === 0 && typeof s.iter === 'number' && s.iter > maxIter) {
          maxIter = s.iter;
        }
      }
      return maxIter + 1;
    };

    // The copy line (8.3 line 3 → 0-based index 2). The k-th occurrence is iteration k.
    const copySteps = steps
      .map((s, i) => ({ s, i }))
      .filter(({ s }) => s.block === 0 && s.line === 2)
      .map(({ i }) => i);

    // On the copy step of the 2nd iteration the union (line 4) has NOT run yet,
    // so row index 1 (the one that adds S) must still be hidden.
    expect(visibleRowCount(copySteps[1])).toBe(1);

    // The union step (8.3 line 4 → index 3) of the 2nd iteration reveals row 1.
    const unionIter1 = steps.findIndex(
      (s) => s.block === 0 && s.line === 3 && s.iter === 1
    );
    expect(visibleRowCount(unionIter1)).toBe(2);
  });

  test('tags loop steps with table/iter and rewrite steps without', () => {
    const algo = new RemovingEpsilonRules([rule('S', 'A'), rule('A', 'a', 'ε')], t);
    algo.execute();
    const loopSteps = algo.steps.filter((s) => s.block === 0 && s.table === 0);
    expect(loopSteps.length).toBeGreaterThan(0);
    expect(loopSteps.every((s) => typeof s.iter === 'number')).toBe(true);
  });

  test('8.4 walks the loop body and adds each combination as its own step', () => {
    // S → A B ; A → a A | ε ; B → b B | ε   (N_ε = {A, B, S})
    const algo = new RemovingEpsilonRules(
      [rule('S', 'A B'), rule('A', 'a A', 'ε'), rule('B', 'b B', 'ε')],
      t
    );
    algo.execute();
    const block1 = algo.steps.filter((s) => s.block === 1);

    // Each generated combination is its own step on the add line (index 12):
    // S gains B, A, ε ; A gains 'a' ; B gains 'b' → 5 single-combination steps.
    const addSteps = block1.filter((s) => s.line === 12);
    expect(addSteps).toHaveLength(5);

    // The condition gate (index 11) is visited once per rule in the second loop.
    const checkSteps = block1.filter((s) => s.line === 11);
    expect(checkSteps).toHaveLength(3);

    // The walkthrough ends on the final end-for/result line (index 17),
    // not mid-body on an add/remove line.
    expect(block1[block1.length - 1].line).toBe(17);
  });

  test('each step carries an evolving grammar snapshot and add/remove changes', () => {
    const algo = new RemovingEpsilonRules(
      [rule('S', 'A B'), rule('A', 'a A', 'ε'), rule('B', 'b B', 'ε')],
      t
    );
    algo.execute();
    const steps = algo.steps;

    // every step carries a grammar snapshot string
    expect(steps.every((s) => typeof s.snapshot === 'string' && s.snapshot.length > 0)).toBe(true);
    // first step shows the original grammar; last step shows the final grammar
    expect(steps[0].snapshot).toBe('S → A B\nA → a A | ε\nB → b B | ε');
    expect(steps[steps.length - 1].snapshot).toBe(algo.toString());

    // adding a combination is described as an 'add' change
    const adds = steps.filter((s) => s.change && s.change.kind === 'add');
    expect(adds.some((s) => s.change.leftSide === 'S' && s.change.alt === 'B')).toBe(true);
    // removing A → ε is described as a 'remove' change
    expect(
      steps.some((s) => s.change && s.change.kind === 'remove' && s.change.alt === 'ε')
    ).toBe(true);
  });

  test('emits steps for both pseudocode blocks 8.3 and 8.4', () => {
    const algo = new RemovingEpsilonRules([rule('S', 'A'), rule('A', 'a', 'ε')], t);
    algo.execute();
    const blocks = new Set(algo.steps.map((s) => s.block));
    expect(blocks.has(0)).toBe(true);
    expect(blocks.has(1)).toBe(true);
  });
});
