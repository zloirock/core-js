import { fileURLToPath } from 'node:url';
import entriesMap from '@core-js/compat/entries' with { type: 'json' };

// strip Vite-style `?import` / `?t=123` / `#hash` suffixes from a module id.
// Windows UNC prefixes `\\?\` (long-path) and `\\.\` (device) embed `?`/`.` at index 2 -
// skip the 4-char prefix so the search doesn't mistake them for a query separator.
// also skip the forward-slash forms `//?/` and `//./` produced by Vite/Rollup path
// normalization stages, otherwise the embedded `?` was treated as a query separator and
// the path silently truncated to `//`.
// lives in path-namespace despite being consumed by AST plugins because the operation is
// purely string normalization on a module-id string - no AST awareness needed
const UNC_PREFIXES = ['\\\\?\\', '\\\\.\\', '//?/', '//./'];

// chars to skip before scanning a module id for `?` / `#` separators: the length of the
// Windows UNC prefix when one leads the id. shared by every hand-rolled query scan so no
// caller can mistake the in-prefix `?` for a query start (`\\?\C:\x.js?t=1` truncating to `\\`)
export function uncPrefixOffset(id) {
  return UNC_PREFIXES.some(p => id.startsWith(p)) ? 4 : 0;
}

export function stripQueryHash(id) {
  const offset = uncPrefixOffset(id);
  const at = id.slice(offset).search(/[#?]/);
  return at === -1 ? id : id.slice(0, offset + at);
}

// Windows long-path / device-path prefixes in their canonical (post-`\\`->`/`) form.
// `import.meta.resolve` under Windows can return such absolute paths; strip so the
// canonical `core-js/...` slice lines up against the entry map. Combined char-class
// `[.?]` covers both verbatim long-path (`//?/`) and device-path (`//./`) shapes
export const WINDOWS_UNC_PREFIX_RE = /^\/\/[.?]\//;

// canonical lowercase forward-slash form of a module-id string. shared by every entry-
// detection callsite so backslash form (Windows / Vite-rewritten `\core-js\...`), Farm's
// path-join doubled-slash artifact (`core-js//actual/...`), Windows UNC long-path /
// device-path absolute (`\\?\C:\...`, `//?/C:/...`), and case mismatches all resolve
// identically. UNC strip must run BEFORE slash-collapse: `//?/` would collapse to `/?/`
// before the strip pattern (`//[.?]/`) could match, leaking the prefix into the canonical
// path
export function normalizeImportSource(source) {
  return stripQueryHash(source)
    .replaceAll('\\', '/')
    .replace(WINDOWS_UNC_PREFIX_RE, '')
    .replaceAll(/\/{2,}/g, '/')
    .toLowerCase();
}

// `array/at` -> `full/array/at` modules; top-level `actual`/`index`/... -> their root entry.
// `Object.hasOwn` guards against prototype-chain hits: JSON-imported object carries regular
// Object.prototype, so bare `entriesMap['constructor']` / `['toString']` / `['__proto__']`
// would return function/object values from the prototype instead of null. user typo in
// `include: ['constructor']` should silently no-op via null, not accidentally match a prop
export function lookupEntryModules(pattern) {
  if (typeof pattern !== 'string') return null;
  const full = `full/${ pattern }`;
  if (Object.hasOwn(entriesMap, full)) return entriesMap[full];
  if (Object.hasOwn(entriesMap, pattern)) return entriesMap[pattern];
  return null;
}

// `import.meta.resolve` is a pure function of the specifier for the whole process life (the
// resolver reads the on-disk package layout, which a build does not mutate), yet it was hit once
// per emitted import per file. cached by specifier - the key space is the polyfill entry set.
// module-level rather than per-plugin-instance, unlike the adapters: the resolution is anchored at
// THIS module's own URL, so it is identical for every instance in the process, and `pkg` is part of
// the key so a monorepo alias cannot collide with the main package. bundler workers get their own
// module instance, so there is no shared-state race to speak of either
const absoluteImportCache = new Map();

export function resolveImportPath(pkg, subpath, absoluteImports) {
  const source = `${ pkg }/${ subpath }`;
  if (!absoluteImports) return source;
  const cached = absoluteImportCache.get(source);
  if (cached !== undefined) return cached;
  let result;
  try {
    const resolved = import.meta.resolve(source);
    result = resolved.startsWith('file:') ? fileURLToPath(resolved).replaceAll('\\', '/') : resolved;
  } catch {
    result = source;
  }
  absoluteImportCache.set(source, result);
  return result;
}

// skip core-js internals, root entry re-exports, and bundles - polyfilling them creates
// circular dependencies. `(?:^|\/)` boundary covers Farm/Bun/esbuild-plugin bare ids too.
// patterns operate on canonical (normalizeImportSource-output) form: forward slashes only,
// lowercase, no query/hash, no UNC prefix - back-slash alternation no longer needed
const CORE_JS_INTERNAL_FILE = /(?:^|\/)(?:core-js|core-js-pure|@core-js\/pure)\/(?:(?:actual|es|features|full|internals|modules|proposals|stable|stage)\/|(?:configurator|index)\.js$)/;
const CORE_JS_BUNDLE = /(?:^|\/)(?:core-js-bundle|@core-js\/bundle)(?:\/|$)/;

export function isCoreJSFile(filename) {
  if (typeof filename !== 'string') return false;
  const normalized = normalizeImportSource(filename);
  return CORE_JS_INTERNAL_FILE.test(normalized) || CORE_JS_BUNDLE.test(normalized);
}
