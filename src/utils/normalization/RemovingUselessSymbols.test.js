import { RemovingUselessSymbols } from './RemovingUselessSymbols.js';

// translation stub: return the key so the algorithm can build steps without i18n
const t = (key) => key;

function rule(leftSide, ...alts) {
  return { leftSide, rightSide: alts.map((a) => a.split(' ')) };
}

function asText(rules) {
  return rules
    .map((r) => `${r.leftSide} -> ${r.rightSide.map((a) => a.join(' ')).join(' | ')}`)
    .join('\n');
}

describe('RemovingUselessSymbols (textbook example 8.1.1)', () => {
  // S → AB | C ; A → aA | a ; B → bB ; C → c ; D → bc
  const buildRules = () => [
    rule('S', 'A B', 'C'),
    rule('A', 'a A', 'a'),
    rule('B', 'b B'),
    rule('C', 'c'),
    rule('D', 'b c'),
  ];

  test('N_T excludes the non-terminating B', () => {
    const algo = new RemovingUselessSymbols(buildRules(), t);
    algo.buildNT();
    expect([...algo.NT].sort()).toEqual(['A', 'C', 'D', 'S']);
  });

  test('V_D keeps only symbols reachable from S', () => {
    const algo = new RemovingUselessSymbols(buildRules(), t);
    const final = algo.execute();
    // reachable from S after pruning non-terminating: S, C, c
    expect([...algo.VD].sort()).toEqual(['C', 'S', 'c']);
    expect(asText(final)).toBe('S -> C\nC -> c');
  });

  test('does not mutate the caller rules', () => {
    const original = buildRules();
    new RemovingUselessSymbols(original, t).execute();
    expect(original).toHaveLength(5);
    expect(original[0].rightSide).toEqual([['A', 'B'], ['C']]);
  });

  test('builds N_T and V_D iteration tables like Tabuľka 8.1 and 8.2', () => {
    const algo = new RemovingUselessSymbols(buildRules(), t);
    algo.execute();
    expect(algo.blocks[0].tables[0].rows).toEqual([   // Tabuľka 8.1 (N_T)
      { set: '{A, C, D}', prev: '∅', condition: true },
      { set: '{A, C, D, S}', prev: '{A, C, D}', condition: true },
      { set: '{A, C, D, S}', prev: '{A, C, D, S}', condition: false },
    ]);
    expect(algo.blocks[1].tables[0].rows).toEqual([   // Tabuľka 8.2 (V_D)
      { set: '{S, C}', prev: '{S}', condition: true },
      { set: '{S, C, c}', prev: '{S, C}', condition: true },
      { set: '{S, C, c}', prev: '{S, C, c}', condition: false },
    ]);
  });

  test('emits steps tagged with pseudocode block 8.1 and 8.2', () => {
    const algo = new RemovingUselessSymbols(buildRules(), t);
    algo.execute();
    const blocks = new Set(algo.steps.map((s) => s.block));
    expect(blocks.has(0)).toBe(true); // 8.1
    expect(blocks.has(1)).toBe(true); // 8.2
    expect(algo.steps.every((s) => typeof s.line === 'number')).toBe(true);
  });

  test('removes useless symbols one at a time with amber change markers', () => {
    const algo = new RemovingUselessSymbols(buildRules(), t);
    algo.execute();
    const removes = algo.steps.filter((s) => s.change && s.change.kind === 'remove');
    // B (non-terminating), then A and D (unreachable) each get their own remove step,
    // plus the "A B" alternative pruned from S → at least 4 removals total
    expect(removes.length).toBeGreaterThanOrEqual(4);
    const removedLhs = removes.map((s) => s.change.leftSide);
    expect(removedLhs).toContain('B'); // non-terminating rule
    expect(removedLhs).toContain('A'); // unreachable rule
    expect(removedLhs).toContain('D'); // unreachable rule
  });

  test('snapshots shrink toward the final grammar', () => {
    const algo = new RemovingUselessSymbols(buildRules(), t);
    algo.execute();
    const steps = algo.steps;
    expect(steps.every((s) => typeof s.snapshot === 'string' && s.snapshot.length > 0)).toBe(true);
    // last snapshot is the final (smallest) grammar; an earlier one is larger
    expect(steps[steps.length - 1].snapshot).toBe(algo.toString());
    const lastLines = steps[steps.length - 1].snapshot.split('\n').length;
    const firstLines = steps[0].snapshot.split('\n').length;
    expect(firstLines).toBeGreaterThan(lastLines);
  });
});
