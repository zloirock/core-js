import { fileURLToPath } from 'node:url';
import entriesMap from '@core-js/compat/entries' with { type: 'json' };

// strip Vite-style `?import` / `?t=123` / `#hash` suffixes from a module id
export function stripQueryHash(id) {
  const at = id.search(/[#?]/);
  return at === -1 ? id : id.slice(0, at);
}

// `array/at` -> `full/array/at` modules; top-level `actual`/`index`/... -> their root entry
export function lookupEntryModules(pattern) {
  if (typeof pattern !== 'string') return null;
  return entriesMap[`full/${ pattern }`] ?? entriesMap[pattern] ?? null;
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

// skip core-js internals and bundles - polyfilling their own code creates circular dependencies
const CORE_JS_INTERNAL_FILE = /[/\\](?:core-js|core-js-pure|@core-js[/\\]pure)[/\\](?:actual|es|features|full|internals|modules|proposals|stable|stage)[/\\]/;
const CORE_JS_BUNDLE = /[/\\](?:core-js-bundle|@core-js[/\\]bundle)[/\\]/;

export function isCoreJSFile(filename) {
  // normalize doubled slashes/backslashes - some bundlers (farm) pass ids like `core-js-pure//full/...`
  const normalized = filename.replaceAll(/[/\\]{2,}/g, '/');
  return CORE_JS_INTERNAL_FILE.test(normalized) || CORE_JS_BUNDLE.test(normalized);
}
