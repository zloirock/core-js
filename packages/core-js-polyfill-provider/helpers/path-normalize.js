import { readFileSync, statSync } from 'node:fs';
import Module, { createRequire } from 'node:module';
import { isAbsolute, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import entriesMap from '@core-js/compat/entries' with { type: 'json' };
import { wrapWithCause } from './error-tag.js';

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
  const query = id.indexOf('?', offset);
  const end = query === -1 ? id.length : query;
  const firstHash = id.indexOf('#', offset);
  if (firstHash === -1 || firstHash >= end) return id.slice(0, end);
  // A file URL's fragment is opaque, even when it contains a slash. Filesystem ids
  // can have a literal hash in a directory name. Ignore slashes inside query values.
  if (/^(?:\/@id\/|\/@fs(?=\/))*file:/i.test(id)) return id.slice(0, firstHash);
  const separator = Math.max(id.lastIndexOf('/', end - 1), id.lastIndexOf('\\', end - 1));
  const hash = firstHash > separator ? firstHash : id.indexOf('#', separator + 1);
  return id.slice(0, hash === -1 ? end : Math.min(end, hash));
}

// Windows long-path / device-path prefixes in their canonical (post-`\\`->`/`) form.
// Windows module IDs can carry such prefixes; strip so the
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

// Node's import.meta.resolve ignores its parent argument without a flag. Forward this
// lookup with the project's parent URL and the caller's own ESM conditions and hooks.
function projectImportURL(source, parent) {
  // Bun's resolver takes a filename. Deno and Node's asynchronous loader thread do not
  // expose a project-relative synchronous ESM resolver through Node's hooks.
  if (process.versions.bun) return new URL(import.meta.resolve(source, parent));
  if (!import.meta.resolve || process.versions.deno) return pathToFileURL(createRequire(parent).resolve(source));
  const parentURL = pathToFileURL(parent).href;
  // eslint-disable-next-line node/no-unsupported-features/node-builtins -- synchronous hooks are available since Node 22.15
  const hook = Module.registerHooks({ resolve(specifier, context, nextResolve) {
    if (specifier === source && context.parentURL === import.meta.url) return nextResolve(specifier, { ...context, parentURL });
    return nextResolve(specifier, context);
  } });
  try {
    return new URL(import.meta.resolve(source));
  } finally {
    hook.deregister();
  }
}

const absoluteImportCache = new Map();
const PATH_IMPORT_HOSTS = new Map([
  ['esbuild', 'path'], ['rollup', 'path'], ['@rollup/plugin-babel', 'path'], ['webpack', 'webpack'], ['babel-loader', 'webpack'],
]);

// These resolvers consume filesystem requests. Standalone Node ESM consumes URL specifiers.
export function absoluteImportsForHost(enabled, host) {
  return enabled && (PATH_IMPORT_HOSTS.get(host) ?? enabled);
}

