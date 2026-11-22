import { RemovingEpsilonRules } from "../utils/normalization/RemovingEpsilonRules.js";
import { RemovingUnitRules } from "../utils/normalization/RemovingUnitRules.js";
import { RemovingUselessSymbols } from "../utils/normalization/RemovingUselessSymbols.js";
import { RemovingLeftRecursion } from "../utils/normalization/RemovingLeftRecursion.js";
import { CNFConversion } from "../utils/normalization/CNFConversastion.js";
import { LL1Analysis } from "../utils/analysis/LL1Analysis.js";

// The single list of algorithms the app offers, in tab order. `key` doubles as
// the locale key of the tab label. Algorithms that expose their own `blocks`
// (8.1–8.6 pseudocode) need nothing more; legacy ones get a `legacyLinesKey`
// pointing at their single flat pseudocode array. `stepwiseOutput` algorithms
// emit a grammar snapshot per step, so the output panel builds up the result
// progressively while stepping instead of showing the final grammar at once.
export const ALGORITHMS = [
  { key: "removeEpsilon", ProcessingClass: RemovingEpsilonRules, legacyLinesKey: "stepsForRemoveEpsilonRules", stepwiseOutput: true },
  { key: "removeUnitRules", ProcessingClass: RemovingUnitRules, legacyLinesKey: "stepsForRemoveUnitRules", stepwiseOutput: true },
  { key: "removeUselessSymbols", ProcessingClass: RemovingUselessSymbols, stepwiseOutput: true },
  { key: "removeLeftRecursion", ProcessingClass: RemovingLeftRecursion, legacyLinesKey: "stepsForLeftRecursion", stepwiseOutput: true },
  { key: "convertToCNF", ProcessingClass: CNFConversion, legacyLinesKey: "stepsForGrammarTransformation", stepwiseOutput: true },
  { key: "llAnalysis", ProcessingClass: LL1Analysis, stepwiseOutput: true },
];

const BY_KEY = new Map(ALGORITHMS.map((algorithm) => [algorithm.key, algorithm]));

export const getAlgorithm = (key) => BY_KEY.get(key) ?? null;
