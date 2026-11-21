// Exercise the shard protocol through a real fork, including diagnostics that look like reports.
import { runShards } from './fixture-shards.mjs';
import { createChecker } from '../polyfill-provider/harness.mjs';
import { fileURLToPath } from 'node:url';

const { check, checkTruthy, finish } = createChecker('fixture-shard-protocol');
const CHILD = fileURLToPath(new URL('./fixture-shard-protocol-child.mjs', import.meta.url));

const totals = await runShards({ script: CHILD, shards: 2 });

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
  ['ARRAY', /must report exactly one result object/u],
  ['DUPLICATE', /must report exactly one result object/u],
  ['SILENT', /produced no result/u],
  ['FATAL', /failed after reporting.*code 2/u],
  ['FRACTIONAL_COUNT', /expected a positive integer shard count, got 2\.5/u, 2.5],
  ['ZERO_COUNT', /expected a positive integer shard count, got 0/u, 0],
]) {
  let failure;
  try {
    await runShards({ script: CHILD, shards, extraEnv: { [`SHARD_PROTOCOL_${ flag }`]: '1' } });
  } catch (error) {
    failure = error;
  }
  checkTruthy(`rejects ${ flag.toLowerCase() } reports`, pattern.test(failure?.message ?? ''));
}

finish();
