import { deepEqual, doesNotMatch, equal, match, rejects } from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

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
        doesNotMatch(capabilities.build, /@a{40}/, 'the build name carries no commit');
        equal(capabilities.maxDuration, pages.length * 1080 + 600, 'maxDuration outlives the page timeouts');
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
    if (failed || noReporter || hangs === 3 || sessionNull || navigationError || wrongPage) await rejects(run(suite), /Sauce Labs run failed/, 'the run fails');
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

{
  const { output, sessions, annotationRequests, markerRequests } = await runFake({ failed: 1 });
  equal(sessions, 1, 'reports failed pages and survives a replaced deployment marker #1');
  equal(annotationRequests, 1, 'reports failed pages and survives a replaced deployment marker #2');
  equal(markerRequests, 2, 'reports failed pages and survives a replaced deployment marker #3');
  match(output, /unit-browser\/global\.html: 1 failed/, 'reports failed pages and survives a replaced deployment marker #4');
  match(output, /commit\.txt shows HTTP 404.*testing the currently served pages/, 'reports failed pages and survives a replaced deployment marker #5');
  match(output, /commit\.txt shows HTTP 404.*after the run/, 'reports failed pages and survives a replaced deployment marker #6');
}

{
  const { output, sessions, markerRequests } = await runFake();
  equal(sessions, 1, 'passes served pages despite a missing deployment marker #1');
  equal(markerRequests, 2, 'passes served pages despite a missing deployment marker #2');
  match(output, /all the browsers passed/, 'passes served pages despite a missing deployment marker #3');
  match(output, /commit\.txt shows HTTP 404.*after the run/, 'passes served pages despite a missing deployment marker #4');
}

{
  const { output, sessions } = await runFake({ sessionNull: true });
  equal(sessions, 3, 'retries an invalid WebDriver response for a platform #1');
  match(output, /invalid WebDriver response.*retrying \(2 of 3\)/, 'retries an invalid WebDriver response for a platform #2');
  match(output, /invalid WebDriver response.*retrying \(3 of 3\)/, 'retries an invalid WebDriver response for a platform #3');
}

{
  const { started, nextStartedWhileSlow, fastFinished } = await runFake({ dynamicQueue: true });
  equal(fastFinished, true, 'assigns the next waiting platform to the available worker #1');
  equal(nextStartedWhileSlow, true, 'assigns the next waiting platform to the available worker #2');
  deepEqual(started, ['slow', 'fast', 'next', 'last'], 'assigns the next waiting platform to the available worker #3');
}

{
  const { output, sessions } = await runFake({ pageUrl: 'https://example.test/branch/unit-browser/global.html' });
  equal(sessions, 1, 'accepts HTTPS redirects to the same published page #1');
  match(output, /all the browsers passed/, 'accepts HTTPS redirects to the same published page #2');
}

{
  const { output, sessions } = await runFake({ wrongPage: true });
  equal(sessions, 3, 'rejects results from a different page #1');
  match(output, /unexpected page.*other\.html/, 'rejects results from a different page #2');
}

{
  const { output, sessions } = await runFake({ navigationError: true });
  equal(sessions, 3, 'includes a session link when a page fails after session creation #1');
  match(output, /test browser: https:\/\/app\.saucelabs\.com\/tests\/test-session.*navigation failed/, 'includes a session link when a page fails after session creation #2');
}

{
  const { sessions, annotationRequests } = await runFake({ navigationError: true });
  equal(sessions, 3, 'marks a session failed when navigation fails #1');
  equal(annotationRequests, 3, 'marks a session failed when navigation fails #2');
}

{
  const { output, sessions } = await runFake({ hangs: 1 });
  equal(sessions, 2, 'restarts a platform whose page does not finish and passes if it recovers #1');
  match(output, /test browser: unit-browser\/global\.html: not finished in 3 minutes.*retrying \(2 of 3\)/, 'restarts a platform whose page does not finish and passes if it recovers #2');
  match(output, /all the browsers passed/, 'restarts a platform whose page does not finish and passes if it recovers #3');
}

{
  const { output, sessions } = await runFake({ hangs: 3, marker: 'a'.repeat(40) });
  equal(sessions, 3, 'reports the active QUnit test when every attempt times out #1');
  match(output, /retrying \(3 of 3\)/, 'reports the active QUnit test when every attempt times out #2');
  match(output, /\n {2}unit-browser\/global\.html: not finished in 3 minutes; current test: Promises > pending callback/, 'reports the active QUnit test when every attempt times out #3');
}

{
  const { listedWhileOpen, listedAfter } = await runFake();
  equal(listedWhileOpen, 'test-session\n', 'lists open sessions for the cleanup of a cancelled run #1');
  equal(listedAfter, '', 'lists open sessions for the cleanup of a cancelled run #2');
}

{
  const { output, sessions, quits } = await runFake({ unwritableSessions: true });
  equal(sessions, 1, 'tests and closes the session when the session list cannot be written #1');
  equal(quits, 1, 'tests and closes the session when the session list cannot be written #2');
  match(output, /could not list the open sessions/, 'tests and closes the session when the session list cannot be written #3');
  match(output, /all the browsers passed/, 'tests and closes the session when the session list cannot be written #4');
}

{
  const { output } = await runFake({ noReporter: true });
  match(output, /global\.html: no results reporter on the page/, 'does not report bundle commits of a page whose reporter is missing #1');
  doesNotMatch(output, /bundles of/, 'does not report bundle commits of a page whose reporter is missing #2');
}

{
  const commit = 'a'.repeat(40);
  const other = 'b'.repeat(40);
  const { output } = await runFake({ marker: commit, commits: [other, other] });
  match(output, new RegExp(`unit-browser/global\\.html: bundles of ${ other } instead of ${ commit }`), 'warns when the browser executed bundles of another commit #1');
  match(output, /all the browsers passed/, 'warns when the browser executed bundles of another commit #2');
  const { output: matching } = await runFake({ marker: commit, commits: [commit, commit] });
  doesNotMatch(matching, /bundles of/, 'warns when the browser executed bundles of another commit #3');
}

{
  const pages = ['unit-browser/global.html', 'unit-browser/pure.html'];
  const { output, sessions, navigations } = await runFake({ hangs: 1, pages });
  equal(sessions, 2, 'restarts a hung platform without navigating the busy browser to the next page #1');
  deepEqual(navigations.map(url => url.replace('http://example.test/branch/', '')), [pages[0], ...pages], 'restarts a hung platform without navigating the busy browser to the next page #2');
  match(output, /global\.html: not finished in 3 minutes.*retrying \(2 of 3\)/, 'restarts a hung platform without navigating the busy browser to the next page #3');
  doesNotMatch(output, /unexpected page/, 'restarts a hung platform without navigating the busy browser to the next page #4');
  match(output, /all the browsers passed/, 'restarts a hung platform without navigating the busy browser to the next page #5');
}
