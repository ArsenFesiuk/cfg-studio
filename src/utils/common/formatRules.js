// Shared grammar → text formatter used by the step-emitting algorithms.
//
// Every step stores a snapshot of the whole grammar, so formatting used to cost
// O(grammar size) per step. Each rule's line is cached against its `rightSide`
// array (identity + length): the algorithms only ever grow an alternatives
// array with push() or replace it with a new array, never edit it in place.
const lineCache = new WeakMap();

function formatRule(rule) {
  const { leftSide, rightSide } = rule;
  const cached = lineCache.get(rightSide);
  if (cached && cached.length === rightSide.length && cached.leftSide === leftSide) {
    return cached.text;
  }
  const text = `${leftSide} → ${rightSide.map((a) => a.join(' ')).join(' | ')}`;
  lineCache.set(rightSide, { length: rightSide.length, leftSide, text });
  return text;
}

export function formatRules(rules) {
  return rules.map(formatRule).join('\n');
}

// Snapshot source for one algorithm run. Most steps (building N_A, N_ε, V_D…)
// do not touch the grammar, so consecutive snapshots are identical: return the
// very same string instead of storing a fresh copy per step. Memory then grows
// with the number of grammar *changes*, not with the number of steps.
export function createSnapshotter() {
  let lastLines = null;
  let lastText = '';
  return (rules) => {
    const lines = rules.map(formatRule);
    const unchanged =
      lastLines !== null &&
      lines.length === lastLines.length &&
      lines.every((line, i) => line === lastLines[i]);
    if (unchanged) return lastText;
    lastLines = lines;
    lastText = lines.join('\n');
    return lastText;
  };
}
