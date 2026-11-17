import { deepStrictEqual, ok, strictEqual } from 'node:assert/strict';
import fs, { mkdir, mkdtemp, readdir, readFile, rm, utimes, writeFile } from 'node:fs/promises';
import { syncBuiltinESMExports } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mock } from 'node:test';
import { promisify } from 'node:util';
import { gunzip } from 'node:zlib';
import createBundles from '../../packages/core-js-service/internals/infrastructure/bundles.js';
import { COMPRESSION_DEFAULT } from '../../packages/core-js-service/config.js';

const decompress = promisify(gunzip);
const SCRIPT = '!function () { \'use strict\'; var polyfilled = true; }();\n';

function warnings() {
  const reported = [];
  return { reported, warn: (condition, message) => reported.push([condition, message]) };
}

// bytes only, never a path, and asynchronous even where the store is not. a path would pin the
// store to a local disk forever - not because Redis or S3 are hard to write, but because every
// caller would already be built around a file
const memory = createBundles({ generation: 'a1b2c3d4e5f60718', compression: COMPRESSION_DEFAULT, warn: warnings().warn });

strictEqual(await memory.has('nothing'), false, 'bundles #1');
strictEqual(await memory.get('nothing', 'identity'), null, 'bundles #2');
strictEqual(await memory.modules('nothing'), null, 'bundles #3');

await memory.put('abc', { modules: ['es.array.at'], script: SCRIPT });

strictEqual(await memory.has('abc'), true, 'bundles #4');
ok(Buffer.isBuffer(await memory.get('abc', 'identity')), 'bundles-1 #1');
strictEqual((await memory.get('abc', 'identity')).toString('utf8'), SCRIPT, 'bundles-1 #2');
deepStrictEqual(await memory.modules('abc'), ['es.array.at'], 'bundles #5');
// the module list is handed out frozen: it is the store's own memory, and the store outlives
// every caller that reads it
ok(Object.isFrozen(await memory.modules('abc')), 'bundles #5a');

// the uncompressed form is always stored, which is what lets a client that refuses compression be
// answered without a branch of its own. brotli is off by default: it costs several times the build
deepStrictEqual(memory.encodings, ['identity', 'gzip'], 'bundles #6');
strictEqual((await decompress(await memory.get('abc', 'gzip'))).toString('utf8'), SCRIPT, 'bundles #7');
strictEqual(await memory.get('abc', 'br'), null, 'bundles #8');

const withBrotli = createBundles({ generation: 'a1b2c3d4e5f60718',
  compression: { ...COMPRESSION_DEFAULT, br: {} }, warn: warnings().warn });

// and what is not asked for is not held: a representation kept in memory but never written would
// make a restart serve less than the process that stored it
const compressedOnly = createBundles({ generation: 'a1b2c3d4e5f60718', compression: { gzip: {} }, warn: warnings().warn });

await compressedOnly.put('abc', { modules: [], script: SCRIPT });

deepStrictEqual(compressedOnly.encodings, ['gzip'], 'bundles-1 #3');
strictEqual(await compressedOnly.get('abc', 'identity'), null, 'bundles-1 #4');
ok(Buffer.isBuffer(await compressedOnly.get('abc', 'gzip')), 'bundles-1 #5');

await withBrotli.put('abc', { modules: [], script: SCRIPT });
deepStrictEqual(withBrotli.encodings, ['identity', 'gzip', 'br'], 'bundles #9');
ok(Buffer.isBuffer(await withBrotli.get('abc', 'br')), 'bundles #10');

const directory = await mkdtemp(join(tmpdir(), 'core-js-service-'));
const GENERATION = 'a1b2c3d4e5f60718';
const NEXT = '00112233445566aa';
const THIRD = 'ffeeddccbbaa9988';
function store(options = {}) {
  return createBundles({ directory, generation: GENERATION, compression: COMPRESSION_DEFAULT, retain: 1, warn: warnings().warn, ...options });
}

