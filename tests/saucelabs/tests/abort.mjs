import { deepEqual, doesNotMatch, equal, rejects } from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setImmediate } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const scenarios = ['polling', 'starting', 'retrying', 'annotating', 'annotation-error', 'annotating-failed', 'closing'];

if (fileURLToPath(import.meta.url) !== process.argv[1]) {
  const sessionsDir = await mkdtemp(join(tmpdir(), 'saucelabs-abort-'));
  const failures = [];
  try {
    for (const scenario of scenarios) {
      const sessionsFile = join(sessionsDir, scenario);
      try {
        await $({ quiet: true, timeout: '4s', timeoutSignal: 'SIGKILL',
          env: { ...process.env, SAUCE_SESSIONS_FILE: sessionsFile } })`node tests/saucelabs/tests/abort.mjs ${ scenario }`;
        equal(await readFile(sessionsFile, 'utf8'), '', 'the session list is empty');
      } catch (error) {
        failures.push(`${ scenario }: ${ error.message }`);
      }
    }
  } finally {
    await rm(sessionsDir, { recursive: true });
  }
  equal(failures.length, 0, failures.join('\n'));
  echo(chalk.green('Sauce Labs run abort tested'));
} else {
  const [scenario] = process.argv.slice(2);
  const sessionsFile = process.env.SAUCE_SESSIONS_FILE;
  const commit = 'a'.repeat(40);
  const otherCommit = 'b'.repeat(40);
  const page = 'unit-browser/global.html';
  const pageUrl = `http://example.test/branch/${ page }`;

  if (!scenarios.includes(scenario)) throw new Error(`Unknown abort scenario: ${ scenario }`);
  if (!sessionsFile) throw new Error('SAUCE_SESSIONS_FILE is required by the abort scenario');

  function deferred() {
    let resolve;
    const promise = new Promise(resolvePromise => { resolve = resolvePromise; });
    return { promise, resolve };
  }

  process.env.SAUCE_USERNAME = 'test';
  process.env.SAUCE_ACCESS_KEY = 'test';
  globalThis.$ = {};
  globalThis.argv = { _: ['http://example.test/branch', commit] };
  globalThis.chalk = { cyan: String, green: String, red: String, yellow: String };

  const ready = deferred();
  const release = deferred();
  const annotating = ['annotating', 'annotation-error', 'annotating-failed'].includes(scenario);
  const otherPassed = scenario !== 'annotating-failed';
  const otherFinished = annotating || scenario === 'closing';
  const opened = [];
  const closed = [];
  const annotations = [];
  const output = [];
  let navigations = 0;
  let stopped = false;
  let pollsAfterStop = 0;

  function waitForAbort() {
    ready.resolve();
    return release.promise;
  }

  globalThis.echo = message => output.push(message);
  globalThis.fetch = async (url, options = {}) => {
    const path = new URL(url).pathname;
    if (path.endsWith('/commit.txt')) return { ok: true, text: async () => commit };
    if (path.endsWith('/concurrency')) return { ok: true, json: async () => ({ concurrency: {
      organization: { allowed: { vms: 3, mac_vms: 2 } }, team: { allowed: { vms: 3, mac_vms: 2 } },
    } }) };
    const [id] = path.slice('/wd/hub/session/'.length).split('/');
    let payload = {};
    if (path === '/wd/hub/session') {
      const { name } = JSON.parse(options.body).desiredCapabilities;
      opened.push(name);
      if (name === 'other' && scenario === 'starting') await waitForAbort();
      payload = { sessionId: name };
    } else if (options.method === 'DELETE') {
      if (id === 'other' && scenario === 'closing') await waitForAbort();
      closed.push(id);
    } else if (path.endsWith('/url')) {
      navigations++;
      if (id === 'other' && scenario === 'retrying') payload = { status: 13, value: { message: 'navigation failed' } };
    } else {
      const { script } = JSON.parse(options.body);
      if (script.startsWith('sauce:job-result=')) {
        annotations.push([id, script]);
        if (id === 'other' && (annotating || scenario === 'retrying')) {
          await waitForAbort();
          if (scenario === 'annotation-error') throw new Error('annotation unavailable');
        }
        if (id === 'changing') release.resolve();
      } else if (script.startsWith('var results = ')) {
        if (stopped) pollsAfterStop++;
        if (id === 'changing') {
          await ready.promise;
          // Let the other page enter its polling wait before the mismatch arrives.
          await setImmediate();
          stopped = true;
        } else if (!otherFinished) ready.resolve();
        payload = { value: JSON.stringify({ url: pageUrl, commits: [id === 'changing' ? otherCommit : commit],
          results: { done: id === 'other' && otherFinished } }) };
      }
    }
    return { ok: true, text: async () => JSON.stringify(payload) };
  };

  const { run } = await import('../helpers.mjs');
  await rejects(run({
    name: 'unit', pages: otherFinished ? [page] : [page, 'unit-browser/pure.html'], reporter: 'qunitResults',
    pollInterval: 100,
    platforms: ['changing', 'other', 'queued'].map(name => ({ name, pool: 'mac_vms', w3c: false, capabilities: {} })),
    evaluate: () => {
      if (!otherFinished) throw new Error('foreign or unfinished results must not be evaluated');
      return { passed: otherPassed, summary: otherPassed ? 'ok' : 'assertion failed', details: [] };
    },
  }), { message: `Sauce Labs run stopped: ${ page }: bundles of ${ otherCommit } instead of ${ commit }` }, scenario);
  deepEqual(opened, ['changing', 'other'], `${ scenario }: no queued platform or retry starts`);
  deepEqual(closed.sort(), ['changing', 'other'], `${ scenario }: every created session closes`);
  const otherResults = scenario === 'closing' ? ['passed'] : ['failed'];
  if (annotating && otherPassed) otherResults.push('passed');
  deepEqual(annotations.sort(), [
    ['changing', 'sauce:job-result=failed'],
    ...otherResults.map(result => ['other', `sauce:job-result=${ result }`]),
  ], `${ scenario }: session results reflect when the abort happened`);
  equal(navigations, scenario === 'starting' ? 1 : 2, `${ scenario }: no further page starts`);
  equal(pollsAfterStop, 0, `${ scenario }: the stop interrupts a polling wait, no page is polled after it`);
  doesNotMatch(output.join('\n'), /all the browsers passed|retrying/, `${ scenario }: no retry or success is reported`);
}
