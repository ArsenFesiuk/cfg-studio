import { cssVariables, cv } from './theme.js';

describe('theme tokens', () => {
  test('light and dark define exactly the same tokens', () => {
    expect(Object.keys(cssVariables('dark')).sort()).toEqual(Object.keys(cssVariables('light')).sort());
  });

  test('every token is a CSS variable reference and has a published value', () => {
    const published = cssVariables('light');
    for (const [token, reference] of Object.entries(cv)) {
      const name = reference.slice('var('.length, -1);
      expect(published[name]).toBeDefined();
      expect(token).toBeTruthy();
    }
  });

  test('dark values differ from light for surfaces and text', () => {
    const light = cssVariables('light');
    const dark = cssVariables('dark');
    expect(dark['--cfg-surface']).not.toBe(light['--cfg-surface']);
    expect(dark['--cfg-text']).not.toBe(light['--cfg-text']);
    expect(dark['--cfg-bg']).not.toBe(light['--cfg-bg']);
  });

  test('camelCase token names become kebab-case variables', () => {
    expect(cv.surfaceAlt).toBe('var(--cfg-surface-alt)');
    expect(cv.highlightAdd).toBe('var(--cfg-highlight-add)');
  });

  test('an unknown mode falls back to the light palette', () => {
    expect(cssVariables('nope')).toEqual(cssVariables('light'));
  });
});
