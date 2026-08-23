// The shard protocol's own contract, exercised through a real fork rather than against a copy of the
// regex: what a child may put in a payload, and how the parent merges what comes back.
//
// Both halves are load-bearing and both have failed. A payload naming `@rollup/...` used to leave the
// shard reported as having said nothing, and one containing `@@` used to be matched and then torn in
// half at `JSON.parse`. The marker now opens a line instead, which only holds because
// `emitShardSummary` writes a newline first - the child below ends its output without one.
import { runShards } from './fixture-shards.mjs';
import { createChecker } from '../polyfill-provider/harness.mjs';
import { fileURLToPath } from 'node:url';

const { check, checkTruthy, finish } = createChecker('fixture-shard-protocol');
const CHILD = fileURLToPath(new URL('./fixture-shard-protocol-child.mjs', import.meta.url));

const totals = await runShards({ script: CHILD, shards: 2 });

check('numbers add up across shards', totals.passed, 3);
check('arrays concatenate rather than summing', totals.rows.length, 2);
check('and arrive in shard order', totals.rows.map(row => row.shard).join(','), '0,1');
checkTruthy('a payload naming a package survives the marker',
  totals.rows.every(row => row.error.includes('@rollup/plugin-babel')));
checkTruthy('so does one carrying `@@`', totals.rows.every(row => row.error.includes('@@ inside')));

let refused = null;
try {
  await runShards({ script: CHILD, shards: 1, extraEnv: { SHARD_PROTOCOL_BAD: '1' } });
} catch (error) {
  refused = error;
}
checkTruthy('a value that is neither number nor array is refused, not guessed at',
  /only numbers and arrays merge/u.test(refused?.message ?? ''));

let silent = null;
try {
  await runShards({ script: CHILD, shards: 1, extraEnv: { SHARD_PROTOCOL_SILENT: '1' } });
} catch (error) {
  silent = error;
}
checkTruthy('a shard that exits having reported nothing fails the run loudly',
  /produced no result/u.test(silent?.message ?? ''));

finish();
