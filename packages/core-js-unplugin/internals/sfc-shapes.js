import { stripQueryHash } from '@core-js/polyfill-provider/helpers/path-normalize';

// SFC (Vue / Svelte / Astro) virtual-module ids and bundler asset / proxy ids carry their metadata as
// QUERY PARAMS, not free-form text: `App.vue?vue&type=script&lang=ts`, `foo.js?url`, `x.js?commonjs-proxy`.
// There is no cross-framework SPEC for these ids - each framework plugin + bundler invents its own
// query - so SOME explicit list of markers / types is unavoidable. What IS reusable is the PARSING:
// split the id ONCE into a path + structured params and decide on `params.get(...)` / `params.has(...)`.
// The older approach scanned the raw id with one regex per case, which mis-fired on param names that
// merely CONTAIN a keyword (`clang=` / `slang=` matched a `lang=` substring) and accreted a fresh regex
// for every boundary / order / hash variant. The structured form below cannot have that class of bug.

// frameworks whose SFC virtual id carries a bare marker param (`?vue`, `?svelte`, `?astro`)
const SFC_FRAMEWORK_MARKERS = ['astro', 'svelte', 'vue'];
// JS/TS langs the parser handles (js / ts / cjs / mjs / cts / mts / jsx / tsx). `d.ts` is excluded
// (declaration, no runtime); any other `lang=` value (scss / en / ...) marks a non-JS block. the two
// arms enumerate exactly the real extensions - a single `[cm]?[jt]sx?` would also accept the
// non-existent `cjsx` / `mtsx`, whose lifted suffix oxc can't parse as JSX/TS
const SFC_JS_LANG_RE = /^(?:[cm]?[jt]s|[jt]sx)$/;
// SFC sub-block types whose body is CSS / markup, never runnable JS
const SFC_NON_JS_TYPES = new Set(['style', 'template']);
// Vite asset-import query params whose resolved body is not user-authored JS (`?url` / `?raw` /
// `?worker` / `?inline` / ...). matched at ANY param position (the prior regex used `[&?]`), so a
// structured key check is order-neutral by construction. `worker` has `-module` / `_file` sub-forms
const ASSET_QUERY_PARAMS = new Set(['css', 'direct', 'html-proxy', 'import', 'inline', 'raw', 'url',
  'used', 'worklet']);
const WORKER_PARAM_RE = /^worker(?:[-_][a-z]+)?$/;

// Split a bundler module id into its path and query params. Each decoded param key + value is lowercased
// so every structured lookup stays case-insensitive (markers / types / langs were matched case-
// insensitively by the prior `/i` regexes - some pipelines preserve author casing like `lang=TS`); the
// path keeps its original case (extension matching is independently case-insensitive). The hash is cut
// before parsing because URLSearchParams treats `#` as a literal, so a `lang=ts#L10` tail would leak in.
export function parseModuleId(id) {
  const path = stripQueryHash(id);
  // `rest` begins at the first `#` or `?` (the path boundary). only a LEADING `?` opens a query; a
  // leading `#` means the remainder is a fragment, so a `?` inside it (`path#frag?key`) is fragment
  // text, not a query - scanning for `?` anywhere would mis-read it as `?key` and skip a real JS file
  // (`?url` asset query) or mis-admit an SFC whose marker lives in the fragment. the hash is returned
  // verbatim for the one caller that keys on it (the snapshot cache); detection ignores it
  const rest = id.slice(path.length);
  let query = '';
  let hash = '';
  if (rest[0] === '?') {
    const hashStart = rest.indexOf('#');
    query = hashStart === -1 ? rest.slice(1) : rest.slice(1, hashStart);
    if (hashStart !== -1) hash = rest.slice(hashStart);
  } else if (rest[0] === '#') {
    hash = rest;
  }
  // lowercase each key + value AFTER URLSearchParams percent-decodes them, not the raw query string: a
  // percent-encoded letter decodes to its literal AFTER a raw lowercase (`lang=t%53` -> `tS`), surviving
  // it - so structured lang / type lookups missed it. lowercasing post-decode keeps them case-insensitive;
  // the path keeps its original case (extension matching is independently case-insensitive)
  const params = new URLSearchParams();
  for (const [key, value] of new URLSearchParams(query)) params.append(key.toLowerCase(), value.toLowerCase());
  return { path, params, hash };
}

