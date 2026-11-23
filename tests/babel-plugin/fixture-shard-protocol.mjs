// Exercise the shard protocol through a real fork, including diagnostics that look like reports.
import { runShards } from './fixture-shards.mjs';
import { createChecker } from '../polyfill-provider/harness.mjs';
import { fileURLToPath } from 'node:url';

const { check, checkTruthy, finish } = createChecker('fixture-shard-protocol');
const CHILD = fileURLToPath(new URL('./fixture-shard-protocol-child.mjs', import.meta.url));

const dir = await fs.mkdtemp(path.join(import.meta.dirname, 'fixture-shard-protocol-'));
const output = [];
let totals;
try {
  totals = await runShards({
    script: CHILD,
    shards: 2,
    extraEnv: { SHARD_PROTOCOL_ORDER: path.join(dir, 'ready') },
    print: line => output.push(line),
  });
  const fixture = 'entry-global/import-es-chrome-135-v4.0';
  const root = path.join(import.meta.dirname, '../transpiler-fixtures');
  for (const shard of ['1/1', '0/0', 'bad', '0/9007199254740992']) {
    const result = await $({
      cwd: import.meta.dirname,
      env: { ...process.env, FIXTURE_SHARD: shard, FIXTURE_SUBTREE: fixture },
      quiet: true,
      nothrow: true,
    })`zx index.mjs`;
    check(`invalid shard ${ shard } fails the command`, result.exitCode, 1);
    checkTruthy(`names the invalid shard ${ shard }`, result.stderr.includes(`invalid FIXTURE_SHARD '${ shard }'`));
  }
  await fs.copy(path.join(root, fixture), dir);
  await fs.writeFile(path.join(dir, 'output.mjs'), 'export default 123456;');
  const manual = await $({
    cwd: import.meta.dirname,
    env: { ...process.env, FIXTURE_SHARD: '0/1', FIXTURE_SUBTREE: path.relative(root, dir), OVERWRITE: '' },
    quiet: true,
    nothrow: true,
  })`zx index.mjs`;
  check('standalone shard reports its failed fixture', JSON.parse(manual.stdout.trimEnd().split('\n').at(-1)).failed, 1);
  check('standalone shard fails the command', manual.exitCode, 1);
} finally {
  try {
    await fs.remove(dir);
  } catch (error) {
    console.warn(`could not remove ${ dir }: ${ error.message }`);
  }
}
check('replays both shard logs in order with complete UTF-8 characters', output.join('\n'),
  [0, 1].map(index => `[fixture-shard-protocol] shard ${ index }: @@FIXTURE-SHARD@@{ordinary output}@@🌍`).join('\n'));

check('numbers add up across shards', totals.passed, 3);
check('arrays concatenate rather than summing', totals.rows.length, 2);
check('and arrive in shard order', totals.rows.map(row => row.shard).join(','), '0,1');
checkTruthy('a payload naming a package survives transport',
  totals.rows.every(row => row.error.includes('@rollup/plugin-babel')));
checkTruthy('so does one carrying `@@`', totals.rows.every(row => row.error.includes('@@ inside')));
checkTruthy('Unicode line separators survive transport', totals.rows.every(row => row.error.includes('\u2028\u2029')));

for (const [flag, pattern, shards = 2] of [
  ['BAD', /incompatible values for shard key `passed`/u],
  ['MIXED', /incompatible values for shard key `passed`/u],
  ['REVERSE', /shard 1\/2: incompatible values for shard key `passed`/u],
  ['NULL', /shard 0\/2 must report exactly one result object/u],
  ['STRING', /shard 0\/2 must report exactly one result object/u],
  ['EARLY_EXIT', /produced no result.*code 2/u],
  ['ARRAY', /must report exactly one result object/u],
  ['DUPLICATE', /must report exactly one result object/u],
  ['SILENT', /produced no result/u],
  ['FATAL', /failed after reporting.*code 2/u],
  ['FRACTIONAL_COUNT', /expected a positive integer shard count, got 2\.5/u, 2.5],
  ['ZERO_COUNT', /expected a positive integer shard count, got 0/u, 0],
]) {
  let failure;
  const logs = [];
  try {
    await runShards({ script: CHILD, shards, extraEnv: { [`SHARD_PROTOCOL_${ flag }`]: '1' }, print: line => logs.push(line) });
  } catch (error) {
    failure = error;
  }
  checkTruthy(`rejects ${ flag.toLowerCase() } reports`, pattern.test(failure?.message ?? ''));
  if (flag === 'BAD') check('also prints later shards after a merge failure', logs.length, shards);
}

finish();
