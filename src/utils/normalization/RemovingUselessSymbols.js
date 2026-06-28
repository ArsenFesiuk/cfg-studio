// Removing useless symbols — follows the textbook exactly:
//   Algoritmus 8.1  construct N_T (non-terminals that derive terminal strings)
//   Algoritmus 8.2  construct V_D (reachable symbols)
// The class is pure logic + step emission. Each emitted step references which
// pseudocode block (8.1 / 8.2) and which line is active, so the viewer can
// highlight it. Visualisation can be changed by editing only the locale lines.

const setStr = (set) => [...set].join(', ');
const fmtSet = (set) => (set.size ? `{${[...set].join(', ')}}` : '∅');

function formatRules(rules) {
  return rules
    .map((r) => `${r.leftSide} → ${r.rightSide.map((a) => a.join(' ')).join(' | ')}`)
    .join('\n');
}

export class RemovingUselessSymbols {
  constructor(rules, t) {
    this.t = t;
    // deep copy so the caller's rules are never mutated
    this.rules = rules.map((r) => ({
      leftSide: r.leftSide,
      rightSide: r.rightSide.map((alt) => [...alt]),
    }));
    this.steps = [];
    this.blocks = [
      { titleKey: 'algoTitle_8_1', linesKey: 'pseudo_8_1', tables: [] },
      { titleKey: 'algoTitle_8_2', linesKey: 'pseudo_8_2', tables: [] },
    ];
  }

  // `snapshot` is the grammar as it stands at this step (rules mutate in place).
  // Removals are stepwise: each removed rule/alternative is its own step carrying
  // a `change` marker { kind: 'remove', leftSide, alt? } so the output panel can
  // highlight it amber, exactly like the ε-rule removals.
  emit(block, line, message, table = null, iter = null, change = null) {
    this.steps.push({ block, line, message, table, iter, snapshot: formatRules(this.rules), change });
  }

  nonTerminals() {
    return new Set(this.rules.map((r) => r.leftSide));
  }

  isTerminal(symbol) {
    return symbol !== 'ε' && !this.nonTerminals().has(symbol);
  }

  // every symbol of the alternative is a terminal, ε, or already in `known`
  altResolvedBy(alt, known) {
    for (const s of alt) {
      if (s === 'ε') continue;
      if (this.isTerminal(s)) continue;
      if (known.has(s)) continue;
      return false;
    }
    return true;
  }

  // every symbol of the alternative is ε or in the reachable set `known`
  altReachableBy(alt, known) {
    for (const s of alt) {
      if (s !== 'ε' && !known.has(s)) return false;
    }
    return true;
  }

  // ── Algoritmus 8.1: N_T ────────────────────────────────────────────────────
  buildNT() {
    const rows = [];
    let NT = new Set();
    // line 0:  N_T ← ∅
    this.emit(0, 0, this.t('useless_8_1_init', { NT: setStr(NT) }));

    let prev;
    let iter = -1;
    do {
      iter++;
      prev = new Set(NT);
      // line 2:  Ń_T ← N_T  (no table/iter: the row holds the post-line-3 value,
      // so it must only be revealed once line 3 runs — not yet, at the copy step)
      this.emit(0, 2, this.t('useless_8_1_copy', { NT: setStr(NT), prev: setStr(prev) }));

      // line 3:  N_T ← Ń_T ∪ {A | A → α ∈ P ∧ α ∈ (Ń_T ∪ T)*}
      for (const rule of this.rules) {
        if (NT.has(rule.leftSide)) continue;
        for (const alt of rule.rightSide) {
          if (this.altResolvedBy(alt, prev)) {
            NT.add(rule.leftSide);
            this.emit(0, 3, this.t('useless_8_1_add', {
              A: rule.leftSide,
              alt: alt.join(' '),
              NT: setStr(NT),
            }), 0, iter);
            break;
          }
        }
      }
      rows.push({ set: fmtSet(NT), prev: fmtSet(prev), condition: NT.size !== prev.size });
      // line 4:  while N_T ≠ Ń_T
      this.emit(0, 4, this.t('useless_8_1_while', { NT: setStr(NT), prev: setStr(prev) }), 0, iter);
    } while (NT.size !== prev.size);

    this.blocks[0].tables = [
      { setLabel: 'N_{T}', prevLabel: '\\acute{N}_{T}', rows },
    ];
    this.NT = NT;
    return NT;
  }

