// The rollup plugin that serves a handful of packages from their own TypeScript SOURCES - unplugin's
// `pre` phase reads type annotations no later phase can see. MUST sit before `nodeResolve()`, which
// answers `htmlparser2` with its published `dist/**.js`, and the first hook wins.
/* eslint-disable node/no-sync -- rollup's `resolveId` answers synchronously, and the scans run once, on load */
import { existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve as resolvePath } from 'node:path';
import { NODE_MODULES, toPosix } from './paths.mjs';

// DECLARED in this suite's package.json even where one arrives through another package's graph: that
// declaration is what makes npm hoist it to this directory's node_modules root, the only place looked at
export const TS_SOURCE_PACKAGES = new Set([
  'htmlparser2', 'domutils', 'dom-serializer', 'entities', 'css-select', 'css-what', 'nth-check',
]);

// `.d.ts` is deliberately NOT TypeScript here. Stripping one would erase it to an empty module and
// hand rollup a silently empty dependency; leaving it alone makes rollup's own parser reject it.
export const TS_EXTENSION = /(?<!\.d)\.[cm]?ts$/;

const TS_SOURCE_ROOTS = [...TS_SOURCE_PACKAGES].map(name => toPosix(join(NODE_MODULES, name, 'src')));

// both of these leave the matrix GREEN while the package quietly builds from its published JS
function assertUsableSet() {
  for (const name of TS_SOURCE_PACKAGES) {
    if (name.startsWith('@')) {
      throw new Error(`TS_SOURCE_PACKAGES: '${ name }' is scoped, which \`tsSources\` cannot resolve - it `
        + 'splits a bare specifier at the first `/`, so the name never matches and the package would '
        + 'silently build from its published JS. Teach `resolveId` the `@scope/name` form first.');
    }
  }
  // every installed package, not only the listed ones: whoever asks is who gets served
  const installed = readdirSync(NODE_MODULES).flatMap(entry => entry.startsWith('@')
    ? readdirSync(join(NODE_MODULES, entry)).map(scoped => `${ entry }/${ scoped }`)
    : entry);
  for (const owner of installed) {
    for (const name of TS_SOURCE_PACKAGES) {
      if (owner !== name && existsSync(join(NODE_MODULES, owner, 'node_modules', name))) {
        throw new Error(`TS_SOURCE_PACKAGES: ${ owner } carries its own copy of ${ name } - \`tsSources\` `
          + 'resolves every bare specifier to the top-level copy, so the two versions would be mixed '
          + 'silently. Reconcile the pinned versions so npm hoists a single copy.');
      }
    }
  }
}
assertUsableSet();

// a directory has to be REJECTED, not just skipped: an extensionless specifier makes the first
// candidate the path itself, and a bare `existsSync` answers `true` for a directory
function firstExistingFile(candidates) {
  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

export function tsSources() {
  return {
    name: 'e2e-ts-sources',
    // `./Parser.js` from inside a `src` dir -> `./Parser.ts`; `entities/decode` -> `<pkg>/src/decode.ts`.
    // Both drop the `.js`: a TS-ESM specifier names the file the compiler WILL emit, and node's resolver
    // never maps it back - so without this every intra-package import resolves to nothing.
    resolveId(source, importer) {
      if (source.startsWith('.')) {
        if (!importer || TS_SOURCE_ROOTS.every(root => !toPosix(importer).startsWith(root))) return null;
        const abs = resolvePath(dirname(importer), source);
        return firstExistingFile([abs.replace(/\.[cm]?js$/, '.ts'), `${ abs }.ts`, join(abs, 'index.ts')]);
      }
      const [name, ...rest] = source.split('/');
      if (!TS_SOURCE_PACKAGES.has(name)) return null;
      const sub = (rest.length ? rest.join('/') : 'index').replace(/\.[cm]?js$/, '');
      const file = firstExistingFile([join(NODE_MODULES, name, 'src', `${ sub }.ts`), join(NODE_MODULES, name, 'src', sub, 'index.ts')]);
      if (file) return file;
      throw new Error(`TS_SOURCE_PACKAGES: '${ source }' has no TypeScript source under node_modules/${ name }/src `
        + '- that package is built from its sources (see ts-sources.mjs), and without them this build silently '
        + 'degrades to a published-JS one. Reinstall, or drop the package from the set deliberately.');
    },
  };
}
