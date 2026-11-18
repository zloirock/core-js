import { setMaxListeners } from 'node:events';
import { writeFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { setTimeout } from 'node:timers/promises';
import { basicAuthorization, COMMAND_TIMEOUT, createSession, WebDriverError } from './webdriver.mjs';

// zx logs fetch options, which carry the credentials
$.verbose = false;

const {
  SAUCE_USERNAME: username, SAUCE_ACCESS_KEY: accessKey, SAUCE_REGION: region = 'us-west-1', SAUCE_SESSIONS_FILE: sessionsFile,
} = process.env;
// the suite reads the options
const [BASE_URL, COMMIT, ...extra] = argv._.filter(arg => !arg.startsWith('--'));

const ATTEMPTS = 3;
const POLL_INTERVAL = 5e3;
const REPORTER_TIMEOUT = 6e4;
// the slowest emulator finished both pages in under two minutes
const RUN_TIMEOUT = 3 * 6e4;
const REQUEST_TIMEOUT = 15e3;

if (!username || !accessKey) throw new Error('SAUCE_USERNAME and SAUCE_ACCESS_KEY are required');
if (extra.length) throw new Error(`unexpected arguments ${ extra.join(' ') }, pass the URL and an optional commit`);
if (COMMIT && !/^[\da-f]{40}$/.test(COMMIT)) throw new Error('commit must be a full 40-character SHA');
if (!/^[a-z]+-[a-z]+-\d+$/.test(region)) throw new Error(`SAUCE_REGION is a data center like us-west-1 or eu-central-1, not ${ region }`);
if (!/^https?:\/\/./.test(BASE_URL)) throw new Error(`pass the http(s) URL of the branch directory on GitHub Pages, not ${ BASE_URL }`);

const { cyan, green, red, yellow } = chalk;
const base = BASE_URL.replace(/\/$/, '');
const hub = `https://ondemand.${ region }.saucelabs.com/wd/hub`;
const api = `https://api.${ region }.saucelabs.com`;
const dashboard = region === 'us-west-1' ? 'https://app.saucelabs.com' : `https://app.${ region }.saucelabs.com`;

async function deployedCommit() {
  try {
    const response = await fetch(`${ base }/commit.txt`, { signal: AbortSignal.timeout(REQUEST_TIMEOUT) });
    return response.ok ? (await response.text()).trim() : `HTTP ${ response.status }`;
  } catch (error) {
    return error.message;
  }
}

// a session beyond the plan waits in the Sauce Labs queue, and the wait counts towards the session timeout
async function sessionLimits() {
  let concurrency;
  try {
    const response = await fetch(`${ api }/rest/v1.2/users/${ encodeURIComponent(username) }/concurrency`, {
      headers: { authorization: basicAuthorization(username, accessKey) },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    });
    if (!response.ok) throw new Error(`HTTP ${ response.status }`);
    ({ concurrency } = await response.json());
  } catch (error) {
    throw new Error(`could not read the Sauce Labs concurrency limit: ${ error.message }`, { cause: error });
  }
  // `vms` covers every virtual platform, the Mac included, as the dashboard total does; the pools are within it
  const limit = pool => Math.min(concurrency?.organization?.allowed?.[pool], concurrency?.team?.allowed?.[pool]);
  if (!(limit('vms') > 0)) throw new Error(`no Sauce Labs virtual machine sessions available, the limit is ${ limit('vms') }`);
  return limit;
}

function sessionCapabilities(suite, { name, w3c, capabilities: browser }) {
  const options = {
    name,
    build: `${ suite.name } ${ basename(base) }`,
    // outlives a page timeout, so Sauce Labs never ends the session first
    maxDuration: (suite.pages.length * (3 * COMMAND_TIMEOUT + RUN_TIMEOUT) + 2 * COMMAND_TIMEOUT) / 1e3,
  };
  return w3c ? { ...browser, 'sauce:options': options } : { ...browser, ...options };
}

async function runPage({ reporter, evaluate, pollInterval = POLL_INTERVAL }, session, page, controller) {
  const { signal } = controller;
  const expected = `${ base }/${ page }`;
  await session.execute(`sauce:context=${ page }`);
  signal.throwIfAborted();
  await session.navigate(expected);
  const start = Date.now();
  for (;;) {
    signal.throwIfAborted();
    // the driver of Firefox 48 - 50 cancels a timer of the page on each command, and one
    // right after the navigation takes the timer QUnit resumes with, so the wait goes first
    await setTimeout(pollInterval, undefined, { signal });
    const state = await session.execute(`var results = window.${ reporter }; var commits = window.bundleCommits || []; return results || commits.length ? JSON.stringify({ url: window.location.href, results: results, commits: commits }) : null;`);
    signal.throwIfAborted();
    const elapsed = Date.now() - start;
    const { url, results, commits } = state ? JSON.parse(state) : {};
    const foreign = COMMIT && [...new Set(commits)].filter(commit => commit !== COMMIT);
    // GitHub Pages upgrades HTTP to HTTPS where the browser supports its TLS
    if ((results || foreign?.length) && url !== expected && !(expected.startsWith('http:') && url === expected.replace(/^http:/, 'https:'))) {
      // a slow simulator shows the previous page for a while after the navigation command
      if (elapsed > REPORTER_TIMEOUT) throw new WebDriverError(`unexpected page ${ url } instead of ${ expected }`);
      continue;
    }
    if (foreign?.length) {
      controller.abort(new Error(`${ page }: bundles of ${ foreign.join(', ') } instead of ${ COMMIT }`));
      signal.throwIfAborted();
    }
    if (results?.done) return { page, commits, ...evaluate(results) };
    if (results && elapsed > RUN_TIMEOUT) {
      const current = results.currentTest;
      const testName = current && `${ current.module ? `${ current.module } > ` : '' }${ current.test }`;
      return { page, commits, ...evaluate(results), passed: false, unfinished: true,
        error: `not finished in ${ RUN_TIMEOUT / 6e4 } minutes${ testName ? `; current test: ${ testName }` : '' }` };
    }
    if (!results && elapsed > REPORTER_TIMEOUT) return { page, passed: false, details: [], error: 'no results reporter on the page' };
  }
}

// a cancelled step does not signal npm's children, so a later step closes these
const openSessions = new Set();
let sessionsWritten;

// serialized, so an older list never lands last
async function writeSessions(previous) {
  await previous;
  try {
    await writeFile(sessionsFile, [...openSessions].map(sessionId => `${ sessionId }\n`).join(''));
  } catch (error) {
    echo(yellow(`could not list the open sessions: ${ error.message }`));
  }
}

function trackSession(id, open) {
  if (open) openSessions.add(id);
  else openSessions.delete(id);
  if (sessionsFile) sessionsWritten = writeSessions(sessionsWritten);
  return sessionsWritten;
}

async function annotateJob(session, platform, result) {
  try {
    await session.execute(`sauce:job-result=${ result }`);
    return result;
  } catch (error) {
    echo(yellow(`${ platform.name }: could not report the Sauce Labs job result: ${ error.message }`));
  }
}

async function runSession(suite, platform, controller) {
  const { signal } = controller;
  const session = await createSession({
    hub,
    username,
    accessKey,
    w3c: platform.w3c,
    capabilities: sessionCapabilities(suite, platform),
  });
  await trackSession(session.id, true);
  const pages = [];
  let hung;
  let jobResult;
  try {
    for (const page of suite.pages) {
      signal.throwIfAborted();
      // a browser busy with a hung page does not navigate
      if (hung) {
        pages.push({ page, passed: false, details: [], error: `not run, the session stopped at ${ hung }` });
        continue;
      }
      let result;
      try {
        result = await runPage(suite, session, page, controller);
      } catch (error) {
        if (!signal.aborted) error.message = `${ page }: ${ error.message }`;
        throw error;
      }
      pages.push(result);
      if (result.unfinished) hung = page;
    }
    signal.throwIfAborted();
    // a lost annotation must not retry the platform
    jobResult = await annotateJob(session, platform, pages.every(({ passed }) => passed) ? 'passed' : 'failed');
    signal.throwIfAborted();
  } catch (error) {
    // The abort reason belongs to the whole run; each session keeps its own error and link.
    const failure = signal.aborted ? new Error(`run stopped: ${ signal.reason.message }`, { cause: signal.reason }) : error;
    failure.sessionId = session.id;
    if (jobResult !== 'failed') await annotateJob(session, platform, 'failed');
    throw failure;
  } finally {
    try {
      await session.quit();
      await trackSession(session.id, false);
    } catch (error) {
      echo(yellow(`${ platform.name }: ${ error.message }`));
    }
  }
  return { platform, id: session.id, pages };
}

async function runPlatform(suite, platform, controller) {
  const { signal } = controller;
  for (let attempt = 1; ; attempt++) {
    let message;
    try {
      signal.throwIfAborted();
      const result = await runSession(suite, platform, controller);
      // a hung emulator and an endless test look alike
      const unfinished = result.pages.find(page => page.unfinished);
      if (signal.aborted || !unfinished || attempt === ATTEMPTS) return result;
      message = `${ unfinished.page }: ${ unfinished.error }`;
    } catch (error) {
      if (signal.aborted || !(error instanceof WebDriverError) || attempt === ATTEMPTS) return { platform, error, id: error.sessionId };
      ({ message } = error);
    }
    echo(yellow(`${ platform.name }: ${ message }, retrying (${ attempt + 1 } of ${ ATTEMPTS })`));
  }
}

function report({ platform, id, pages, error }) {
  if (error) {
    echo(red(`${ platform.name }: ${ id ? `${ dashboard }/tests/${ id }: ` : '' }${ error.message }`));
    return false;
  }
  const lines = [cyan(`${ platform.name }: ${ dashboard }/tests/${ id }`)];
  let platformPassed = true;
  for (const { page, passed, summary, details, commits, error: pageError = summary } of pages) {
    // appended to each bundle by the Pages build; a deploy by an older workflow has none
    if (COMMIT && commits && !commits.length) lines.push(yellow(`  ${ page }: no commit marker in the bundles`));
    if (passed) {
      lines.push(green(`  ${ page }: ${ summary }`));
      continue;
    }
    platformPassed = false;
    lines.push(red(`  ${ page }: ${ pageError }`));
    for (const detail of details) lines.push(red(detail));
  }
  echo(lines.join('\n'));
  return platformPassed;
}

export async function run(suite) {
  // a never settled wait would end the process with code 0
  const { exitCode } = process;
  process.exitCode = 1;
  try {
    await runSuite(suite);
  } finally {
    process.exitCode = exitCode;
  }
}

async function runSuite(suite) {
  if (COMMIT) {
    const deployed = await deployedCommit();
    if (deployed !== COMMIT) echo(yellow(`${ base }/commit.txt shows ${ deployed } instead of ${ COMMIT }; testing the currently served pages`));
  }

  const limit = await sessionLimits();
  // limits queued session requests too: --all has hundreds of platforms
  const concurrency = Math.min(limit('vms'), suite.platforms.length);
  echo(green(`running ${ cyan(base) } on Sauce Labs, browsers: ${ cyan(suite.platforms.length) }, sessions: ${ cyan(concurrency) }`));
  let passed = true;
  const waiting = suite.platforms.filter(platform => {
    if (!platform.pool || limit(platform.pool) > 0) return true;
    passed = report({ platform, error: new Error(`no Sauce Labs ${ platform.pool } sessions available, the limit is ${ limit(platform.pool) }`) }) && passed;
    return false;
  });
  // a session over its pool limit would wait in the Sauce Labs queue, so a worker takes a platform with a free slot
  const running = {};
  const released = [];
  const controller = new AbortController();
  const { signal } = controller;
  // Each worker can have one polling timer listening for abort.
  setMaxListeners(concurrency, signal);
  const workers = Array.from({ length: concurrency }, async () => {
    let workerPassed = true;
    while (waiting.length && !signal.aborted) {
      const index = waiting.findIndex(({ pool }) => !pool || (running[pool] ?? 0) < limit(pool));
      if (index === -1) {
        await new Promise(resolve => released.push(resolve));
        continue;
      }
      const [platform] = waiting.splice(index, 1);
      const { pool } = platform;
      if (pool) running[pool] = (running[pool] ?? 0) + 1;
      const result = await runPlatform(suite, platform, controller);
      if (pool) running[pool]--;
      for (const resolve of released.splice(0)) resolve();
      if (!report(result)) workerPassed = false;
    }
    return workerPassed;
  });
  passed = (await Promise.all(workers)).every(Boolean) && passed;
  if (signal.aborted) throw new Error(`Sauce Labs run stopped: ${ signal.reason.message }`, { cause: signal.reason });

  if (COMMIT) {
    const deployed = await deployedCommit();
    if (deployed !== COMMIT) echo(yellow(`${ base }/commit.txt shows ${ deployed } instead of ${ COMMIT } after the run; results describe the served pages`));
  }

  if (!passed) throw new Error('Sauce Labs run failed');

  echo(green('all the browsers passed'));
}
