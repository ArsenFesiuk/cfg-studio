// Removing ε-rules — follows the textbook exactly:
//   Algoritmus 8.3  construct N_ε (non-terminals that can derive ε)
//   Algoritmus 8.4  rewrite the rules based on N_ε
// Pure logic + step emission; pseudocode lives in the locale files.

const setStr = (set) => [...set].join(', ');
const isEps = (alt) => alt.length === 1 && alt[0] === 'ε';
const key = (alt) => JSON.stringify(alt);

function formatRules(rules) {
  return rules
    .map((r) => `${r.leftSide} → ${r.rightSide.map((a) => a.join(' ')).join(' | ')}`)
    .join('\n');
}

export class RemovingEpsilonRules {
  constructor(rules, t) {
    this.t = t;
    this.rules = rules.map((r) => ({
      leftSide: r.leftSide,
      rightSide: r.rightSide.map((alt) => [...alt]),
    }));
    this.steps = [];
    this.blocks = [
      { titleKey: 'algoTitle_8_3', linesKey: 'pseudo_8_3' },
      { titleKey: 'algoTitle_8_4', linesKey: 'pseudo_8_4' },
    ];
  }

  emit(block, line, message) {
    this.steps.push({ block, line, message });
  }

  // an alternative is "nullable" if it is ε, or every symbol is in `known`
  altNullable(alt, known) {
    if (isEps(alt)) return true;
    return alt.every((s) => known.has(s));
  }

  // ── Algoritmus 8.3: N_ε ─────────────────────────────────────────────────────
  buildNEps() {
    let N = new Set();
    this.emit(0, 0, this.t('eps_8_3_init', { N: setStr(N) })); // N_ε ← ∅

    let prev;
    do {
      prev = new Set(N);
      this.emit(0, 2, this.t('eps_8_3_copy', { N: setStr(N), prev: setStr(prev) })); // Ń_ε ← N_ε

      for (const rule of this.rules) {
        if (N.has(rule.leftSide)) continue;
        for (const alt of rule.rightSide) {
          if (this.altNullable(alt, prev)) {
            N.add(rule.leftSide);
            this.emit(0, 3, this.t('eps_8_3_add', {
              A: rule.leftSide,
              alt: alt.join(' '),
              N: setStr(N),
            }));
            break;
          }
        }
      }
      this.emit(0, 4, this.t('eps_8_3_while', { N: setStr(N), prev: setStr(prev) }));
    } while (N.size !== prev.size);

    this.nullable = N;
    return N;
  }

  // all combinations of `beta` where each nullable occurrence is kept or dropped
  generateCombinations(beta) {
    const positions = [];
    beta.forEach((s, i) => {
      if (this.nullable.has(s)) positions.push(i);
    });
    const out = [];
    const total = 1 << positions.length;
    for (let mask = 0; mask < total; mask++) {
      const dropped = new Set();
      positions.forEach((pos, bit) => {
        if (mask & (1 << bit)) dropped.add(pos);
      });
      const combo = beta.filter((_, i) => !dropped.has(i));
      out.push(combo.length ? combo : ['ε']);
    }
    return out;
  }

  // ── Algoritmus 8.4: rewrite rules ───────────────────────────────────────────
  modifyRules() {
    const startSymbol = this.rules.length ? this.rules[0].leftSide : null;
    this.emit(1, 0, this.t('eps_8_4_init', { rules: formatRules(this.rules) })); // P' ← P

    // is the start symbol used on some right-hand side?
    const startUsed = this.rules.some((r) =>
      r.rightSide.some((alt) => alt.includes(startSymbol))
    );

    let newStart = null;

    // First loop (lines 2–10): handle existing A → ε
    for (const rule of [...this.rules]) {
      if (!rule.rightSide.some(isEps)) continue;
      this.emit(1, 1, this.t('eps_8_4_for', { A: rule.leftSide })); // for all A → ε

      if (rule.leftSide !== startSymbol) {
        rule.rightSide = rule.rightSide.filter((alt) => !isEps(alt));
        this.emit(1, 3, this.t('eps_8_4_remove', { A: rule.leftSide, rules: formatRules(this.rules) }));
      } else if (startUsed) {
        // S is used → introduce a new start symbol S'
        rule.rightSide = rule.rightSide.filter((alt) => !isEps(alt)); // remove S → ε
        newStart = `${startSymbol}_0`;
        this.rules.unshift({ leftSide: newStart, rightSide: [[startSymbol], ['ε']] });
        this.emit(1, 7, this.t('eps_8_4_start_used', { S: startSymbol, Snew: newStart, rules: formatRules(this.rules) }));
      }
      // else: S not used → keep S → ε
    }

    const effectiveStart = newStart ?? startSymbol;

    // Second loop (lines 11–18): add nullable combinations
    for (const rule of [...this.rules]) {
      if (rule.leftSide === newStart) continue; // don't expand the new start rule
      this.emit(1, 10, this.t('eps_8_4_loop2', { A: rule.leftSide }));

      const existing = new Set(rule.rightSide.map(key));
      const added = [];
      for (const alt of rule.rightSide) {
        if (isEps(alt)) continue;
        if (!alt.some((s) => this.nullable.has(s))) continue;
        for (const combo of this.generateCombinations(alt)) {
          const k = key(combo);
          if (!existing.has(k)) {
            existing.add(k);
            rule.rightSide.push(combo);
            added.push(combo);
          }
        }
      }
      if (added.length > 0) {
        this.emit(1, 12, this.t('eps_8_4_combine', {
          A: rule.leftSide,
          added: added.map((a) => a.join(' ')).join(', '),
          rules: formatRules(this.rules),
        }));
      }

      // lines 15–16: remove ε generated for non-start symbols
      if (rule.leftSide !== effectiveStart && rule.rightSide.some(isEps)) {
        rule.rightSide = rule.rightSide.filter((alt) => !isEps(alt));
        this.emit(1, 15, this.t('eps_8_4_remove_generated', { A: rule.leftSide, rules: formatRules(this.rules) }));
      }
    }
  }

  execute() {
    this.buildNEps();
    this.modifyRules();
    return this.rules;
  }

  toString() {
    return formatRules(this.rules);
  }
}
