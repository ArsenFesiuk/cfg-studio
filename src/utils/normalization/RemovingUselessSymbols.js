// Removing useless symbols — follows the textbook exactly:
//   Algoritmus 8.1  construct N_T (non-terminals that derive terminal strings)
//   Algoritmus 8.2  construct V_D (reachable symbols)
// The class is pure logic + step emission. Each emitted step references which
// pseudocode block (8.1 / 8.2) and which line is active, so the viewer can
// highlight it. Visualisation can be changed by editing only the locale lines.

const setStr = (set) => [...set].join(', ');

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
      { titleKey: 'algoTitle_8_1', linesKey: 'pseudo_8_1' },
      { titleKey: 'algoTitle_8_2', linesKey: 'pseudo_8_2' },
    ];
  }

  emit(block, line, message) {
    this.steps.push({ block, line, message });
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
    let NT = new Set();
    // line 0:  N_T ← ∅
    this.emit(0, 0, this.t('useless_8_1_init', { NT: setStr(NT) }));

    let prev;
    do {
      prev = new Set(NT);
      // line 2:  Ń_T ← N_T
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
            }));
            break;
          }
        }
      }
      // line 4:  while N_T ≠ Ń_T
      this.emit(0, 4, this.t('useless_8_1_while', { NT: setStr(NT), prev: setStr(prev) }));
    } while (NT.size !== prev.size);

    this.NT = NT;
    return NT;
  }

  // remove non-terminals (and their rules) that are not in N_T
  removeNotTerminating() {
    const NT = this.NT;
    this.rules = this.rules
      .filter((rule) => NT.has(rule.leftSide))
      .map((rule) => ({
        leftSide: rule.leftSide,
        rightSide: rule.rightSide.filter((alt) =>
          alt.every((s) => this.isTerminal(s) || NT.has(s) || s === 'ε')
        ),
      }))
      .filter((rule) => rule.rightSide.length > 0);

    // attach the removal note to the end of block 8.1
    this.emit(0, 4, this.t('useless_8_1_remove', {
      NT: setStr(NT),
      rules: formatRules(this.rules),
    }));
  }

  // ── Algoritmus 8.2: V_D ────────────────────────────────────────────────────
  buildVD() {
    if (this.rules.length === 0) {
      this.VD = new Set();
      return this.VD;
    }
    const startSymbol = this.rules[0].leftSide;
    let VD = new Set([startSymbol]);
    // line 0:  V_D ← {S}
    this.emit(1, 0, this.t('useless_8_2_init', { VD: setStr(VD) }));

    let prev;
    do {
      prev = new Set(VD);
      // line 2:  V'_D ← V_D
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
              }));
            }
          }
        }
      }
      // line 4:  while V_D ≠ V'_D
      this.emit(1, 4, this.t('useless_8_2_while', { VD: setStr(VD), prev: setStr(prev) }));
    } while (VD.size !== prev.size);

    this.VD = VD;
    return VD;
  }

  // remove all symbols (rules) not in V_D
  removeUnreachable() {
    const VD = this.VD;
    this.rules = this.rules
      .filter((rule) => VD.has(rule.leftSide))
      .map((rule) => ({
        leftSide: rule.leftSide,
        rightSide: rule.rightSide.filter((alt) => alt.every((s) => s === 'ε' || VD.has(s))),
      }))
      .filter((rule) => rule.rightSide.length > 0);

    this.emit(1, 4, this.t('useless_8_2_remove', {
      VD: setStr(VD),
      rules: formatRules(this.rules),
    }));
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
