// process-level sharding for the transpiler-fixture runners (babel-plugin / unplugin),
// mirroring the transpiler-differential parent/shard protocol: the parent re-forks its own
// zx script N times with `FIXTURE_SHARD=k/N`, each child runs a deterministic slice and
// reports its result over the fork IPC channel; failure / rewrite lines stream
// through the buffered child output. children run through the zx CLI so the runner scripts
// keep their zx globals without a zxi round-trip (deps are already installed by the parent's zxi)
import { fork } from 'node:child_process';
import { createRequire } from 'node:module';
import { kill } from 'zx';
import { loadBabelOptions } from './fixture-options.mjs';

export const { FIXTURE_SHARD } = process.env;

// deterministic slice of this shard's fixtures; the list must arrive identically sorted in
// every process (the runners sort their directory walks)
export function shardSlice(list) {
  const found = /^(?<index>\d+)\/(?<total>\d+)$/u.exec(FIXTURE_SHARD);
  const index = Number(found?.groups.index);
  const total = Number(found?.groups.total);
  if (!Number.isSafeInteger(total) || index >= total) {
    throw new Error(`invalid FIXTURE_SHARD '${ FIXTURE_SHARD }': expected index/total with 0 <= index < total`);
  }
  return list.filter((_, i) => i % total === index);
}

// Keep results separate from stdout: diagnostics can print arbitrary fixture text.
export function emitShardSummary(payload, failed = false) {
  if (process.send) process.send(payload);
  else {
    console.log(JSON.stringify(payload));
    if (failed) process.exitCode = 1;
  }
}

function zxCliPath() {
  const req = createRequire(import.meta.url);
  const pkg = req('zx/package.json');
  const bin = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin.zx;
  return path.join(path.dirname(req.resolve('zx/package.json')), bin);
}

// Collect sorted fixture directories for both plugin runners and shared invariants;
// shard slices must be identical across processes. Validate source size and plugin
// configuration before either skipping or regeneration can hide an invalid fixture.
export async function collectFixtures(directory, out = []) {
  const names = (await fs.readdir(directory)).sort();
  if (names.includes('input.mjs')) {
    const source = await fs.readFile(path.join(directory, 'input.mjs'), 'utf8');
    checkFixtureSize(source, directory);
    const options = await loadBabelOptions(directory);
    if (!Array.isArray(options?.plugins) || options.plugins.every(plugin => !Array.isArray(plugin) || plugin[0] !== '@core-js')) {
      throw new Error(`fixture options: ${ directory } must declare plugins: [["@core-js", { ... }]]`);
    }
    out.push(directory);
    return out;
  }
  const before = out.length;
  for (const name of names) {
    const subdirectory = path.join(directory, name);
    if ((await fs.stat(subdirectory)).isDirectory()) await collectFixtures(subdirectory, out);
  }
  // a directory that is neither a fixture nor a container of one is read by NO runner: the walk
  // drops it here, so it never reaches a counter, and the reconciliation downstream cannot miss it
  // either - that check compares counters against what was COLLECTED, and this never was
  if (out.length === before) throw new Error(`fixture tree: ${ directory } holds no input.mjs and no fixture below it`);
  return out;
}

// Count source lines, including trivia, before any skip or OVERWRITE path can admit a fixture.
// An exception carries its own ceiling so an indivisible regression cannot grow unchecked.
export function checkFixtureSize(source, directory) {
  const rows = source.split(/\r\n|[\n\r\u{2028}\u{2029}]/u);
  const lines = source ? rows.length - Number(/[\n\r\u{2028}\u{2029}]$/u.test(source)) : 0;
  const [first] = rows;
  const directive = /^\/\/ fixture-size: (?<maxLines>\d+) -- \S.*$/u.exec(first);
  const limit = directive ? Number(directive.groups.maxLines) : 30;
  if (/^\/\/\s*fixture-size\b/u.test(first) && (!directive || !Number.isSafeInteger(limit) || limit <= 30)) {
    throw new Error(`fixture size: ${ directory } has an invalid fixture-size directive`);
  }
  if (lines <= 30) {
    if (directive) throw new Error(`fixture size: ${ directory } no longer needs a fixture-size directive`);
    return;
  }
  if (lines > limit) {
    throw new Error(`fixture size: ${ directory } has ${ lines } lines (limit ${ limit }); split independent claims`);
  }
}

export function defaultShardCount(fixtureCount) {
  const wanted = Number(process.env.FIXTURE_SHARDS) || Math.max(1, Math.floor(os.cpus().length / 2));
  // no point forking more shards than a sensible minimum slice per process - the child pays
  // a full plugin-stack import either way
  return Math.max(1, Math.min(wanted, Math.ceil(fixtureCount / 200)));
}