// Resolve from the project working directory, not the provider's installation. Builds do not
// mutate their package layout; include the directory in the key so another project in this
// process cannot inherit its paths. Only successful resolutions are retained.
export function resolveImportPath(pkg, subpath, absoluteImports, importStyle = 'require') {
  const source = `${ pkg }/${ subpath }`;
  if (!absoluteImports) return source;
  const directory = process.cwd();
  const bundler = importStyle === 'import' && typeof absoluteImports === 'string' && absoluteImports;
  const key = `${ directory }\0${ bundler || importStyle }\0${ source }`;
  const cached = absoluteImportCache.get(key);
  if (cached !== undefined) return cached;
  let result;
  try {
    const parent = resolve(directory, 'package.json');
    if (importStyle === 'import') {
      let url = projectImportURL(source, parent);
      // Packages without an exports map can rely on extension and directory-index lookup.
      // An explicit ESM target is exact, even when a CommonJS sibling exists.
      try {
        // eslint-disable-next-line node/no-sync -- both plugins resolve imports during the synchronous transform
        if (!statSync(url).isFile()) throw new Error(`not a file: ${ url.href }`);
      } catch (error) {
        if (url.search || url.hash || (error.code && error.code !== 'ENOENT' && error.code !== 'ENOTDIR')) throw error;
        // eslint-disable-next-line node/no-unsupported-features/node-builtins -- this finds the manifest even when exports hides it
        const manifest = Module.findPackageJSON?.(source, parent);
        // eslint-disable-next-line node/no-sync -- a legacy package directory may have no manifest
        const hasManifest = manifest && statSync(manifest, { throwIfNoEntry: false });
        // eslint-disable-next-line node/no-sync -- resolving a filename must not run a user's module load hook
        const exportMap = hasManifest ? JSON.parse(readFileSync(manifest, 'utf8').replace(/^\uFEFF/, '')).exports : null;
        if (!manifest || (exportMap ?? null) !== null) throw error;
        url = pathToFileURL(createRequire(parent).resolve(fileURLToPath(url)));
      }
      const path = fileURLToPath(url);
      if (bundler) {
        const file = path.split(sep).join('/');
        const suffix = url.href.slice(url.href.search(/[#?]|$/));
        if (bundler === 'webpack' && (suffix || file.includes('?', uncPrefixOffset(file)))) {
          // FileUriPlugin decodes the URL, then webpack splits the resource at unquoted '?' and '#'.
          url.pathname = url.pathname.replaceAll(/%(?:23|3f)/gi, '%00$&');
          result = url.href;
        } else result = suffix ? url.href : file;
      } else result = path.startsWith('/') && new URL(path, url).href === url.href ? path : url.href;
    } else result = createRequire(parent).resolve(source).split(sep).join('/');
  } catch (error) {
    throw wrapWithCause(`cannot resolve ${ JSON.stringify(source) } from ${ JSON.stringify(directory) }`, error);
  }
  absoluteImportCache.set(key, result);
  return result;
}

// the DIRECTORY a package resolves to need not carry its name (`@core-js/pure` lives in
// `core-js-pure` in a workspace, and a pnpm store renames again), so a specifier the injector
// spelled as a resolved file path is recognised by the package ROOT the same resolver produced -
// normalized like every other specifier, or null when the package does not resolve at all
const packageRootCache = new Map();

export function packageRootPrefix(pkg, fileURL = false) {
  const key = `${ process.cwd() }\0${ fileURL }\0${ pkg }`;
  if (packageRootCache.has(key)) return packageRootCache.get(key);
  let resolved;
  try {
    resolved = resolveImportPath(pkg, 'package.json', true);
  } catch {
    packageRootCache.set(key, null);
    return null;
  }
  const marker = '/package.json';
  // Recognition also asks about optional packages; absence is no provenance proof.
  const root = resolved.endsWith(marker)
    ? normalizeImportSource((fileURL ? pathToFileURL(resolved).href : resolved).slice(0, -marker.length + 1)) : null;
  packageRootCache.set(key, root);
  return root;
}

// core-js ships only `.js` files; the trailing `/index` collapses when users reference a
// directory-style entry path (`core-js/stable/array/index` === `core-js/stable/array`)
export function canonicalizeEntrySubpath(s) {
  return s.replace(/\.js$/, '').replace(/\/index$/, '');
}

// Node accepts file URLs as ESM specifiers. A CommonJS load needs a filesystem path.
export function isFileURLSpecifier(source) {
  return /^file:[/\\]/i.test(source);
}

// `?v=123` / `#hash` suffixes are Vite/webpack cache-bust markers, not part of the entry path.
// match `source` against `<pkg>/<subPrefix><rest>` where `pkg` is one of `pkgs`;
// returns canonicalized `<rest>` or null when no prefix matches or `<rest>` is empty.
// `normalizeImportSource` (shared with `getCoreJSEntry`) handles case / backslash / slash-
// collapse uniformly so pre-pass dedup catches Vite-rewritten Windows imports and Farm's
// doubled-slash artifact equally
// `{ entry, pkg }` for the most specific package boundary, or null. A checkout directory can
// itself be called `core-js` and contain a different polyfill package. The package travels
// with the entry because a recognised import is re-emitted, and re-emitting it under the plugin's
// own package would silently retarget a user's polyfill at another one
export function matchEntrySubpath(source, pkgs, subPrefix, esm = null, importStyle = null, absoluteImports = false) {
  if (isAssetImport(source)) return null;
  const clean = normalizeImportSource(source);
  const fileURL = isFileURLSpecifier(clean);
  if (fileURL && esm === false) return null;
  const absoluteId = clean.startsWith('/') || /^(?:[a-z]:|file:)\//.test(clean);
  const absolute = isAbsolute(source) && !/^\/@(?:fs|id)\//.test(source);
  const bundlePath = esm && typeof absoluteImports === 'string';
  const absoluteESM = absolute && esm !== false && (source.startsWith('/') || bundlePath);
  const reserved = absoluteESM && /[#%?]/.test(source);
  let physical;
  let match = null;
  let length = Infinity;
  for (const pkg of pkgs) {
    // Package segments inside a relative path belong to the author's module.
    if (!absoluteId && !clean.startsWith(`${ pkg }/`)) continue;
    const afterPkg = subpathAfterPackage(clean, pkg);
    // `continue`, not `return null`: when an earlier package is a path-prefix of `source` but
    // the sub-prefix doesn't match (`a/` matches but `a/stable/x` isn't under `modules/`), a
    // LATER package that IS a full match (`a/b/` over `a/b/modules/x`) must still be tried -
    // bailing here would make matching order-dependent
    if (afterPkg === null || !afterPkg.startsWith(subPrefix)) continue;
    const entry = canonicalizeEntrySubpath(afterPkg.slice(subPrefix.length)) || null;
    if (entry && afterPkg.length < length) {
      // A physical ESM import names a module instance, including its query and fragment.
      // Bare bundler ids can still use cache-busting suffixes.
      // A raw path with reserved characters can also be a CommonJS filename when the load kind is unknown.
      const projectFile = absoluteESM && (esm || !reserved) && clean.slice(0, -afterPkg.length) === packageRootPrefix(pkg);
      // A second physical copy can have the same package segments. Only the resolver can establish identity.
      if (absolute && !projectFile && physical === undefined) {
        try {
          physical = createRequire(import.meta.url).resolve(source).split(sep).join('/');
        } catch {
          physical = null; // Virtual bundler ids can still be recognized by their layout.
        }
      }
      if (physical && (!absoluteESM || (esm === null && reserved))) {
        try {
          if (physical !== resolveImportPath(pkg, subPrefix + entry, true)) continue;
        } catch {
          continue;
        }
      } else if (fileURL || projectFile || (absoluteESM && (physical || reserved))) {
        let target;
        try {
          let matches;
          if (bundlePath && absolute) {
            target = resolveImportPath(pkg, subPrefix + entry, absoluteImports, 'import');
            matches = source === target || physical === target;
          } else {
            target = resolveImportPath(pkg, subPrefix + entry, true, 'import');
            const expected = new URL(target, 'file:///').href;
            const authored = new URL(source, 'file:///').href;
            matches = authored === expected || import.meta.resolve(authored) === expected;
          }
          if (!matches) continue;
        } catch {
          // A bundler can supply an absolute id for an alias outside Node's package tree.
          if (fileURL || physical || target || packageRootPrefix(pkg)) continue;
        }
      }
      match = { entry, pkg };
      length = afterPkg.length;
    }
  }
  // The shipped packages export the same files to both loaders. A fork can export two
  // different modules at one subpath, so its authored load must keep its original kind.
  if (match && importStyle && importStyle !== (esm ? 'import' : 'require') && !CORE_JS_PACKAGES.includes(match.pkg)) return null;
  return match;
}

// what follows the package in an already-normalized specifier, or null. three spellings answer for
// one package: the bare name the source writes, the RESOLVED ROOT the injector writes under
// `absoluteImports` (whose directory need not be named after the package), and - for a layout
// neither of those covers - the name as a path SEGMENT
function subpathAfterPackage(clean, pkg) {
  const pkgPrefix = `${ pkg }/`;
  if (clean.startsWith(pkgPrefix)) return clean.slice(pkgPrefix.length);
  const root = packageRootPrefix(pkg, clean.startsWith('file:/'));
  if (root && clean.startsWith(root)) return clean.slice(root.length);
  const segment = clean.lastIndexOf(`/${ pkgPrefix }`);
  if (segment !== -1) return clean.slice(segment + 1 + pkgPrefix.length).replace(PACKAGE_CACHE_VERSION, '');
  const versioned = clean.lastIndexOf(`/${ pkg }@`);
  if (versioned === -1) return null;
  const tail = clean.slice(versioned + pkg.length + 2);
  return PACKAGE_CACHE_VERSION.test(tail) ? tail.replace(PACKAGE_CACHE_VERSION, '') : null;
}

// Bun puts @version@@@revision after the package name; Deno uses a version directory.
const PACKAGE_CACHE_VERSION = /^\d+\.\d+\.\d+(?:[+-][\w+\-.]+)?(?:@@@\d+)?\//;

const CORE_JS_PACKAGES = ['core-js', 'core-js-pure', '@core-js/pure'];

// A source specifier must name a known package or its resolved absolute tree. Relative
// lookalikes are user modules; flavor segments alone never prove package ownership.
export function coreJSImportSubpath(source, packages = null, esm = null) {
  if (typeof source !== 'string') return null;
  return matchEntrySubpath(source, packages ? [...packages, ...CORE_JS_PACKAGES] : CORE_JS_PACKAGES, '', esm)?.entry ?? null;
}

const ASSET_EXPORT_KEYS = new Set(['raw', 'url', 'inline', 'worker', 'sharedworker']);

// Vite asset queries change the export itself. A cache-busting query still names the module.
export function isAssetImport(source) {
  const query = source.indexOf('?');
  if (query === -1) return false;
  const end = stripQueryHash(source).length;
  if (source[end] !== '?') return false;
  const hash = source.indexOf('#', end + 1);
  for (const name of new URLSearchParams(source.slice(end + 1, hash === -1 ? undefined : hash)).keys()) {
    if (ASSET_EXPORT_KEYS.has(name.toLowerCase())) return true;
  }
  return false;
}

const PURE_IMPORT_FLAVOR_SEGMENTS = new Set(['actual', 'es', 'features', 'full', 'stable']);
// the source-level half of the recognition: the entry a pure-package specifier names, or null
// when no flavor segment with an entry tail is present. This extracts a trusted subpath;
// callers reading source specifiers first prove package ownership with coreJSImportSubpath.
export function pureImportSourceEntry(source) {
  if (typeof source !== 'string' || isAssetImport(source)) return null;
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
  if (subpathAfterPackage(normalized, 'core-js-bundle') !== null
    || subpathAfterPackage(normalized, '@core-js/bundle') !== null) return true;
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
