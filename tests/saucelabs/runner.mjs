import platforms from './platforms.mjs';
import { COMMAND_TIMEOUT, createSession, WebDriverError } from './webdriver.mjs';

// zx logs every fetch with its options, and those of the WebDriver requests carry the credentials
$.verbose = false;

const { SAUCE_USERNAME: username, SAUCE_ACCESS_KEY: accessKey, SAUCE_REGION: region = 'us-west-1' } = process.env;
const [BASE_URL, COMMIT] = argv._;

const PAGES = [
  'unit-browser/global.html',
  'unit-browser/pure.html',
  // the e2e legs karma runs in browsers
  'unit-browser/usage-pure-babel.html',
  'unit-browser/usage-pure-unplugin-pre-post.html',
];

const ATTEMPTS = 3;
const POLL_INTERVAL = 5e3;
// the reporter is loaded by the page itself, so a page that has none by then is not the one expected
const REPORTER_TIMEOUT = 6e4;
const RUN_TIMEOUT = 15 * 6e4;
// GitHub Pages serves a finished deploy with a delay
const DEPLOY_TIMEOUT = 10 * 6e4;
const DEPLOY_POLL_INTERVAL = 15e3;
// every page at its worst - the navigation, the run and the poll that finds it over: a session Sauce Labs
// ended before that would turn a hang, which is a result, into a broken session, which is retried
const MAX_DURATION = PAGES.length * (2 * COMMAND_TIMEOUT + RUN_TIMEOUT) / 1e3;

const POLL = 'var results = window.qunitResults; return results ? JSON.stringify(results) : null;';

if (!username || !accessKey) throw new Error('SAUCE_USERNAME and SAUCE_ACCESS_KEY are required');
// the short forms of other Sauce Labs tools (us, eu) name no host here, and every session would retry it
if (!/^[a-z]+-[a-z]+-\d+$/.test(region)) throw new Error(`SAUCE_REGION is a data center like us-west-1 or eu-central-1, not ${ region }`);
// anything else reaches the browsers first, as a navigation every session retries
if (!/^https?:\/\/./.test(BASE_URL)) throw new Error(`pass the http(s) URL of the branch directory on GitHub Pages, not ${ BASE_URL }`);

const { cyan, green, red, yellow } = chalk;
const base = BASE_URL.replace(/\/$/, '');
const build = `${ path.basename(base) }@${ COMMIT ?? 'local' }`;
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

function sessionCapabilities({ name, w3c, capabilities: browser }) {
  const options = { name, build, maxDuration: MAX_DURATION };
  return w3c ? { ...browser, 'sauce:options': options } : { ...browser, ...options };
}

// a page that fails or hangs is a result; only the WebDriver errors below it are worth another session
async function runPage(session, page) {
  await session.execute(`sauce:context=${ page }`);
  await session.navigate(`${ base }/${ page }`);
  const start = Date.now();
  for (;;) {
    const state = await session.execute(POLL);
    const elapsed = Date.now() - start;
    if (state) {
      const results = JSON.parse(state);
      // QUnit 1 ends a run without tests as a pass, and that is what a page whose bundle did not load runs
      if (results.done) return results.total ? { page, results } : { page, error: 'no assertions ran' };
      if (elapsed > RUN_TIMEOUT) return { page, results, error: `not finished in ${ RUN_TIMEOUT / 6e4 } minutes` };
    } else if (elapsed > REPORTER_TIMEOUT) return { page, error: 'no results reporter on the page' };
    await sleep(POLL_INTERVAL);
  }
}

function pagePassed({ results, error }) {
  return !error && results.failed === 0;
}

async function runSession(platform) {
  const session = await createSession({
    hub,
    username,
    accessKey,
    w3c: platform.w3c,
    capabilities: sessionCapabilities(platform),
  });
  const pages = [];
  try {
    for (const page of PAGES) {
      try {
        pages.push(await runPage(session, page));
      } catch (error) {
        // a browser frozen inside a test stops answering, and the command alone does not say where
        error.message = `${ page }: ${ error.message }`;
        throw error;
      }
    }
    await session.execute(`sauce:job-result=${ pages.every(pagePassed) ? 'passed' : 'failed' }`);
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

async function runPlatform(platform) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await runSession(platform);
    } catch (error) {
      if (!(error instanceof WebDriverError) || attempt === ATTEMPTS) return { platform, error };
      echo(yellow(`${ platform.name }: ${ error.message }, retrying (${ attempt + 1 } of ${ ATTEMPTS })`));
    }
  }
}

// dumped values and error messages span lines
function indent(text, prefix) {
  return text.replaceAll(/^/gm, prefix);
}

function report({ platform, id, pages, error }) {
  if (error) {
    echo(red(`${ platform.name }: ${ error.message }`));
    return false;
  }
  const lines = [cyan(`${ platform.name }: ${ dashboard }/tests/${ id }`)];
  for (const outcome of pages) {
    const { page, results, error: pageError } = outcome;
    if (pagePassed(outcome)) {
      lines.push(green(`  ${ page }: ${ cyan(results.total) } assertions passed`));
      continue;
    }
    lines.push(red(`  ${ page }: ${ pageError ?? `${ results.failed } of ${ results.total } assertions failed` }`));
    // a run that never ended still lists the failures it met before
    for (const { module, test, message, expected, actual } of results?.failures ?? []) {
      // most tests sit outside any QUnit module
      lines.push(red(indent(`${ module ? `${ module } > ` : '' }${ test }: ${ message }`, '    ')));
      if (expected !== undefined) lines.push(red(indent(`expected: ${ expected }\nactual: ${ actual }`, '      ')));
    }
    const unlisted = results?.failed - results?.failures.length;
    if (unlisted > 0) lines.push(red(`    and ${ unlisted } more`));
  }
  echo(lines.join('\n'));
  return pages.every(pagePassed);
}

if (COMMIT) await waitForDeploy();

echo(green(`running ${ cyan(base) } on Sauce Labs, browsers: ${ cyan(platforms.length) }`));

// every platform reports as it finishes, and the exit code waits for all of them
const outcomes = await Promise.all(platforms.map(async platform => report(await runPlatform(platform))));
let passed = outcomes.every(Boolean);

if (COMMIT) {
  const deployed = await deployedCommit();
  if (deployed !== COMMIT) {
    passed = false;
    echo(red(`${ base }/commit.txt shows ${ deployed } instead of ${ COMMIT } after the run`));
  }
}

if (!passed) throw new Error('Sauce Labs run failed');

echo(green('all the browsers passed'));
