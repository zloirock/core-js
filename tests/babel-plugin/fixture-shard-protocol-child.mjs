// The child half of fixture-shard-protocol.mjs, forked by runShards.
import { spawn } from 'node:child_process';
import { setTimeout } from 'node:timers/promises';
import { FIXTURE_SHARD, emitShardSummary } from './fixture-shards.mjs';

const [index] = FIXTURE_SHARD.split('/', 1);

// Ordinary output deliberately resembles the old report format and lacks a trailing newline.
process.stdout.write(`[fixture-shard-protocol] shard ${ index }: @@FIXTURE-SHARD@@{ordinary output}@@`);

if (process.env.SHARD_PROTOCOL_ORDER) {
  // Shard 1 leaves the marker as it exits. Shard 0 finishes its own split write afterwards.
  const marker = process.env.SHARD_PROTOCOL_ORDER;
  if (index === '0') {
    const deadline = Date.now() + 30_000;
    while (!await fs.pathExists(marker)) {
      if (Date.now() >= deadline) throw new Error('shard 1 did not exit');
      await setTimeout(10);
    }
  } else process.once('exit', () => {
    // eslint-disable-next-line node/no-sync -- the exit handler cannot await a write
    fs.writeFileSync(marker, '');
  });
  const bytes = Buffer.from('🌍');
  process.stdout.write(bytes.subarray(0, 2));
  await setTimeout(30);
  process.stdout.write(bytes.subarray(2));
}

if (process.env.SHARD_PROTOCOL_HELD_PIPE) {
  if (index === '0') {
    // Windows closes the shard's job on exit. The writer must outlive it to exercise the inherited pipe.
    const marker = process.env.SHARD_PROTOCOL_HELD_PIPE;
    spawn(process.execPath, ['--input-type=module', '-e', [
      'import { existsSync } from "node:fs";',
      'import { setTimeout } from "node:timers/promises";',
      'const deadline = Date.now() + 120000;',
      'while (!existsSync(process.argv[1]) && Date.now() < deadline) await setTimeout(20);',
      'if (existsSync(process.argv[1])) process.stdout.write("pipe drained");',
    ].join('\n'), marker], {
      detached: true,
      stdio: ['ignore', 'inherit', 'ignore'],
    }).unref();
  } else {
    // Keep the peer alive past the runner deadline so only cancellation can release the writer.
    await setTimeout(120_000);
  }
}
if (process.env.SHARD_PROTOCOL_HANG) await setTimeout(30_000);
if (process.env.SHARD_PROTOCOL_DISCONNECT) {
  process.disconnect();
  await setTimeout(30_000);
}
if (process.env.SHARD_PROTOCOL_FAIL_FAST) {
  const marker = process.env.SHARD_PROTOCOL_FAIL_FAST;
  if (index === '0') {
    while (!await fs.pathExists(marker)) await setTimeout(20);
    if (process.env.SHARD_PROTOCOL_BAD_MESSAGE) {
      emitShardSummary({ passed: 1 });
      emitShardSummary({ passed: 1 });
      await setTimeout(30_000);
    } else if (process.env.SHARD_PROTOCOL_BAD) emitShardSummary({ passed: 'bad counter' });
    else process.exitCode = 2;
  } else {
    if (process.env.SHARD_PROTOCOL_DESCENDANT) {
      spawn(process.execPath, ['-e', [
        'const socket = require("node:net").connect(+process.argv[2], "127.0.0.1", () => {',
        '  require("node:fs").writeFileSync(process.argv[1], "started");',
        '});',
        'const timer = setTimeout(() => { process.stdout.write("descendant finished"); socket.destroy(); }, 120000);',
        'socket.on("close", () => clearTimeout(timer));',
      ].join('\n'), marker, process.env.SHARD_PROTOCOL_DESCENDANT], { stdio: ['ignore', 'inherit', 'inherit'] }).unref();
    } else await fs.writeFile(marker, '');
    await setTimeout(30_000);
    process.stdout.write('slow shard finished');
  }
}

// SILENT exits cleanly having said nothing - the sneakier half of "produced no result", since a crash
// is loud on its own while a silent zero would just vanish from the totals
if (!process.env.SHARD_PROTOCOL_SILENT && !process.env.SHARD_PROTOCOL_EARLY_EXIT && !process.env.SHARD_PROTOCOL_FAIL_FAST) {
  if (process.env.SHARD_PROTOCOL_DUPLICATE && index === '0') emitShardSummary({ passed: 1 });
  if (process.env.SHARD_PROTOCOL_BAD) emitShardSummary({ passed: 'not a number' });
  else if (process.env.SHARD_PROTOCOL_MIXED) emitShardSummary({ passed: index === '0' ? 1 : [2] });
  else if (process.env.SHARD_PROTOCOL_REVERSE) emitShardSummary({ passed: index === '0' ? [1] : 2 });
  else if (process.env.SHARD_PROTOCOL_NULL && index === '0') emitShardSummary(null);
  else if (process.env.SHARD_PROTOCOL_STRING && index === '0') emitShardSummary('invalid');
  else if (process.env.SHARD_PROTOCOL_ARRAY && index === '0') emitShardSummary([]);
  else emitShardSummary({
    passed: Number(index) + 1,
    rows: [{
      shard: Number(index), execArgv: process.execArgv, forceColor: process.env.FORCE_COLOR,
      error: 'Cannot find module @rollup/plugin-babel @@ inside, separators \u2028\u2029, ends with @',
    }],
  });
}

if (process.env.SHARD_PROTOCOL_FATAL || process.env.SHARD_PROTOCOL_EARLY_EXIT) process.exitCode = 2;
