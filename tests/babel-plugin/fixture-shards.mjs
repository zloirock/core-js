// process-level sharding for the transpiler-fixture runners (babel-plugin / unplugin),
// mirroring the transpiler-differential parent/shard protocol: the parent re-forks its own
// zx script N times with `FIXTURE_SHARD=k/N`, each child runs a deterministic slice and
// reports its counters through a stdout marker; failure / rewrite lines stream through the
// buffered child output. children run through the zx CLI so the runner scripts keep their
// zx globals without a zxi round-trip (deps are already installed by the parent's zxi)
import { fork } from 'node:child_process';
import { createRequire } from 'node:module';
import { loadBabelOptions } from './fixture-options.mjs';

// `.*` (greedy to the line's last `@@`), never `[^@]*`: the counters carry per-reason keys, and one
// of them - `skip:no @core-js plugin in options` - holds the delimiter's own character. The marker
// then matched nothing at all and the shard's entire verdict set was reported as "produced no
// result", naming neither the fixture nor the reason. The payload is one line, so `.` cannot leave it
const MARKER = /(?:^|\n)@@FIXTURE-SHARD@@(?<json>.*)@@\r?\n?$/u;

export const { FIXTURE_SHARD } = process.env;

// deterministic slice of this shard's fixtures; the list must arrive identically sorted in
// every process (the runners sort their directory walks)
export function shardSlice(list) {
  const found = /^(?<index>\d+)\/(?<total>\d+)$/u.exec(FIXTURE_SHARD);
  const index = Number(found.groups.index);
  const total = Number(found.groups.total);
  return list.filter((_, i) => i % total === index);
}

// the child's final line: counters for the parent, machine-parseable and colorless
export function emitShardSummary(counts) {
  process.stdout.write(`@@FIXTURE-SHARD@@${ JSON.stringify(counts) }@@\n`);
}

function zxCliPath() {
  const req = createRequire(import.meta.url);
  const pkg = req('zx/package.json');
  const bin = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin.zx;
  return path.join(path.dirname(req.resolve('zx/package.json')), bin);
}

// Project fixtures may link packages. Follow a directory link unless it points back into this walk.
async function linkedDirectory(directory, ancestors) {
  try {
    const target = await fs.realpath(directory);
    if (!(await fs.stat(target)).isDirectory()) return false;
    const parents = await Promise.all(ancestors.map(ancestor => fs.realpath(ancestor)));
    return !parents.includes(target);
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ELOOP') return false;
    throw error;
  }
}

// Collect sorted fixture directories for both plugin runners and shared invariants;
// shard slices must be identical across processes. Validate source size and plugin
// configuration before either skipping or regeneration can hide an invalid fixture.
export async function visitFixtures(directory, visit, insideFixture = false, ancestors = []) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const isFixture = entries.some(entry => entry.name === 'input.mjs');
  if (isFixture) {
    const source = await fs.readFile(path.join(directory, 'input.mjs'), 'utf8');
    checkFixtureSize(source, directory);
    const options = await loadBabelOptions(directory);
    if (!Array.isArray(options?.plugins) || options.plugins.every(plugin => !Array.isArray(plugin) || plugin[0] !== '@core-js')) {
      throw new Error(`fixture options: ${ directory } must declare plugins: [["@core-js", { ... }]]`);
    }
    await visit(directory, source, options);
  }
  const directories = [];
  ancestors.push(directory);
  for (const entry of entries) {
    const subdirectory = path.join(directory, entry.name);
    if (entry.isDirectory() || (entry.isSymbolicLink() && await linkedDirectory(subdirectory, ancestors))) directories.push(subdirectory);
  }
  let count = Number(isFixture);
  for (const subdirectory of directories.sort()) count += await visitFixtures(subdirectory, visit, insideFixture || isFixture, ancestors);
  ancestors.pop();
  // Fixtures can ship local packages and other test assets alongside their input.
  if (!insideFixture && !isFixture && !directories.length) throw new Error(`fixture tree: ${ directory } holds no input.mjs and no fixture below it`);
  return count;
}

// Shard coordinators retain paths only. A single-pass consumer can use the validated input directly.
export async function collectFixtures(directory, out = []) {
  await visitFixtures(directory, fixture => out.push(fixture));
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

// fork one child per shard through the zx CLI, aggregate counters, replay each child's
// buffered output (only failures and real rewrites are printed by the runners). a child
// that dies without reporting fails the run loudly instead of vanishing from the totals.
// runner parameters travel via `extraEnv`, not CLI args - the zx CLI keeps the script name
// in `argv._`, so positional args would land off-by-one against the zxi-invoked parent
export async function runShards({ script, shards, extraEnv = {} }) {
  const cli = zxCliPath();
  const runs = Array.from({ length: shards }, (_, index) => new Promise((resolve, reject) => {
    const child = fork(cli, [script], {
      execArgv: [],
      env: { ...process.env, ...extraEnv, FIXTURE_SHARD: `${ index }/${ shards }`, FORCE_COLOR: '1' },
      stdio: ['ignore', 'pipe', 'inherit', 'ipc'],
    });
    let buf = '';
    child.stdout.setEncoding('utf8').on('data', data => { buf += data; });
    child.on('error', reject);
    child.on('close', (code, signal) => {
      const found = MARKER.exec(buf);
      // child output is replayed VERBATIM (minus the marker) - assertion diffs carry
      // meaningful blank lines that a cosmetic collapse would corrupt
      const output = buf.replace(MARKER, '');
      if (code !== 0 || !found) {
        return reject(new Error(`fixture shard ${ index }/${ shards } ${ found ? 'exited abnormally' : 'produced no result' } `
          + `(code ${ code }, signal ${ signal })\n${ output }`));
      }
      try {
        const counts = JSON.parse(found.groups.json);
        if (!counts || !Object.hasOwn(counts, 'passed') || Object.values(counts).some(value => !Number.isSafeInteger(value) || value < 0)) {
          throw new Error('expected non-negative integer counters including passed');
        }
        resolve({ counts, output });
      } catch (error) {
        reject(new Error(`fixture shard ${ index }/${ shards } reported invalid counters\n${ buf }`, { cause: error }));
      }
    });
  }));
  const results = await Promise.all(runs);
  const totals = Object.create(null);
  for (const { counts, output } of results) {
    for (const [key, value] of Object.entries(counts)) totals[key] = (totals[key] ?? 0) + value;
    const trimmed = output.trim();
    if (trimmed) echo(trimmed);
  }
  return { ...totals };
}
