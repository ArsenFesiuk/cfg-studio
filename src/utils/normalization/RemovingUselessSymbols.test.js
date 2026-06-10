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

  test('emits steps tagged with pseudocode block 8.1 and 8.2', () => {
    const algo = new RemovingUselessSymbols(buildRules(), t);
    algo.execute();
    const blocks = new Set(algo.steps.map((s) => s.block));
    expect(blocks.has(0)).toBe(true); // 8.1
    expect(blocks.has(1)).toBe(true); // 8.2
    expect(algo.steps.every((s) => typeof s.line === 'number')).toBe(true);
  });
});
