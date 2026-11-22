import React from "react";
import { cv } from "../theme/theme.js";

const GREEN = cv.highlightAdd;
const AMBER = cv.highlightRemove;

// Renders a grammar string line by line. When `change` is set, the line of the
// affected rule is highlighted: an added alternative glows green, while a rule
// that just lost a production (e.g. A → ε) is tinted amber.
export default function GrammarView({ grammar, change }) {
  return grammar.split("\n").map((line, i) => {
    const arrowIdx = line.indexOf("→");
    const lhs = arrowIdx === -1 ? null : line.slice(0, arrowIdx).trim();
    const isChangedRule = change && lhs === change.leftSide;

    if (!isChangedRule) {
      return <div key={i}>{line || " "}</div>;
    }
    // whole-line highlight: removals (amber) or a brand-new rule with no single alt
    if (change.kind === "remove" || !change.alt) {
      const bg = change.kind === "remove" ? AMBER : GREEN;
      return (
        <div key={i} style={{ backgroundColor: bg, borderRadius: 4, padding: "0 2px" }}>
          {line}
        </div>
      );
    }
    // an added alternative: highlight just that token in green
    const head = line.slice(0, arrowIdx + 1);
    const alts = line.slice(arrowIdx + 1).split("|");
    return (
      <div key={i}>
        {head}
        {alts.map((a, j) => {
          const hit = a.trim() === change.alt;
          return (
            <span key={j}>
              {j > 0 ? "|" : ""}
              <span
                style={
                  hit
                    ? { backgroundColor: GREEN, borderRadius: 4, padding: "0 2px", fontWeight: 700 }
                    : undefined
                }
              >
                {a}
              </span>
            </span>
          );
        })}
      </div>
    );
  });
}
