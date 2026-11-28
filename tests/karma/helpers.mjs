import { CHILD_STOP_TIMEOUT_MS, releaseChild, waitWithin } from '../e2e-libs/deadline.mjs';
import findInternetExplorer from './internet-explorer.js';

if (process.env.CI) await $`playwright install --with-deps chromium firefox webkit`;
else await $`playwright install chromium firefox webkit`;

const ATTEMPTS = 3;

// a browser that never starts, never reaches the karma page or drops the connection is not a test
// result - CI runners produce those often enough to repeat such a run instead of failing the job
const INFRASTRUCTURE_FAILURES = [
  /Cannot start /, // the browser process exited before it was captured
  / crashed\./, // ... or after
  /failed \d+ times \(/, // karma gave up restarting it
  /has not captured in \d+ ms/, // it never reached the karma page
  / DISCONNECTED|Disconnected /, // it dropped the connection mid-run
  /browserType\.launch:|page\.goto:/, // playwright never got it to the point karma sees it
];

// what the reporters spell out for a real test result, which is never repeated
const TEST_FAILURE = /\(\d+ FAILED\)|TOTAL: \d+ FAILED/;

$.quote = it => `'${ it }'`;

// zx kills the command tree (taskkill /T on Windows). Wait for its exit before retrying.
async function stopKarma(command) {
  await command.kill('SIGKILL');
  return command;
}

export async function waitForKarma(command, timeout, stopTimeout = CHILD_STOP_TIMEOUT_MS) {
  let output = timeout ? await waitWithin(command, timeout) : await command;
  const timedOut = output === null;
  if (timedOut) {
    try {
      output = await waitWithin(stopKarma(command), stopTimeout);
      if (output === null) throw new Error(`no exit within ${ stopTimeout }ms`);
    } catch (error) {
      // zx sets exitCode on failure. A surviving child or an inherited pipe can keep it alive.
      if (command.child) releaseChild(command.child);
      throw new Error(`Karma timed out after ${ timeout }ms and its process tree could not be stopped`, { cause: error });
    }
  }
  const { exitCode, signal, stdout, stderr } = output;
  return { exitCode, signal, stdout, stderr, timedOut };
}

// runs one bundle set, repeating it while the browsers rather than the tests are what failed: a red
// karma job is a real failure, and a slow green one says in its retry lines what it cost. `config`
// names a configuration of a suite's own, next to `karma.conf.js`, which it builds on, and `env` what
// it reads from the environment
export async function start(files, { config, env, hasTestFailure, timeout } = {}) {
  const target = files.map(file => `../../${ file }.js`).join(',');

  for (let attempt = 1; ; attempt++) {
    // IE spawns a second process that its launcher only reaps through `wmic`, deprecated and
    // already gone from newer Windows images, and a leftover one takes over the next launch,
    // which then exits at once as `Cannot start IE`. the sweep is blind - it takes every IE on
    // the machine - so it is limited to a CI runner, where nothing else runs one and the karma
    // starts below are sequential, and never touches a developer's own browser
    if (process.env.CI && findInternetExplorer()) {
      await $({ nothrow: true, quiet: true })`taskkill /F /IM iexplore.exe`;
    }

    const command = $({ nothrow: true, env: { ...process.env, ...env } })`karma start ${ config ?? [] } -f=${ target }`;
    const { exitCode, signal, stdout, stderr, timedOut } = await waitForKarma(command, timeout);

    if (exitCode === 0 && !timedOut) return;

    const output = stdout + stderr;

    // a signal leaves `exitCode` null and means something outside stopped the run - neither a pass
    // nor a browser that deserves another chance
    if ((signal && !timedOut) || attempt === ATTEMPTS || !await shouldRetryKarma(output, hasTestFailure, timedOut)) {
      throw new Error(`${ target } ${ timedOut ? `timed out after ${ timeout }ms` : 'failed' }`);
    }

    echo(chalk.yellow(`${ target } failed to run the browsers, retrying (${ attempt + 1 } of ${ ATTEMPTS })`));
  }
}

// A suite with failOnFailingTestSuite disabled can print failed assertions on an infrastructure
// exit. Its caller will gate the assertions from the completed retry.
export async function shouldRetryKarma(output, hasTestFailure = text => TEST_FAILURE.test(text), timedOut = false) {
  return (timedOut || INFRASTRUCTURE_FAILURES.some(it => it.test(output))) && !await hasTestFailure(output);
}
