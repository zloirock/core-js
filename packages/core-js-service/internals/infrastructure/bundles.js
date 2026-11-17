import { createHash, randomUUID } from 'node:crypto';
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

// hash the bytes once, when the representation enters memory
function representation(bytes) {
  return { bytes, digest: createHash('sha256').update(bytes).digest('base64url') };
}

// the bundle store, one directory per generation of the plan. the module list is kept beside the
// bytes: it cannot be recovered from the identifier, and it is what tells a developer what went into
// the bundle of a given browser
export default function createBundles({ directory = null, generation, compression, retain = null, warn }) {
  const memory = new Map();
  // in the order the store writes and reads them, which is the order they were declared in
  const encodings = Object.keys(compression);
  let root = directory;

  const loaded = loadFromDisk();

  async function otherGenerations() {
    const others = [];

    for (const entry of await readdir(root, { withFileTypes: true })) {
      if (!entry.isDirectory() || !GENERATION_LIKE.test(entry.name) || entry.name === generation) continue;
      try {
        others.push([entry.name, (await stat(join(root, entry.name))).mtimeMs]);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    }

    others.sort(([, a], [, b]) => b - a);

    return others.map(([name]) => name);
  }

  async function loadFromDisk() {
    if (root === null) return;

    const names = [generation];
    try {
      if (retain !== 0) names.push(...(await otherGenerations()).slice(0, retain ?? undefined));
    } catch { /* no other generations could be listed */ }

    for (const name of names) {
      // each generation is read on its own: the one being served is usually not on disk yet - this
      // process is about to write it - and giving up there would leave the retained ones unread
      try {
        for (const file of await readdir(join(root, name))) {
          // the sidecar exists for every encoding set and is committed after the bytes
          if (!file.endsWith('.json')) continue;

          const bundleId = file.slice(0, -5);

          if (!memory.has(bundleId)) await readBundle(bundleId, name);
        }
      } catch { /* a generation nobody has written yet, or one this process cannot read */ }
    }
  }

  // written to a temporary name and renamed WITHIN THE SAME DIRECTORY. a rename across a device
  // boundary is not atomic and throws, and without atomicity a reader gets a truncated file under a
  // valid identifier, which `immutable` nails into that cache for a year
  async function commit(target, bytes) {
    // two stores in the same process can build the same bundle concurrently
    const temporary = `${ target }.${ randomUUID() }.tmp`;

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
  async function writeBundle(bundleId, { modules, representations }) {
    if (root === null) return;

    const folder = join(root, generation);
    try {
      await mkdir(folder, { recursive: true });
      const digests = {};
      for (const [encoding, { bytes, digest }] of representations) {
        await commit(join(folder, bundleId + REPRESENTATIONS[encoding].extension), bytes);
        digests[encoding] = digest;
      }
      await commit(join(folder, `${ bundleId }.json`), JSON.stringify({ modules, digests }));
    } catch (error) {
      if (root === null) return;
      root = null;
      warn('bundles:no-disk', `the bundles cannot be written to ${ directory } (${ error.message }), `
        + 'they are kept in memory only - every restart will warm up again');
    }
  }

  async function readBundle(bundleId, storedIn) {
    try {
      const from = join(root, storedIn);
      const { modules, digests } = JSON.parse(await readFile(join(from, `${ bundleId }.json`), 'utf8'));

      // a sidecar that parses but carries no list is as unusable as one that does not parse at
      // all - taken as it is, the bundle would answer `has` for ever and `modules` never, and the
      // warm-up would keep skipping the rebuild that would repair it
      if (!Array.isArray(modules)) return;

      const representations = new Map();
      for (const encoding of encodings) {
        const stored = representation(await readFile(join(from, bundleId + REPRESENTATIONS[encoding].extension)));
        // Sidecars written before digests were recorded still work with retained bundle URLs.
        if (digests !== undefined && digests?.[encoding] !== stored.digest) return;
        representations.set(encoding, stored);
      }
      memory.set(bundleId, { modules: Object.freeze(modules), representations, generation: storedIn });
    } catch { /* absent, or half-written by a build that died: this process will build it */ }
  }

  async function find(bundleId) {
    await loaded;

    return memory.get(bundleId) ?? null;
  }

  async function getRepresentation(bundleId, encoding) {
    return (await find(bundleId))?.representations.get(encoding) ?? null;
  }

  return {
    encodings,
    getRepresentation,
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
      const stored = await getRepresentation(bundleId, encoding);
      if (stored === null) return null;
      // the public copy needs its own backing memory to keep stored bytes and digest in sync
      const bytes = Buffer.alloc(stored.bytes.length);
      stored.bytes.copy(bytes);
      return bytes;
    },

    // handed out frozen rather than copied: the array is the store's own memory, and the store
    // outlives every caller that reads it
    async modules(bundleId) {
      return (await find(bundleId))?.modules ?? null;
    },

    async put(bundleId, { modules, script }) {
      await loaded;

      const source = Buffer.from(script, 'utf8');
      const representations = new Map();

      // only what is stored is compressed: a representation nobody asked to keep must not sit in
      // memory either, or a restart would serve less than this process does
      for (const encoding of encodings) {
        const { compress } = REPRESENTATIONS[encoding];
        const bytes = compress === undefined ? source : await compress(source, compression[encoding]);
        representations.set(encoding, representation(bytes));
      }

      const bundle = { modules: Object.freeze([...modules]), representations, generation };
      memory.set(bundleId, bundle);
      await writeBundle(bundleId, bundle);
    },

    // the generation being served is never removed, and neither are the `retain` newest of the
    // ones left behind: the page that named a bundle of the deploy just replaced is already in a
    // browser, and a rollback finds its bundles where it left them
    async prune() {
      if (root === null || retain === null) return [];

      const removed = [];

      try {
        // A later directory listing could include a generation created by another instance.
        for (const name of (await otherGenerations()).slice(retain)) {
          await rm(join(root, name), { recursive: true, force: true });
          removed.push(name);
        }
      } catch (error) {
        warn('bundles:no-prune', `the bundles of the previous generations could not be removed from ${
          directory } (${ error.message }), they are taking up space until something else clears them`);
      }

      return removed;
    },
  };
}
