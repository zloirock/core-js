import { fileURLToPath } from 'node:url';
import entriesMap from '@core-js/compat/entries' with { type: 'json' };

const UNC_PREFIXES = ['\\\\?\\', '\\\\.\\', '//?/', '//./'];

// chars to skip before scanning a module id for `?` / `#` separators: the length of the
// Windows UNC prefix when one leads the id. the query scan skips it rather than mistaking
// its `?` for a query start (`\\?\C:\x.js?t=1` truncating to `\\`)
function uncPrefixOffset(id) {
  return UNC_PREFIXES.some(p => id.startsWith(p)) ? 4 : 0;
}

// strip Vite-style `?import` / `?t=123` / `#hash` suffixes from a module id.
// Windows UNC prefixes `\\?\` (long-path) and `\\.\` (device) embed `?`/`.` at index 2 -
// skip the 4-char prefix so the search doesn't mistake them for a query separator.
// also skip the forward-slash forms `//?/` and `//./` produced by Vite/Rollup path
// normalization stages, otherwise the embedded `?` was treated as a query separator and
// the path silently truncated to `//`.
// lives in path-namespace despite being consumed by AST plugins because the operation is
// purely string normalization on a module-id string - no AST awareness needed
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

// the package name as entry detection and import emission spell it: interior `//` runs collapsed
// and trailing slashes dropped. `getCoreJSEntry` joins via `${ pkg }/`, so `'my-core-js/'` would
// yield `'my-core-js//foo'` and miss every entry; `normalizeImportPath` canonicalises sources with
// slash-collapse, so `'my//core-js'` would never match its own normalised imports; and the injector
// joins the same way, so `'@core-js/pure///'` would print `'@core-js/pure///actual/array/from'`.
// a name made of slashes alone collapses to `''`, and the option validator rejects exactly that
// null-space by asking this function rather than a second spelling of the rule
export function canonicalisePackage(name) {
  const collapsed = name.replaceAll(/\/{2,}/g, '/');
  let end = collapsed.length;
  while (end > 0 && collapsed[end - 1] === '/') end--;
  return end === collapsed.length ? collapsed : collapsed.slice(0, end);
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

// the DIRECTORY a package resolves to need not carry its name (`@core-js/pure` lives in
// `core-js-pure` in a workspace, and a pnpm store renames again), so a specifier the injector
// spelled as a resolved file path is recognised by the package ROOT the same resolver produced -
// normalized like every other specifier, or null when the package does not resolve at all
const packageRootCache = new Map();

export function packageRootPrefix(pkg) {
  if (packageRootCache.has(pkg)) return packageRootCache.get(pkg);
  const resolved = resolveImportPath(pkg, 'package.json', true);
  const marker = '/package.json';
  // an UNRESOLVED package falls back to the bare specifier, which the bare-prefix check already
  // covers - reporting it here would claim a root that does not exist
  const root = resolved.endsWith(marker) && resolved !== `${ pkg }${ marker }`
    ? normalizeImportSource(resolved.slice(0, -marker.length + 1)) : null;
  packageRootCache.set(pkg, root);
  return root;
}

// core-js ships only `.js` files; the trailing `/index` collapses when users reference a
// directory-style entry path (`core-js/stable/array/index` === `core-js/stable/array`)
export function canonicalizeEntrySubpath(s) {
  return s.replace(/\.js$/, '').replace(/\/index$/, '');
}

// `?v=123` / `#hash` suffixes are Vite/webpack cache-bust markers, not part of the entry path.
// match `source` against `<pkg>/<subPrefix><rest>` where `pkg` is one of `pkgs`;
// returns canonicalized `<rest>` or null when no prefix matches or `<rest>` is empty.
// `normalizeImportSource` (shared with `getCoreJSEntry`) handles case / backslash / slash-
// collapse uniformly so pre-pass dedup catches Vite-rewritten Windows imports and Farm's
// doubled-slash artifact equally
// `{ entry, pkg }` for the FIRST package this specifier belongs to, or null. the package travels
// with the entry because a recognised import is re-emitted, and re-emitting it under the plugin's
// own package would silently retarget a user's polyfill at another one
export function matchEntrySubpath(source, pkgs, subPrefix) {
  const clean = normalizeImportSource(source);
  for (const pkg of pkgs) {
    const afterPkg = subpathAfterPackage(clean, pkg);
    // `continue`, not `return null`: when an earlier package is a path-prefix of `source` but
    // the sub-prefix doesn't match (`a/` matches but `a/stable/x` isn't under `modules/`), a
    // LATER package that IS a full match (`a/b/` over `a/b/modules/x`) must still be tried -
    // bailing here would make matching order-dependent
    if (afterPkg === null || !afterPkg.startsWith(subPrefix)) continue;
    const entry = canonicalizeEntrySubpath(afterPkg.slice(subPrefix.length)) || null;
    if (entry) return { entry, pkg };
  }
  return null;
}

// what follows the package in an already-normalized specifier, or null. three spellings answer for
// one package: the bare name the source writes, the RESOLVED ROOT the injector writes under
// `absoluteImports` (whose directory need not be named after the package), and - for a layout
// neither of those covers - the name as a path SEGMENT
function subpathAfterPackage(clean, pkg) {
  const pkgPrefix = `${ pkg }/`;
  if (clean.startsWith(pkgPrefix)) return clean.slice(pkgPrefix.length);
  const root = packageRootPrefix(pkg);
  if (root && clean.startsWith(root)) return clean.slice(root.length);
  const segment = clean.lastIndexOf(`/${ pkgPrefix }`);
  return segment === -1 ? null : clean.slice(segment + 1 + pkgPrefix.length);
}

const CORE_JS_PACKAGES = ['core-js', 'core-js-pure', '@core-js/pure'];

// A source specifier must name a known package or its resolved absolute tree. Relative
// lookalikes are user modules; flavor segments alone never prove package ownership.
export function coreJSImportSubpath(source, packages = null) {
  if (typeof source !== 'string') return null;
  const clean = normalizeImportSource(source);
  const absolute = clean.startsWith('/') || /^(?:[a-z]:|file:)\//.test(clean);
  if (!absolute && !packages?.some(pkg => clean.startsWith(`${ pkg }/`))
    && CORE_JS_PACKAGES.every(pkg => !clean.startsWith(`${ pkg }/`))) return null;
  return (packages && matchEntrySubpath(clean, packages, '')
    || matchEntrySubpath(clean, CORE_JS_PACKAGES, ''))?.entry ?? null;
}

const PURE_IMPORT_FLAVOR_SEGMENTS = new Set(['actual', 'es', 'features', 'full', 'stable']);
// the source-level half of the recognition: the entry a pure-package specifier names, or null
// when no flavor segment with an entry tail is present. This extracts a trusted subpath;
// callers reading source specifiers first prove package ownership with coreJSImportSubpath.
export function pureImportSourceEntry(source) {
  if (typeof source !== 'string') return null;
  const segments = canonicalizeEntrySubpath(normalizeImportSource(source)).split('/');
  const at = segments.findIndex(segment => PURE_IMPORT_FLAVOR_SEGMENTS.has(segment));
  return at === -1 || at === segments.length - 1 ? null : segments.slice(at + 1).join('/');
}

// Only a flavor at the package root names a pure entry. A nested directory named
// `features` in a user file below a checkout does not establish pure provenance.
export function pureImportSubpath(source, packages = null) {
  const subpath = coreJSImportSubpath(source, packages);
  return subpath && PURE_IMPORT_FLAVOR_SEGMENTS.has(subpath.split('/', 1)[0]) ? subpath : null;
}

// skip core-js internals, root entry re-exports, and bundles - polyfilling them creates
// circular dependencies. The package boundary covers Farm/Bun/esbuild-plugin bare ids too.
// patterns operate on canonical (normalizeImportSource-output) form: forward slashes only,
// lowercase, no query/hash, no UNC prefix - back-slash alternation no longer needed
const CORE_JS_INTERNAL_FILE = /^(?:(?:actual|es|features|full|internals|modules|proposals|stable|stage)\/|(?:configurator|index)\.js$)/;
const CORE_JS_BUNDLE = /(?:^|\/)(?:core-js-bundle|@core-js\/bundle)(?:\/|$)/;

export function isCoreJSFile(filename, packages = null) {
  if (typeof filename !== 'string') return false;
  const normalized = normalizeImportSource(filename);
  if (CORE_JS_BUNDLE.test(normalized)) return true;
  for (const pkg of packages ?? []) {
    const subpath = subpathAfterPackage(normalized, pkg);
    if (subpath !== null && CORE_JS_INTERNAL_FILE.test(subpath)) return true;
  }
  for (const pkg of CORE_JS_PACKAGES) {
    const subpath = subpathAfterPackage(normalized, pkg);
    if (subpath !== null && CORE_JS_INTERNAL_FILE.test(subpath)) return true;
  }
  return false;
}

// the suffix family TypeScript gives a declaration file, anchored at the end so a DIRECTORY
// named like one (`/pkg/x.d.ts/inner.ts`) does not swallow the sources under it
const DECLARATION_FILE = /\.d\.(?:cts|mts|ts)$/;

// a TypeScript DECLARATION file emits no runtime code whatsoever: every declaration in it is
// ambient whether or not it spells `declare`, so nothing written there is ever evaluated and a
// polyfill for it is pure over-injection - in usage-pure, a rewrite of a read that never runs.
// the other file-level question next to it asks about core-js internals, which is why this is
// its own predicate rather than a disjunct of that one
export function isDeclarationFile(filename) {
  return typeof filename === 'string' && DECLARATION_FILE.test(normalizeImportSource(filename));
}

const MODULE_ID_LANGUAGE = /\.(?<prefix>[cm]?)(?<family>[jt])s(?<jsx>x?)$/;

// the language family a module id names, or null when it names no runnable JS/TS source at all.
// asked through `normalizeImportSource`, so the answer is case-insensitive by construction - the
// property the hand-rolled spellings beside it disagreed about, and a wrong answer there is a
// FATAL parse rather than a narrower one. `jsx` follows TypeScript's own rule: the js family
// always admits it, because JSX is a strict superset there - a `<` never starts a JS expression,
// measured over fifty thousand parses of this repository with zero divergence - while the ts
// family admits it only through `.tsx`, since `.ts` spends the same syntax on the legacy
// angle-bracket cast. `script` / `esm` are the extension's own format answer, which neither the
// body nor the caller may overrule
export function moduleIdLanguage(id) {
  if (typeof id !== 'string') return null;
  const path = normalizeImportSource(id);
  const match = MODULE_ID_LANGUAGE.exec(path);
  if (!match || DECLARATION_FILE.test(path)) return null;
  const { prefix, family, jsx } = match.groups;
  const ts = family === 't';
  return { ts, jsx: !ts || jsx === 'x', script: prefix === 'c', esm: prefix === 'm' };
}
