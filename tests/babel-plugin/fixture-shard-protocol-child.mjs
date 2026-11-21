// The child half of fixture-shard-protocol.mjs, forked by runShards.
import { FIXTURE_SHARD, emitShardSummary } from './fixture-shards.mjs';

const [index] = FIXTURE_SHARD.split('/', 1);

// Ordinary output deliberately resembles the old report format and lacks a trailing newline.
process.stdout.write(`[fixture-shard-protocol] shard ${ index }: @@FIXTURE-SHARD@@{ordinary output}@@`);

// SILENT exits cleanly having said nothing - the sneakier half of "produced no result", since a crash
// is loud on its own while a silent zero would just vanish from the totals
if (!process.env.SHARD_PROTOCOL_SILENT) {
  if (process.env.SHARD_PROTOCOL_DUPLICATE) emitShardSummary({ passed: 1 });
  if (process.env.SHARD_PROTOCOL_BAD) emitShardSummary({ passed: 'not a number' });
  else if (process.env.SHARD_PROTOCOL_MIXED) emitShardSummary({ passed: index === '0' ? 1 : [2] });
  else if (process.env.SHARD_PROTOCOL_ARRAY) emitShardSummary([]);
  else emitShardSummary({
    passed: Number(index) + 1,
    rows: [{ shard: Number(index), error: 'Cannot find module @rollup/plugin-babel @@ inside, separators \u2028\u2029, ends with @' }],
  });
}

if (process.env.SHARD_PROTOCOL_FATAL) process.exitCode = 2;
