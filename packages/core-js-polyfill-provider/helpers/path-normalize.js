import { fileURLToPath } from 'node:url';
import entriesMap from '@core-js/compat/entries' with { type: 'json' };

// strip Vite-style `?import` / `?t=123` / `#hash` suffixes from a module id.
// Windows UNC prefixes `\\?\` (long-path) and `\\.\` (device) embed `?`/`.` at index 2 -
// skip the 4-char prefix so the search doesn't mistake them for a query separator.
// lives in path-namespace despite being consumed by AST plugins because the operation is
// purely string normalization on a module-id string - no AST awareness needed
export function stripQueryHash(id) {
  const offset = id.startsWith('\\\\?\\') || id.startsWith('\\\\.\\') ? 4 : 0;
  const at = id.slice(offset).search(/[#?]/);
  return at === -1 ? id : id.slice(0, offset + at);
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
// circular dependencies. `(?:^|[/\\])` covers Farm/Bun/esbuild-plugin bare ids too
const CORE_JS_INTERNAL_FILE = /(?:^|[/\\])(?:core-js|core-js-pure|@core-js[/\\]pure)[/\\](?:(?:actual|es|features|full|internals|modules|proposals|stable|stage)[/\\]|index\.js$)/;
const CORE_JS_BUNDLE = /(?:^|[/\\])(?:core-js-bundle|@core-js[/\\]bundle)(?:[/\\]|$)/;

export function isCoreJSFile(filename) {
  // normalize doubled slashes/backslashes - some bundlers (farm) pass ids like `core-js-pure//full/...`
  // and strip Vite/Rolldown query/hash suffix upfront so callers don't have to
  const normalized = stripQueryHash(filename).replaceAll(/[/\\]{2,}/g, '/');
  return CORE_JS_INTERNAL_FILE.test(normalized) || CORE_JS_BUNDLE.test(normalized);
}