  // remove non-terminals (and their rules) that are not in N_T, one at a time so
  // the output shrinks step by step. Attached to the end of block 8.1 (line 4).
  removeNotTerminating() {
    const NT = this.NT;
    // Snapshot the non-terminal set up front: removing rules mid-pass would make a
    // deleted non-terminal (e.g. B) start looking like a terminal, wrongly keeping
    // alternatives that reference it. A symbol is fine if it is a terminal/ε (not an
    // original non-terminal) or it can terminate (is in N_T).
    const nts = this.nonTerminals();
    const altOk = (alt) => alt.every((s) => !nts.has(s) || NT.has(s));

    // (a) drop every rule whose left-hand side cannot terminate. Emit before
    // deleting so the doomed rule is still in the snapshot to be highlighted.
    for (const rule of [...this.rules]) {
      if (NT.has(rule.leftSide)) continue;
      this.emit(0, 4, this.t('useless_8_1_remove_rule', {
        A: rule.leftSide,
        NT: setStr(NT),
        rules: formatRules(this.rules),
      }), null, null, { kind: 'remove', leftSide: rule.leftSide });
      this.rules = this.rules.filter((r) => r !== rule);
    }

    // (b) drop alternatives that still reference a non-terminating symbol.
    for (const rule of [...this.rules]) {
      const good = rule.rightSide.filter(altOk);
      if (good.length === rule.rightSide.length) continue; // nothing to prune
      if (good.length === 0) {
        // every alternative is useless → the whole rule disappears
        this.emit(0, 4, this.t('useless_8_1_remove_rule', {
          A: rule.leftSide,
          NT: setStr(NT),
          rules: formatRules(this.rules),
        }), null, null, { kind: 'remove', leftSide: rule.leftSide });
        this.rules = this.rules.filter((r) => r !== rule);
        continue;
      }
      for (const alt of rule.rightSide.filter((a) => !altOk(a))) {
        rule.rightSide = rule.rightSide.filter((a) => a !== alt);
        this.emit(0, 4, this.t('useless_8_1_remove_alt', {
          A: rule.leftSide,
          alt: alt.join(' '),
          rules: formatRules(this.rules),
        }), null, null, { kind: 'remove', leftSide: rule.leftSide, alt: alt.join(' ') });
      }
    }
  }

  // ── Algoritmus 8.2: V_D ────────────────────────────────────────────────────
  buildVD() {
    if (this.rules.length === 0) {
      this.VD = new Set();
      return this.VD;
    }
    const startSymbol = this.rules[0].leftSide;
    const rows = [];
    let VD = new Set([startSymbol]);
    // line 0:  V_D ← {S}
    this.emit(1, 0, this.t('useless_8_2_init', { VD: setStr(VD) }));

    let prev;
    let iter = -1;
    do {
      iter++;
      prev = new Set(VD);
      // line 2:  V'_D ← V_D  (no table/iter: the row holds the post-line-3 value,
      // so it must only be revealed once line 3 runs — not yet, at the copy step)
      this.emit(1, 2, this.t('useless_8_2_copy', { VD: setStr(VD), prev: setStr(prev) }));

      // line 3:  V_D ← V'_D ∪ {β | A → αβγ ∈ P ∧ A ∈ V'_D}
      for (const rule of this.rules) {
        if (!prev.has(rule.leftSide)) continue;
        for (const alt of rule.rightSide) {
          for (const symbol of alt) {
            if (symbol !== 'ε' && !VD.has(symbol)) {
              VD.add(symbol);
              this.emit(1, 3, this.t('useless_8_2_add', {
                symbol,
                A: rule.leftSide,
                alt: alt.join(' '),
                VD: setStr(VD),
              }), 0, iter);
            }
          }
        }
      }
      rows.push({ set: fmtSet(VD), prev: fmtSet(prev), condition: VD.size !== prev.size });
      // line 4:  while V_D ≠ V'_D
      this.emit(1, 4, this.t('useless_8_2_while', { VD: setStr(VD), prev: setStr(prev) }), 0, iter);
    } while (VD.size !== prev.size);

    this.blocks[1].tables = [
      { setLabel: 'V_{D}', prevLabel: '\\acute{V}_{D}', rows },
    ];
    this.VD = VD;
    return VD;
  }

  // remove all symbols (rules) not in V_D, one at a time. Block 8.2 (line 4).
  removeUnreachable() {
    const VD = this.VD;
    const altOk = (alt) => alt.every((s) => s === 'ε' || VD.has(s));

    // (a) drop every unreachable rule, emitting before deletion.
    for (const rule of [...this.rules]) {
      if (VD.has(rule.leftSide)) continue;
      this.emit(1, 4, this.t('useless_8_2_remove_rule', {
        A: rule.leftSide,
        VD: setStr(VD),
        rules: formatRules(this.rules),
      }), null, null, { kind: 'remove', leftSide: rule.leftSide });
      this.rules = this.rules.filter((r) => r !== rule);
    }

    // (b) drop alternatives that reference an unreachable symbol.
    for (const rule of [...this.rules]) {
      const good = rule.rightSide.filter(altOk);
      if (good.length === rule.rightSide.length) continue;
      if (good.length === 0) {
        this.emit(1, 4, this.t('useless_8_2_remove_rule', {
          A: rule.leftSide,
          VD: setStr(VD),
          rules: formatRules(this.rules),
        }), null, null, { kind: 'remove', leftSide: rule.leftSide });
        this.rules = this.rules.filter((r) => r !== rule);
        continue;
      }
      for (const alt of rule.rightSide.filter((a) => !altOk(a))) {
        rule.rightSide = rule.rightSide.filter((a) => a !== alt);
        this.emit(1, 4, this.t('useless_8_2_remove_alt', {
          A: rule.leftSide,
          alt: alt.join(' '),
          rules: formatRules(this.rules),
        }), null, null, { kind: 'remove', leftSide: rule.leftSide, alt: alt.join(' ') });
      }
    }

    // Concluding step: whole-rule removals emit before deletion, so end on a clean
    // snapshot that shows the final grammar with no pending highlight.
    this.emit(1, 4, this.t('useless_8_2_done', { rules: formatRules(this.rules) }));
  }

  execute() {
    this.buildNT();
    this.removeNotTerminating();
    this.buildVD();
    this.removeUnreachable();
    return this.rules;
  }

  toString() {
    return formatRules(this.rules);
  }
}
