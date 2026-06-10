// Removing unit (simple) rules — follows the textbook exactly:
//   Algoritmus 8.5  construct N_A (non-terminals derivable from A via unit rules)
//   Algoritmus 8.6  rewrite the rules using the sets N_A
// Pure logic + step emission; pseudocode lives in the locale files.

const setStr = (set) => [...set].join(', ');
const key = (alt) => JSON.stringify(alt);

function formatRules(rules) {
  return rules
    .map((r) => `${r.leftSide} → ${r.rightSide.map((a) => a.join(' ')).join(' | ')}`)
    .join('\n');
}

export class RemovingUnitRules {
  constructor(rules, t) {
    this.t = t;
    this.rules = rules.map((r) => ({
      leftSide: r.leftSide,
      rightSide: r.rightSide.map((alt) => [...alt]),
    }));
    this.NT = new Set(this.rules.map((r) => r.leftSide));
    this.steps = [];
    this.blocks = [
      { titleKey: 'algoTitle_8_5', linesKey: 'pseudo_8_5' },
      { titleKey: 'algoTitle_8_6', linesKey: 'pseudo_8_6' },
    ];
  }

  emit(block, line, message) {
    this.steps.push({ block, line, message });
  }

  isUnit(alt) {
    return alt.length === 1 && this.NT.has(alt[0]);
  }

  // productions of a non-terminal in the original grammar
  productionsOf(symbol) {
    const r = this.rules.find((x) => x.leftSide === symbol);
    return r ? r.rightSide : [];
  }

  // ── Algoritmus 8.5: N_A ─────────────────────────────────────────────────────
  buildNA(A) {
    let N = new Set([A]);
    this.emit(0, 0, this.t('unit_8_5_init', { A, NA: setStr(N) })); // N_A ← {A}

    let prev;
    do {
      prev = new Set(N);
      this.emit(0, 2, this.t('unit_8_5_copy', { NA: setStr(N), prev: setStr(prev) })); // Ń_A ← N_A

      for (const rule of this.rules) {
        if (!prev.has(rule.leftSide)) continue;
        for (const alt of rule.rightSide) {
          if (this.isUnit(alt) && !N.has(alt[0])) {
            N.add(alt[0]);
            this.emit(0, 3, this.t('unit_8_5_add', {
              C: alt[0],
              B: rule.leftSide,
              NA: setStr(N),
            }));
          }
        }
      }
      this.emit(0, 4, this.t('unit_8_5_while', { NA: setStr(N), prev: setStr(prev) }));
    } while (N.size !== prev.size);

    return N;
  }

  // ── Algoritmus 8.6: rewrite ─────────────────────────────────────────────────
  execute() {
    this.emit(1, 0, this.t('unit_8_6_init', { rules: formatRules(this.rules) })); // P' ← P

    // line 2: remove all unit rules from P'
    const result = new Map(); // leftSide -> array of alternatives
    const seen = new Map(); // leftSide -> Set of keys
    for (const rule of this.rules) {
      const nonUnit = rule.rightSide.filter((alt) => !this.isUnit(alt));
      result.set(rule.leftSide, nonUnit);
      seen.set(rule.leftSide, new Set(nonUnit.map(key)));
    }
    const drawRules = () =>
      formatRules(this.rules.map((r) => ({ leftSide: r.leftSide, rightSide: result.get(r.leftSide) })));
    this.emit(1, 1, this.t('unit_8_6_remove_units', { rules: drawRules() }));

    // line 3: for all N_A, A ∈ N
    for (const A of this.NT) {
      const NA = this.buildNA(A);
      this.emit(1, 2, this.t('unit_8_6_forA', { A, NA: setStr(NA) }));

      // line 4: for all B ∈ N_A
      for (const B of NA) {
        this.emit(1, 3, this.t('unit_8_6_forB', { A, B }));
        // line 5: for all B → α ∈ P
        for (const alt of this.productionsOf(B)) {
          // line 6: if B → α is not a unit rule
          if (this.isUnit(alt)) continue;
          // line 7: P' ← P' ∪ {A → α}
          const k = key(alt);
          if (!seen.get(A).has(k)) {
            seen.get(A).add(k);
            result.get(A).push(alt);
            this.emit(1, 6, this.t('unit_8_6_add', {
              A,
              B,
              alt: alt.join(' '),
              rules: drawRules(),
            }));
          }
        }
      }
    }

    // materialise final rules (drop empties)
    this.rules = this.rules
      .map((r) => ({ leftSide: r.leftSide, rightSide: result.get(r.leftSide) }))
      .filter((r) => r.rightSide.length > 0);

    return this.rules;
  }

  toString() {
    return formatRules(this.rules);
  }
}
