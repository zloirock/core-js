// WebKit can deliver unhandledrejection after timers and DOM tasks from the same exercise.
// Use the actual frame entry point and remove each frame the moment it hands over its verdict.
import { deepEqual } from 'node:assert/strict';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { promisify } from 'node:util';
import { webkit } from 'playwright';

// Start navigation as the parent is parsed. Waiting for its load event before inserting the
// frame gives WebKit a different schedule for delivering independent rejections.
const PARENT = `<!doctype html><body><script>
  var frame = document.createElement('iframe');
  window.e2eFrameDone = function (label, expected, mode, checks, reason) {
    window.result = { passed: checks ? checks[0].pass : undefined, reason: reason };
    frame.remove();
  };
  frame.src = 'frame.html';
  document.body.appendChild(frame);
</script>`;

// Hold the actual browser listener for one control, preserving event order while timers run.
function delayRejections() {
  const add = window.addEventListener;
  window.addEventListener = function (type, listener, options) {
    if (type === 'unhandledrejection') {
      add.call(this, type, event => setTimeout(() => listener.call(this, event), 200), options);
    } else add.call(this, type, listener, options);
  };
}

export async function checkWebKitRejections() {
  const scripts = new Map(await Promise.all(['trap', 'shared', 'frame'].map(async name => [
    `${ name }.js`, await readFile(new URL(`../e2e-libs/harness/${ name }.js`, import.meta.url), 'utf8'),
  ])));
  scripts.set('cell.js', "window.E2E_CELL = { label: 'cell', expected: ['one'], timeout: 5000 };");
  const tags = ['trap', 'shared', 'bundle', 'cell', 'frame'].map(name => `<script src="${ name }.js"></script>`);
  const html = `<!doctype html><body>${ tags.join('') }`;

  const server = createServer((request, response) => {
    const name = request.url.split('/').pop();
    if (scripts.has(name)) {
      response.writeHead(200, { 'Content-Type': 'text/javascript' }).end(scripts.get(name));
    } else if (name === 'index.html' || name === 'frame.html') {
      response.writeHead(200, { 'Content-Type': 'text/html' }).end(name === 'index.html' ? PARENT : html);
    } else response.writeHead(404).end();
  });
  const browser = await webkit.launch();
  try {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const origin = `http://127.0.0.1:${ server.address().port }`;
    const page = await browser.newPage();
    let attempt = 0;
    const rejection = 'Promise.reject(new Error("independent"))';
    for (const [setup, reason, runs, delayed, startup = ''] of [
      ['', null, 1],
      ['', null, 1, false, 'Array.isArray = function () { return false; };'],
      [`${ rejection }.catch(function () {});`, null, 1],
      [`${ rejection };`, 'run() threw - unhandled rejection - independent', 20],
      [`${ rejection };`, 'run() threw - unhandled rejection - independent', 1, true],
    ]) {
      if (delayed) scripts.set('trap.js', `(${ delayRejections })();\n${ scripts.get('trap.js') }`);
      scripts.set('bundle.js', `${ startup }
      window.E2E = { run: function () {
        ${ setup }
        return { checks: [{ label: 'one', pass: true }] };
      } };`);
      const expected = { passed: reason ? undefined : true, reason };
      for (let i = 0; i < runs; i++) {
        await page.goto(`${ origin }/${ ++attempt }/index.html`);
        const result = await page.waitForFunction(() => globalThis.result, null, { timeout: 10_000 });
        deepEqual(await result.jsonValue(), expected);
      }
    }
  } finally {
    try {
      await browser.close();
    } catch (error) {
      console.warn(`could not close WebKit: ${ error.message }`);
    }
    if (server.listening) {
      try {
        await promisify(server.close.bind(server))();
      } catch (error) {
        console.warn(`could not close HTTP server: ${ error.message }`);
      }
    }
  }
}
