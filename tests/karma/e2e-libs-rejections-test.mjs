// WebKit can deliver unhandledrejection after timers and DOM tasks from the same exercise.
// Use the actual frame entry point and remove each frame the moment it hands over its verdict.
import { deepEqual } from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { webkit } from 'playwright';

export async function checkWebKitRejections() {
  const [trap, shared, frame] = await Promise.all(['trap', 'shared', 'frame'].map(
    name => readFile(new URL(`../e2e-libs/harness/${ name }.js`, import.meta.url), 'utf8'),
  ));

  const browser = await webkit.launch();
  try {
    const page = await browser.newPage();
    await page.setContent('<!doctype html><body></body>');
    for (const variation of ['clean', 'handled', ...Array(20).fill('bad')]) {
      const exercise = `window.E2E_CELL = { label: 'cell', expected: ['one'], timeout: 5000 };
        window.E2E = { run: function () {
          ${ variation === 'clean' ? '' : 'var pending = Promise.reject(new Error("independent"));' }
          ${ variation === 'handled' ? 'pending.catch(function () {});' : '' }
          return { checks: [{ label: 'one', pass: true }] };
        } };`;
      const html = [trap, exercise, shared, frame].map(script => `<script>${ script }</script>`).join('');
      const actual = await page.evaluate(content => new Promise((resolve, reject) => {
        const child = document.createElement('iframe');
        const timeout = setTimeout(() => reject(new Error('frame did not report')), 10_000);
        globalThis.e2eFrameDone = (label, expected, mode, checks, reason) => {
          clearTimeout(timeout);
          child.remove();
          resolve({ passed: checks?.[0].pass, reason });
        };
        child.srcdoc = content;
        document.body.append(child);
      }), html);
      deepEqual(actual, variation === 'bad'
        ? { passed: undefined, reason: 'run() threw - unhandled rejection - independent' }
        : { passed: true, reason: null });
    }
  } finally {
    await browser.close();
  }
}
