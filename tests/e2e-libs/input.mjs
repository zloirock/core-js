// What a run was fed. Versions come from the LOCKFILES rather than from walking `node_modules`: a lock
// answers for a package whose `exports` map does not list its own `package.json`, and it reports what
// was DECLARED, which is what "were these two runs fed the same thing?" asks about.
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { HERE, PACKAGE_JSON, ROOT, toPosix } from './paths.mjs';
import { TS_SOURCE_PACKAGES } from './ts-sources.mjs';

// Depended on without being pinned, so they resolve from the root tree: the polyfill stack, unplugin's
// parser, and the minification pair behind the wire size. Appended to what this suite does declare.
const UNPINNED = ['@core-js/pure', '@core-js/unplugin', '@core-js/babel-plugin', 'oxc-parser',
  '@core-js/builder', '@swc/core'];

// in resolution order - this suite's own install first, then the root tree node walks up into
const LOCK_FILES = [join(HERE, 'package-lock.json'), join(ROOT, 'package-lock.json')];

// A workspace package is in the lock as a LINK with no version of its own - `@core-js/pure` and the
// two plugins all arrive that way - so its version is read from the package it points at.
async function versionsFrom(lockPath) {
  const versions = new Map();
  const base = dirname(lockPath);
  let entries;
  try {
    entries = Object.entries(JSON.parse(await readFile(lockPath, 'utf8')).packages ?? {});
  } catch { return versions; } // a lock that cannot be read reports nothing, never ends a run
  for (const [key, entry] of entries) {
    if (!key.startsWith('node_modules/')) continue;
    const name = key.slice('node_modules/'.length);
    // a nested copy is npm's answer to a version conflict and is NOT what a bare specifier resolves
    // to from the top of the tree, which is what this file reports on
    if (name.includes('node_modules/')) continue;
    if (entry.version) versions.set(name, entry.version);
    else if (entry.resolved) {
      try {
        versions.set(name, JSON.parse(await readFile(resolve(base, entry.resolved, 'package.json'), 'utf8')).version);
      } catch { /* a link that does not resolve is reported as unknown below, never as a failure */ }
    }
  }
  return versions;
}

async function digestOf(file) {
  try {
    return createHash('sha256').update(await readFile(file)).digest('hex').slice(0, 12);
  } catch { return '?'; } // a missing lock is diagnostic noise, never a reason to abort a run
}

export async function describeInput() {
  const tables = await Promise.all(LOCK_FILES.map(lock => versionsFrom(lock)));
  const digests = await Promise.all(LOCK_FILES.map(lock => digestOf(lock)));
  const declared = JSON.parse(await readFile(PACKAGE_JSON, 'utf8')).devDependencies ?? {};
  const names = [...new Set([...Object.keys(declared), ...UNPINNED])].sort();

  return {
    environment: `${ process.platform }/${ process.arch } node ${ process.version }`,
    // keyed by path relative to the repository root, so two runs on different checkouts compare
    lockfiles: Object.fromEntries(LOCK_FILES.map((lock, index) => [toPosix(relative(ROOT, lock)), digests[index]])),
    // apart from `packages` because these are consumed as SOURCE rather than as a published build,
    // which is the path the phase axis exists to exercise
    tsSources: [...TS_SOURCE_PACKAGES],
    packages: Object.fromEntries(names.map(name => [name, tables.find(table => table.has(name))?.get(name) ?? '?'])),
  };
}
