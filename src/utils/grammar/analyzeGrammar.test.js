import { analyzeGrammar, getPlainRules, parseGrammar } from './GrammarParser.js';

const t = (key, opts) => (opts ? `${key} ${JSON.stringify(opts)}` : key);

describe('analyzeGrammar', () => {
  test('BNF: rules and errors agree with getPlainRules / parseGrammar', () => {
    const text = '<S> ::= <A> b | ε\n<A> ::= a';
    const result = analyzeGrammar(text, t);
    expect(result.rules).toEqual(getPlainRules(text, t).rules);
    expect(result.errors).toEqual(parseGrammar(text, t).errors);
    expect(result.errors).toEqual([]);
    expect(result.plainErrors).toEqual([]);
  });

  test('BNF with a syntax error reports it once for both views', () => {
    const text = '<S> ::= <A b';
    const result = analyzeGrammar(text, t);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors).toEqual(parseGrammar(text, t).errors);
    expect(result.plainErrors).toEqual(getPlainRules(text, t).errors);
  });

  test('EBNF input still gets its own validation and expanded plain rules', () => {
    const text = 'S ::= "a" {"b"}';
    const result = analyzeGrammar(text, t);
    expect(result.errors).toEqual(parseGrammar(text, t).errors);
    expect(result.rules).toEqual(getPlainRules(text, t).rules);
    expect(result.rules.length).toBeGreaterThan(1);
  });

  test('empty input has no rules and no errors', () => {
    expect(analyzeGrammar('', t)).toEqual({ rules: [], plainErrors: [], errors: [] });
  });

  test('unrecognised text keeps the format hint from parseGrammar', () => {
    const text = 'S -> a';
    const result = analyzeGrammar(text, t);
    expect(result.errors).toEqual(parseGrammar(text, t).errors);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
