import assert from 'node:assert/strict';
import { test } from 'node:test';

// Exercise the runner against a fake WebDriver hub without starting Sauce Labs sessions.
async function runFake({ failed = 0, marker = 404, timeout = false } = {}) {
  const previous = {
    username: process.env.SAUCE_USERNAME,
    accessKey: process.env.SAUCE_ACCESS_KEY,
    fetch: globalThis.fetch,
    $: globalThis.$,
    argv: globalThis.argv,
    chalk: globalThis.chalk,
    echo: globalThis.echo,
    now: Date.now,
  };
  const output = [];
  let sessions = 0;
  let annotationRequests = 0;
  let markerRequests = 0;
  try {
    process.env.SAUCE_USERNAME = 'test';
    process.env.SAUCE_ACCESS_KEY = 'test';
    globalThis.$ = {};
    globalThis.argv = { _: ['http://example.test/branch', 'a'.repeat(40)] };
    globalThis.chalk = { cyan: String, green: String, red: String, yellow: String };
    globalThis.echo = message => output.push(message);
    const start = Date.now();
    globalThis.fetch = async (url, options) => {
      const path = new URL(url).pathname;
      if (path.endsWith('/commit.txt')) {
        markerRequests++;
        return marker === 404 ? { ok: false, status: 404 } : { ok: true, text: async () => marker };
      }
      let payload;
      if (path === '/wd/hub/session') {
        sessions++;
        assert.doesNotMatch(JSON.parse(options.body).desiredCapabilities.build, /@a{40}/);
        payload = { sessionId: 'test-session' };
      } else if (options.method === 'DELETE') payload = {};
      else if (path.endsWith('/url')) payload = {};
      else {
        const { script } = JSON.parse(options.body);
        if (script.startsWith('sauce:job-result=')) {
          annotationRequests++;
          payload = { status: 13, value: { message: 'annotation unavailable' } };
        } else if (script.startsWith('var results = ')) {
          if (timeout) Date.now = () => start + 16 * 6e4;
          payload = { value: JSON.stringify(timeout
            ? { done: false, failed: 0, total: 0, failures: [], currentTest: { module: 'Promises', test: 'pending callback' } }
            : { done: true, failed, total: 1, failures: [] }) };
        } else payload = { value: null };
      }
      return { ok: true, text: async () => JSON.stringify(payload) };
    };
    const { run } = await import('./helpers.mjs');
    const suite = {
      name: 'unit', pages: ['unit-browser/global.html'], platforms: [{
        name: 'test browser', w3c: false, capabilities: { browserName: 'firefox', version: '7' },
      }],
      concurrency: 1, reporter: 'qunitResults',
      evaluate: ({ failed: count }) => ({ passed: count === 0, summary: `${ count } failed`, details: [] }),
    };
    if (failed || timeout) await assert.rejects(run(suite), /Sauce Labs run failed/);
    else await run(suite);
    return { output: output.join('\n'), sessions, annotationRequests, markerRequests };
  } finally {
    Date.now = previous.now;
    for (const [name, value] of Object.entries({ SAUCE_USERNAME: previous.username, SAUCE_ACCESS_KEY: previous.accessKey })) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    for (const name of ['fetch', '$', 'argv', 'chalk', 'echo']) globalThis[name] = previous[name];
  }
}

test('reports failed pages and survives a replaced deployment marker', async () => {
  const { output, sessions, annotationRequests, markerRequests } = await runFake({ failed: 1 });
  assert.equal(sessions, 1);
  assert.equal(annotationRequests, 1);
  assert.equal(markerRequests, 2);
  assert.match(output, /unit-browser\/global\.html: 1 failed/);
  assert.match(output, /commit\.txt shows HTTP 404.*testing the currently served pages/);
  assert.match(output, /commit\.txt shows HTTP 404.*after the run/);
});

test('passes served pages despite a missing deployment marker', async () => {
  const { output, sessions, markerRequests } = await runFake();
  assert.equal(sessions, 1);
  assert.equal(markerRequests, 2);
  assert.match(output, /all the browsers passed/);
  assert.match(output, /commit\.txt shows HTTP 404.*after the run/);
});

test('reports the active QUnit test when a page times out', async () => {
  const { output, sessions } = await runFake({ timeout: true, marker: 'a'.repeat(40) });
  assert.equal(sessions, 1);
  assert.match(output, /unit-browser\/global\.html: not finished in 15 minutes; current test: Promises > pending callback/);
});
