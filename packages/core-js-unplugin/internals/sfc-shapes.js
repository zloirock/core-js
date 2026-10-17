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
// SFC sub-block types whose body is CSS, at every phase
const SFC_STYLE_TYPES = new Set(['style']);
// ... and the one whose body is markup only until the framework plugin compiles it: on `post` a
// `type=template` block is expected to hold the render FUNCTION that compilation produced, ordinary
// JS owed its polyfills like any other. Same inference and the same cheap failure as the bare id
const SFC_COMPILED_TO_JS_TYPES = new Set(['template']);
// framework SFC source extensions. the bare id (no marker params) is the whole file, markup on
// `pre` and the compiled module on `post`
const SFC_EXT_RE = /\.(?:astro|svelte|vue)$/i;
// Vite asset-import query params whose resolved body is not user-authored JS (`?url` / `?raw` /
// `?inline` / ...). matched at ANY param position (the prior regex used `[&?]`), so a
// structured key check is order-neutral by construction
const ASSET_QUERY_PARAMS = new Set(['css', 'direct', 'import', 'inline', 'raw', 'url', 'used', 'worklet']);
// `?worker` / `?sharedworker` resolve to a worker-CONSTRUCTOR factory Vite generates, and its
// `-module` / `-inline` sub-forms with them; the body is bundled separately under its own id
const WORKER_WRAPPER_PARAM_RE = /^(?:shared)?worker(?:-[a-z]+)?$/;
// ... and THAT id is `?worker_file&type=module`, which carries the author's own worker source.
// `type=classic` is loaded as a script (Vite prepends `importScripts`), where neither import
// render can land, so it stays out
const WORKER_SOURCE_PARAM = 'worker_file';
// vite's html-proxy body is an inline block lifted out of an .html file; the trailing
// `index=<n>.<ext>` says which kind, exactly as vite's own `htmlProxyRE` reads it. `.js` is the
// author's `<script type="module">` body - real JS on every phase - and `.css` an inline `<style>`
const HTML_PROXY_JS_INDEX_RE = /^\d+\.js$/;

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

function sfcFrameworkMarked(params) {
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
function sfcJsLang(params) {
  const lang = sfcLangParam(params);
  return lang && SFC_JS_LANG_RE.test(lang) ? lang : null;
}

// a framework SFC SOURCE file by its BARE id - the whole file rather than one of the sub-blocks its
// plugin splits it into. Whether that plugin hands the id back compiled is INFERRED from its
// conventions, not verified here, and the admission is safe because being wrong is cheap: a body
// that is still markup fails the parse, which warns and skips. Refusing instead would lose the
// polyfills of a compiled module silently. Any query or fragment means another stage owns the id
export function isSfcSourceFile({ path, params, hash }) {
  // a bare trailing separator carries nothing, so `App.vue?` and `App.vue#` are the bare id the
  // same way `App.vue` is - the question is whether anything NAMES a sub-part of the file
  return SFC_EXT_RE.test(path) && !hash.slice(1) && params.size === 0;
}

// vite's inline `<script>` proxy, as opposed to the `<style>` one sharing the marker
export function isHtmlProxyScript(params) {
  return params.has('html-proxy') && HTML_PROXY_JS_INDEX_RE.test(params.get('index') ?? '');
}

// --- composed predicates ---

// shouldTransform's SFC admission: a runnable JS/TS sub-block. A style body never admits; a TEMPLATE
// body admits only once `compiled` says the framework plugin has already turned it into JS, and only
// if it declares a JS lang. Otherwise an explicit JS lang (either form) admits, and a framework-marked
// script / module block with NO lang param AT ALL is JS by default. That default arm fires only when
// `sfcLangParam` is null (truly absent) - any lang hint (`lang=ts` / `lang.ts` / non-JS `lang.coffee` /
// even an empty `lang=` / `lang.`) is NOT markerless and must not default to JS, else a non-JS lang
// would parse-as-JS like the JS langs did
export function isSfcScriptBlock(params, { compiled = false } = {}) {
  const type = params.get('type');
  if (SFC_STYLE_TYPES.has(type)) return false;
  // the ONE phase-dependent arm: a template block is markup until its plugin compiles it
  if (SFC_COMPILED_TO_JS_TYPES.has(type)) return compiled && !!sfcJsLang(params);
  if (sfcJsLang(params)) return true;
  return sfcLangParam(params) === null && sfcFrameworkMarked(params) && (type === 'module' || type === 'script');
}

// a Vite asset-import query whose body is not user JS - skip transform entirely
export function isViteAssetQuery(params) {
  for (const key of params.keys()) {
    // the two markers that carry the author's own JS under one spelling and a generated wrapper
    // under another - the rejection is the spelling, not the marker
    if (key === WORKER_SOURCE_PARAM) {
      if (params.get('type') === 'module') continue;
      return true;
    }
    if (key === 'html-proxy') {
      if (isHtmlProxyScript(params)) continue;
      return true;
    }
    if (ASSET_QUERY_PARAMS.has(key) || WORKER_WRAPPER_PARAM_RE.test(key)) return true;
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
