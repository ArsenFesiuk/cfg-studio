// FIRST / FOLLOW / PREDICT construction + LL(1) parse table — follows the
// KPI FEI TUKE course exactly (https://kurzy.kpi.fei.tuke.sk/fj/labs/10.html):
//   Algorithm 1  construct FST_A for all A ∈ N
//   Algorithm 2  the function FIRST(α)
//   Algorithm 3  construct FOLLOW(A) for all A ∈ N
//   PREDICT(A → α) and the resulting LL(1) parse table
// Analysis only — the grammar itself is never rewritten.

const END = '$';

const setStr = (set) => [...set].join(', ');
const fmtSet = (set) => (set.size ? `{${[...set].join(', ')}}` : '∅');
const isEps = (alt) => alt.length === 1 && alt[0] === 'ε';

export class LL1Analysis {
  constructor(rules, t) {
    this.t = t;
    this.rules = rules; // never mutated — this class only analyses the grammar
    this.nonTerminals = [...new Set(rules.map((r) => r.leftSide))];
    this.startSymbol = rules.length ? rules[0].leftSide : null;
    this.terminals = [
      ...new Set(
        rules
          .flatMap((r) => r.rightSide.flat())
          .filter((s) => s !== 'ε' && !this.nonTerminals.includes(s))
      ),
    ];
    this.steps = [];
    this.blocks = [
      { titleKey: 'algoTitle_nullable', linesKey: 'pseudo_nullable', tables: [] },
      { titleKey: 'algoTitle_fst', linesKey: 'pseudo_fst', tables: [] },
      { titleKey: 'algoTitle_first_fn', linesKey: 'pseudo_first_fn' },
      { titleKey: 'algoTitle_follow', linesKey: 'pseudo_follow', tables: [] },
      { titleKey: 'algoTitle_predict', linesKey: 'pseudo_predict' },
      { titleKey: 'algoTitle_parsetable', linesKey: 'pseudo_parsetable' },
    ];
  }

  emit(block, line, message, table = null, iter = null) {
    this.steps.push({ block, line, message, table, iter, snapshot: this.currentSummary() });
  }

  currentSummary() {
    const lines = [];
    if (this.nullable) lines.push(`N_ε = ${fmtSet(this.nullable)}`);
    if (this.FST) {
      lines.push('', 'FIRST:');
      for (const A of this.nonTerminals) lines.push(`FIRST(${A}) = ${fmtSet(this.FST.get(A))}`);
    }
    if (this.FLW) {
      lines.push('', 'FOLLOW:');
      for (const A of this.nonTerminals) lines.push(`FOLLOW(${A}) = ${fmtSet(this.FLW.get(A))}`);
    }
    if (this.predictList) {
      lines.push('', 'PREDICT:');
      for (const p of this.predictList) lines.push(`(${p.ruleNumber}) PREDICT(${p.rule}) = ${fmtSet(p.set)}`);
    }
    if (this.isLL1 !== undefined) {
      lines.push('', this.isLL1 ? 'Grammar IS LL(1).' : 'Grammar is NOT LL(1) — parse table has conflicts.');
    }
    return lines.join('\n');
  }

  isTerminal(sym) {
    return sym !== 'ε' && !this.nonTerminals.includes(sym);
  }

  // ── prerequisite: nullable set N_ε (same construction as the previous exercise) ──
  buildNullable() {
    const rows = [];
    let N = new Set();
    this.emit(0, 0, this.t('nullable_init', { N: setStr(N) }));

    let prev;
    let iter = -1;
    do {
      iter++;
      prev = new Set(N);
      this.emit(0, 2, this.t('nullable_copy', { N: setStr(N), prev: setStr(prev) }));

      for (const rule of this.rules) {
        if (N.has(rule.leftSide)) continue;
        for (const alt of rule.rightSide) {
          if (isEps(alt) || alt.every((s) => prev.has(s))) {
            N.add(rule.leftSide);
            this.emit(0, 3, this.t('nullable_add', { A: rule.leftSide, alt: alt.join(' '), N: setStr(N) }), 0, iter);
            break;
          }
        }
      }
      rows.push({ set: fmtSet(N), prev: fmtSet(prev), condition: N.size !== prev.size });
      this.emit(0, 4, this.t('nullable_while', { N: setStr(N), prev: setStr(prev) }), 0, iter);
    } while (N.size !== prev.size);

    this.blocks[0].tables = [{ setLabel: 'N_{\\varepsilon}', prevLabel: '\\acute{N}_{\\varepsilon}', rows }];
    this.nullable = N;
  }

  // ── Algorithm 1: FST_A for all A ∈ N ────────────────────────────────────────
  buildFST() {
    const FST = new Map();
    for (const a of this.terminals) FST.set(a, new Set([a]));
    for (const A of this.nonTerminals) FST.set(A, new Set());
    for (const A of this.nonTerminals) if (this.nullable.has(A)) FST.get(A).add('ε');

    this.emit(1, 8, this.t('fst_init', {
      sets: this.nonTerminals.map((A) => `FST_{${A}} = ${fmtSet(FST.get(A))}`).join(',  '),
    }));

    const rows = [];
    let changed = true;
    let iter = -1;
    while (changed) {
      iter++;
      changed = false;
      for (const rule of this.rules) {
        const A = rule.leftSide;
        for (const alt of rule.rightSide) {
          if (isEps(alt)) continue;
          for (const sym of alt) {
            const before = FST.get(A).size;
            for (const x of FST.get(sym) ?? []) if (x !== 'ε') FST.get(A).add(x);
            if (FST.get(A).size !== before) {
              changed = true;
              this.emit(1, 13, this.t('fst_add', {
                rule: `${A} → ${alt.join(' ')}`, sym, A, FST: setStr(FST.get(A)),
              }));
            }
            if (!this.nullable.has(sym)) break; // terminals are never in Nε, so this also stops there
          }
        }
      }
      rows.push({ values: Object.fromEntries(this.nonTerminals.map((A) => [A, fmtSet(FST.get(A))])) });
      this.emit(1, 18, this.t('fst_iterationDone', { iter: iter + 1 }), 0, iter);
    }
    this.blocks[1].tables = [{ kind: 'multi', columns: this.nonTerminals, rows }];
    this.FST = FST;
  }

