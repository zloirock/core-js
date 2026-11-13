import { writeFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { COMMAND_TIMEOUT, createSession, WebDriverError } from './webdriver.mjs';

// zx logs fetch options, which carry the credentials
$.verbose = false;

const {
  SAUCE_USERNAME: username, SAUCE_ACCESS_KEY: accessKey, SAUCE_REGION: region = 'us-west-1', SAUCE_SESSIONS_FILE: sessionsFile,
} = process.env;
const [BASE_URL, COMMIT] = argv._;

const ATTEMPTS = 3;
const POLL_INTERVAL = 5e3;
const REPORTER_TIMEOUT = 6e4;
// the slowest emulator finished both pages in under two minutes
const RUN_TIMEOUT = 3 * 6e4;
const MARKER_TIMEOUT = 15e3;

if (!username || !accessKey) throw new Error('SAUCE_USERNAME and SAUCE_ACCESS_KEY are required');
if (COMMIT && !/^[\da-f]{40}$/.test(COMMIT)) throw new Error('commit must be a full 40-character SHA');
if (!/^[a-z]+-[a-z]+-\d+$/.test(region)) throw new Error(`SAUCE_REGION is a data center like us-west-1 or eu-central-1, not ${ region }`);
if (!/^https?:\/\/./.test(BASE_URL)) throw new Error(`pass the http(s) URL of the branch directory on GitHub Pages, not ${ BASE_URL }`);

const { cyan, green, red, yellow } = chalk;
const base = BASE_URL.replace(/\/$/, '');
const hub = `https://ondemand.${ region }.saucelabs.com/wd/hub`;
const dashboard = region === 'us-west-1' ? 'https://app.saucelabs.com' : `https://app.${ region }.saucelabs.com`;

async function deployedCommit() {
  try {
    const response = await fetch(`${ base }/commit.txt`, { signal: AbortSignal.timeout(MARKER_TIMEOUT) });
    return response.ok ? (await response.text()).trim() : `HTTP ${ response.status }`;
  } catch (error) {
    return error.message;
  }
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

async function runPage({ reporter, evaluate }, session, page) {
  await session.execute(`sauce:context=${ page }`);
  await session.navigate(`${ base }/${ page }`);
  const start = Date.now();
  for (;;) {
    const state = await session.execute(`var results = window.${ reporter }; return results ? JSON.stringify({ url: window.location.href, results: results, commits: window.bundleCommits || [] }) : null;`);
    const elapsed = Date.now() - start;
    if (state) {
      const { url, results, commits } = JSON.parse(state);
      const expected = `${ base }/${ page }`;
      // GitHub Pages upgrades HTTP to HTTPS where the browser supports its TLS
      if (url !== expected && !(expected.startsWith('http:') && url === expected.replace(/^http:/, 'https:'))) {
        throw new WebDriverError(`unexpected page ${ url } instead of ${ expected }`);
      }
      if (results.done) return { page, commits, ...evaluate(results) };
      if (elapsed > RUN_TIMEOUT) {
        const current = results.currentTest;
        const testName = current && `${ current.module ? `${ current.module } > ` : '' }${ current.test }`;
        return { page, commits, ...evaluate(results), passed: false, unfinished: true,
          error: `not finished in ${ RUN_TIMEOUT / 6e4 } minutes${ testName ? `; current test: ${ testName }` : '' }` };
      }
    } else if (elapsed > REPORTER_TIMEOUT) return { page, passed: false, details: [], error: 'no results reporter on the page' };
    await sleep(POLL_INTERVAL);
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

async function runSession(suite, platform) {
  const session = await createSession({
    hub,
    username,
    accessKey,
    w3c: platform.w3c,
    capabilities: sessionCapabilities(suite, platform),
  });
  await trackSession(session.id, true);
  const pages = [];
  try {
    for (const page of suite.pages) {
      let result;
      try {
        result = await runPage(suite, session, page);
      } catch (error) {
        error.message = `${ page }: ${ error.message }`;
        throw error;
      }
      pages.push(result);
      // a browser busy with a hung page does not navigate
      if (result.unfinished) break;
    }
    // a lost annotation must not retry the platform
    try {
      await session.execute(`sauce:job-result=${ pages.every(({ passed }) => passed) ? 'passed' : 'failed' }`);
    } catch (error) {
      echo(yellow(`${ platform.name }: could not report the Sauce Labs job result: ${ error.message }`));
    }
  } catch (error) {
    error.sessionId = session.id;
    try {
      await session.execute('sauce:job-result=failed');
    } catch (reportError) {
      echo(yellow(`${ platform.name }: could not report the Sauce Labs job result: ${ reportError.message }`));
    }
    throw error;
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

async function runPlatform(suite, platform) {
  for (let attempt = 1; ; attempt++) {
    let message;
    try {
      const result = await runSession(suite, platform);
      // a hung emulator and an endless test look alike
      const unfinished = result.pages.find(page => page.unfinished);
      if (!unfinished || attempt === ATTEMPTS) return result;
      message = `${ unfinished.page }: ${ unfinished.error }`;
    } catch (error) {
      if (!(error instanceof WebDriverError) || attempt === ATTEMPTS) return { platform, error, id: error.sessionId };
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
  for (const { page, passed, summary, details, commits, error: pageError = summary } of pages) {
    // appended to each bundle by the Pages build
    const executed = [...new Set(commits)];
    if (COMMIT && commits && (executed.length !== 1 || executed[0] !== COMMIT)) {
      lines.push(yellow(`  ${ page }: bundles of ${ executed.join(', ') || 'no commit marker' } instead of ${ COMMIT }`));
    }
    if (passed) {
      lines.push(green(`  ${ page }: ${ summary }`));
      continue;
    }
    lines.push(red(`  ${ page }: ${ pageError }`));
    for (const detail of details) lines.push(red(detail));
  }
  echo(lines.join('\n'));
  return pages.every(({ passed }) => passed);
}

export async function run(suite) {
  if (COMMIT) {
    const deployed = await deployedCommit();
    if (deployed !== COMMIT) echo(yellow(`${ base }/commit.txt shows ${ deployed } instead of ${ COMMIT }; testing the currently served pages`));
  }

  echo(green(`running ${ cyan(base) } on Sauce Labs, browsers: ${ cyan(suite.platforms.length) }`));

  // limits queued session requests too: --all has hundreds of platforms
  const concurrency = Math.min(suite.concurrency, suite.platforms.length);
  let nextPlatform = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    let workerPassed = true;
    while (nextPlatform < suite.platforms.length) {
      const platform = suite.platforms[nextPlatform++];
      if (!report(await runPlatform(suite, platform))) workerPassed = false;
    }
    return workerPassed;
  });
  const passed = (await Promise.all(workers)).every(Boolean);

  if (COMMIT) {
    const deployed = await deployedCommit();
    if (deployed !== COMMIT) echo(yellow(`${ base }/commit.txt shows ${ deployed } instead of ${ COMMIT } after the run; results describe the served pages`));
  }

  if (!passed) throw new Error('Sauce Labs run failed');

  echo(green('all the browsers passed'));
}
