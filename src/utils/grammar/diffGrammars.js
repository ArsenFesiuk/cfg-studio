// Compares two grammars given as text ("A → x y | z", one rule per line) and
// reports, for each side, which rules and alternatives are new or gone:
//   before: rules/alternatives that are no longer present  → status 'removed'
//   after:  rules/alternatives that did not exist before   → status 'added'
// Everything else is 'same'. Order of lines and alternatives is kept as given.

const normalise = (text) => text.trim().split(/\s+/).join(' ');

function parse(text) {
  return text
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => {
      const arrow = line.indexOf('→');
      if (arrow === -1) return { lhs: null, alts: [normalise(line)] };
      return {
        lhs: line.slice(0, arrow).trim(),
        alts: line
          .slice(arrow + 1)
          .split('|')
          .map(normalise),
      };
    });
}

function alternativesByLhs(rows) {
  const map = new Map();
  for (const { lhs, alts } of rows) {
    const known = map.get(lhs) ?? new Set();
    alts.forEach((alt) => known.add(alt));
    map.set(lhs, known);
  }
  return map;
}

function annotate(rows, otherByLhs, ownStatus) {
  return rows.map(({ lhs, alts }) => {
    const other = otherByLhs.get(lhs);
    if (!other) {
      return { lhs, status: ownStatus, alts: alts.map((text) => ({ text, status: ownStatus })) };
    }
    return {
      lhs,
      status: 'same',
      alts: alts.map((text) => ({ text, status: other.has(text) ? 'same' : ownStatus })),
    };
  });
}

export function diffGrammars(beforeText, afterText) {
  const before = parse(beforeText ?? '');
  const after = parse(afterText ?? '');
  return {
    before: annotate(before, alternativesByLhs(after), 'removed'),
    after: annotate(after, alternativesByLhs(before), 'added'),
  };
}
