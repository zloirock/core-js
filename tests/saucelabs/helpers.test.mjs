import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

const sessionsFile = join(await mkdtemp(join(tmpdir(), 'saucelabs-')), 'sessions');

async function runFake({
  failed = 0, marker = 404, hangs = 0, sessionNull = false, dynamicQueue = false, navigationError = false, wrongPage = false,
  pageUrl, commits, pages = ['unit-browser/global.html'], unwritableSessions = false, noReporter = false,
} = {}) {
  const previous = {
    username: process.env.SAUCE_USERNAME,
    sessionsFile: process.env.SAUCE_SESSIONS_FILE,
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
  let quits = 0;
  let listedWhileOpen;
  const navigations = [];
  let sessionStart;
  const started = [];
  let releaseSlow;
  let nextStarted;
  const slow = new Promise(resolve => { releaseSlow = resolve; });
  const next = new Promise(resolve => { nextStarted = resolve; });
  let fastFinished = false;
  try {
    process.env.SAUCE_USERNAME = 'test';
    process.env.SAUCE_ACCESS_KEY = 'test';
    process.env.SAUCE_SESSIONS_FILE = sessionsFile;
    if (unwritableSessions) {
      await rm(sessionsFile, { force: true });
      await mkdir(sessionsFile);
    }
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
        sessionStart = navigations.length;
        const capabilities = JSON.parse(options.body).desiredCapabilities;
        assert.doesNotMatch(capabilities.build, /@a{40}/);
        assert.equal(capabilities.maxDuration, pages.length * 1080 + 600);
        const { name } = capabilities;
        if (dynamicQueue) started.push(name);
        if (name === 'next') nextStarted(true);
        payload = sessionNull ? null : { sessionId: dynamicQueue ? name : 'test-session' };
      } else if (options.method === 'DELETE') {
        quits++;
        if (dynamicQueue && path.includes('/fast')) fastFinished = true;
        payload = {};
      } else if (path.endsWith('/url')) {
        navigations.push(JSON.parse(options.body).url);
        if (!unwritableSessions) listedWhileOpen = await readFile(sessionsFile, 'utf8');
        payload = navigationError ? { status: 13, value: { message: 'navigation failed' } } : {};
      } else {
        const { script } = JSON.parse(options.body);
        if (script.startsWith('sauce:job-result=')) {
          annotationRequests++;
          payload = { status: 13, value: { message: 'annotation unavailable' } };
        } else if (noReporter && script.startsWith('var results = ')) {
          Date.now = () => start + 2 * 6e4;
          payload = { value: null };
        } else if (script.startsWith('var results = ')) {
          if (dynamicQueue && path.includes('/slow')) await slow;
          if (sessions <= hangs) {
            const now = start + sessions * 16 * 6e4;
            Date.now = () => now;
          }
          payload = { value: JSON.stringify({
            // a busy browser stays on its first page
            url: pageUrl || (wrongPage ? 'http://example.test/branch/unit-browser/other.html'
              : navigations[sessions <= hangs ? sessionStart : navigations.length - 1]),
            commits,
            results: sessions <= hangs
              ? { done: false, failed: 0, total: 0, failures: [], currentTest: { module: 'Promises', test: 'pending callback' } }
              : { done: true, failed, total: 1, failures: [] },
          }) };
        } else payload = { value: null };
      }
      return { ok: true, text: async () => JSON.stringify(payload) };
    };
    const { run } = await import('./helpers.mjs');
    const suite = {
      name: 'unit', pages, platforms: [{
        name: 'test browser', w3c: false, capabilities: { browserName: 'firefox', version: '7' },
      }],
      concurrency: 1, reporter: 'qunitResults',
      evaluate: ({ failed: count }) => ({ passed: count === 0, summary: `${ count } failed`, details: [] }),
    };
    if (dynamicQueue) {
      suite.platforms = ['slow', 'fast', 'next', 'last'].map(name => ({
        name, w3c: false, capabilities: { browserName: 'firefox', version: '7' },
      }));
      suite.concurrency = 2;
      const running = run(suite);
      // the runner writes the session list in between, so wait for the request, not a tick
      const nextStartedWhileSlow = await Promise.race([next, new Promise(resolve => setTimeout(resolve, 5e3, false))]);
      releaseSlow();
      await running;
      return { started, nextStartedWhileSlow, fastFinished };
    }
    if (failed || noReporter || hangs === 3 || sessionNull || navigationError || wrongPage) await assert.rejects(run(suite), /Sauce Labs run failed/);
    else await run(suite);
    return {
      output: output.join('\n'), navigations, sessions, quits, annotationRequests, markerRequests, listedWhileOpen,
      listedAfter: unwritableSessions ? undefined : await readFile(sessionsFile, 'utf8'),
    };
  } finally {
    if (unwritableSessions) await rm(sessionsFile, { recursive: true });
    Date.now = previous.now;
    for (const [name, value] of Object.entries({
      SAUCE_USERNAME: previous.username, SAUCE_ACCESS_KEY: previous.accessKey, SAUCE_SESSIONS_FILE: previous.sessionsFile,
    })) {
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

test('retries an invalid WebDriver response for a platform', async () => {
  const { output, sessions } = await runFake({ sessionNull: true });
  assert.equal(sessions, 3);
  assert.match(output, /invalid WebDriver response.*retrying \(2 of 3\)/);
  assert.match(output, /invalid WebDriver response.*retrying \(3 of 3\)/);
});

test('assigns the next waiting platform to the available worker', async () => {
  const { started, nextStartedWhileSlow, fastFinished } = await runFake({ dynamicQueue: true });
  assert.equal(fastFinished, true);
  assert.equal(nextStartedWhileSlow, true);
  assert.deepEqual(started, ['slow', 'fast', 'next', 'last']);
});

test('accepts HTTPS redirects to the same published page', async () => {
  const { output, sessions } = await runFake({ pageUrl: 'https://example.test/branch/unit-browser/global.html' });
  assert.equal(sessions, 1);
  assert.match(output, /all the browsers passed/);
});

test('rejects results from a different page', async () => {
  const { output, sessions } = await runFake({ wrongPage: true });
  assert.equal(sessions, 3);
  assert.match(output, /unexpected page.*other\.html/);
});

test('includes a session link when a page fails after session creation', async () => {
  const { output, sessions } = await runFake({ navigationError: true });
  assert.equal(sessions, 3);
  assert.match(output, /test browser: https:\/\/app\.saucelabs\.com\/tests\/test-session.*navigation failed/);
});

test('marks a session failed when navigation fails', async () => {
  const { sessions, annotationRequests } = await runFake({ navigationError: true });
  assert.equal(sessions, 3);
  assert.equal(annotationRequests, 3);
});

test('restarts a platform whose page does not finish and passes if it recovers', async () => {
  const { output, sessions } = await runFake({ hangs: 1 });
  assert.equal(sessions, 2);
  assert.match(output, /test browser: unit-browser\/global\.html: not finished in 3 minutes.*retrying \(2 of 3\)/);
  assert.match(output, /all the browsers passed/);
});

test('reports the active QUnit test when every attempt times out', async () => {
  const { output, sessions } = await runFake({ hangs: 3, marker: 'a'.repeat(40) });
  assert.equal(sessions, 3);
  assert.match(output, /retrying \(3 of 3\)/);
  assert.match(output, /\n {2}unit-browser\/global\.html: not finished in 3 minutes; current test: Promises > pending callback/);
});

test('lists open sessions for the cleanup of a cancelled run', async () => {
  const { listedWhileOpen, listedAfter } = await runFake();
  assert.equal(listedWhileOpen, 'test-session\n');
  assert.equal(listedAfter, '');
});

test('tests and closes the session when the session list cannot be written', async () => {
  const { output, sessions, quits } = await runFake({ unwritableSessions: true });
  assert.equal(sessions, 1);
  assert.equal(quits, 1);
  assert.match(output, /could not list the open sessions/);
  assert.match(output, /all the browsers passed/);
});

test('does not report bundle commits of a page whose reporter is missing', async () => {
  const { output } = await runFake({ noReporter: true });
  assert.match(output, /global\.html: no results reporter on the page/);
  assert.doesNotMatch(output, /bundles of/);
});

test('warns when the browser executed bundles of another commit', async () => {
  const commit = 'a'.repeat(40);
  const other = 'b'.repeat(40);
  const { output } = await runFake({ marker: commit, commits: [other, other] });
  assert.match(output, new RegExp(`unit-browser/global\\.html: bundles of ${ other } instead of ${ commit }`));
  assert.match(output, /all the browsers passed/);
  const { output: matching } = await runFake({ marker: commit, commits: [commit, commit] });
  assert.doesNotMatch(matching, /bundles of/);
});

test('restarts a hung platform without navigating the busy browser to the next page', async () => {
  const pages = ['unit-browser/global.html', 'unit-browser/pure.html'];
  const { output, sessions, navigations } = await runFake({ hangs: 1, pages });
  assert.equal(sessions, 2);
  assert.deepEqual(navigations.map(url => url.replace('http://example.test/branch/', '')), [pages[0], ...pages]);
  assert.match(output, /global\.html: not finished in 3 minutes.*retrying \(2 of 3\)/);
  assert.doesNotMatch(output, /unexpected page/);
  assert.match(output, /all the browsers passed/);
});
