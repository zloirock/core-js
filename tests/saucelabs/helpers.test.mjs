import assert from 'node:assert/strict';
import { test } from 'node:test';

// Exercise the runner against a fake WebDriver hub without starting Sauce Labs sessions.
test('does not retry failed pages when reporting the job result fails', async () => {
  const previous = {
    username: process.env.SAUCE_USERNAME,
    accessKey: process.env.SAUCE_ACCESS_KEY,
    fetch: globalThis.fetch,
    $: globalThis.$,
    argv: globalThis.argv,
    chalk: globalThis.chalk,
    echo: globalThis.echo,
  };
  const output = [];
  let sessions = 0;
  let annotationRequests = 0;
  try {
    process.env.SAUCE_USERNAME = 'test';
    process.env.SAUCE_ACCESS_KEY = 'test';
    globalThis.$ = {};
    globalThis.argv = { _: ['http://example.test/branch'] };
    globalThis.chalk = { cyan: String, green: String, red: String, yellow: String };
    globalThis.echo = message => output.push(message);
    globalThis.fetch = async (url, options) => {
      const path = new URL(url).pathname;
      let payload;
      if (path === '/wd/hub/session') {
        sessions++;
        payload = { sessionId: 'test-session' };
      } else if (options.method === 'DELETE') payload = {};
      else if (path.endsWith('/url')) payload = {};
      else {
        const { script } = JSON.parse(options.body);
        if (script.startsWith('sauce:job-result=')) {
          annotationRequests++;
          payload = { status: 13, value: { message: 'annotation unavailable' } };
        } else if (script.startsWith('var results = ')) {
          payload = { value: JSON.stringify({ done: true, failed: 1, total: 1, failures: [] }) };
        } else payload = { value: null };
      }
      return { ok: true, text: async () => JSON.stringify(payload) };
    };
    const { run } = await import('./helpers.mjs');
    await assert.rejects(run({
      name: 'unit', pages: ['unit-browser/global.html'], platforms: [{
        name: 'test browser', w3c: false, capabilities: { browserName: 'firefox', version: '7' },
      }],
      concurrency: 1, reporter: 'qunitResults',
      evaluate: ({ failed }) => ({ passed: failed === 0, summary: `${ failed } failed`, details: [] }),
    }), /Sauce Labs run failed/);
    assert.equal(sessions, 1);
    assert.equal(annotationRequests, 1);
    assert.match(output.join('\n'), /unit-browser\/global\.html: 1 failed/);
  } finally {
    for (const [name, value] of Object.entries({ SAUCE_USERNAME: previous.username, SAUCE_ACCESS_KEY: previous.accessKey })) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    for (const name of ['fetch', '$', 'argv', 'chalk', 'echo']) globalThis[name] = previous[name];
  }
});
