import { deepEqual, doesNotMatch, equal, match, notEqual, ok, rejects } from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';

const sessionsFile = join(await mkdtemp(join(tmpdir(), 'saucelabs-')), 'sessions');

async function runFake({
  failed = 0, marker = 404, hangs = 0, sessionNull = false, dynamicQueue = false, navigationError = false, wrongPage = false,
  pageUrl, commits, pages = ['unit-browser/global.html'], unwritableSessions = false, noReporter = false,
  limits = { organization: 1, team: 1 }, limitStatus = 200, platforms,
  polling = { pollInterval: 0 },
  latePage = false,
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
  let open = 0;
  let peak = 0;
  const openPools = {};
  const poolPeaks = {};
  let listedWhileOpen;
  let exitCodeWhileRunning;
  const navigations = [];
  const annotations = [];
  const pollDelays = [];
  let navigated;
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
      if (path === '/rest/v1.2/users/test/concurrency') {
        equal(new URL(url).host, 'api.us-west-1.saucelabs.com', 'reads the limit from the REST API of the region');
        equal(options.headers.authorization, `Basic ${ btoa('test:test') }`, 'reads the limit with the hub credentials');
        exitCodeWhileRunning = process.exitCode;
        return { ok: limitStatus === 200, status: limitStatus, json: async () => limits ? { concurrency: {
          organization: { allowed: { vms: limits.organization, mac_vms: 15, ...limits.pools } }, team: { allowed: { vms: limits.team, mac_vms: 15, ...limits.pools } },
        } } : JSON.parse('<html>') };
      }
      let payload;
      if (path === '/wd/hub/session') {
        sessions++;
        peak = Math.max(peak, ++open);
        sessionStart = navigations.length;
        const capabilities = JSON.parse(options.body).desiredCapabilities;
        doesNotMatch(capabilities.build, /@a{40}/, 'the build name carries no commit');
        equal(capabilities.maxDuration, pages.length * 1080 + 600, 'maxDuration outlives the page timeouts');
        const { name } = capabilities;
        if (dynamicQueue) started.push(name);
        if (name === 'next') nextStarted(true);
        const pool = platforms?.find(platform => platform.name === name)?.pool;
        if (pool) poolPeaks[pool] = Math.max(poolPeaks[pool] ?? 0, openPools[pool] = (openPools[pool] ?? 0) + 1);
        payload = sessionNull ? null : { sessionId: dynamicQueue || platforms ? name : 'test-session' };
      } else if (options.method === 'DELETE') {
        quits++;
        open--;
        const pool = platforms?.find(platform => path.includes(`/${ platform.name }`))?.pool;
        if (pool) openPools[pool]--;
        if (dynamicQueue && path.includes('/fast')) fastFinished = true;
        payload = {};
      } else if (path.endsWith('/url')) {
        navigations.push(JSON.parse(options.body).url);
        navigated = performance.now();
        if (!unwritableSessions) listedWhileOpen = await readFile(sessionsFile, 'utf8');
        payload = navigationError ? { status: 13, value: { message: 'navigation failed' } } : {};
      } else {
        const { script } = JSON.parse(options.body);
        const firstPoll = navigated !== undefined && script.startsWith('var results = ');
        if (firstPoll) {
          pollDelays.push(performance.now() - navigated);
          navigated = undefined;
        }
        if (script.startsWith('sauce:job-result=')) {
          annotationRequests++;
          annotations.push(script);
          payload = { status: 13, value: { message: 'annotation unavailable' } };
        } else if (noReporter && script.startsWith('var results = ')) {
          const now = Date.now() + 2 * 6e4;
          Date.now = () => now;
          const window = { location: { href: navigations.at(-1) }, bundleCommits: commits };
          payload = { value: runInNewContext(`(function () { ${ script } })()`, { window }) };
        } else if (script.startsWith('var results = ')) {
          if (dynamicQueue && path.includes('/slow')) await slow;
          if (sessions <= hangs) {
            const now = start + sessions * 16 * 6e4;
            Date.now = () => now;
          }
          if (wrongPage) {
            const now = Date.now() + 2 * 6e4;
            Date.now = () => now;
          }
          payload = { value: JSON.stringify({
            // a busy browser stays on its first page, a slow one shows another page at the first poll
            url: pageUrl || (wrongPage || latePage && firstPoll ? 'http://example.test/branch/unit-browser/other.html'
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
      reporter: 'qunitResults',
      ...polling,
      evaluate: ({ failed: count }) => ({ passed: count === 0, summary: `${ count } failed`, details: [] }),
    };
    if (dynamicQueue) {
      suite.platforms = ['slow', 'fast', 'next', 'last'].map(name => ({
        name, w3c: false, capabilities: { browserName: 'firefox', version: '7' },
      }));
      const running = run(suite);
      // the runner writes the session list in between, so wait for the request, not a tick
      const nextStartedWhileSlow = await Promise.race([next, new Promise(resolve => setTimeout(resolve, 5e3, false))]);
      releaseSlow();
      await running;
      return { started, nextStartedWhileSlow, fastFinished, peak };
    }
    if (platforms) suite.platforms = platforms.map(platform => ({ ...platform, w3c: false, capabilities: { browserName: 'firefox', version: '7' } }));
    const foreignBundles = commits?.some(commit => commit !== 'a'.repeat(40));
    const emptyPool = platforms?.some(({ pool }) => pool && !(limits.pools?.[pool] ?? (pool === 'mac_vms' ? 15 : 0)));
    if (limitStatus !== 200 || !limits?.team) {
      await rejects(run(suite), /could not read the Sauce Labs concurrency limit: (?:HTTP 401|.*JSON)|no Sauce Labs virtual machine sessions available, the limit is 0/, 'the run fails');
      return { sessions };
    }
    if (foreignBundles) await rejects(run(suite), new RegExp(`Sauce Labs run stopped: unit-browser/global\\.html: bundles of .* instead of ${ 'a'.repeat(40) }`), 'the run stops on foreign bundles');
    else if (emptyPool || failed || noReporter || hangs === 3 || sessionNull || navigationError || wrongPage) await rejects(run(suite), /Sauce Labs run failed/, 'the run fails');
    else await run(suite);
    return {
      output: output.join('\n'), exitCodeWhileRunning, navigations, annotations, sessions, peak, poolPeaks, quits, annotationRequests, markerRequests, listedWhileOpen,
      pollDelays,
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
  match(output, /^test browser: https:\/\/app\.saucelabs\.com\/tests\/test-session$/m, 'passes served pages despite a missing deployment marker #5');
}

{
  const { output, sessions } = await runFake({ sessionNull: true });
  equal(sessions, 3, 'retries an invalid WebDriver response for a platform #1');
  match(output, /invalid WebDriver response.*retrying \(2 of 3\)/, 'retries an invalid WebDriver response for a platform #2');
  match(output, /invalid WebDriver response.*retrying \(3 of 3\)/, 'retries an invalid WebDriver response for a platform #3');
  doesNotMatch(output, /saucelabs\.com\/tests\//, 'retries an invalid WebDriver response for a platform #4');
}

{
  const { started, nextStartedWhileSlow, fastFinished } = await runFake({ dynamicQueue: true, limits: { organization: 2, team: 2 } });
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
  const { output, sessions } = await runFake({ latePage: true, pages: ['unit-browser/global.html', 'unit-browser/pure.html'] });
  equal(sessions, 1, 'waits for a page that the browser opens late #1');
  doesNotMatch(output, /retrying|unexpected page/, 'waits for a page that the browser opens late #2');
  match(output, /all the browsers passed/, 'waits for a page that the browser opens late #3');
}

{
  const { output, sessions } = await runFake({ navigationError: true });
  equal(sessions, 3, 'includes a session link when a page fails after session creation #1');
  match(output, /test browser: https:\/\/app\.saucelabs\.com\/tests\/test-session.*navigation failed$/m, 'includes a session link when a page fails after session creation #2');
  match(output, /test browser: https:\/\/app\.saucelabs\.com\/tests\/test-session: .*navigation failed, retrying \(2 of 3\)/, 'includes a session link when a page fails after session creation #3');
}

{
  const { sessions, annotationRequests } = await runFake({ navigationError: true });
  equal(sessions, 3, 'marks a session failed when navigation fails #1');
  equal(annotationRequests, 3, 'marks a session failed when navigation fails #2');
}

{
  const { output, sessions } = await runFake({ hangs: 1 });
  equal(sessions, 2, 'restarts a platform whose page does not finish and passes if it recovers #1');
  match(output, /test browser: https:\/\/app\.saucelabs\.com\/tests\/test-session: unit-browser\/global\.html: not finished in 3 minutes.*retrying \(2 of 3\)/, 'restarts a platform whose page does not finish and passes if it recovers #2');
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
  for (const noReporter of [false, true]) {
    const { output, sessions, navigations, annotations, quits, markerRequests, listedAfter } = await runFake({
      marker: commit, commits: [commit, other], noReporter,
      pages: ['unit-browser/global.html', 'unit-browser/pure.html'], platforms: [{ name: 'first' }, { name: 'next' }],
    });
    match(output, new RegExp(`unit-browser/global\\.html: bundles of ${ other } instead of ${ commit }`), 'stops on foreign bundles before waiting for QUnit #1');
    equal(sessions, 1, 'stops on foreign bundles before waiting for QUnit #2');
    equal(navigations.length, 1, 'stops on foreign bundles before waiting for QUnit #3');
    deepEqual(annotations, ['sauce:job-result=failed'], 'stops on foreign bundles before waiting for QUnit #4');
    equal(quits, 1, 'stops on foreign bundles before waiting for QUnit #5');
    equal(listedAfter, '', 'stops on foreign bundles before waiting for QUnit #6');
    equal(markerRequests, 1, 'stops on foreign bundles before waiting for QUnit #7');
    doesNotMatch(output, /all the browsers passed|assertions passed|retrying/, 'stops on foreign bundles before waiting for QUnit #8');
  }
  const { output: matching } = await runFake({ marker: commit, commits: [commit, commit] });
  doesNotMatch(matching, /bundles of|commit marker in the bundles/, 'passes a page that executed bundles of the tested commit #1');
  match(matching, /all the browsers passed/, 'passes a page that executed bundles of the tested commit #2');
  const { output: unmarked } = await runFake({ marker: commit, commits: [] });
  match(unmarked, /unit-browser\/global\.html: no commit marker in the bundles/, 'only warns about bundles without a commit marker #1');
  match(unmarked, /all the browsers passed/, 'only warns about bundles without a commit marker #2');
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

{
  const { output } = await runFake({ hangs: 3, pages: ['unit-browser/global.html', 'unit-browser/pure.html'] });
  match(output, /\n {2}unit-browser\/pure\.html: not run, the session stopped at unit-browser\/global\.html/, 'reports the pages after a hung page as not run');
}

{
  const platforms = [{ name: 'arm1', pool: 'mac_arm_vms' }, { name: 'arm2', pool: 'mac_arm_vms' }, { name: 'intel', pool: 'mac_vms' }, { name: 'linux' }];
  const { sessions, peak, poolPeaks } = await runFake({ platforms, limits: { organization: 3, team: 3, pools: { mac_arm_vms: 1 } } });
  equal(sessions, 4, 'keeps the sessions of a pool within its limit #1');
  equal(poolPeaks.mac_arm_vms, 1, 'keeps the sessions of a pool within its limit #2');
  equal(peak, 3, 'keeps the sessions of a pool within its limit #3');
}

{
  const platforms = [{ name: 'arm', pool: 'android_arm_vms' }, { name: 'linux' }];
  const { output, sessions } = await runFake({ platforms, limits: { organization: 2, team: 2, pools: { android_arm_vms: 0 } } });
  equal(sessions, 1, 'fails a platform of a pool the plan lacks without opening its session #1');
  match(output, /arm: no Sauce Labs android_arm_vms sessions available, the limit is 0/, 'fails a platform of a pool the plan lacks without opening its session #2');
}

{
  const platforms = [{ name: 'arm', pool: 'mac_arm_vms' }, { name: 'linux' }];
  const { output, sessions } = await runFake({ platforms, limits: { organization: 2, team: 2 } });
  equal(sessions, 1, 'fails a platform of a pool missing from the limit response without opening its session #1');
  match(output, /arm: no Sauce Labs mac_arm_vms sessions available, the limit is NaN/, 'fails a platform of a pool missing from the limit response without opening its session #2');
}

{
  const { exitCode, stderr } = await $({ nothrow: true, quiet: true, timeout: '1m', env: { ...process.env, SAUCE_USERNAME: 'test', SAUCE_ACCESS_KEY: 'test' } })`npm run -s test-saucelabs -- http://example.test/branch --all=false`;
  notEqual(exitCode, 0, 'test-saucelabs passes its options to the suite literally #1');
  match(stderr, /unknown option --all=false/, 'test-saucelabs passes its options to the suite literally #2');
}

{
  const { exitCode, stderr } = await $({ nothrow: true, quiet: true, timeout: '1m', env: { ...process.env, SAUCE_USERNAME: 'test', SAUCE_ACCESS_KEY: 'test' } })`npm run -s test-saucelabs -- http://example.test/branch ${ 'a'.repeat(40) } extra`;
  notEqual(exitCode, 0, 'test-saucelabs rejects an argument after the commit #1');
  match(stderr, /unexpected arguments extra/, 'test-saucelabs rejects an argument after the commit #2');
}

for (const limits of [{ organization: 2, team: 3 }, { organization: 3, team: 2 }]) {
  const { peak } = await runFake({ dynamicQueue: true, limits });
  equal(peak, 2, `opens no more sessions than the organization and team limits allow, ${ JSON.stringify(limits) }`);
}

{
  const { pollDelays } = await runFake({ pages: ['unit-browser/global.html', 'unit-browser/pure.html'], polling: { pollInterval: 100 } });
  equal(pollDelays.length, 2, 'sends no command to a page before the polling interval passes #1');
  // a timer may fire a little early
  ok(pollDelays.every(delay => delay > 90), 'sends no command to a page before the polling interval passes #2');
  const { pollDelays: [byDefault] } = await runFake({ polling: {} });
  ok(byDefault > 4900, 'sends no command to a page before the polling interval passes #3');
}

{
  const { sessions } = await runFake({ limitStatus: 401 });
  equal(sessions, 0, 'opens no session without the concurrency limit');
  const { sessions: none } = await runFake({ limits: { organization: 10, team: 0 } });
  equal(none, 0, 'opens no session when the plan allows none');
  const { sessions: unread } = await runFake({ limits: null });
  equal(unread, 0, 'opens no session when the limit response is not JSON');
}

{
  const { exitCode } = process;
  const { exitCodeWhileRunning } = await runFake();
  equal(exitCodeWhileRunning, 1, 'fails the process if the run never settles #1');
  equal(process.exitCode, exitCode, 'fails the process if the run never settles #2');
  await runFake({ failed: 1 });
  equal(process.exitCode, exitCode, 'fails the process if the run never settles #3');
}

echo(chalk.green('Sauce Labs runner tested'));
