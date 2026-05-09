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
export function stripQueryHash(id) {
  const offset = UNC_PREFIXES.some(p => id.startsWith(p)) ? 4 : 0;
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

export function resolveImportPath(pkg, subpath, absoluteImports) {
  const source = `${ pkg }/${ subpath }`;
  if (!absoluteImports) return source;
  try {
    const resolved = import.meta.resolve(source);
    return resolved.startsWith('file:') ? fileURLToPath(resolved).replaceAll('\\', '/') : resolved;
  } catch {
    return source;
  }
}

// skip core-js internals, root entry re-exports, and bundles - polyfilling them creates
// circular dependencies. `(?:^|\/)` boundary covers Farm/Bun/esbuild-plugin bare ids too.
// patterns operate on canonical (normalizeImportSource-output) form: forward slashes only,
// lowercase, no query/hash, no UNC prefix - back-slash alternation no longer needed
const CORE_JS_INTERNAL_FILE = /(?:^|\/)(?:core-js|core-js-pure|@core-js\/pure)\/(?:(?:actual|es|features|full|internals|modules|proposals|stable|stage)\/|index\.js$)/;
const CORE_JS_BUNDLE = /(?:^|\/)(?:core-js-bundle|@core-js\/bundle)(?:\/|$)/;

export function isCoreJSFile(filename) {
  if (typeof filename !== 'string') return false;
  const normalized = normalizeImportSource(filename);
  return CORE_JS_INTERNAL_FILE.test(normalized) || CORE_JS_BUNDLE.test(normalized);
}