// --- atomic SFC predicates (composed differently by each consumer) ---

export function sfcFrameworkMarked(params) {
  return SFC_FRAMEWORK_MARKERS.some(marker => params.has(marker));
}

// the SFC block lang ext from EITHER the `lang=<ext>` key=value form OR the dotted `lang.<ext>` form
// (Vite's vue plugin appends `&lang.ts` so its pipeline routes the block through the right extension
// transform - URLSearchParams reads it as a value-less key `lang.ts`). null IFF no lang param is present;
// an empty `lang=` / `lang.` yields '' (present-but-empty) so consumers can tell absent from degenerate.
// NOT filtered to JS langs - callers gate on SFC_JS_LANG_RE. already lowercased by parseModuleId
function sfcLangParam(params) {
  const valueForm = params.get('lang');
  if (valueForm !== null) return valueForm;
  for (const key of params.keys()) {
    if (key.startsWith('lang.')) return key.slice(5);
  }
  return null;
}

// the JS/TS lang ext of the SFC lang hint (either form), or null when the param is absent / empty / a
// non-JS lang. without the dotted-form arm a `lang.ts` block was admitted as JS-by-default yet its TS
// suffix was never lifted, so oxc parsed the TS / TSX / JSX body as plain JS and rejected it
export function sfcJsLang(params) {
  const lang = sfcLangParam(params);
  return lang && SFC_JS_LANG_RE.test(lang) ? lang : null;
}

export function sfcIsNonJsTypeBlock(params) {
  return SFC_NON_JS_TYPES.has(params.get('type'));
}

// --- composed predicates ---

// shouldTransform's SFC admission: a runnable JS/TS sub-block. An explicit JS lang (either form) admits
// unless the block is a style / template body; otherwise a framework-marked script / module block with NO
// lang param AT ALL is JS by default. the default arm fires only when `sfcLangParam` is null (truly
// absent) - any lang hint (`lang=ts` / `lang.ts` / non-JS `lang.coffee` / even an empty `lang=` / `lang.`)
// is NOT markerless and must not default to JS, else a non-JS lang would parse-as-JS like the JS langs did
export function isSfcScriptBlock(params) {
  if (sfcIsNonJsTypeBlock(params)) return false;
  if (sfcJsLang(params)) return true;
  const type = params.get('type');
  return sfcLangParam(params) === null && sfcFrameworkMarked(params) && (type === 'module' || type === 'script');
}

// snapshot-cache's sub-block predicate: ANY framework-marked block (incl. style / template, which still
// need a distinct cache key so sibling blocks of one file don't collide) OR a JS-lang-admitted markerless
// block. Intentionally WIDER than isSfcScriptBlock (which gates polyfill injection, not cache keying).
export function isSfcSubBlock(params) {
  return sfcFrameworkMarked(params) || (!!sfcJsLang(params) && !sfcIsNonJsTypeBlock(params));
}

// a Vite asset-import query whose body is not user JS - skip transform entirely
export function isViteAssetQuery(params) {
  for (const key of params.keys()) {
    if (ASSET_QUERY_PARAMS.has(key) || WORKER_PARAM_RE.test(key)) return true;
  }
  return false;
}

// Lift the SFC `lang=` hint onto the post-strip id so oxc-parser's extension-based parser inference sees
// the right language: `App.vue?vue&type=script&lang=ts` -> `App.vue.ts`. Without the lift oxc defaults
// to plain JS on the unknown `.vue` extension and silently rejects the TS body.
export function liftSfcLangSuffix(id) {
  const { path, params } = parseModuleId(id);
  const ext = sfcJsLang(params);
  return ext ? `${ path }.${ ext }` : path;
}