try {
  const disk = store();

  await disk.put('abc', { modules: ['es.array.at'], script: SCRIPT });

  // one directory per generation of the plan, and a bundle lands in the generation being served
  deepStrictEqual(await readdir(directory), [GENERATION], 'bundles-4 #1');
  // a reader never sees a half-written bundle. the temporary name is renamed WITHIN THE SAME
  // DIRECTORY - a rename across a device boundary is not atomic and throws, so the OS temporary
  // directory cannot be used - and nothing temporary is left behind
  deepStrictEqual((await readdir(join(directory, GENERATION))).toSorted(),
    ['abc.js', 'abc.js.gz', 'abc.json'], 'bundles-3 #1');

  // a restart finds what the previous process built, which is the whole point of the disk
  const restarted = store();

  strictEqual(await restarted.has('abc'), true, 'bundles #11');
  strictEqual((await restarted.get('abc', 'identity')).toString('utf8'), SCRIPT, 'bundles #12');
  deepStrictEqual(await restarted.modules('abc'), ['es.array.at'], 'bundles #13');
  for (const encoding of disk.encodings) {
    deepStrictEqual(await restarted.getRepresentation('abc', encoding), await disk.getRepresentation('abc', encoding),
      'bundles-5 #1');
  }
  strictEqual(await restarted.has('missing'), false, 'bundles #14');

  // a second bundle that only ever exists in the generation being replaced
  await disk.put('ghi', { modules: [], script: SCRIPT });

  // the NEXT generation answers a request for that bundle - the page which named it is already in
  // a browser - but does not count it as its own
  const next = store({ generation: NEXT });

  strictEqual((await next.get('abc', 'identity')).toString('utf8'), SCRIPT, 'bundles-4 #2');
  deepStrictEqual(await next.modules('abc'), ['es.array.at'], 'bundles-4 #3');
  strictEqual(await next.has('abc'), false, 'bundles-4 #4');

  // so the warm-up builds it again, into the generation being served: a generation holds every
  // bundle of its plan, which is what makes pruning an older one cost nothing
  await next.put('abc', { modules: ['es.array.at'], script: SCRIPT });

  strictEqual(await next.has('abc'), true, 'bundles-4 #5');
  deepStrictEqual((await readdir(join(directory, NEXT))).toSorted(),
    ['abc.js', 'abc.js.gz', 'abc.json'], 'bundles-4 #6');

  // a sidecar that parses but carries no module list is as unusable as one that does not parse: a
  // bundle taken from it would answer `has` for ever and `modules` never, and the warm-up would keep
  // skipping the rebuild that repairs it
  await writeFile(join(directory, NEXT, 'abc.json'), '{"written":"by something else"}');

  // `has` is what the warm-up asks, and it must say no, so the bundle is built again into this
  // generation. `get` still answers - from the generation retained beside it, which is its job
  strictEqual(await store({ generation: NEXT }).has('abc'), false, 'bundles-4 #6a');
  await writeFile(join(directory, NEXT, 'abc.json'), JSON.stringify({ modules: ['es.array.at'] }));
  strictEqual(await store({ generation: NEXT }).has('abc'), true, 'bundles-4 #6b');

  // the generation being served stays, and so do the `retain` newest of the rest. the age is set
  // rather than taken from the clock: two directories written in the same millisecond order by luck
  const older = new Date(Date.now() - 60_000);

  await mkdir(join(directory, THIRD));
  await utimes(join(directory, THIRD), older, older);
  // and nothing this store could not have written is touched, whatever its age
  await mkdir(join(directory, 'somebody-elses-directory'));
  await utimes(join(directory, 'somebody-elses-directory'), older, older);

  deepStrictEqual(await store({ generation: NEXT }).prune(), [THIRD], 'bundles-4 #7');
  deepStrictEqual((await readdir(directory)).toSorted(),
    [GENERATION, NEXT, 'somebody-elses-directory'].toSorted(), 'bundles-4 #8');

  // `null` keeps every generation, `0` keeps only the one being served
  deepStrictEqual(await store({ generation: NEXT, retain: null }).prune(), [], 'bundles-4 #9');

  // `0` answers for memory as well as for the disk: a store keeping no other generation does not
  // read one either, so `ghi` - which only ever existed in the one being replaced - is not served
  const alone = store({ generation: NEXT, retain: 0 });

  strictEqual(await alone.get('ghi', 'identity'), null, 'bundles-4 #10');
  deepStrictEqual(await alone.prune(), [GENERATION], 'bundles-4 #11');
  // and what was pruned is missed by nobody else: the plan is complete in the generation being served
  strictEqual((await store({ generation: NEXT }).get('abc', 'identity')).toString('utf8'), SCRIPT, 'bundles-4 #12');

  for (const compression of [{ gzip: {} }, { br: {} }, { gzip: {}, br: {} }]) {
    const compressedDirectory = join(directory, Object.keys(compression).join('-'));
    const compressed = store({ directory: compressedDirectory, compression });
    await compressed.put('abc', { modules: [], script: SCRIPT });
    const reloaded = store({ directory: compressedDirectory, compression });
    strictEqual(await reloaded.has('abc'), true, 'bundles-4 #15');
    for (const encoding of compressed.encodings) {
      deepStrictEqual(await reloaded.getRepresentation('abc', encoding),
        await compressed.getRepresentation('abc', encoding), 'bundles-5 #2');
    }
  }

  const checked = { directory: join(directory, 'integrity'), compression: { ...COMPRESSION_DEFAULT, br: {} } };
  const written = store(checked);
  for (const [extension, label] of [['.js', 'bundles-5 #3'], ['.js.gz', 'bundles-5 #4'], ['.js.br', 'bundles-5 #5']]) {
    await written.put('abc', { modules: [], script: SCRIPT });
    const file = join(checked.directory, GENERATION, `abc${ extension }`);
    const bytes = await readFile(file);
    bytes[0] ^= 1;
    await writeFile(file, bytes);
    strictEqual(await store(checked).has('abc'), false, label);
  }

  const sharedDirectory = join(directory, 'shared');
  const sharedWarn = warnings();
  const shared = { directory: sharedDirectory, warn: sharedWarn.warn };
  const bundle = { modules: ['es.array.at'], script: SCRIPT };
  await Promise.all([store(shared).put('abc', bundle), store(shared).put('abc', bundle)]);
  deepStrictEqual(sharedWarn.reported, [], 'bundles-3 #2');
  deepStrictEqual((await readdir(join(sharedDirectory, GENERATION))).toSorted(),
    ['abc.js', 'abc.js.gz', 'abc.json'], 'bundles-3 #3');
  strictEqual((await store(shared).get('abc', 'identity')).toString('utf8'), SCRIPT, 'bundles-3 #4');

  const replacing = store(shared);
  await replacing.put('abc', { modules: [], script: '' });
  strictEqual((await replacing.get('abc', 'identity')).length, 0, 'bundles-4 #16');
  deepStrictEqual(await replacing.modules('abc'), [], 'bundles-4 #17');
  strictEqual((await store(shared).get('abc', 'identity')).length, 0, 'bundles-4 #18');

  // an unusable store falls back to memory. a file in its parent path makes every platform
  // reject writes even when the test runs with elevated privileges
  const parentFile = join(directory, 'file');
  await writeFile(parentFile, '');
  const readOnly = warnings();
  const blocked = createBundles({
    directory: join(parentFile, 'nested'), generation: GENERATION, compression: COMPRESSION_DEFAULT, warn: readOnly.warn,
  });

  await blocked.put('def', { modules: [], script: SCRIPT });

  deepStrictEqual(readOnly.reported.map(([condition]) => condition), ['bundles:no-disk'], 'bundles #15');
  strictEqual((await blocked.get('def', 'identity')).toString('utf8'), SCRIPT, 'bundles #16');

  // and it does not keep trying: the warning is reported once, whatever the traffic
  await blocked.put('ghi', { modules: [], script: SCRIPT });
  strictEqual(readOnly.reported.length, 1, 'bundles #17');
  // a store with no disk left has nothing to prune and says nothing more
  deepStrictEqual(await blocked.prune(), [], 'bundles-4 #13');
  strictEqual(readOnly.reported.length, 1, 'bundles-4 #14');

  const race = join(directory, 'prune-race');
  const pruner = store({ directory: race });
  await pruner.has('abc');
  const vanished = '0000000000000000';
  const fresh = '1122334455667788';
  for (const name of [GENERATION, NEXT, THIRD, vanished]) await mkdir(join(race, name), { recursive: true });
  await utimes(join(race, THIRD), older, older);

  // Change this store's directory immediately after the first listing resolves.
  const realReaddir = readdir;
  let changed = false;
  const listed = mock.method(fs, 'readdir', async (path, ...options) => {
    const entries = await realReaddir(path, ...options);
    if (path !== race || changed) return entries;
    changed = true;
    await rm(join(race, vanished), { recursive: true });
    await mkdir(join(race, fresh));
    return entries.toSorted((a, b) => a.name.localeCompare(b.name));
  });
  syncBuiltinESMExports();
  try {
    deepStrictEqual(await pruner.prune(), [THIRD], 'bundles-4 #19');
  } finally {
    listed.mock.restore();
    syncBuiltinESMExports();
  }
  deepStrictEqual((await readdir(race)).toSorted(), [GENERATION, NEXT, fresh].toSorted(), 'bundles-4 #20');
} finally {
  try {
    await rm(directory, { force: true, recursive: true });
  } catch (error) {
    // a leftover temporary directory cannot break a run, and a failure to remove it must not
    // speak for the assertions above
    console.warn(`could not remove ${ directory }: ${ error.message }`);
  }
}
