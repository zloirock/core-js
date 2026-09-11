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

// runs one bundle set, repeating it while the browsers rather than the tests are what failed: a red
// karma job is a real failure, and a slow green one says in its retry lines what it cost
export async function start(files) {
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

    const { exitCode, signal, stdout, stderr } = await $({ nothrow: true })`karma start -f=${ target }`;

    if (exitCode === 0) return;

    const output = stdout + stderr;

    // a signal leaves `exitCode` null and means something outside stopped the run - neither a pass
    // nor a browser that deserves another chance
    if (signal || attempt === ATTEMPTS || TEST_FAILURE.test(output) || INFRASTRUCTURE_FAILURES.every(it => !it.test(output))) {
      throw new Error(`${ target } failed`);
    }

    echo(chalk.yellow(`${ target } failed to run the browsers, retrying (${ attempt + 1 } of ${ ATTEMPTS })`));
  }
}
