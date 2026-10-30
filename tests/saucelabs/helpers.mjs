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
// GitHub Pages serves a finished deploy with a delay
const DEPLOY_TIMEOUT = 10 * 6e4;
const DEPLOY_POLL_INTERVAL = 15e3;

if (!username || !accessKey) throw new Error('SAUCE_USERNAME and SAUCE_ACCESS_KEY are required');
// the short forms of other Sauce Labs tools (us, eu) name no host here, and every session would retry it
if (!/^[a-z]+-[a-z]+-\d+$/.test(region)) throw new Error(`SAUCE_REGION is a data center like us-west-1 or eu-central-1, not ${ region }`);
// anything else reaches the browsers first, as a navigation every session retries
if (!/^https?:\/\/./.test(BASE_URL)) throw new Error(`pass the http(s) URL of the branch directory on GitHub Pages, not ${ BASE_URL }`);

const { cyan, green, red, yellow } = chalk;
const base = BASE_URL.replace(/\/$/, '');
const hub = `https://ondemand.${ region }.saucelabs.com/wd/hub`;
const dashboard = region === 'us-west-1' ? 'https://app.saucelabs.com' : `https://app.${ region }.saucelabs.com`;

// what the marker says, or why it says nothing - a network error is one more state to wait through
async function deployedCommit() {
  try {
    const response = await fetch(`${ base }/commit.txt`);
    return response.ok ? (await response.text()).trim() : `HTTP ${ response.status }`;
  } catch (error) {
    return error.message;
  }
}

async function waitForDeploy() {
  const deadline = Date.now() + DEPLOY_TIMEOUT;
  for (;;) {
    const deployed = await deployedCommit();
    if (deployed === COMMIT) return;
    if (Date.now() > deadline) throw new Error(`${ base }/commit.txt shows ${ deployed } instead of ${ COMMIT }`);
    await sleep(DEPLOY_POLL_INTERVAL);
  }
}

function sessionCapabilities(suite, { name, w3c, capabilities: browser }) {
  const options = {
    name,
    build: `${ suite.name } ${ basename(base) }@${ COMMIT ?? 'local' }`,
    // every page at its worst - the navigation, the run and the poll that finds it over: a session Sauce Labs
    // ended before that would turn a hang, which is a result, into a broken session, which is retried
    maxDuration: suite.pages.length * (2 * COMMAND_TIMEOUT + RUN_TIMEOUT) / 1e3,
  };
  return w3c ? { ...browser, 'sauce:options': options } : { ...browser, ...options };
}

async function runPage({ reporter, evaluate }, session, page) {
  await session.execute(`sauce:context=${ page }`);
  await session.navigate(`${ base }/${ page }`);
  const start = Date.now();
  for (;;) {
    const state = await session.execute(`var results = window.${ reporter }; return results ? JSON.stringify(results) : null;`);
    const elapsed = Date.now() - start;
    if (state) {
      const results = JSON.parse(state);
      if (results.done) return { page, ...evaluate(results) };
      // a run that never ended still lists the failures it met before
      if (elapsed > RUN_TIMEOUT) return { page, ...evaluate(results), passed: false, error: `not finished in ${ RUN_TIMEOUT / 6e4 } minutes` };
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
    await session.execute(`sauce:job-result=${ pages.every(({ passed }) => passed) ? 'passed' : 'failed' }`);
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
      if (!(error instanceof WebDriverError) || attempt === ATTEMPTS) return { platform, error };
      echo(yellow(`${ platform.name }: ${ error.message }, retrying (${ attempt + 1 } of ${ ATTEMPTS })`));
    }
  }
}

function report({ platform, id, pages, error }) {
  if (error) {
    echo(red(`${ platform.name }: ${ error.message }`));
    return false;
  }
  const lines = [cyan(`${ platform.name }: ${ dashboard }/tests/${ id }`)];
  for (const { page, passed, summary, details, error: pageError } of pages) {
    if (passed) {
      lines.push(green(`  ${ page }: ${ summary }`));
      continue;
    }
    lines.push(red(`  ${ page }: ${ pageError ?? summary }`));
    for (const detail of details) lines.push(red(detail));
  }
  echo(lines.join('\n'));
  return pages.every(({ passed }) => passed);
}

// `evaluate` turns the results a page published into { passed, summary, details }, finished or not
export async function run(suite) {
  if (COMMIT) await waitForDeploy();

  echo(green(`running ${ cyan(base) } on Sauce Labs, browsers: ${ cyan(suite.platforms.length) }`));

  // Limit queued session requests as well as active sessions; the catalog can have hundreds of versions.
  const concurrency = Math.min(suite.concurrency, suite.platforms.length);
  const workers = Array.from({ length: concurrency }, async (_, worker) => {
    let workerPassed = true;
    for (let index = worker; index < suite.platforms.length; index += concurrency) {
      if (!report(await runPlatform(suite, suite.platforms[index]))) workerPassed = false;
    }
    return workerPassed;
  });
  let passed = (await Promise.all(workers)).every(Boolean);

  if (COMMIT) {
    const deployed = await deployedCommit();
    if (deployed !== COMMIT) {
      passed = false;
      echo(red(`${ base }/commit.txt shows ${ deployed } instead of ${ COMMIT } after the run`));
    }
  }

  if (!passed) throw new Error('Sauce Labs run failed');

  echo(green('all the browsers passed'));
}
