// Removing ε-rules — follows the textbook exactly:
//   Algoritmus 8.3  construct N_ε (non-terminals that can derive ε)
//   Algoritmus 8.4  rewrite the rules based on N_ε
// Pure logic + step emission; pseudocode lives in the locale files.

const setStr = (set) => [...set].join(', ');
const fmtSet = (set) => (set.size ? `{${[...set].join(', ')}}` : '∅');
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
      { titleKey: 'algoTitle_8_3', linesKey: 'pseudo_8_3', tables: [] },
      { titleKey: 'algoTitle_8_4', linesKey: 'pseudo_8_4' },
    ];
  }

  // `snapshot` is the grammar as it stands at this step (rules mutate in place);
  // `change` (optional) describes the one alternative/rule added or removed here,
  // so the output panel can highlight it: { kind: 'add'|'remove', leftSide, alt }.
  emit(block, line, message, table = null, iter = null, change = null) {
    this.steps.push({ block, line, message, table, iter, snapshot: formatRules(this.rules), change });
  }

  // an alternative is "nullable" if it is ε, or every symbol is in `known`
  altNullable(alt, known) {
    if (isEps(alt)) return true;
    return alt.every((s) => known.has(s));
  }

  // ── Algoritmus 8.3: N_ε ─────────────────────────────────────────────────────
  buildNEps() {
    const rows = [];
    let N = new Set();
    this.emit(0, 0, this.t('eps_8_3_init', { N: setStr(N) })); // N_ε ← ∅

    let prev;
    let iter = -1;
    do {
      iter++;
      prev = new Set(N);
      // No table/iter here: the row carries the post-union (line 4) value, so it
      // must only be revealed once line 4 runs — not yet, at the copy step.
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
            }), 0, iter);
            break;
          }
        }
      }
      rows.push({ set: fmtSet(N), prev: fmtSet(prev), condition: N.size !== prev.size });
      this.emit(0, 4, this.t('eps_8_3_while', { N: setStr(N), prev: setStr(prev) }), 0, iter);
    } while (N.size !== prev.size);

    this.blocks[0].tables = [
      { setLabel: 'N_{\\varepsilon}', prevLabel: '\\acute{N}_{\\varepsilon}', rows },
    ];
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
  // Pseudocode line → 0-based index map:
  //   1 P'←P → 0 | 2 for A→ε → 1 | 3 if A≠S → 2 | 4 remove A→ε → 3
  //   6 if A=S∧… → 5 | 7 remove S→ε → 6 | 8 add S' → 7 | 10 end for → 9
  //   11 for A→β → 10 | 12 if β nullable → 11 | 13 add combo → 12
  //   15 if A≠S → 14 | 16 remove A→ε → 15 | 18 end for → 17
  modifyRules() {
    const startSymbol = this.rules.length ? this.rules[0].leftSide : null;
    this.emit(1, 0, this.t('eps_8_4_init', { rules: formatRules(this.rules) })); // P' ← P

    // is the start symbol used on some right-hand side?
    const startUsed = this.rules.some((r) =>
      r.rightSide.some((alt) => alt.includes(startSymbol))
    );

    let newStart = null;

    // First loop (lines 2–10): handle existing A → ε, one body line per step
    for (const rule of [...this.rules]) {
      if (!rule.rightSide.some(isEps)) continue;
      this.emit(1, 1, this.t('eps_8_4_for', { A: rule.leftSide })); // line 2: for all A → ε

      if (rule.leftSide !== startSymbol) {
        this.emit(1, 2, this.t('eps_8_4_if_not_start', { A: rule.leftSide })); // line 3: if A ≠ S
        rule.rightSide = rule.rightSide.filter((alt) => !isEps(alt));
        this.emit(1, 3, this.t('eps_8_4_remove', { A: rule.leftSide, rules: formatRules(this.rules) }),
          null, null, { kind: 'remove', leftSide: rule.leftSide, alt: 'ε' }); // line 4
      } else if (startUsed) {
        // S is used → introduce a new start symbol S'
        this.emit(1, 5, this.t('eps_8_4_if_start_used', { S: startSymbol })); // line 6: if A = S ∧ S used
        rule.rightSide = rule.rightSide.filter((alt) => !isEps(alt)); // remove S → ε
        this.emit(1, 6, this.t('eps_8_4_remove_start_eps', { S: startSymbol, rules: formatRules(this.rules) }),
          null, null, { kind: 'remove', leftSide: startSymbol, alt: 'ε' }); // line 7
        newStart = `${startSymbol}_0`;
        this.rules.unshift({ leftSide: newStart, rightSide: [[startSymbol], ['ε']] });
        this.emit(1, 7, this.t('eps_8_4_add_start', { S: startSymbol, Snew: newStart, rules: formatRules(this.rules) }),
          null, null, { kind: 'add', leftSide: newStart }); // line 8
      }
      // else: S not used → keep S → ε (no change)
    }
    this.emit(1, 9, this.t('eps_8_4_endfor1')); // line 10: end for

    const effectiveStart = newStart ?? startSymbol;

    // Second loop (lines 11–18): add nullable combinations, one combination per step
    for (const rule of [...this.rules]) {
      if (rule.leftSide === newStart) continue; // don't expand the new start rule
      this.emit(1, 10, this.t('eps_8_4_loop2', { A: rule.leftSide })); // line 11: for all A → β

      // line 12: does some alternative contain nullable non-terminals?
      const nullableInRule = [
        ...new Set(rule.rightSide.flat().filter((s) => this.nullable.has(s))),
      ];
      if (nullableInRule.length > 0) {
        this.emit(1, 11, this.t('eps_8_4_check_nullable', {
          A: rule.leftSide,
          nullable: nullableInRule.join(', '),
        }));
      } else {
        this.emit(1, 11, this.t('eps_8_4_check_none', { A: rule.leftSide }));
      }

      // line 13: add each new combination as its own step
      const existing = new Set(rule.rightSide.map(key));
      for (const alt of [...rule.rightSide]) {
        if (isEps(alt)) continue;
        if (!alt.some((s) => this.nullable.has(s))) continue;
        for (const combo of this.generateCombinations(alt)) {
          const k = key(combo);
          if (existing.has(k)) continue;
          existing.add(k);
          rule.rightSide.push(combo);
          this.emit(1, 12, this.t('eps_8_4_add_combo', {
            A: rule.leftSide,
            combo: combo.join(' '),
            rules: formatRules(this.rules),
          }), null, null, { kind: 'add', leftSide: rule.leftSide, alt: combo.join(' ') });
        }
      }

      // lines 15–16: remove ε generated for non-start symbols
      if (rule.rightSide.some(isEps)) {
        if (rule.leftSide !== effectiveStart) {
          this.emit(1, 14, this.t('eps_8_4_check_not_start', { A: rule.leftSide })); // line 15: A ≠ S
          rule.rightSide = rule.rightSide.filter((alt) => !isEps(alt));
          this.emit(1, 15, this.t('eps_8_4_remove_generated', { A: rule.leftSide, rules: formatRules(this.rules) }),
            null, null, { kind: 'remove', leftSide: rule.leftSide, alt: 'ε' }); // line 16
        } else {
          this.emit(1, 14, this.t('eps_8_4_keep_start_eps', { A: rule.leftSide })); // line 15: A = S, keep ε
        }
      }
    }
    this.emit(1, 17, this.t('eps_8_4_done', { rules: formatRules(this.rules) })); // line 18: end for + result
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
