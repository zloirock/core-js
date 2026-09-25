// The child half of `fixture-shard-protocol.mjs`, forked by `runShards`. It writes output that does
// NOT end in a newline and then reports a payload carrying every shape the marker has to survive.
import { FIXTURE_SHARD, emitShardSummary } from './fixture-shards.mjs';

const [index] = FIXTURE_SHARD.split('/', 1);

// no trailing newline on purpose: the marker has to open a line whatever the child said last
process.stdout.write(`[fixture-shard-protocol] shard ${ index } wrote this without a trailing newline`);

// SILENT exits cleanly having said nothing - the sneakier half of "produced no result", since a crash
// is loud on its own while a silent zero would just vanish from the totals
if (!process.env.SHARD_PROTOCOL_SILENT) {
  // BAD reports a value that is neither a number nor a list, to prove the parent refuses to guess
  if (process.env.SHARD_PROTOCOL_BAD) emitShardSummary({ passed: 'not a number' });
  else emitShardSummary({
    passed: Number(index) + 1,
    // the package name is what the old `[^@]*` marker cut short; `@@` inside used to end the match early
    rows: [{ shard: Number(index), error: 'Cannot find module @rollup/plugin-babel @@ inside, ends with @' }],
  });
}
