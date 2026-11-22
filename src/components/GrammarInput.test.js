import React from 'react';
import { act, Simulate } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import GrammarInput from './GrammarInput.jsx';
import { ThemeModeProvider } from '../theme/ThemeModeProvider.jsx';

// Stable `t` (like the real one): pseudocode lines come back as a small array.
jest.mock('react-i18next', () => {
  const t = (key, opts) => (opts && opts.returnObjects ? ['line 0', 'line 1'] : key);
  const i18n = { language: 'en', changeLanguage: () => {} };
  return { useTranslation: () => ({ t, i18n }) };
});
jest.mock('better-react-mathjax', () => ({
  MathJax: ({ children }) => children,
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = () => {};
});

beforeEach(() => {
  jest.useFakeTimers();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root.render(<GrammarInput />);
  });
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
  jest.useRealTimers();
});

const button = (label) =>
  [...container.querySelectorAll('button')].find((b) => b.textContent.trim() === label);

const textarea = () => container.querySelector('textarea');

const type = (text) => {
  const area = textarea();
  area.value = text;
  act(() => {
    Simulate.change(area, { target: area });
  });
};

const settle = () => {
  act(() => {
    jest.advanceTimersByTime(400);
  });
};

const click = (label) => {
  act(() => {
    button(label).click();
  });
};

const hasErrorStyle = () => textarea().getAttribute('aria-invalid') === 'true';

test('a valid grammar can be run and stepped through', () => {
  type('<S> ::= <A> | a\n<A> ::= b');
  settle();

  click('removeUnitRules');
  expect(button('result').disabled).toBe(false);
  click('result');

  expect(container.textContent).toMatch(/1 \/ \d+/);
  expect(container.textContent).toContain('S →');

  click('next');
  expect(container.textContent).toMatch(/2 \/ \d+/);
  click('back');
  expect(container.textContent).toMatch(/1 \/ \d+/);
});

test('Result stays disabled until parsing has caught up with typing', () => {
  type('<S> ::= a');
  click('removeUnitRules');
  expect(button('result').disabled).toBe(true);

  settle();
  expect(button('result').disabled).toBe(false);
});

test('a syntax error is reported and blocks Result', () => {
  type('<S> ::= <A b');
  settle();
  click('removeUnitRules');

  expect(hasErrorStyle()).toBe(true);
  expect(button('result').disabled).toBe(true);
});

test('editing the grammar discards the previous result', () => {
  type('<S> ::= a');
  settle();
  click('removeUnitRules');
  click('result');
  expect(container.textContent).toMatch(/1 \/ \d+/);

  type('<S> ::= b');
  expect(container.textContent).not.toMatch(/\d+ \/ \d+/);
  expect(button('next').disabled).toBe(true);
});

test('an over-limit ε grammar is refused with an error instead of running', () => {
  const k = 11;
  const names = Array.from({ length: k }, (_, i) => `<A${i}>`);
  const text = [
    `<S> ::= ${names.join(' ')}`,
    ...names.map((n) => `${n} ::= a | epsilon`),
  ].join('\n');

  type(text);
  settle();
  click('removeEpsilon');
  click('result');

  expect(hasErrorStyle()).toBe(true);
  expect(container.textContent).not.toMatch(/\d+ \/ \d+/);
});

test('Reset clears the grammar and the selected algorithm', () => {
  type('<S> ::= a');
  settle();
  click('removeUnitRules');
  click('result');

  click('reset');
  expect(textarea().value).toBe('');
  expect(button('removeUnitRules').disabled).toBe(true);
});

const byLabel = (label) => container.querySelector(`[aria-label="${label}"]`);

const press = (key) => {
  act(() => {
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  });
};

test('Help opens the guide in a dialog and can be closed', () => {
  // once an algorithm is running the guide leaves the right panel...
  type('<S> ::= a');
  settle();
  click('removeUnitRules');
  click('result');
  expect(document.body.textContent).not.toContain('guideShortcuts');

  // ...but stays reachable from the app bar
  act(() => {
    byLabel('help').click();
  });
  expect(document.querySelector('[role="dialog"]')).not.toBeNull();
  expect(document.querySelector('[role="dialog"]').textContent).toContain('guideShortcuts');

  act(() => {
    [...document.querySelectorAll('[role="dialog"] button')].find((b) => b.textContent === 'close').click();
  });
  act(() => {
    jest.advanceTimersByTime(500);
  });
  expect(document.querySelector('[role="dialog"]')).toBeNull();
});

