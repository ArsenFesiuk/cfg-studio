/**
 * Згортання безпосередньої рекурсії правила у EBNF-конструкції.
 * (Назва історична — функція згортає і ліву, і праву рекурсію.)
 *
 * Працює на простому проміжному представленні (IR), не залежить від ANTLR:
 *   symbol = { text: string, isTerminal: boolean }
 *   alt    = symbol[]            (одна альтернатива — послідовність символів)
 *
 * Повертає праву частину правила (RHS) у вигляді рядка EBNF.
 *
 * Форми:
 *   ліва  A ::= A α | β   →   [X] β   (факторизація суфікса, пріоритет)
 *                          →   β {α}   (Kleene-фолбек);  β = ε  →  {α}
 *   права A ::= α A | β   →   {α} β ;  β = ε  →  {α}
 *   без рекурсії          →   косметика (термінали в лапки, нетермінали голі)
 */

// epsilon рендериться як голе слово (FormatSwitch згодом поверне ε)
function renderSymbol(sym) {
  if (sym.text === 'epsilon') return 'epsilon';
  return sym.isTerminal ? `"${sym.text}"` : sym.text;
}

function renderSeq(alt) {
  return alt.map(renderSymbol).join(' ');
}

function renderAlts(alts) {
  return alts.map(renderSeq).join(' | ');
}

function symbolsEqual(a, b) {
  return a.text === b.text && a.isTerminal === b.isTerminal;
}

// чи закінчується послідовність seq на суфікс suf
function endsWith(seq, suf) {
  if (seq.length < suf.length) return false;
  const offset = seq.length - suf.length;
  return suf.every((s, i) => symbolsEqual(seq[offset + i], s));
}

function isLeftRecursive(lhs, alt) {
  return alt.length > 1 && !alt[0].isTerminal && alt[0].text === lhs;
}

function isRightRecursive(lhs, alt) {
  const last = alt[alt.length - 1];
  return alt.length > 1 && !last.isTerminal && last.text === lhs;
}

function isEpsilon(alt) {
  return alt.length === 1 && alt[0].text === 'epsilon';
}

// β без чисто-ε альтернатив, відрендерене; '' якщо β = ε
function renderBase(base) {
  const nonEps = base.filter((b) => !isEpsilon(b));
  if (nonEps.length === 0) return '';
  const str = nonEps.map(renderSeq).join(' | ');
  return nonEps.length > 1 ? `(${str})` : str;
}

export function factorLeftRecursion(lhs, alts) {
  // --- ліва рекурсія: A ::= A α | β ---
  const leftRec = alts.filter((a) => isLeftRecursive(lhs, a));
  if (leftRec.length > 0) {
    const base = alts.filter((a) => !isLeftRecursive(lhs, a));

    // [ ] форма: рівно одна база, і вона є суфіксом кожної рекурсивної альтернативи
    if (base.length === 1 && !isEpsilon(base[0])) {
      const beta = base[0];
      const allEnd = leftRec.every((r) => r.length > beta.length && endsWith(r, beta));
      if (allEnd) {
        const prefixes = leftRec.map((r) => r.slice(0, r.length - beta.length));
        return `[${prefixes.map(renderSeq).join(' | ')}] ${renderSeq(beta)}`;
      }
    }

    // Kleene: β {α}   (β = ε → {α})
    const tails = leftRec.map((r) => r.slice(1));
    const kleene = `{${tails.map(renderSeq).join(' | ')}}`;
    const baseStr = renderBase(base);
    return baseStr ? `${baseStr} ${kleene}` : kleene;
  }

  // --- права рекурсія: A ::= α A | β ---
  const rightRec = alts.filter((a) => isRightRecursive(lhs, a));
  if (rightRec.length > 0) {
    const base = alts.filter((a) => !isRightRecursive(lhs, a));
    const heads = rightRec.map((r) => r.slice(0, -1));
    const kleene = `{${heads.map(renderSeq).join(' | ')}}`;
    const baseStr = renderBase(base);
    return baseStr ? `${kleene} ${baseStr}` : kleene;
  }

  // --- без рекурсії: косметика ---
  return renderAlts(alts);
}
