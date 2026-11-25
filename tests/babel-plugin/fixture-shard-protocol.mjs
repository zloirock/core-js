// Exercise the shard protocol through a real fork, including diagnostics that look like reports.
import { rejects } from 'node:assert/strict';
import childProcess from 'node:child_process';
import { syncBuiltinESMExports } from 'node:module';
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
    extraEnv: { SHARD_PROTOCOL_ORDER: path.join(dir, 'ready'), FIXTURE_SHARD: 'bad', FORCE_COLOR: '0' },
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
checkTruthy('the child receives no Node arguments', totals.rows.every(row => row.execArgv.length === 0));
checkTruthy('the parent overrides the conflicting color setting', totals.rows.every(row => row.forceColor === '1'));
checkTruthy('a payload naming a package survives transport',
  totals.rows.every(row => row.error.includes('@rollup/plugin-babel')));
checkTruthy('so does one carrying `@@`', totals.rows.every(row => row.error.includes('@@ inside')));
checkTruthy('Unicode line separators survive transport', totals.rows.every(row => row.error.includes('\u2028\u2029')));

for (const [flag, pattern, shards = 2] of [
  ['BAD', /invalid value for shard key `passed`/u],
  ['MIXED', /incompatible values for shard key `passed`/u],
  ['REVERSE', /shards 0 and 1\/2: incompatible values for shard key `passed`/u],
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
  if (flag === 'MIXED') check('prints both reporting shards on a type mismatch', logs.length, shards);
}

// Force one real spawn to fail while its peer finishes and writes diagnostics.
const originalFork = childProcess.fork;
const spawnArguments = [];
let spawnError;
try {
  childProcess.fork = (file, args, options) => {
    spawnArguments.push(options.execArgv);
    if (options.env.FIXTURE_SHARD === '1/2') options.execPath = `${ process.execPath }.missing-for-shard-probe`;
    return originalFork(file, args, options);
  };
  syncBuiltinESMExports();
  await runShards({ script: CHILD, shards: 2, print: () => { /* No diagnostics are expected from the failed spawn. */ } });
} catch (error) {
  spawnError = error;
} finally {
  childProcess.fork = originalFork;
  syncBuiltinESMExports();
}
checkTruthy('the fork explicitly clears inherited Node arguments',
  spawnArguments.length === 2 && spawnArguments.every(args => Array.isArray(args) && args.length === 0));
check('preserves spawn error code', spawnError?.cause?.code, 'ENOENT');
checkTruthy('names the failed shard', spawnError?.message.includes('shard 1/2 process error'));
const hungOutput = [];
await rejects(runShards({
  script: CHILD, shards: 1, extraEnv: { SHARD_PROTOCOL_HANG: '1' }, timeout: 5000,
  print: line => hungOutput.push(line),
}), /fixture shards did not finish within 5000ms/u);
checkTruthy('prints diagnostics from a timed-out shard', hungOutput.some(line => line.includes('shard 0:')));
const pipeOutput = [];
await rejects(runShards({
  script: CHILD, shards: 1, extraEnv: { SHARD_PROTOCOL_EARLY_EXIT: '1', SHARD_PROTOCOL_HELD_PIPE: '1' }, timeout: 5000,
  print: line => pipeOutput.push(line),
}), /shard 0\/1 produced no result.*code 2/u);
checkTruthy('drains inherited stdout after the failing shard exits', pipeOutput.some(line => line.endsWith('pipe drained')));
const fastDir = await fs.mkdtemp(path.join(import.meta.dirname, 'fixture-shard-fail-fast-'));
try {
  for (const [suffix, extraEnv, expected] of [
    ['exit', {}, /shard 0\/2 produced no result.*code 2/u],
    ['descendant', { SHARD_PROTOCOL_DESCENDANT: '1' }, /shard 0\/2 produced no result.*code 2/u],
    ['counter', { SHARD_PROTOCOL_BAD: '1' }, /shard 0\/2: invalid value for shard key `passed`/u],
    ['duplicate', { SHARD_PROTOCOL_BAD_MESSAGE: '1' }, /shard 0\/2 must report exactly one result object/u],
  ]) {
    const logs = [];
    await rejects(runShards({
      script: CHILD, shards: 2,
      extraEnv: { ...extraEnv, SHARD_PROTOCOL_FAIL_FAST: path.join(fastDir, suffix) }, timeout: 10_000,
      print: line => logs.push(line),
    }), expected);
    check(`both logs survive ${ suffix }`, logs.length, 2);
    if (suffix === 'descendant') {
      check('the descendant started before cancellation', await fs.readFile(path.join(fastDir, suffix), 'utf8'), 'started');
      checkTruthy('cancellation closes the pipe held by the descendant', logs.every(line => !line.includes('descendant finished')));
    }
    checkTruthy(`stops the still-running shard after ${ suffix }`, logs.every(line => !line.includes('slow shard finished')));
  }
} finally {
  await fs.rm(fastDir, { recursive: true, force: true });
}
finish();
