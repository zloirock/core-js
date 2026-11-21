// WebKit can deliver unhandledrejection after timers and DOM tasks from the same exercise.
// Use the actual frame entry point and remove each frame the moment it hands over its verdict.
import { deepEqual } from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { webkit } from 'playwright';

// Executed by Playwright in the parent page.
function runFrame(html) {
  return new Promise((resolve, reject) => {
    const frame = document.createElement('iframe');
    const timeout = setTimeout(() => reject(new Error('frame did not report')), 10_000);
    globalThis.e2eFrameDone = (label, expected, mode, checks, reason) => {
      clearTimeout(timeout);
      frame.remove();
      resolve({ passed: checks?.[0].pass, reason });
    };
    frame.srcdoc = html;
    document.body.append(frame);
  });
}

export async function checkWebKitRejections() {
  const [trap, shared, frame] = await Promise.all(['trap', 'shared', 'frame'].map(
    name => readFile(new URL(`../e2e-libs/harness/${ name }.js`, import.meta.url), 'utf8'),
  ));

  const browser = await webkit.launch();
  try {
    const page = await browser.newPage();
    await page.setContent('<!doctype html><body></body>');
    const rejection = 'Promise.reject(new Error("independent"))';
    for (const [setup, reason, runs] of [
      ['', null, 1],
      [`${ rejection }.catch(function () {});`, null, 1],
      [`${ rejection };`, 'run() threw - unhandled rejection - independent', 20],
    ]) {
      const exercise = `window.E2E_CELL = { label: 'cell', expected: ['one'], timeout: 5000 };
        window.E2E = { run: function () {
          ${ setup }
          return { checks: [{ label: 'one', pass: true }] };
        } };`;
      const html = [trap, exercise, shared, frame].map(script => `<script>${ script }</script>`).join('');
      const expected = { passed: reason ? undefined : true, reason };
      for (let i = 0; i < runs; i++) deepEqual(await page.evaluate(runFrame, html), expected);
    }
  } finally {
    await browser.close();
  }
}
