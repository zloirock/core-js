import { deepStrictEqual, notStrictEqual, ok, strictEqual } from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { writeFile, mkdtemp, readdir, rm, symlink } from 'node:fs/promises';
import { request } from 'node:http';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const entry = new URL('../../packages/core-js-service-container/index.js', import.meta.url);
const fixtureEntry = new URL('./container-process-fixture.mjs', import.meta.url);
const directory = await mkdtemp(join(tmpdir(), 'core-js-container-process-'));
const children = new Set();

async function freePort() {
  const server = createServer();
  await new Promise((resolve, reject) => server.once('error', reject).listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  return port;
}

function launch(manifestPath, port, extra = {}, { script = entry, ipc = false } = {}) {
  const child = spawn(process.execPath, [fileURLToPath(script)], {
    env: {
      ...process.env,
      HOST: '127.0.0.1', PORT: String(port), CORE_JS_MANIFEST_PATH: manifestPath,
      // Keep the test processes out of any cache configured by the invoking shell.
      CORE_JS_CACHE_DIR: undefined, CORE_JS_IMAGE_DIGEST: undefined,
      ...extra,
    },
    stdio: ['ignore', 'ignore', 'pipe', ...ipc ? ['ipc'] : []],
  });
  children.add(child);
  let errors = '';
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', chunk => { errors += chunk; });
  const exit = new Promise(resolve => child.once('exit', (code, signal) => {
    children.delete(child);
    resolve({ code, signal });
  }));
  return { child, exit, errors: () => errors };
}

function get(port, path, { headers = {}, timeout = 3000 } = {}) {
  return new Promise((resolve, reject) => {
    const client = request({ host: '127.0.0.1', port, path, headers }, response => {
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve({ status: response.statusCode, headers: response.headers,
        body: Buffer.concat(chunks) }));
      response.on('error', reject);
    });
    client.on('error', reject);
    client.setTimeout(timeout, () => client.destroy(new Error(`request timed out: ${ path }`)));
    client.end();
  });
}

async function statusOrNull(port) {
  try {
    return await get(port, '/status', { timeout: 1500 });
  } catch {
    return null;
  }
}

async function failOnExit(exit, label) {
  const result = await exit;
  throw new Error(`${ label }: container exited ${ JSON.stringify(result) }`);
}

async function until(port, predicate, label, exit) {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    const outcome = await Promise.race([statusOrNull(port), failOnExit(exit, label)]);
    if (outcome && predicate(outcome)) return outcome;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`${ label }: timed out`);
}

async function within(promise, label, duration = 5000) {
  let timer;
  try {
    return await Promise.race([promise, new Promise((resolve, reject) => {
      timer = setTimeout(() => reject(new Error(`${ label } timed out`)), duration);
    })]);
  } finally {
    clearTimeout(timer);
  }
}

async function stop(instance) {
  instance.child.kill('SIGTERM');
  return within(instance.exit, 'container shutdown');
}