  // ── Algorithm 2: FIRST(α), used internally for FOLLOW and PREDICT ───────────
  first(alpha) {
    if (isEps(alpha)) return new Set(['ε']);
    const result = new Set();
    for (const sym of alpha) {
      if (this.isTerminal(sym)) {
        result.add(sym);
        return result;
      }
      for (const x of this.FST.get(sym)) if (x !== 'ε') result.add(x);
      if (!this.nullable.has(sym)) return result;
    }
    result.add('ε'); // every symbol in alpha was nullable
    return result;
  }

  // ── Algorithm 3: FOLLOW(A) for all A ∈ N ────────────────────────────────────
  buildFollow() {
    const FLW = new Map();
    for (const A of this.nonTerminals) FLW.set(A, new Set());
    FLW.get(this.startSymbol).add(END);
    this.emit(3, 3, this.t('follow_init', { S: this.startSymbol }));

    const rows = [];
    let changed = true;
    let iter = -1;
    while (changed) {
      iter++;
      changed = false;
      for (const A of this.nonTerminals) {
        for (const rule of this.rules) {
          const B = rule.leftSide;
          for (const alt of rule.rightSide) {
            if (isEps(alt)) continue;
            for (let i = 0; i < alt.length; i++) {
              if (alt[i] !== A) continue;
              const beta = alt.slice(i + 1);
              const firstBeta = beta.length ? this.first(beta) : new Set(['ε']);
              const before = FLW.get(A).size;
              for (const x of firstBeta) if (x !== 'ε') FLW.get(A).add(x);
              if (firstBeta.has('ε')) for (const x of FLW.get(B)) FLW.get(A).add(x);
              if (FLW.get(A).size !== before) {
                changed = true;
                this.emit(3, 8, this.t('follow_add', {
                  rule: `${B} → ${alt.join(' ')}`, A, FLW: setStr(FLW.get(A)),
                }));
              }
            }
          }
        }
      }
      rows.push({ values: Object.fromEntries(this.nonTerminals.map((A) => [A, fmtSet(FLW.get(A))])) });
      this.emit(3, 14, this.t('follow_iterationDone', { iter: iter + 1 }), 0, iter);
    }
    this.blocks[3].tables = [{ kind: 'multi', columns: this.nonTerminals, rows }];
    this.FLW = FLW;
  }

  // ── PREDICT(A → α) for every rule ───────────────────────────────────────────
  buildPredict() {
    this.predictList = [];
    this.emit(4, 0, this.t('predict_start'));
    let ruleNumber = 0;
    for (const rule of this.rules) {
      for (const alt of rule.rightSide) {
        ruleNumber++;
        const f = this.first(alt);
        const nullableAlt = f.has('ε');
        const set = new Set([...f].filter((x) => x !== 'ε'));
        if (nullableAlt) for (const x of this.FLW.get(rule.leftSide)) set.add(x);
        const label = `${rule.leftSide} → ${alt.join(' ')}`;
        this.predictList.push({ ruleNumber, leftSide: rule.leftSide, rule: label, set });
        this.emit(4, nullableAlt ? 1 : 0, this.t('predict_rule', { n: ruleNumber, rule: label, set: setStr(set) }));
      }
    }
  }

  // ── parse table RT + LL(1) conflict check ───────────────────────────────────
  buildParseTable() {
    this.emit(5, 0, this.t('parsetable_start'));
    const columns = [...this.terminals, END];
    const grid = new Map(); // "A|t" -> [ruleNumber, ...]
    for (const { ruleNumber, leftSide, set } of this.predictList) {
      for (const t of set) {
        const cellKey = `${leftSide}|${t}`;
        const cell = grid.get(cellKey) ?? [];
        cell.push(ruleNumber);
        grid.set(cellKey, cell);
      }
    }
    const conflicts = [];
    for (const [cellKey, nums] of grid) {
      if (nums.length > 1) conflicts.push(`RT[${cellKey.replace('|', ', ')}]`);
    }
    this.parseTableColumns = columns;
    this.parseTableRows = this.nonTerminals.map((A) => ({
      label: A,
      cells: columns.map((t) => {
        const nums = grid.get(`${A}|${t}`) ?? [];
        return { numbers: nums, conflict: nums.length > 1 };
      }),
    }));
    this.isLL1 = conflicts.length === 0;
    this.conflicts = conflicts;
    this.blocks[5].tables = [{ kind: 'grid', columns, rows: this.parseTableRows }];
    this.emit(
      5,
      1,
      this.isLL1 ? this.t('parsetable_ll1_yes') : this.t('parsetable_ll1_no', { conflicts: conflicts.join(', ') }),
      0,
      0
    );
  }


  execute() {
    this.buildNullable();
    this.buildFST();
    this.buildFollow();
    this.buildPredict();
    this.buildParseTable();
    this.summary = this.currentSummary();
    return this.rules;
  }

  toString() {
    return this.summary ?? '';
  }
}