// fork one child per shard through the zx CLI, merge what they report - counters add up, lists
// concatenate in shard order, anything else is refused by name - replay each child's
// buffered output (only failures and real rewrites are printed by the runners). a child
// that dies without reporting fails the run loudly instead of vanishing from the totals.
// runner parameters travel via `extraEnv`, not CLI args - the zx CLI keeps the script name
// in `argv._`, so positional args would land off-by-one against the zxi-invoked parent
export async function runShards({ script, shards, extraEnv = {}, print = echo, timeout = 45 * 60_000 }) {
  if (!Number.isSafeInteger(shards) || shards < 1) throw new Error(`expected a positive integer shard count, got ${ shards }`);
  if (!Number.isInteger(timeout) || timeout < 1 || timeout > 2 ** 31 - 1) throw new Error(`invalid shard deadline: ${ timeout }ms`);

  const cli = zxCliPath();
  const output = Array(shards).fill('');
  const active = new Set();
  const fields = new Map();
  const { promise: stopped, resolve: finishStop } = Promise.withResolvers();
  let failure;
  let stopTimer;
  let stopping;
  function running(child) {
    return child.pid && child.exitCode === null && child.signalCode === null;
  }

  async function stopShard(child) {
    if (!running(child)) return;
    try {
      await kill(child.pid, 'SIGKILL');
    } catch {
      if (running(child)) child.kill('SIGKILL');
    }
  }

  function fail(error) {
    if (failure) return;
    failure = error;
    // Join cancellation before returning, or release the pipes on the cleanup deadline.
    // eslint-disable-next-line promise/no-promise-in-callback -- collected alongside the shard results
    stopping = Promise.all([...active].map(stopShard));
    stopTimer = setTimeout(() => {
      for (const child of active) {
        if (running(child)) child.kill('SIGKILL');
        child.stdout?.destroy();
        if (child.connected) child.disconnect();
        child.unref();
      }
      finishStop();
    }, 10_000);
  }

  const deadline = setTimeout(() => fail(new Error(`fixture shards did not finish within ${ timeout }ms`)), timeout);
  let results;
  try {
    const runs = Array.from({ length: shards }, (_, index) => new Promise(resolve => {
      if (failure) {
        resolve();
        return;
      }
      const shard = `fixture shard ${ index }/${ shards }`;
      let child;
      try {
        child = fork(cli, [script], {
          execArgv: [],
          env: { ...process.env, ...extraEnv, FIXTURE_SHARD: `${ index }/${ shards }`, FORCE_COLOR: '1' },
          stdio: ['ignore', 'pipe', 'inherit', 'ipc'],
        });
      } catch (error) {
        fail(new Error(`${ shard } process error: ${ error.message }`, { cause: error }));
        resolve();
        return;
      }
      active.add(child);
      let payload;
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', data => { output[index] += data; });
      child.on('message', message => {
        if (payload !== undefined || !message || typeof message !== 'object' || Array.isArray(message)) {
          fail(new Error(`${ shard } must report exactly one result object`));
          return;
        }
        for (const [key, value] of Object.entries(message)) {
          const array = Array.isArray(value);
          const seen = fields.get(key);
          if (!array && typeof value !== 'number') {
            fail(new Error(`${ shard }: invalid value for shard key \`${ key }\` - expected a number or an array`));
            return;
          }
          if (seen && seen.array !== array) {
            fail(new Error(`fixture shards ${ Math.min(index, seen.index) } and ${ Math.max(index, seen.index) }/${ shards }: incompatible values for shard key \`${ key }\``));
            return;
          }
          if (!seen) fields.set(key, { array, index });
        }
        payload = message;
      });
      child.on('error', error => fail(new Error(`${ shard } process error: ${ error.message }`, { cause: error })));
      // A descendant can keep stdout open after the shard has already failed.
      function checkExit(code, signal) {
        if (code === null && signal === null) return;
        // A clean exit needs the final IPC message before it can be called silent.
        if (code === 0 && child.connected) return;
        if (payload === undefined) fail(new Error(`${ shard } produced no result (code ${ code }, signal ${ signal })`));
        else if (code !== 0) fail(new Error(`${ shard } failed after reporting (code ${ code }, signal ${ signal })`));
      }
      child.once('exit', checkExit);
      child.once('disconnect', () => checkExit(child.exitCode, child.signalCode));
      child.once('close', () => {
        active.delete(child);
        resolve(payload);
      });
    }));
    async function collect() {
      const summaries = await Promise.all(runs);
      await stopping;
      return summaries;
    }
    results = await Promise.race([collect(), stopped]);
  } finally {
    clearTimeout(deadline);
    clearTimeout(stopTimer);
    for (const lines of output) {
      if (lines.trim()) print(lines.trimEnd());
    }
  }
  if (failure) throw failure;
  const totals = Object.create(null);
  for (const payload of results) {
    for (const [key, value] of Object.entries(payload)) {
      if (Array.isArray(value)) totals[key] = (totals[key] ?? []).concat(value);
      else totals[key] = (totals[key] ?? 0) + value;
    }
  }
  return totals;
}
