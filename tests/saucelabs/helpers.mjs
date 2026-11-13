import { basename } from 'node:path';
import { COMMAND_TIMEOUT, createSession, WebDriverError } from './webdriver.mjs';

// zx logs every fetch with its options, and those of the WebDriver requests carry the credentials
$.verbose = false;

const { SAUCE_USERNAME: username, SAUCE_ACCESS_KEY: accessKey, SAUCE_REGION: region = 'us-west-1' } = process.env;
const [BASE_URL, COMMIT] = argv._;

const ATTEMPTS = 3;
const POLL_INTERVAL = 5e3;
// the reporter is loaded by the page itself, so a page that has none by then is not the one expected
const REPORTER_TIMEOUT = 6e4;
const RUN_TIMEOUT = 15 * 6e4;
const MARKER_TIMEOUT = 15e3;

if (!username || !accessKey) throw new Error('SAUCE_USERNAME and SAUCE_ACCESS_KEY are required');
if (COMMIT && !/^[\da-f]{40}$/.test(COMMIT)) throw new Error('commit must be a full 40-character SHA');
// the short forms of other Sauce Labs tools (us, eu) name no host here, and every session would retry it
if (!/^[a-z]+-[a-z]+-\d+$/.test(region)) throw new Error(`SAUCE_REGION is a data center like us-west-1 or eu-central-1, not ${ region }`);
// anything else reaches the browsers first, as a navigation every session retries
if (!/^https?:\/\/./.test(BASE_URL)) throw new Error(`pass the http(s) URL of the branch directory on GitHub Pages, not ${ BASE_URL }`);

const { cyan, green, red, yellow } = chalk;
const base = BASE_URL.replace(/\/$/, '');
const hub = `https://ondemand.${ region }.saucelabs.com/wd/hub`;
const dashboard = region === 'us-west-1' ? 'https://app.saucelabs.com' : `https://app.${ region }.saucelabs.com`;

// GitHub Pages can replace the branch's marker during a long run, but the served pages remain testable
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
    // Include page context, navigation, and the final poll, plus job annotation and quit.
    // Ending the session before these complete would turn a page timeout into a retried WebDriver error.
    maxDuration: (suite.pages.length * (3 * COMMAND_TIMEOUT + RUN_TIMEOUT) + 2 * COMMAND_TIMEOUT) / 1e3,
  };
  return w3c ? { ...browser, 'sauce:options': options } : { ...browser, ...options };
}

async function runPage({ reporter, evaluate }, session, page) {
  await session.execute(`sauce:context=${ page }`);
  await session.navigate(`${ base }/${ page }`);
  const start = Date.now();
  for (;;) {
    const state = await session.execute(`var results = window.${ reporter }; return results ? JSON.stringify({ url: window.location.href, results: results }) : null;`);
    const elapsed = Date.now() - start;
    if (state) {
      const { url, results } = JSON.parse(state);
      if (url !== `${ base }/${ page }`) throw new WebDriverError(`unexpected page ${ url } instead of ${ base }/${ page }`);
      if (results.done) return { page, ...evaluate(results) };
      // a run that never ended still lists the failures it met before
      if (elapsed > RUN_TIMEOUT) {
        const current = results.currentTest;
        const testName = current && `${ current.module ? `${ current.module } > ` : '' }${ current.test }`;
        return { page, ...evaluate(results), passed: false,
          error: `not finished in ${ RUN_TIMEOUT / 6e4 } minutes${ testName ? `; current test: ${ testName }` : '' }` };
      }
    } else if (elapsed > REPORTER_TIMEOUT) return { page, passed: false, details: [], error: 'no results reporter on the page' };
    await sleep(POLL_INTERVAL);
  }
}

async function runSession(suite, platform) {
  const session = await createSession({
    hub,
    username,
    accessKey,
    w3c: platform.w3c,
    capabilities: sessionCapabilities(suite, platform),
  });
  const pages = [];
  try {
    for (const page of suite.pages) {
      try {
        pages.push(await runPage(suite, session, page));
      } catch (error) {
        // a browser frozen inside a test stops answering, and the command alone does not say where
        error.message = `${ page }: ${ error.message }`;
        throw error;
      }
    }
    // reporting the job result must not discard the pages or retry a failed assertion
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
    // an abandoned session holds its concurrency slot until Sauce Labs times it out
    try {
      await session.quit();
    } catch (error) {
      echo(yellow(`${ platform.name }: ${ error.message }`));
    }
  }
  return { platform, id: session.id, pages };
}

async function runPlatform(suite, platform) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await runSession(suite, platform);
    } catch (error) {
      if (!(error instanceof WebDriverError) || attempt === ATTEMPTS) return { platform, error, id: error.sessionId };
      echo(yellow(`${ platform.name }: ${ error.message }, retrying (${ attempt + 1 } of ${ ATTEMPTS })`));
    }
  }
}

function report({ platform, id, pages, error }) {
  if (error) {
    echo(red(`${ platform.name }: ${ id ? `${ dashboard }/tests/${ id }: ` : '' }${ error.message }`));
    return false;
  }
  const lines = [cyan(`${ platform.name }: ${ dashboard }/tests/${ id }`)];
  for (const { page, passed, summary, details, error: pageError = summary } of pages) {
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

// `evaluate` turns the results a page published into { passed, summary, details }, finished or not
export async function run(suite) {
  if (COMMIT) {
    const deployed = await deployedCommit();
    if (deployed !== COMMIT) echo(yellow(`${ base }/commit.txt shows ${ deployed } instead of ${ COMMIT }; testing the currently served pages`));
  }

  echo(green(`running ${ cyan(base) } on Sauce Labs, browsers: ${ cyan(suite.platforms.length) }`));

  // Limit queued session requests as well as active sessions; the catalog can have hundreds of versions.
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
