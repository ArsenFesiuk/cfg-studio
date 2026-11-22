import React from "react";
import { cv } from "../theme/theme.js";

const BACKGROUND = { added: cv.highlightAdd, removed: cv.highlightRemove };

const mark = (status) =>
  status === "same"
    ? undefined
    : { backgroundColor: BACKGROUND[status], borderRadius: 4, padding: "0 2px", fontWeight: 700 };

// One side of a before/after comparison (rows come from diffGrammars). A rule
// that is entirely new or gone is tinted as a whole line; otherwise only the
// alternatives that differ are marked.
export default function GrammarDiffView({ rows }) {
  return rows.map((row, i) => {
    if (row.lhs === null) return <div key={i}>{row.alts.map((a) => a.text).join(" ")}</div>;

    const wholeLine = row.status !== "same";
    return (
      <div
        key={i}
        data-status={row.status}
        style={wholeLine ? { backgroundColor: BACKGROUND[row.status], borderRadius: 4, padding: "0 2px" } : undefined}
      >
        {row.lhs} →{" "}
        {row.alts.map((alt, j) => (
          <React.Fragment key={j}>
            {j > 0 ? " | " : ""}
            <span data-status={alt.status} style={wholeLine ? undefined : mark(alt.status)}>
              {alt.text}
            </span>
          </React.Fragment>
        ))}
      </div>
    );
  });
}