try {
  const absent = join(directory, 'missing-entry.js');
  const importer = spawn(process.execPath, ['--input-type=module', '--eval',
    `process.argv[1] = ${ JSON.stringify(absent) }; await import(${ JSON.stringify(entry.href) });`],
  { stdio: ['ignore', 'ignore', 'pipe'] });
  let importError = '';
  importer.stderr.setEncoding('utf8');
  importer.stderr.on('data', chunk => { importError += chunk; });
  children.add(importer);
  const importExit = new Promise(resolve => importer.once('exit', code => {
    children.delete(importer);
    resolve(code);
  }));
  strictEqual(await within(importExit, 'passive entry import'), 0,
    `container-process-2 #15: ${ importError }`);

  const invalidPath = join(directory, 'invalid.json');
  await writeFile(invalidPath, '{"modules":["not.a.module"]}');
  const invalidPort = await freePort();
  const invalid = launch(invalidPath, invalidPort);
  const failed = await until(invalidPort, response => response.status === 200 &&
    JSON.parse(response.body).state === 'error', 'invalid manifest', invalid.exit);
  deepStrictEqual(JSON.parse(failed.body), { state: 'error', baselineReady: false, fullyWarmed: false,
    errorCode: 'manifest_invalid' }, 'container-process-1 #1');
  const unavailable = await get(invalidPort, '/polyfills.js');
  strictEqual(unavailable.status, 503, 'container-process-1 #2');
  strictEqual(unavailable.headers['cache-control'], 'no-store', 'container-process-1 #3');
  strictEqual((await get(invalidPort, '/status')).status, 200, 'container-process-1 #4');
  ok(invalid.errors().includes('not.a.module'), 'container-process-1 #5');
  deepStrictEqual(await stop(invalid), { code: 0, signal: null }, 'container-process-2 #1');

  const validPath = join(directory, 'valid.json');
  await writeFile(validPath, '{"modules":["es.array.at","es.object.group-by"]}');
  const validPort = await freePort();
  const cacheDir = join(directory, 'cache');
  const digest = 'a'.repeat(64);
  const valid = launch(validPath, validPort, { CORE_JS_CACHE_DIR: cacheDir, CORE_JS_IMAGE_DIGEST: `sha256:${ digest }` });
  const ready = await until(validPort, response => response.status === 200 &&
    JSON.parse(response.body).baselineReady, 'baseline readiness', valid.exit);
  strictEqual(JSON.parse(ready.body).state, 'ready', 'container-process-1 #6');
  const script = await get(validPort, '/polyfills.js', { headers: { 'accept-encoding': 'identity' } });
  strictEqual(script.status, 200, 'container-process-1 #7');
  strictEqual(script.headers['cache-control'], 'private, no-cache', 'container-process-1 #8');
  ok(script.body.includes(Buffer.from('core-js')), 'container-process-1 #9');
  const cached = await get(validPort, '/polyfills.js', { headers: { 'accept-encoding': 'identity',
    'if-none-match': script.headers.etag } });
  strictEqual(cached.status, 304, 'container-process-1 #10');
  notStrictEqual(script.headers.etag, undefined, 'container-process-1 #11');
  const warmed = await until(validPort, response => JSON.parse(response.body).fullyWarmed,
    'full warm-up', valid.exit);
  strictEqual(JSON.parse(warmed.body).state, 'ready', 'container-process-1 #12');
  ok((await readdir(join(cacheDir, digest))).length > 0, 'container-cache-1 #8');

  deepStrictEqual(await stop(valid), { code: 0, signal: null }, 'container-process-2 #4');

  const linkPath = join(directory, 'container-entry.js');
  await symlink(fileURLToPath(entry), linkPath);
  const linkedPort = await freePort();
  const linked = launch(validPath, linkedPort, {}, { script: pathToFileURL(linkPath) });
  const linkedStatus = await until(linkedPort, response => response.status === 200 &&
    JSON.parse(response.body).baselineReady, 'linked entry readiness', linked.exit);
  strictEqual(JSON.parse(linkedStatus.body).state, 'ready', 'container-process-2 #13');
  deepStrictEqual(await stop(linked), { code: 0, signal: null }, 'container-process-2 #14');

  const planPort = await freePort();
  const plan = launch(validPath, planPort, { CONTAINER_PLAN_FAILURE: '1' }, { script: fixtureEntry, ipc: true });
  const planStatus = await until(planPort, response => JSON.parse(response.body).state === 'error',
    'plan failure', plan.exit);
  deepStrictEqual(JSON.parse(planStatus.body), { state: 'error', baselineReady: false,
    fullyWarmed: false, errorCode: 'plan_failed' }, 'container-process-1 #13');
  const planScript = await get(planPort, '/polyfills.js');
  strictEqual(planScript.status, 503, 'container-process-1 #14');
  strictEqual(planScript.headers['cache-control'], 'no-store', 'container-process-1 #15');
  ok(plan.errors().includes('fixture plan failure'), 'container-process-1 #16');
  plan.child.disconnect();
  deepStrictEqual(await stop(plan), { code: 0, signal: null }, 'container-process-2 #11');

  for (const phase of ['before_headers', 'after_headers']) {
    const failurePort = await freePort();
    const failure = launch(validPath, failurePort, { CONTAINER_REQUEST_FAILURE: phase },
      { script: fixtureEntry, ipc: true });
    await until(failurePort, response => JSON.parse(response.body).baselineReady,
      `${ phase } request failure readiness`, failure.exit);
    if (phase === 'before_headers') {
      const response = await get(failurePort, '/polyfills.js');
      strictEqual(response.status, 500, 'container-http-3 #14');
      strictEqual(response.headers['cache-control'], 'no-store', 'container-http-3 #15');
    } else {
      await new Promise((resolve, reject) => {
        const client = request({ host: '127.0.0.1', port: failurePort, path: '/polyfills.js' }, response => {
          response.on('aborted', resolve);
          response.on('error', error => error.code === 'ECONNRESET' ? resolve() : reject(error));
          response.on('end', () => reject(new Error('partial response completed')));
          response.resume();
        });
        client.on('error', error => error.code === 'ECONNRESET' ? resolve() : reject(error));
        client.setTimeout(3000, () => client.destroy(new Error('response did not finish')));
        client.end();
      });
    }
    strictEqual((await get(failurePort, '/status')).status, 200, 'container-http-3 #16');
    deepStrictEqual(await stop(failure), { code: 0, signal: null }, 'container-http-3 #17');
    strictEqual(failure.errors().split('fixture script failed').length - 1, 1,
      'container-http-3 #18');
  }

  const heldPort = await freePort();
  const held = launch(validPath, heldPort, {}, { script: fixtureEntry, ipc: true });
  await until(heldPort, response => JSON.parse(response.body).baselineReady,
    'held handler readiness', held.exit);
  const accepted = new Promise(resolve => held.child.once('message', resolve));
  const inflight = get(heldPort, '/polyfills.js', { headers: { connection: 'close' }, timeout: 5000 });
  strictEqual(await within(Promise.race([accepted, failOnExit(held.exit, 'accepted request')]), 'accepted request'),
    'accepted', 'container-process-2 #2');
  const shuttingDown = new Promise(resolve => held.child.once('message', resolve));
  held.child.kill('SIGINT');
  strictEqual(await within(Promise.race([shuttingDown, failOnExit(held.exit, 'shutdown signal')]), 'shutdown signal'),
    'shutdown received', 'container-process-2 #12');
  held.child.send('finish');
  const response = await inflight;
  held.child.disconnect();
  strictEqual(response.status, 200, 'container-process-2 #3');
  strictEqual(response.body.toString(), 'accepted request completed', 'container-process-2 #9');
  deepStrictEqual(await within(held.exit, 'held container shutdown'),
    { code: 0, signal: null }, `container-process-2 #10: ${ held.errors() }`);

  const badSettings = launch(validPath, await freePort(), { PORT: 'invalid' });
  const outcome = await within(badSettings.exit, 'invalid settings exit');
  notStrictEqual(outcome.code, 0, 'container-process-2 #5');
  ok(badSettings.errors().includes('PORT'), 'container-process-2 #6');

  const occupied = createServer();
  await new Promise((resolve, reject) => occupied.once('error', reject).listen(0, '127.0.0.1', resolve));
  try {
    const listener = launch(validPath, occupied.address().port);
    const result = await within(listener.exit, 'listener failure exit');
    notStrictEqual(result.code, 0, 'container-process-2 #7');
    ok(listener.errors().includes('EADDRINUSE'), 'container-process-2 #8');
  } finally {
    await new Promise((resolve, reject) => occupied.close(error => error ? reject(error) : resolve()));
  }
} finally {
  const active = [...children];
  for (const child of active) child.kill('SIGKILL');
  await Promise.all(active.map(child => new Promise(resolve => child.once('exit', resolve))));
  await rm(directory, { recursive: true, force: true });
}
