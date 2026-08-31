import { mkdir, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { brotliCompress, gzip } from 'node:zlib';

// what a representation is: the suffix it is written under, and what turns the source into it.
// `identity` IS the source, and having no compressor is what says so - one table, so that an
// encoding is added in one place and cannot arrive half-declared
const REPRESENTATIONS = {
  identity: { extension: '.js' },
  gzip: { extension: '.js.gz', compress: promisify(gzip) },
  br: { extension: '.js.br', compress: promisify(brotliCompress) },
};

const GENERATION_LIKE = /^[\da-f]{16}$/;

// the bundle store, one directory per generation of the plan. the module list is kept beside the
// bytes: it cannot be recovered from the identifier, and it is what tells a developer what went into
// the bundle of a given browser
export default function createBundles({ directory = null, generation, compression, retain, warn }) {
  const memory = new Map();
  // in the order the store writes and reads them, which is the order they were declared in
  const encodings = Object.keys(compression);
  let root = directory;

  const loaded = loadFromDisk();

  async function generationsToKeep() {
    const others = [];

    try {
      for (const entry of await readdir(root, { withFileTypes: true })) {
        if (!entry.isDirectory() || !GENERATION_LIKE.test(entry.name) || entry.name === generation) continue;
        others.push([entry.name, (await stat(join(root, entry.name))).mtimeMs]);
      }
    } catch { /* nothing has been written here yet, or nothing can be read */ }

    others.sort(([, a], [, b]) => b - a);

    return [generation, ...others.slice(0, retain ?? others.length).map(([name]) => name)];
  }

  async function loadFromDisk() {
    if (root === null) return;

    for (const name of await generationsToKeep()) {
      // each generation is read on its own: the one being served is usually not on disk yet - this
      // process is about to write it - and giving up there would leave the retained ones unread
      try {
        for (const file of await readdir(join(root, name))) {
          if (!file.endsWith('.js')) continue;

          const bundleId = file.slice(0, -3);

          if (!memory.has(bundleId)) await readBundle(bundleId, name);
        }
      } catch { /* a generation nobody has written yet, or one this process cannot read */ }
    }
  }

  // written to a temporary name and renamed WITHIN THE SAME DIRECTORY. a rename across a device
  // boundary is not atomic and throws, and without atomicity a reader gets a truncated file under a
  // valid identifier, which `immutable` nails into that cache for a year
  async function commit(name, bytes) {
    const target = join(root, generation, name);
    const temporary = `${ target }.${ process.pid }.tmp`;

    try {
      await writeFile(temporary, bytes);
      await rename(temporary, target);
    } catch (error) {
      try {
        await rm(temporary, { force: true });
      } catch { /* the failure being reported is the write, not the cleanup after it */ }
      throw error;
    }
  }

  // no disk is a working state, not a failure: no permission, no space, a read-only volume. it
  // costs another warm-up at the next restart, and is said once
  async function writeBundle(bundleId, { modules, bytes }) {
    if (root === null) return;

    try {
      await mkdir(join(root, generation), { recursive: true });
      for (const encoding of encodings) await commit(bundleId + REPRESENTATIONS[encoding].extension, bytes.get(encoding));
      await commit(`${ bundleId }.json`, JSON.stringify({ modules }));
    } catch (error) {
      root = null;
      warn('bundles:no-disk', `the bundles cannot be written to ${ directory } (${ error.message }), `
        + 'they are kept in memory only - every restart will warm up again');
    }
  }

  async function readBundle(bundleId, storedIn) {
    try {
      const from = join(root, storedIn);
      const bytes = new Map();
      for (const encoding of encodings) {
        bytes.set(encoding, await readFile(join(from, bundleId + REPRESENTATIONS[encoding].extension)));
      }
      const { modules } = JSON.parse(await readFile(join(from, `${ bundleId }.json`), 'utf8'));

      // a sidecar that parses but carries no list is as unusable as one that does not parse at
      // all - taken as it is, the bundle would answer `has` for ever and `modules` never, and the
      // warm-up would keep skipping the rebuild that would repair it
      if (!Array.isArray(modules)) return;

      memory.set(bundleId, { modules: Object.freeze(modules), bytes, generation: storedIn });
    } catch { /* absent, or half-written by a build that died: this process will build it */ }
  }

  async function find(bundleId) {
    await loaded;

    return memory.get(bundleId) ?? null;
  }

  return {
    encodings,
    generation,

    // in the generation being SERVED, where `get` answers from any generation still retained: a
    // bundle inherited from an older one would leave this generation incomplete, and pruning that
    // older one later would cost a warm-up nobody asked for
    async has(bundleId) {
      const bundle = await find(bundleId);

      return Boolean(bundle) && bundle.generation === generation;
    },

    // bytes, never a path, and asynchronous even where the implementation is not - a path would
    // pin the store to a local disk forever
    async get(bundleId, encoding) {
      return (await find(bundleId))?.bytes.get(encoding) ?? null;
    },

    // handed out frozen rather than copied: the array is the store's own memory, and the store
    // outlives every caller that reads it
    async modules(bundleId) {
      return (await find(bundleId))?.modules ?? null;
    },

    async put(bundleId, { modules, script }) {
      const source = Buffer.from(script, 'utf8');
      const bytes = new Map();

      // only what is stored is compressed: a representation nobody asked to keep must not sit in
      // memory either, or a restart would serve less than this process does
      for (const encoding of encodings) {
        const { compress } = REPRESENTATIONS[encoding];
        bytes.set(encoding, compress === undefined ? source : await compress(source, compression[encoding]));
      }

      const frozen = Object.freeze([...modules]);

      memory.set(bundleId, { modules: frozen, bytes, generation });
      await writeBundle(bundleId, { modules: frozen, bytes });
    },

    // the generation being served is never removed, and neither are the `retain` newest of the
    // ones left behind: the page that named a bundle of the deploy just replaced is already in a
    // browser, and a rollback finds its bundles where it left them
    async prune() {
      if (root === null || retain === null) return [];

      const removed = [];

      try {
        const keep = new Set(await generationsToKeep());

        for (const entry of await readdir(root, { withFileTypes: true })) {
          if (!entry.isDirectory() || !GENERATION_LIKE.test(entry.name) || keep.has(entry.name)) continue;

          await rm(join(root, entry.name), { recursive: true, force: true });
          removed.push(entry.name);
        }
      } catch (error) {
        warn('bundles:no-prune', `the bundles of the previous generations could not be removed from ${
          directory } (${ error.message }), they are taking up space until something else clears them`);
      }

      return removed;
    },
  };
}
