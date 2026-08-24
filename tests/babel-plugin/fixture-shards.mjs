// process-level sharding for the transpiler-fixture runners (babel-plugin / unplugin),
// mirroring the transpiler-differential parent/shard protocol: the parent re-forks its own
// zx script N times with `FIXTURE_SHARD=k/N`, each child runs a deterministic slice and
// reports its counters through a stdout marker; failure / rewrite lines stream through the
// buffered child output. children run through the zx CLI so the runner scripts keep their
// zx globals without a zxi round-trip (deps are already installed by the parent's zxi)
import { fork } from 'node:child_process';
import { createRequire } from 'node:module';

const MARKER = /@@FIXTURE-SHARD@@(?<json>[^@]*)@@/u;

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

// the walk COLLECTS (sorted - readdir order is OS-dependent and the shard slices must be
// identical across processes); a fixture directory is one holding `input.mjs`. shared by
// the recursive-corpus runners (babel-plugin, ast-engine); the text runner keeps its own
// two-level collect because its walk is method-scoped
export async function collectFixtures(directory, out = []) {
  const names = (await fs.readdir(directory)).sort();
  if (names.includes('input.mjs')) {
    out.push(directory);
    return out;
  }
  for (const name of names) {
    const subdirectory = path.join(directory, name);
    if ((await fs.stat(subdirectory)).isDirectory()) await collectFixtures(subdirectory, out);
  }
  return out;
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
    child.stdout.on('data', data => { buf += data; });
    child.on('error', reject);
    child.on('exit', (code, signal) => {
      const found = MARKER.exec(buf);
      // child output is replayed VERBATIM (minus the marker) - assertion diffs carry
      // meaningful blank lines that a cosmetic collapse would corrupt
      const output = buf.replace(MARKER, '');
      if (!found) {
        return reject(new Error(`fixture shard ${ index }/${ shards } produced no result `
          + `(code ${ code }, signal ${ signal })\n${ output }`));
      }
      resolve({ counts: JSON.parse(found.groups.json), output });
    });
  }));
  const results = await Promise.all(runs);
  const totals = {};
  for (const { counts, output } of results) {
    for (const [key, value] of Object.entries(counts)) totals[key] = (totals[key] ?? 0) + value;
    const trimmed = output.trim();
    if (trimmed) echo(trimmed);
  }
  return totals;
}
