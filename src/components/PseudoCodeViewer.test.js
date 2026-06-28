import React, { useState } from 'react';
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import { PseudoCodeViewer } from './PseudoCodeViewer';

// Minimal mocks so the component can render under jsdom without the real
// i18n / MathJax stack.
// Real react-i18next returns a STABLE `t` across renders. Mirror that here —
// a fresh `t` each render would make the effect that depends on `t` loop on its
// own and mask the actual bug we are testing (the onStepChange feedback loop).
jest.mock('react-i18next', () => {
  const t = (key, opts) => (opts && opts.returnObjects ? ['line 0', 'line 1'] : key);
  return { useTranslation: () => ({ t }) };
});
jest.mock('better-react-mathjax', () => ({
  MathJax: ({ children }) => children,
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

class FakeAlgo {
  constructor() {
    this.blocks = [{ titleKey: null, linesKey: 'pseudo' }];
    this.steps = [
      { block: 0, line: 0, message: 'a' },
      { block: 0, line: 1, message: 'b' },
    ];
  }
  execute() {}
}

const rules = [{ leftSide: 'A', rightSide: [['a']] }];

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = () => {};
});

test('does not loop when the parent passes a fresh onStepChange every render', () => {
  let calls = 0;

  // Mirrors GrammarInput: a brand-new inline onStepChange on every render,
  // and the callback sets parent state (which forces another render).
  function Wrapper() {
    const [, setInfo] = useState(null);
    return (
      <PseudoCodeViewer
        rules={rules}
        ProcessingClass={FakeAlgo}
        onStepChange={(info) => {
          calls += 1;
          setInfo(info);
        }}
      />
    );
  }

  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  // With the render-loop bug this throws "Maximum update depth exceeded".
  act(() => {
    root.render(<Wrapper />);
  });

  // A correct implementation notifies the parent only when the step actually
  // changes — a small, bounded number of times, not once per render.
  expect(calls).toBeLessThan(10);

  act(() => {
    root.unmount();
  });
  container.remove();
});