test('arrow keys step through a running algorithm, but not while typing', () => {
  type('<S> ::= <A> | a\n<A> ::= b');
  settle();
  click('removeUnitRules');
  click('result');
  expect(container.textContent).toMatch(/1 \/ \d+/);

  press('ArrowRight');
  expect(container.textContent).toMatch(/2 \/ \d+/);
  press('ArrowLeft');
  expect(container.textContent).toMatch(/1 \/ \d+/);

  act(() => {
    textarea().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  });
  expect(container.textContent).toMatch(/1 \/ \d+/);
});

test('errors are listed under the grammar field, not only in a tooltip', () => {
  type('<S> ::= <A b');
  settle();

  const list = container.querySelector('#grammar-errors');
  expect(list).not.toBeNull();
  expect(list.children.length).toBeGreaterThan(0);
  expect(textarea().getAttribute('aria-describedby')).toBe('grammar-errors');

  type('<S> ::= a');
  settle();
  expect(container.querySelector('#grammar-errors')).toBeNull();
});

const lastStep = () => {
  for (let i = 0; i < 400; i++) {
    const match = container.textContent.match(/(\d+) \/ (\d+)/);
    if (match && match[1] === match[2]) return;
    press('ArrowRight');
  }
};

test('CFG → CNF walks through the sub-algorithms too, with a grammar at every step', () => {
  type('<S> ::= <A> <B>\n<A> ::= a <A> | epsilon\n<B> ::= b');
  settle();
  click('convertToCNF');
  click('result');

  const total = Number(container.textContent.match(/1 \/ (\d+)/)[1]);
  expect(total).toBeGreaterThan(30);

  lastStep();
  expect(container.textContent).toContain('S_0 →');
});

test('Before / After shows the input next to the current grammar and marks the changes', () => {
  type('<S> ::= a <S> | epsilon');
  settle();
  click('removeEpsilon');
  click('result');
  lastStep();

  expect(container.textContent).not.toContain('compareBefore');
  click('outputCompare');
  expect(container.textContent).toContain('compareBefore');
  expect(container.textContent).toContain('compareAfter');
  expect(container.textContent).toContain('legendAdded');
  expect(container.querySelector('[data-status="added"]')).not.toBeNull();
  expect(container.querySelector('[data-status="removed"]')).not.toBeNull();

  click('outputResult');
  expect(container.textContent).not.toContain('compareBefore');
});

test('LL(1) results are drawn as tables with a verdict', () => {
  type('<E> ::= <T> <E2>\n<E2> ::= + <T> <E2> | epsilon\n<T> ::= num');
  settle();
  click('llAnalysis');
  click('result');
  lastStep();

  expect(container.textContent).toContain('ll1Yes');
  expect(container.textContent).toContain('FIRST / FOLLOW');
  expect(container.textContent).not.toContain('outputCompare');
});

test('the step slider jumps straight to a chosen step', () => {
  type('<S> ::= <A> | a\n<A> ::= b');
  settle();
  click('removeUnitRules');
  click('result');

  const input = container.querySelector('input[type="range"]');
  expect(input).not.toBeNull();
  input.value = '5';
  act(() => {
    Simulate.change(input, { target: input });
  });
  expect(container.textContent).toMatch(/5 \/ \d+/);
});

describe('theme', () => {
  beforeEach(() => {
    window.localStorage.clear();
    act(() => {
      root.render(
        <ThemeModeProvider>
          <GrammarInput />
        </ThemeModeProvider>
      );
    });
  });

  test('the toggle switches between light and dark and remembers the choice', () => {
    expect(byLabel('switchToDark')).not.toBeNull();

    act(() => {
      byLabel('switchToDark').click();
    });
    expect(byLabel('switchToLight')).not.toBeNull();
    expect(window.localStorage.getItem('cfg-studio-theme')).toBe('dark');

    act(() => {
      byLabel('switchToLight').click();
    });
    expect(byLabel('switchToDark')).not.toBeNull();
    expect(window.localStorage.getItem('cfg-studio-theme')).toBe('light');
  });
});
