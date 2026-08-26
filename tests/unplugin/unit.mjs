import { parseSync } from 'oxc-parser';
import { builders, traverse } from 'estree-toolkit';
import { TraceMap, originalPositionFor } from '@jridgewell/trace-mapping';
import unplugin, { shouldTransform } from '../../packages/core-js-unplugin/index.js';
import { createPolyfillContext, entryToGlobalHint } from '../../packages/core-js-polyfill-provider/index.js';
import { ORPHAN_REF_PATTERN } from '../../packages/core-js-polyfill-provider/injector-base.js';
import { collectMutationPrePass, createEstreeAdapter, withoutPhantomDeclarationViolations } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { patternToRegExp } from '../../packages/core-js-polyfill-provider/helpers/pattern-matching.js';
import { buildOffsetToLoc } from '../../packages/core-js-polyfill-provider/helpers/source-scan.js';
import { normalizeMachinePaths, slashifyPath } from './fixture-lang.mjs';
import ImportInjector from '../../packages/core-js-unplugin/internals/import-injector.js';
import createPlugin, {
  formatLabelLocation,
  formatParseErrorForThrow,
  formatParseErrorForWarn,
  formatParseErrorMessage,
} from '../../packages/core-js-unplugin/internals/plugin.js';
import SnapshotCache from '../../packages/core-js-unplugin/internals/snapshot-cache.js';
import { printProgram } from '../../packages/core-js-unplugin/internals/print.js';
import { expressionStatement as mintStatement, literal as mintLiteral } from '../../packages/core-js-unplugin/internals/builders.js';
import { collapseWhitespace } from './collapse-whitespace.mjs';
import {
  hasCoreJSImport,
  injectionFusesLeft,
  isCallee,
  isChunkLoaderBundler,
  isTopLevelImportLike,
  liftSfcLangSuffix,
  skipDirectivePrologue,
  stripLeadingBOMs,
  walkAstNodes,
} from '../../packages/core-js-unplugin/internals/plugin-helpers.js';
import { unwrapRuntimeExpr as unwrapNode } from '@core-js/polyfill-provider/helpers/ast-patterns';

function programOf(src, sourceType = 'module') {
  // eslint-disable-next-line node/no-sync -- oxc-parser sync-only API
  return parseSync('/x.mjs', src, { sourceType }).program;
}

const { cyan, green, red } = chalk;

const counts = { passed: 0, failed: 0 };

function check(label, actual, expected) {
  if (actual === expected) {
    counts.passed++;
    return;
  }
  counts.failed++;
  echo`${ red('FAIL') } ${ cyan(label) } :: got ${ JSON.stringify(actual) }, want ${ JSON.stringify(expected) }`;
}

// --- shouldTransform ---
const shouldTransformCases = [
  // Vue / Astro / Svelte SFC sub-blocks: the real language lives in the `lang=` value or dotted `lang.`
  // key. SFC sub-block with NO lang param: Svelte 5 / Vue / Astro default-JS scripts (no lang token)
  ['/src/App.svelte?svelte&type=script', true, 'Svelte SFC default JS script'],
  ['/src/App.svelte?svelte&type=module', true, 'Svelte SFC default JS module'],
  ['/src/App.vue?vue&type=script', true, 'Vue SFC default JS script'],
  ['/src/App.vue?vue&type=script&setup=true', true, 'Vue SFC default JS script with setup'],
  ['/src/Page.astro?astro&type=script', true, 'Astro SFC default JS script'],
  // SFC query param order is bundler-dependent (vite vs farm vs custom emitters); admission is
  // order-independent - the framework marker may sit after `type=`
  ['/src/App.vue?type=script&vue', true, 'framework marker after type= (order-independent)'],
  ['/src/Page.astro?type=module&astro#L10', true, 'marker after type= with hash, order-independent'],
  ['/src/App.vue?vue&type=style', false, 'Vue SFC style block (default-JS only matches script/module)'],
  // explicit non-JS lang= blocks the default-JS fallback
  ['/src/App.vue?vue&type=script&lang=scss', false, 'Vue SFC explicit lang=scss blocks default-JS fallback'],
  // unknown framework marker without lang= still bails (no JS extension, no SFC marker)
  ['/src/foo.unknown?type=script', false, 'unknown framework marker'],
  ['/src/App.vue?vue&type=script&setup=true&lang=ts', true, 'Vue SFC lang=ts'],
  ['/src/App.vue?vue&type=script&lang=mts', true, 'Vue SFC lang=mts'],
  ['/src/App.vue?vue&type=script&lang=cts', true, 'Vue SFC lang=cts'],
  ['/src/App.vue?vue&type=script&lang=jsx', true, 'Vue SFC lang=jsx'],
  ['/src/App.vue?vue&type=script&setup=true&lang=tsx', true, 'Vue SFC lang=tsx'],
  ['/src/App.vue?lang=ts&type=script', true, 'lang= before type='],
  ['/src/App.vue?foo=bar&lang=ts&baz=qux', true, 'lang= sandwiched between query params'],
  ['/src/App.svelte?lang=jsx', true, 'Svelte SFC lang=jsx'],
  ['/src/Page.astro?astro&type=script&lang=tsx', true, 'Astro SFC lang=tsx'],
  // dotted virtual-ext lang form: Vite's vue plugin appends the block lang as a trailing DOTTED suffix
  // (`&lang.ts` -> URLSearchParams value-less key `lang.ts`), not a `lang=` value - admitted + lifted alike
  ['/src/App.vue?vue&type=script&setup=true&lang.ts', true, 'Vue SFC dotted lang.ts'],
  ['/src/App.vue?vue&type=script&lang.tsx', true, 'Vue SFC dotted lang.tsx'],
  ['/src/Page.astro?astro&lang.jsx', true, 'Astro SFC dotted lang.jsx'],
  // a dotted NON-JS lang is a hint (not markerless), so the default-JS arm must NOT admit it - else oxc
  // would parse-as-JS like the dotted JS langs did; a dotted style block is excluded by type as well
  ['/src/App.vue?vue&type=script&lang.coffee', false, 'Vue SFC dotted non-JS lang.coffee blocks default-JS'],
  ['/src/App.vue?vue&type=style&lang.scss', false, 'Vue SFC dotted lang.scss style block'],
  ['/src/App.vue?vue&type=script&lang.d.ts', false, 'Vue SFC dotted declaration lang.d.ts (not runnable JS)'],
  ['/src/App.vue?vue&type=template&lang.ts', false, 'Vue SFC dotted lang.ts in template block excluded by type'],
  // any `lang.<x>` key is a hint (only an ABSENT lang param is markerless), so an empty `lang.` and a
  // non-ext `lang.bar` both block the default-JS arm - symmetric with the empty `lang=` negative below
  ['/src/App.vue?vue&type=script&lang.', false, 'Vue SFC empty dotted lang. blocks default-JS'],
  ['/src/App.vue?vue&type=script&lang.bar', false, 'Vue SFC non-ext dotted lang.bar blocks default-JS'],
  // `xlang.ts` does NOT start with `lang.`, so it is not a dotted hint - the block stays markerless JS
  ['/src/App.vue?vue&type=script&xlang.ts', true, 'xlang.ts is not a dotted lang hint'],
  // mixed / repeated lang forms - value form wins over a dotted sibling; first dotted wins among dotted
  ['/src/App.vue?vue&type=script&lang=ts&lang.tsx', true, 'lang=ts value form admitted alongside dotted'],
  ['/src/App.vue?vue&lang.ts&lang.tsx', true, 'first dotted lang wins'],
  // percent-encoded uppercase lang value: URLSearchParams decodes `%53` to `S` AFTER the case-fold, so
  // the lowercase must happen post-decode (`lang=t%53` -> `ts`) or the JS lang is missed
  ['/src/App.vue?vue&type=script&lang=t%53', true, 'Vue SFC percent-encoded lang=t%53'],
  // SFC non-JS sub-blocks / declaration / substring false-match / empty value
  ['/src/App.vue?vue&type=style&lang=scss', false, 'Vue SFC lang=scss'],
  ['/src/App.vue?vue&type=script&lang=d.ts', false, 'SFC declaration block (lang=d.ts)'],
  ['/src/App.vue?xlang=ts', false, 'xlang= substring guard'],
  ['/src/App.vue?lang=', false, 'empty lang='],
  // a default-JS SFC block whose query carries a param merely ENDING in `lang` must still
  // transform: the non-JS `lang=` negative gate is anchored to a param boundary, so `clang=`/
  // `slang=` no longer match it as a substring and drop the block
  ['/src/App.vue?vue&type=script&clang=gcc', true, 'clang= param does not block default-JS SFC'],
  ['/src/App.vue?vue&type=script&slang=en', true, 'slang= param does not block default-JS SFC'],
  // `.js`/`.ts` token appears only inside the query - strip query before extension-check
  ['/virtual:foo?output=main.js', false, '.js inside query only'],
  ['/virtual:foo?output=main.ts#bar', false, '.ts inside query only'],
  // SFC with a `.js`-like token in the query: `stripQueryHash` leaves `.vue`, SFC path wins
  ['/src/foo.vue?lang=ts&suffix=.js', true, 'SFC with .js token in query'],
  // SFC + `#hash` suffix (sourcemap line markers, plugin-wrapper artifacts) - `lang=` token
  // closes on `#` as well as `&`/EOL; without the `#` alternative the SFC dispatch silently
  // falls through to extension-only detection
  ['/src/App.vue?vue&type=script&lang=ts#L10', true, 'SFC lang=ts followed by #hash'],
  ['/src/App.vue?vue&type=template&lang=ts#x', false, 'SFC template lang=ts with #hash (template still excluded)'],
  ['/src/App.vue?vue&type=script#L10', true, 'SFC default-JS script with #hash'],
  // a `?` that lives INSIDE a URL fragment (`path#frag?key`) is fragment text, not a query: a real JS
  // file with such a tail must still transform (the fragment `?url` is not an asset query that skips it),
  // and an SFC whose marker lives in the fragment is NOT an admitted sub-block (its query is empty)
  ['/src/foo.js#frag?url', true, 'fragment-embedded asset key does not skip real JS'],
  ['/src/App.vue#x?vue&type=script', false, 'fragment-embedded SFC marker is not a query, not admitted'],
  ['/src/foo.png?x.js', false, '.png base with .js token in query'],
  // plain extensions
  ['/src/foo.js', true, 'plain .js'],
  ['/src/foo.tsx?v=1', true, '.tsx with bundler query'],
  ['/src/foo.mts', true, '.mts extension'],
  ['/src/foo.cts', true, '.cts extension'],
  // declaration files
  ['/src/types.d.ts', false, 'declaration file'],
  ['/src/types.d.mts?v=1', false, 'd.mts with query'],
  // Rollup internals
  ['/src/foo.js?commonjs-proxy', false, 'rollup commonjs proxy'],
  ['\0virtual:entry', false, 'rollup virtual module'],
  // Vite asset-import queries: resolved body isn't user JS even though path looks like one
  ['/src/img.js?url', false, 'Vite ?url'],
  ['/src/data.js?raw', false, 'Vite ?raw'],
  ['/src/worker.js?worker', false, 'Vite ?worker'],
  ['/src/worklet.js?worklet', false, 'Vite ?worklet'],
  ['/src/style.js?inline', false, 'Vite ?inline'],
  ['/src/foo.js?url&v=1', false, 'Vite ?url with extra query'],
  ['/src/foo.js?v=1&url', false, 'Vite ?url trailing'],
  // Vite worker sub-forms: `?worker-module`, `?worker_file` identify ESM-worker / worker-body
  // bundling stages; transformed body is Vite's synthetic output, not user JS
  ['/src/worker.js?worker-module', false, 'Vite ?worker-module'],
  ['/src/worker.js?worker_file', false, 'Vite ?worker_file'],
  // Vite `?sharedworker` resolves to a SharedWorker-constructor factory exactly like `?worker` - the
  // worker body is bundled separately, so the import id itself is not user JS and must skip transform
  ['/src/worker.js?sharedworker', false, 'Vite ?sharedworker'],
  ['/src/worker.js?sharedworker-module', false, 'Vite ?sharedworker sub-form'],
  // Vite internal queries: `?html-proxy` (HTML inline scripts), `?css` (CSS-as-JS),
  // `?used` (tree-shake marker), `?direct` (post-processing escape), `?import` (wrap bypass)
  ['/index.html?html-proxy&index=0.js', false, 'Vite ?html-proxy'],
  ['/src/style.css?css', false, 'Vite ?css'],
  ['/src/foo.js?used', false, 'Vite ?used'],
  ['/src/foo.css?direct', false, 'Vite ?direct'],
  ['/src/foo.js?import', false, 'Vite ?import'],
  // Vue / Astro SFC style and template halves are CSS / markup, not JS - even with lang=ts
  // (TS-in-CSS-in-JS edge) the body isn't runnable JS; polyfill injection would corrupt it
  ['/src/App.vue?vue&type=style&lang=ts', false, 'Vue SFC style block with lang=ts'],
  ['/src/App.vue?vue&type=template&lang=ts', false, 'Vue SFC template block with lang=ts'],
  // near-misses that should NOT match (substring or suffix only)
  ['/src/curly.js?curl=x', true, 'query containing "url" as substring'],
  ['/src/foo.js?v=unrelated', true, 'no asset-query key'],
  // case-insensitive extension match: Windows FS / build tools may upper-case
  ['/src/App.JS', true, 'uppercase .JS'],
  ['/src/App.TSX', true, 'uppercase .TSX'],
  ['/src/App.MJS', true, 'uppercase .MJS'],
  ['/src/types.D.TS', false, 'uppercase .D.TS still excluded'],
  // Vite SFC sub-block id with multiple non-marker query keys. Vue's SFC compiler
  // appends `setup=true&t=<timestamp>&v=<hash>` for HMR / setup-block disambiguation;
  // shouldTransform must still admit such ids when `lang=ts` is present
  ['/src/App.vue?vue&type=script&setup=true&lang=ts&t=12345', true, 'SFC with HMR timestamp + setup query'],
  ['/src/App.vue?vue&type=script&lang=tsx&v=abc123', true, 'SFC with version-hash query'],
  // bare id (no extension) carrying a `lang=` query - virtual modules sometimes use
  // bare paths; SFC dispatch matches on the query alone, so transform fires
  ['/virtual:component?lang=ts', true, 'bare virtual id with lang=ts'],
  // SFC sub-block with `.js` extension on the base path AND `lang=` token: extension
  // takes precedence (JS_RE matches the post-strip base), still transforms
  ['/src/foo.js?lang=tsx', true, '.js base with lang= override'],
  // SFC sub-block + Vite asset query mixing: the asset-query gate wins, the body is
  // bundler-synthetic output regardless of lang= hint
  ['/src/App.vue?vue&type=script&lang=ts&inline', false, 'SFC lang=ts trumped by ?inline'],
  ['/src/App.vue?vue&type=script&lang=ts&worker', false, 'SFC lang=ts trumped by ?worker'],
  // worker sub-form must match exactly one [-_][a-z]+ segment - a second hyphen breaks
  // the match (Vite never emits `?worker-foo-bar` so this stays a no-op gate)
  ['/src/foo.js?worker-module-extra', true, 'worker- with second hyphen escapes asset gate'],
  // SFC query case-insensitivity: tooling normally lowercases keys/values but some pipelines
  // preserve author-cased `lang="TS"` / `type="SCRIPT"`. `/i` flag on SFC regexes catches them
  ['/src/App.vue?vue&type=script&lang=TS', true, 'SFC mixed-case lang=TS'],
  ['/src/App.vue?vue&type=SCRIPT&lang=ts', true, 'SFC mixed-case type=SCRIPT'],
  ['/src/App.vue?vue&type=STYLE&lang=ts', false, 'SFC mixed-case type=STYLE excluded'],
  ['/src/App.vue?vue&type=script&lang=Tsx', true, 'SFC mixed-case lang=Tsx'],
  ['/src/App.vue?vue&type=script&lang=MJS', true, 'SFC mixed-case lang=MJS'],
  // mixed-case framework marker - `/i` on default-JS regex admits author-cased `?VUE`
  ['/src/App.vue?VUE&type=script', true, 'SFC mixed-case framework marker'],
  ['/src/App.vue?Vue&type=module', true, 'SFC capitalised framework marker'],
  // edge: multiple framework markers (custom loader artifact) admits via lang= path
  ['/src/App.vue?vue&vue&type=script&lang=ts', true, 'SFC duplicate framework marker'],
  // edge: whitespace around lang= bails (no real separator before, no valid ext)
  ['/src/App.vue?vue&type=script&lang= ts', false, 'SFC whitespace around lang value'],
  ['/src/App.vue? lang=ts', false, 'SFC whitespace before lang'],
  // edge: empty lang= - the lang-path rejects (the lang value needs a `[jt]` char), and the
  // default-JS fallback is blocked because a lang= param is present, so the id bails entirely.
  // user authoring `lang=""` is a tool-error shape; pinning the deterministic resolution here
  ['/src/App.vue?vue&type=script&lang=', false, 'SFC empty lang= bails (lang-path rejects, default-JS gate blocks)'],
  // pseudo-extensions: `lang=mjsx` / `cjsx` / `mtsx` / `ctsx` are NOT real file extensions, so the
  // lifted suffix can't drive oxc's parser - the split alternation rejects them (a single
  // `[cm]?[jt]sx?` wrongly accepted them, then the `.mjsx`-named block failed to parse, no polyfill)
  ['/src/App.vue?vue&type=script&lang=mjsx', false, 'SFC pseudo-ext lang=mjsx rejected'],
  ['/src/App.vue?vue&type=script&lang=cjsx', false, 'SFC pseudo-ext lang=cjsx rejected'],
  ['/src/App.vue?vue&type=script&lang=mtsx', false, 'SFC pseudo-ext lang=mtsx rejected'],
  ['/src/App.vue?vue&type=script&lang=ctsx', false, 'SFC pseudo-ext lang=ctsx rejected'],
  // the real `[cm]`-prefixed extensions still match (the alternation's first arm `[cm]?[jt]s`)
  ['/src/App.vue?vue&type=script&lang=mjs', true, 'SFC real ext lang=mjs'],
  ['/src/App.vue?vue&type=script&lang=cts', true, 'SFC real ext lang=cts'],
  // a `lang=` inside a PATH segment must NOT suppress a legitimate default-JS SFC - the gate scopes
  // the `lang=` check to the query/hash suffix, so this query-less-lang default-JS query still fires
  ['/src/lang=weird/App.vue?vue&type=script', true, 'SFC default-JS not suppressed by lang= in path'],
];

for (const [id, want, label] of shouldTransformCases) check(`shouldTransform/${ label }`, shouldTransform(id), want);

// --- liftSfcLangSuffix ---
// shouldTransform's lang arm and the lifter BOTH resolve the lang through the same `sfcJsLang` predicate
// in internals/sfc-shapes.js (which reads either the `lang=` value or the dotted `lang.<ext>` key), so
// every shape admitted via the lang path produces a matching extension here by construction; drift
// between admit and lift can't happen now that both consumers share one predicate, not just one regex
const liftSfcLangCases = [
  // basic JS/TS extensions
  ['/src/App.vue?vue&type=script&lang=ts', '/src/App.vue.ts'],
  ['/src/App.vue?vue&type=script&lang=tsx', '/src/App.vue.tsx'],
  ['/src/App.vue?vue&type=script&lang=js', '/src/App.vue.js'],
  ['/src/App.vue?vue&type=script&lang=jsx', '/src/App.vue.jsx'],
  // module / commonjs extension prefixes (Vue 3 + Astro support these natively)
  ['/src/App.vue?vue&type=script&lang=mts', '/src/App.vue.mts'],
  ['/src/App.vue?vue&type=script&lang=cts', '/src/App.vue.cts'],
  ['/src/App.vue?vue&type=script&lang=mjs', '/src/App.vue.mjs'],
  ['/src/App.vue?vue&type=script&lang=cjs', '/src/App.vue.cjs'],
  // hash terminator (sourcemap pipelines append `#L<line>` to the id)
  ['/src/App.vue?vue&type=script&lang=ts#L10', '/src/App.vue.ts'],
  ['/src/App.vue?vue&type=script&lang=tsx#hash', '/src/App.vue.tsx'],
  ['/src/App.vue?vue&type=script&lang=mts#L1', '/src/App.vue.mts'],
  // hash-only terminator on the lang token without trailing `&` - the `(?:[#&]|$)` boundary
  // accepts `#` so the named group still captures and `#L42` is excluded from `ext`
  ['/src/App.vue?vue&lang=ts#L42', '/src/App.vue.ts'],
  // lang= position variations
  ['/src/App.vue?lang=ts', '/src/App.vue.ts'],
  ['/src/App.vue?lang=ts&type=script', '/src/App.vue.ts'],
  ['/src/App.vue?foo=bar&lang=ts&baz=qux', '/src/App.vue.ts'],
  // lang= sandwiched in the middle of the query (between marker and trailing param) - the query
  // is parsed into params, so a lang token matches the same regardless of its position
  ['/src/App.vue?vue&lang=ts&type=script', '/src/App.vue.ts'],
  // multiple lang= tokens - regex stops at the first match (RegExp.exec returns leftmost-
  // first per spec), so `lang=ts&lang=tsx` lifts to `.ts`. authoring this shape is a user
  // bug; the test pins the deterministic resolution
  ['/src/App.vue?vue&lang=ts&lang=tsx', '/src/App.vue.ts'],
  // dotted virtual-ext form (`&lang.ts`): Vite's vue plugin appends the block lang as a trailing DOTTED
  // suffix (URLSearchParams reads it as a value-less key `lang.ts`), not a `lang=` value. without
  // recognising it the suffix was dropped and oxc parsed the TS / TSX / JSX body as plain JS
  ['/src/App.vue?vue&type=script&setup=true&lang.ts', '/src/App.vue.ts'],
  ['/src/App.vue?vue&type=script&lang.tsx', '/src/App.vue.tsx'],
  ['/src/App.vue?vue&type=script&lang.cts', '/src/App.vue.cts'],
  ['/src/Page.astro?astro&lang.jsx', '/src/Page.astro.jsx'],
  // dotted lang + `#hash` terminator (sourcemap line marker) - hash is cut before parsing, lift still fires
  ['/src/App.vue?vue&type=script&lang.ts#L10', '/src/App.vue.ts'],
  // value form wins over a dotted sibling; among dotted siblings the first key wins (deterministic)
  ['/src/App.vue?vue&type=script&lang=ts&lang.tsx', '/src/App.vue.ts'],
  ['/src/App.vue?vue&lang.ts&lang.tsx', '/src/App.vue.ts'],
  // a dotted NON-JS lang (scss) is a lang hint but not a JS ext, so no lift (baseId unchanged)
  ['/src/App.vue?vue&type=style&lang.scss', '/src/App.vue'],
  // empty dotted `lang.`, non-ext `lang.bar`, dotted declaration `lang.d.ts` are hints but not JS exts - no lift
  ['/src/App.vue?vue&type=script&lang.', '/src/App.vue'],
  ['/src/App.vue?vue&type=script&lang.bar', '/src/App.vue'],
  ['/src/App.vue?vue&type=script&lang.d.ts', '/src/App.vue'],
  // percent-encoded uppercase lang value: URLSearchParams decodes `%53` to `S` AFTER the case-fold, so
  // the lowercase must run post-decode (`lang=t%53` -> `ts`) or the JS lang is missed
  ['/src/App.vue?vue&type=script&lang=t%53', '/src/App.vue.ts'],
  // non-JS lang= or no lang= - return baseId unchanged (no synthesized extension)
  ['/src/App.vue?vue&type=script&lang=scss', '/src/App.vue'],
  ['/src/App.vue?vue&type=script&lang=d.ts', '/src/App.vue'],
  ['/src/App.vue?vue&type=script', '/src/App.vue'],
  ['/src/App.vue', '/src/App.vue'],
  // empty SFC query (`?vue` framework marker only, no lang= at all) returns baseId as-is
  ['/src/App.vue?vue', '/src/App.vue'],
  // numeric-suffixed `lang=js2` must NOT match - `[cm]?[jt]sx?` rejects digits at the tail.
  // the `(?:[#&]|$)` boundary further requires the lang value to end on `&`/`#`/EOL, so
  // `js2` is rejected by both the alphabet and the boundary
  ['/src/App.vue?vue&lang=js2', '/src/App.vue'],
  // non-vue SFC framework (`.svelte`) with lang= - regex is framework-agnostic, only the
  // `lang=<ext>` shape gates the match, so svelte gets the same lift behaviour as vue
  ['/src/App.svelte?lang=ts', '/src/App.svelte.ts'],
  ['/src/App.svelte?svelte&type=script&lang=tsx', '/src/App.svelte.tsx'],
  // astro SFC with lang= - same framework-agnostic shape applies
  ['/src/Page.astro?astro&type=script&lang=ts', '/src/Page.astro.ts'],
  // substring guard: `xlang=` must not match - the `[&?]` prefix class demands a real
  // separator before `lang=`, so `?xlang=ts` is rejected (no leading `&`/`?` to consume)
  ['/src/App.vue?xlang=ts', '/src/App.vue'],
  // author-cased `lang=TS` etc. - admission is case-insensitive (each query key + value is lowercased
  // AFTER percent-decode) so mixed-case suffixes are accepted; the lifter emits the extension lowercased
  // so oxc-parser's extension-based language inference resolves canonical `.ts` / `.tsx` parsers.
  // case-sensitive matching would leave the bare `.vue` baseId and oxc would silently reject TS-only
  // syntax in the SFC script body
  ['/src/App.vue?vue&type=script&lang=TS', '/src/App.vue.ts'],
  ['/src/App.vue?vue&type=script&lang=Tsx', '/src/App.vue.tsx'],
  ['/src/App.vue?vue&type=script&lang=MTS', '/src/App.vue.mts'],
  ['/src/App.vue?vue&type=script&lang=JSX', '/src/App.vue.jsx'],
  ['/src/App.vue?vue&type=script&lang=TS#L10', '/src/App.vue.ts'],
  // a `lang=` that lives in the FRAGMENT (`#x?lang=ts`) is fragment text, not a query token - no lift
  ['/src/App.vue#x?lang=ts', '/src/App.vue'],
  // hash-only id (no query) - stripQueryHash drops `#L10`, no lang= match returns baseId
  ['/src/App.vue#L10', '/src/App.vue'],
  // repeated framework marker tokens - regex anchors on `lang=` so duplicate `vue&vue` doesn't
  // affect the match; first `lang=` still wins
  ['/src/App.vue?vue&vue&type=script&lang=ts', '/src/App.vue.ts'],
  // whitespace around lang= or its value - regex demands a real separator before `lang=` and
  // a `[jt]`-rooted alphabet at the value, so spaces always bail to baseId
  ['/src/App.vue? lang=ts', '/src/App.vue'],
  ['/src/App.vue?vue&type=script&lang= ts', '/src/App.vue'],
  ['/src/App.vue?vue&type=script&lang=ts ', '/src/App.vue'],
  // empty extension `lang=` - alphabet requires at least one `[jt]` char, so bare equals sign
  // falls through to baseId
  ['/src/App.vue?vue&type=script&lang=', '/src/App.vue'],
  ['/src/App.vue?vue&type=script&lang=&type=script', '/src/App.vue'],
  // multiple extension chars: `mjs` / `cjs` / `mts` already covered above; assert .mjs as the
  // longest extension form lifts symmetrically
  ['/src/App.vue?vue&type=script&lang=mjs#L1', '/src/App.vue.mjs'],
  // Astro variants symmetric with Vue / Svelte coverage
  ['/src/Page.astro?astro&type=script&lang=tsx', '/src/Page.astro.tsx'],
  ['/src/Page.astro?astro&type=script&lang=mts', '/src/Page.astro.mts'],
  ['/src/Page.astro?astro&type=script&lang=TS', '/src/Page.astro.ts'],
  // Svelte symmetry
  ['/src/Comp.svelte?svelte&type=script&lang=ts', '/src/Comp.svelte.ts'],
  ['/src/Comp.svelte?svelte&type=script&lang=mts', '/src/Comp.svelte.mts'],
  ['/src/Comp.svelte?svelte&type=script&lang=JSX', '/src/Comp.svelte.jsx'],
];
for (const [id, want] of liftSfcLangCases) {
  check(`liftSfcLangSuffix/${ id }`, liftSfcLangSuffix(id), want);
}

// class entries (bare or `/constructor` tail) PascalCase the first segment; method
// entries return null so user imports of them don't masquerade as class aliases
check('entryToGlobalHint/single segment', entryToGlobalHint('promise'), 'Promise');
check('entryToGlobalHint/subpath constructor', entryToGlobalHint('promise/constructor'), 'Promise');
check('entryToGlobalHint/kebab single word', entryToGlobalHint('weak-map'), 'WeakMap');
// single-segment helper entries (`is-iterable`, `get-iterator`, `set-immediate`) bail -
// the kebab form would derive a plausible PascalCase but the result isn't a real global,
// and downstream `resolveSuperImportName` would over-inject against the fabricated name.
// filter through `KNOWN_GLOBAL_NAMES` (globals + statics in built-in-definitions)
check('entryToGlobalHint/non-class helper bails', entryToGlobalHint('is-iterable'), null);
check('entryToGlobalHint/empty string', entryToGlobalHint(''), null);
// method / instance entries: user's pure import is a function, not the class - no hint
check('entryToGlobalHint/static method', entryToGlobalHint('promise/try'), null);
check('entryToGlobalHint/instance subpath', entryToGlobalHint('array/instance/at'), null);
check('entryToGlobalHint/kebab subpath', entryToGlobalHint('array-buffer/is-view'), null);
check('entryToGlobalHint/deep kebab subpath', entryToGlobalHint('typed-array/instance/to-sorted'), null);
// edge cases
check('entryToGlobalHint/leading slash', entryToGlobalHint('/promise'), null);
check('entryToGlobalHint/trailing slash', entryToGlobalHint('promise/'), null);
// numeric-leading / underscore-leading heads can never match a real global identifier -
// filtered up front so downstream consumers don't carry a junk hint through to the lookup
check('entryToGlobalHint/numeric prefix', entryToGlobalHint('42'), null);
check('entryToGlobalHint/underscore prefix', entryToGlobalHint('_foo'), null);
check('entryToGlobalHint/null', entryToGlobalHint(null), null);

// --- ref-block anchor vs a trailing comment separated by exotic whitespace ---

// the anchor scan skips inter-token whitespace before a same-line trailing comment so the injected
// `var _ref;` block lands AFTER that comment instead of splitting the import from it. the gap may be
// any ES WhiteSpace - the two rows below feed one char per class boundary and assert the comment
// still precedes the block; the line terminator row is the negative, where the scan MUST stop
{
  const GAPS = [
    ['space', ' '],
    ['tab', '\t'],
    ['form feed', '\f'],
    ['vertical tab', '\v'],
    ['no-break space', '\u00A0'],
    ['byte order mark', '\uFEFF'],
    ['en quad', '\u2000'],
  ];
  for (const [label, gap] of GAPS) {
    const source = `import x from "y";${ gap }// keep\nexport const r = [...x].at(0);\n`;
    const out = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 } }).transform(source, '/p.mjs')?.code ?? '';
    const comment = out.indexOf('// keep');
    const refBlock = out.indexOf('var _ref');
    check(`import-injector: trailing comment keeps its import across a ${ label }`,
      comment !== -1 && refBlock !== -1 && comment < refBlock, true);
  }
  // a LINE TERMINATOR is not inter-token whitespace here: the comment belongs to the next line, so
  // the block anchors before it
  for (const [label, gap] of [['newline', '\n'], ['line separator', '\u2028']]) {
    const source = `import x from "y";${ gap }// next line\nexport const r = [...x].at(0);\n`;
    const out = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 } }).transform(source, '/p.mjs')?.code ?? '';
    check(`import-injector: a ${ label } ends the anchor scan`,
      out.indexOf('var _ref') < out.indexOf('// next line'), true);
  }
}

// --- isTopLevelImportLike: paren / sequence-wrapped require ---
// a top-level `require('m')` counts as an import-like statement so `var _ref;` lands after it.
// the callee is peeled of skippable wrappers first, so a parenthesized or comma-sequence
// `require` (minifier / bundler output like `(0, require)('m')`) is still recognized
function checkIsTopLevelImportLikeWrappedRequire() {
  function stmtOf(src) {
    return programOf(src, 'script').body[0];
  }
  check('isTopLevelImportLike/bare require', isTopLevelImportLike(stmtOf("require('m');")), true);
  check('isTopLevelImportLike/paren-wrapped require', isTopLevelImportLike(stmtOf("(require)('m');")), true);
  check('isTopLevelImportLike/sequence-wrapped require', isTopLevelImportLike(stmtOf("(0, require)('m');")), true);
  check('isTopLevelImportLike/var require', isTopLevelImportLike(stmtOf("var m = require('m');")), true);
  check('isTopLevelImportLike/var paren-wrapped require', isTopLevelImportLike(stmtOf("var m = (0, require)('m');")), true);
  // a non-require call is not import-like
  check('isTopLevelImportLike/plain call not import', isTopLevelImportLike(stmtOf('foo();')), false);
}
checkIsTopLevelImportLikeWrappedRequire();

// --- transform parse-error path ---
// fatal parse errors return null + emit a `this.warn(...)` describing the failure so the
// user identifies the file. oxc-parser is forgiving and returns an `errors` array rather
// than throwing, so the plugin filters severity:'Error' explicitly. message must carry
// source location (codeframe baked-in `line:col` pointer) so the user can fix the source
// from the warn alone - bare `Unexpected token` without coordinates is unactionable
function checkTransformParseErrorReturnsNullAndWarns() {
  const plugin = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 } });
  let warned = '';
  const result = plugin.transform.call(
    { warn: msg => { warned = msg; } },
    'class { method( ',
    '/syntax-error.mjs',
  );
  check('transform/parse-error returns null', result, null);
  check('transform/parse-error emits warn with `[core-js]` prefix',
    warned.startsWith('[core-js]') && warned.includes('/syntax-error.mjs'), true);
  // codeframe carries `,-[<id>:<line>:<col>]` and an ASCII pointer to the failing
  // token. presence of the bracketed id-line-col marker confirms location was surfaced
  check('transform/parse-error warn includes source location',
    /\/syntax-error\.mjs:\d+:\d+/.test(warned), true);
  check('transform/parse-error warn includes codeframe pointer',
    warned.includes('class { method('), true);
}
checkTransformParseErrorReturnsNullAndWarns();

// bundler-less callers (esbuild post-resolve adapter, bun, direct callers without a `warn`
// hook) must NOT silently drop the file with `return null` - that hides the broken source
// downstream. plugin throws a tagged error so the breadcrumb propagates instead
function checkTransformParseErrorThrowsWhenNoWarn() {
  const plugin = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 } });
  let thrown = null;
  try {
    plugin.transform.call({}, 'class { method( ', '/no-warn.mjs');
  } catch (error) {
    thrown = error;
  }
  check('transform/parse-error throws when no warn callback', thrown instanceof Error, true);
  // runTransform's outer catch stamps `[core-js] [<id>]` via tagError; inner message body
  // says `could not parse: <oxc error>` so the two prefixes don't double up
  check('transform/parse-error thrown msg carries core-js tag with file id',
    thrown?.message?.startsWith('[core-js] [/no-warn.mjs]'), true);
  check('transform/parse-error thrown msg includes source location',
    /\/no-warn\.mjs:\d+:\d+/.test(thrown?.message ?? ''), true);
  // `warn` field on `this` set to a non-function (object / null / number) must take the
  // same throw path - the runtime guard is `typeof === 'function'`, not truthy/defined
  let thrown2 = null;
  try {
    plugin.transform.call({ warn: 'not a function' }, 'class { method( ', '/bad-warn.mjs');
  } catch (error) {
    thrown2 = error;
  }
  check('transform/parse-error throws when warn is not a function',
    thrown2 instanceof Error && thrown2.message.includes('/bad-warn.mjs'), true);
}
checkTransformParseErrorThrowsWhenNoWarn();

// formatParseErrorMessage labels-only fallback: oxc currently always emits codeframe, but
// future versions might omit it for synthetic / degraded errors. helper must still build
// an actionable message from labels + label.message + helpMessage. test with a
// synthetic error shape (no codeframe) to lock the fallback path
function checkFormatParseErrorLabelsFallback() {
  const code = 'const x =\nfoo(';
  const syntheticError = {
    severity: 'Error',
    message: 'Synthetic test error',
    labels: [{ message: 'expected expression', start: 10, end: 11 }],
    helpMessage: 'add a value after `=`',
    codeframe: null,
  };
  const warnMsg = formatParseErrorMessage({
    id: '/synthetic.mjs', error: syntheticError, code, withCoreJSPrefix: true,
  });
  check('formatParseErrorMessage/labels-fallback prefix',
    warnMsg.startsWith('[core-js] could not parse /synthetic.mjs:'), true);
  // offset 10 lands on line 2 (after the `\n` at offset 9), column 1 (start of `foo`)
  check('formatParseErrorMessage/labels-fallback at line:col', warnMsg.includes('at 2:1'), true);
  check('formatParseErrorMessage/labels-fallback label.message',
    warnMsg.includes('expected expression'), true);
  check('formatParseErrorMessage/labels-fallback helpMessage',
    warnMsg.includes('add a value after `=`'), true);
  // throw-path variant strips the explicit `[core-js]` prefix because runTransform's catch
  // re-stamps `[core-js] [<id>]` via tagError - double-prefixing would be noisy
  const throwMsg = formatParseErrorMessage({
    id: '/synthetic.mjs', error: syntheticError, code, withCoreJSPrefix: false,
  });
  check('formatParseErrorMessage/throw-path no `[core-js]` prefix',
    throwMsg.startsWith('could not parse:'), true);
  // missing helpMessage and missing label.message both degrade gracefully - presence of
  // line:col alone is enough for the user to find the broken span
  const minimal = formatParseErrorMessage({
    id: '/min.mjs',
    error: {
      severity: 'Error',
      message: 'Unexpected token',
      labels: [{ message: null, start: 0, end: 1 }],
      helpMessage: null,
      codeframe: null,
    },
    code: 'x',
    withCoreJSPrefix: true,
  });
  check('formatParseErrorMessage/minimal labels has line:col',
    /at \d+:\d+/.test(minimal), true);
  check('formatParseErrorMessage/minimal labels no null str',
    !minimal.includes('null'), true);
  // codeframe present -> labels path skipped entirely (codeframe already carries line:col)
  const withFrame = formatParseErrorMessage({
    id: '/frame.mjs',
    error: {
      severity: 'Error',
      message: 'Boom',
      labels: [{ message: 'label noise', start: 0, end: 1 }],
      helpMessage: null,
      codeframe: '  x Boom\n   ,-[/frame.mjs:1:1]\n',
    },
    code: 'x',
    withCoreJSPrefix: true,
  });
  check('formatParseErrorMessage/codeframe wins over labels',
    withFrame.includes('[/frame.mjs:1:1]') && !withFrame.includes('label noise'), true);
}
checkFormatParseErrorLabelsFallback();

// --- formatParseErrorMessage degradation paths ---
// no codeframe AND no labels: helper must still emit a usable head from `error.message`;
// silently swallowing the diagnostic would hide the broken file from the user
function checkFormatParseErrorNoCodeframeNoLabels() {
  const warnOut = formatParseErrorForWarn({
    id: '/bare.mjs',
    error: { severity: 'Error', message: 'Bare oxc failure', labels: null, helpMessage: null, codeframe: null },
    code: 'x',
  });
  check('formatParseErrorMessage/bare warn starts with prefix',
    warnOut.startsWith('[core-js] could not parse /bare.mjs: Bare oxc failure'), true);
  check('formatParseErrorMessage/bare warn carries no location chunk',
    !warnOut.includes('\nat ') && !warnOut.includes('null'), true);

  const throwOut = formatParseErrorForThrow({
    error: { severity: 'Error', message: 'Bare oxc failure', labels: undefined, codeframe: undefined },
    code: 'x',
  });
  check('formatParseErrorMessage/bare throw head only', throwOut, 'could not parse: Bare oxc failure');
}
checkFormatParseErrorNoCodeframeNoLabels();

// helpMessage with neither codeframe nor labels: tail still attaches to head separated by `\n`
// so the suggestion ("did you mean `function*`?") reaches the user even on degraded shapes
function checkFormatParseErrorHelpMessageAttachesWithoutLocation() {
  const msg = formatParseErrorForWarn({
    id: '/help-only.mjs',
    error: {
      severity: 'Error',
      message: 'Unexpected token',
      labels: null,
      helpMessage: 'try removing the trailing comma',
      codeframe: null,
    },
    code: 'x,',
  });
  const [head, tail] = msg.split('\n', 2);
  check('formatParseErrorMessage/help-only head',
    head.startsWith('[core-js] could not parse /help-only.mjs: Unexpected token'), true);
  check('formatParseErrorMessage/help-only tail equals helpMessage', tail, 'try removing the trailing comma');
}
checkFormatParseErrorHelpMessageAttachesWithoutLocation();

// --- formatLabelLocation edge cases ---
// guards: integer-only offset; null / negative / non-integer / past-EOF -> null so the caller
// drops the `at line:col` chunk instead of emitting a junk `at NaN:NaN`
function checkFormatLabelLocationEdgeCases() {
  // start=0 -> first char, line 1 column 1
  check('formatLabelLocation/start=0 first char',
    formatLabelLocation({ start: 0 }, 'abc\ndef'), '1:1');
  // start past LF terminator -> line 2 column 1
  check('formatLabelLocation/past LF line 2 col 1',
    formatLabelLocation({ start: 4 }, 'abc\ndef'), '2:1');
  // start at EOF (offset === code.length) -> still valid, snaps to final line tail
  check('formatLabelLocation/start at EOF valid', formatLabelLocation({ start: 7 }, 'abc\ndef'), '2:4');
  // empty source + start=0 -> 1:1 (only-line entry covers offset 0)
  check('formatLabelLocation/empty source start 0', formatLabelLocation({ start: 0 }, ''), '1:1');
  // null / undefined / negative / non-integer / past-EOF -> null
  check('formatLabelLocation/null start', formatLabelLocation({ start: null }, 'abc'), null);
  check('formatLabelLocation/undefined start', formatLabelLocation({ start: undefined }, 'abc'), null);
  check('formatLabelLocation/negative start', formatLabelLocation({ start: -1 }, 'abc'), null);
  check('formatLabelLocation/past EOF start', formatLabelLocation({ start: 10 }, 'abc'), null);
  check('formatLabelLocation/fractional start', formatLabelLocation({ start: 1.5 }, 'abc'), null);
  // label without `start` (missing key) -> null
  check('formatLabelLocation/missing start key', formatLabelLocation({}, 'abc'), null);
  // CRLF line endings: column reflects post-newline reset on line 2
  check('formatLabelLocation/CRLF line 2 col 1',
    formatLabelLocation({ start: 5 }, 'abc\r\ndef'), '2:1');
  // U+2028 ES line separator advances the line counter the same as LF. literal source
  // escape sequences are forbidden by `es/no-json-superset`; build via `String.fromCharCode`
  const ls2028 = String.fromCharCode(0x2028);
  check('formatLabelLocation/U+2028 line 2',
    formatLabelLocation({ start: 4 }, `abc${ ls2028 }def`), '2:1');
}
checkFormatLabelLocationEdgeCases();

// --- parse-error path: SFC virtual id surfaces lifted suffix ---
// Vue/Astro/Svelte SFC virtual ids embed the language in the query (`?vue&type=script&lang=ts`).
// `liftSfcLangSuffix` recovers it onto a synthesized extension (`App.vue.ts`) before parsing.
// the warn message MUST carry the lifted id so the user sees the real source file with its
// extension, not the bare virtual path
function checkTransformParseErrorSfcLiftedSuffix() {
  const plugin = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 } });
  let warned = '';
  const result = plugin.transform.call(
    { warn: msg => { warned = msg; } },
    'class { method( ',
    '/src/App.vue?vue&type=script&lang=ts',
  );
  check('transform/sfc parse-error returns null', result, null);
  // warn surfaces the ORIGINAL id (full query) so the user can map back to their source file
  check('transform/sfc parse-error warn carries original SFC id',
    warned.includes('/src/App.vue?vue&type=script&lang=ts'), true);
  // codeframe references the LIFTED id (`App.vue.ts`) - oxc-parser sees the synthesized path
  // and bakes it into the codeframe pointer, so the user can correlate the location chunk
  // with the SFC sub-block's effective language
  check('transform/sfc parse-error codeframe references lifted suffix',
    /App\.vue\.ts:\d+:\d+/.test(warned), true);
}
checkTransformParseErrorSfcLiftedSuffix();

// --- parse-error path: empty source ---
// empty file with a `warn` hook returns null without emitting a warn (oxc accepts empty input).
// no-warn variant likewise returns null - empty source has no fatal errors to throw on
function checkTransformParseErrorEmptySource() {
  const plugin = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 } });
  let warned = '';
  const result = plugin.transform.call(
    { warn: msg => { warned = msg; } },
    '',
    '/empty.mjs',
  );
  check('transform/empty source returns null', result, null);
  check('transform/empty source emits no warn', warned, '');
  // no-warn path: empty input is well-formed so the throw branch never fires
  let thrown = null;
  try {
    plugin.transform.call({}, '', '/empty-nowarn.mjs');
  } catch (error) {
    thrown = error;
  }
  check('transform/empty source no-warn does not throw', thrown, null);
}
checkTransformParseErrorEmptySource();

// --- pre+post: usage-global post map keeps sourcesContent ---
// the post pass omits sourcesContent only when it CHAINS through a pre pass that already emitted
// a content-bearing map. a usage-global pre is detection-only (no source rewrite -> no map), so
// post must still emit sourcesContent itself - otherwise the map references the file with no
// inline content and devtools can't show the original source
function checkPrePostUsageGlobalSourcesContent() {
  const source = 'Promise.resolve(1);\n';
  const id = '/src/pre-post-content.js';
  const plugin = createPlugin({ method: 'usage-global', version: '4.0', targets: { ie: 11 } });
  plugin.transform(source, id, 'pre'); // detection-only pre: stores a no-rewrite snapshot
  const post = plugin.transform(source, id, 'post');
  if (!post?.map) {
    counts.failed++;
    echo`${ red('FAIL') } ${ cyan('prePost/post emitted map') } :: missing map`;
    return;
  }
  check('prePost/usage-global post injected polyfill', /core-js\/modules\/es\.promise/.test(post.code), true);
  check('prePost/usage-global post map includes sourcesContent', !!post.map.sourcesContent?.[0], true);
  check('prePost/sourcesContent is the original source', post.map.sourcesContent?.[0], source);
}
checkPrePostUsageGlobalSourcesContent();

// `absoluteImports` spells every injected import as a RESOLVED FILE PATH, and the post pass has to
// recognise what pre wrote there - a scan that reads its own spelling as foreign redeclares the
// same binding and the build dies on `Identifier has already been declared`
function checkPrePostAbsoluteImportsNoDuplicate() {
  const source = 'export const r = [1].at(0);\n';
  const id = '/src/pre-post-absolute.js';
  const plugin = createPlugin({
    method: 'usage-pure', version: '4.0', targets: { ie: 11 }, absoluteImports: true,
  });
  const pre = plugin.transform(source, id, 'pre');
  const post = plugin.transform(pre?.code ?? source, id, 'post');
  const names = (post?.code ?? pre?.code ?? source).matchAll(/^import (?<local>\w+)/gm)
    .map(m => m.groups.local).toArray();
  check('prePost/absoluteImports declares each import once', names.length, new Set(names).size);
  check('prePost/absoluteImports still injects', names.length > 0, true);
}
checkPrePostAbsoluteImportsNoDuplicate();

// --- pre+post: ctor-alias member reads survive the snapshot handoff end-to-end ---
// the injector-level round-trip is unit-locked above (blind entries carried, per-binding
// entries intentionally dropped - stale spans); this locks the TRANSFORM-level outcome the
// handoff exists for: a usage-global pre detects the alias, the post pass still resolves the
// member read through the carried hint for BOTH the declaration and the assignment form.
// the usage-pure twin completes in pre (the alias and its read rewrite in the same pass), so
// post is an idempotent pass-through - locked as the discriminating other branch
function checkPrePostAliasMemberHandoff() {
  const globalCases = [
    ['decl-form', 'const { Map: M } = globalThis;\nexport const r = M.groupBy([1], x => x);\n'],
    ['assignment-form', 'let M;\n({ Map: M } = globalThis);\nexport const r = M.groupBy([1], x => x);\n'],
  ];
  for (const [label, source] of globalCases) {
    const plugin = createPlugin({ method: 'usage-global', version: '4.0', targets: { ie: 11 } });
    const pre = plugin.transform(source, '/src/prepost-alias.js', 'pre');
    const post = plugin.transform(pre?.code ?? source, '/src/prepost-alias.js', 'post');
    const out = post?.code ?? pre?.code ?? source;
    check(`prePost/global alias ${ label } injects the member polyfill`,
      /core-js\/modules\/es\.map\.group-by/.test(out), true);
  }
  const pureSource = 'const { Map: M } = globalThis;\nexport const r = typeof M.groupBy;\n';
  const purePlugin = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 } });
  const purePre = purePlugin.transform(pureSource, '/src/prepost-alias-pure.js', 'pre');
  check('prePost/pure alias read narrows already in pre', /_Map\$groupBy/.test(purePre?.code ?? ''), true);
  const purePost = purePlugin.transform(purePre?.code ?? pureSource, '/src/prepost-alias-pure.js', 'post');
  const purePostCode = purePost?.code ?? purePre?.code ?? pureSource;
  check('prePost/pure post is idempotent over the rewritten alias', /_Map\$groupBy/.test(purePostCode)
    && !/_Map\$groupBy\$/.test(purePostCode), true);
}
checkPrePostAliasMemberHandoff();

// --- collapseWhitespace: the cross-plugin comparator's lexer ---
// the comparator must DISCRIMINATE real divergences inside/after regex and template literals
// (the old quote-toggle scanner fused a regex quote into a phantom string and mis-closed
// nested templates - false PASS) while staying whitespace-insensitive outside literals
function checkCollapseWhitespaceLexer() {
  const cw = collapseWhitespace;
  check('collapse/regex quote discriminates suffix',
    cw('const r = /a"b/; f(1);') !== cw('const r = /a"b/; f(2);'), true);
  check('collapse/regex literal keeps its inner space', cw('const r = /a b/;').includes('/a b/'), true);
  /* eslint-disable no-template-curly-in-string -- template lexing is the case under test */
  check('collapse/nested template discriminates code after it',
    cw('tag`a${ inner`x` }b`; f(1);') !== cw('tag`a${ inner`x` }b`; f(2);'), true);
  check('collapse/substitution collapses, literal chunks kept',
    cw('`a  b${ x  +  1 }c  d`'), '`a  b${x+1}c  d`');
  /* eslint-enable no-template-curly-in-string -- end of the lexed-template block */
  check('collapse/whitespace-only difference equal', cw('const  a\n=\n1;'), cw('const a = 1;'));
  check('collapse/division is not a regex', cw('const q = a / b / c;'), 'const q=a/b/c;');
  check('collapse/word-boundary space preserved', cw('const from = 1;'), 'const from=1;');
  check('collapse/comment apostrophe does not open a string',
    cw("// don't\nf(1);"), cw('f(1);'));
}
checkCollapseWhitespaceLexer();

// the discriminating other branch: a usage-pure pre REWRITES the source (`Array.from` -> pure
// helper) and emits a content-bearing map, so post must CHAIN through it and OMIT its own
// sourcesContent (re-emitting would duplicate the content the build composes from pre's map).
// pins that the inheritedPreRewrote flag correctly separates the two pre kinds
function checkPrePostUsagePureOmitsSourcesContent() {
  const source = 'const r = Array.from([1]);\n';
  const id = '/src/pure-prepost-content.js';
  const plugin = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 } });
  const pre = plugin.transform(source, id, 'pre'); // pure pre rewrites + emits a content-bearing map
  check('prePost/usage-pure pre rewrote the source', pre?.code !== undefined && pre.code !== source, true);
  const post = plugin.transform(source, id, 'post');
  if (!post?.map) {
    counts.failed++;
    echo`${ red('FAIL') } ${ cyan('prePost/pure post emitted map') } :: missing map`;
    return;
  }
  check('prePost/usage-pure post chains -> omits sourcesContent', !post.map.sourcesContent?.[0], true);
}
checkPrePostUsagePureOmitsSourcesContent();

// --- ORPHAN_REF_PATTERN ---
// matches plugin-emitted refs (`_ref`, `_ref2`, `_ref3`, ...) but rejects `_ref0`/`_ref1`
// which user-code may use; the plugin never emits these (skip-1 babel UID convention)
check('ORPHAN_REF/bare', ORPHAN_REF_PATTERN.test('_ref'), true);
check('ORPHAN_REF/_ref2', ORPHAN_REF_PATTERN.test('_ref2'), true);
check('ORPHAN_REF/_ref10', ORPHAN_REF_PATTERN.test('_ref10'), true);
check('ORPHAN_REF/_ref0', ORPHAN_REF_PATTERN.test('_ref0'), false);
check('ORPHAN_REF/_ref1', ORPHAN_REF_PATTERN.test('_ref1'), false);
check('ORPHAN_REF/_ref01', ORPHAN_REF_PATTERN.test('_ref01'), false);
check('ORPHAN_REF/_ref09', ORPHAN_REF_PATTERN.test('_ref09'), false);
check('ORPHAN_REF/_refX', ORPHAN_REF_PATTERN.test('_refX'), false);
check('ORPHAN_REF/empty', ORPHAN_REF_PATTERN.test(''), false);

// --- adoptOrphanRefs respects flushedRefs across the snapshot round-trip ---

// pre already printed `var _ref;` into its output; post re-discovers the name as an orphan
// and must NOT redeclare it - the `#flushedRefs` skip in `adoptOrphanRefs` is the only
// dedup between pre's printed decl and post's flush
function checkAdoptOrphanRespectsFlushed() {
  const inj = new ImportInjector({ mode: 'actual', pkg: 'x', inherit: { flushedRefs: ['_ref'] } });
  inj.adoptOrphanRefs(['_ref', '_ref2']);
  const snap = inj.snapshot();
  check('adoptOrphan/skips flushed', snap.refs.includes('_ref'), false);
  check('adoptOrphan/adds new', snap.refs.includes('_ref2'), true);
  check('adoptOrphan/flushed carried', snap.flushedRefs.includes('_ref'), true);
}
checkAdoptOrphanRespectsFlushed();

// --- SnapshotCache key normalization ---
// pre/post pair must round-trip across query / hash / slash variants. without normalization
// a Windows bundler that switches between `\` and `/` between passes would lose the snapshot
function checkSnapshotKeyNormalization() {
  const cache = new SnapshotCache();
  cache.store('/src/foo.js', { tag: 'A' });
  check('SnapshotCache/strip query', cache.take('/src/foo.js?v=1')?.tag, 'A');
  cache.store('C:\\src\\bar.js', { tag: 'B' });
  check('SnapshotCache/normalize backslash', cache.take('C:/src/bar.js')?.tag, 'B');
  cache.store('/src/baz.js#anchor', { tag: 'C' });
  check('SnapshotCache/strip hash', cache.take('/src/baz.js')?.tag, 'C');
  check('SnapshotCache/take consumes', cache.take('/src/foo.js'), null);
  // Vite dev-server: pre may see `file:///abs/foo.js`, post may see `/@fs/abs/foo.js`
  cache.store('file:///abs/foo.js', { tag: 'D' });
  check('SnapshotCache/file:// <-> /@fs', cache.take('/@fs/abs/foo.js')?.tag, 'D');
  cache.store('/@fs/abs/bar.js', { tag: 'E' });
  check('SnapshotCache//@fs <-> file://', cache.take('file:///abs/bar.js')?.tag, 'E');
  // multi-slash collapse: bundler path-join quirk produces `pkg//sub/foo`
  cache.store('core-js-pure//full/foo.js', { tag: 'F' });
  check('SnapshotCache/collapse repeated slashes', cache.take('core-js-pure/full/foo.js')?.tag, 'F');
  // SFC sub-block queries are block selectors - distinct setup/type/lang combinations must
  // resolve to different keys, otherwise the later write clobbers the former's snapshot
  cache.store('/src/App.vue?vue&type=script', { tag: 'sfc-plain' });
  cache.store('/src/App.vue?vue&type=script&setup=true', { tag: 'sfc-setup' });
  check('SnapshotCache/sfc type=script', cache.take('/src/App.vue?vue&type=script')?.tag, 'sfc-plain');
  check('SnapshotCache/sfc setup=true', cache.take('/src/App.vue?vue&type=script&setup=true')?.tag, 'sfc-setup');
  cache.store('/src/Page.astro?astro&type=script', { tag: 'astro-plain' });
  cache.store('/src/Page.astro?astro&type=script&lang=ts', { tag: 'astro-ts' });
  check('SnapshotCache/astro plain', cache.take('/src/Page.astro?astro&type=script')?.tag, 'astro-plain');
  check('SnapshotCache/astro lang=ts', cache.take('/src/Page.astro?astro&type=script&lang=ts')?.tag, 'astro-ts');
  // framework marker at the very END of the query, followed by a `#L<n>` sourcemap suffix: the marker
  // must still register so two such sub-blocks of one file keep DISTINCT keys instead of both collapsing
  // to the stripped-path key (which would clobber the first snapshot). a raw scan whose marker boundary
  // excluded `#` missed a marker pinned between `&` and `#`
  cache.store('/src/App.vue?type=script&vue#L1', { tag: 'tail-marker-script' });
  cache.store('/src/App.vue?type=template&vue#L2', { tag: 'tail-marker-template' });
  check('SnapshotCache/tail marker + hash script distinct', cache.take('/src/App.vue?type=script&vue#L1')?.tag, 'tail-marker-script');
  check('SnapshotCache/tail marker + hash template distinct', cache.take('/src/App.vue?type=template&vue#L2')?.tag, 'tail-marker-template');
  // detection and key construction share ONE parse, so a sub-block whose query differs only in CASE or
  // PERCENT-ENCODING between the pre and post passes still round-trips - the key inherits the lowercase +
  // decode the detection predicate applies, instead of keeping raw bytes (`type=SCRIPT` <-> `type=script`,
  // `%76%75%65` <-> `vue`). drive-letter case was already folded; the query is the dimension this closes
  cache.store('/src/Case.vue?vue&type=SCRIPT&lang=TS', { tag: 'sfc-xcase' });
  check('SnapshotCache/sfc query case canonical across passes',
    cache.take('/src/Case.vue?vue&type=script&lang=ts')?.tag, 'sfc-xcase');
  cache.store('/src/Enc.vue?%76%75%65&type=script', { tag: 'sfc-xenc' });
  check('SnapshotCache/sfc query percent-encoding canonical across passes',
    cache.take('/src/Enc.vue?vue&type=script')?.tag, 'sfc-xenc');
  // percent-encoded UPPERCASE marker (`%56ue` -> `Vue`): the case-fold runs AFTER percent-decode, so the
  // decoded `V` folds to `v` and the marker still registers - a pre-decode fold would leave `Vue`, miss
  // the marker, and key on the bare path, breaking the round-trip with the plain `?vue` post-pass id
  // Windows UNC prefixes embed `?` at index 2 - the HMR-timestamp strip must scan for the
  // query past the prefix (shared offset with stripQueryHash). with a raw indexOf the strip
  // consumed the REAL `?` together with a first-token `?t=N`, gluing the remaining query onto
  // the path and diverging from the stored key
  cache.store('//?/C:/src/App.vue?vue&type=script', { tag: 'unc-fwd' });
  check('SnapshotCache/UNC forward + t= first token with tail',
    cache.take('//?/C:/src/App.vue?t=123&vue&type=script')?.tag, 'unc-fwd');
  cache.store('\\\\?\\C:\\src\\Bar.vue?vue&type=script', { tag: 'unc-bs' });
  check('SnapshotCache/UNC backslash + t= appended',
    cache.take('\\\\?\\C:\\src\\Bar.vue?vue&type=script&t=99')?.tag, 'unc-bs');
  cache.store('//?/C:/src/plain.js', { tag: 'unc-bare' });
  check('SnapshotCache/UNC + t= as the only query token',
    cache.take('//?/C:/src/plain.js?t=5')?.tag, 'unc-bare');
  cache.store('/src/NonUnc.vue?vue&type=script', { tag: 'nonunc' });
  check('SnapshotCache/non-UNC t= first token control',
    cache.take('/src/NonUnc.vue?t=123&vue&type=script')?.tag, 'nonunc');
  cache.store('//?/C:/src/Frag.vue?vue&type=script#L5', { tag: 'unc-frag' });
  check('SnapshotCache/UNC + fragment + t= first token',
    cache.take('//?/C:/src/Frag.vue?t=7&vue&type=script#L5')?.tag, 'unc-frag');
  cache.store('/src/Up.vue?%56ue&type=script', { tag: 'sfc-upenc' });
  check('SnapshotCache/sfc percent-encoded uppercase marker canonical',
    cache.take('/src/Up.vue?vue&type=script')?.tag, 'sfc-upenc');
  // an in-HASH `?t=N` (after `#`) is opaque fragment text, NOT an HMR marker: stripping it (the old
  // `indexOf('?')` matched the in-fragment `?`) collapsed two sub-blocks differing only in the fragment
  cache.store('/src/Frag.vue?vue&type=script#L1?t=1', { tag: 'frag-a' });
  cache.store('/src/Frag.vue?vue&type=script#L1?t=2', { tag: 'frag-b' });
  check('SnapshotCache/in-hash query not HMR-stripped a', cache.take('/src/Frag.vue?vue&type=script#L1?t=1')?.tag, 'frag-a');
  check('SnapshotCache/in-hash query not HMR-stripped b', cache.take('/src/Frag.vue?vue&type=script#L1?t=2')?.tag, 'frag-b');
  // a decoded `&` in a param value must not merge with the `&` token join: the single param `a=b&c`
  // (`a=b%26c`) and the two params `a=b` + `c` must key distinctly, not both re-serialize to `a=b&c&vue`
  cache.store('/src/Amp.vue?vue&a=b%26c', { tag: 'enc-amp' });
  cache.store('/src/Amp.vue?vue&a=b&c', { tag: 'two-param' });
  check('SnapshotCache/decoded & no join collision a', cache.take('/src/Amp.vue?vue&a=b%26c')?.tag, 'enc-amp');
  check('SnapshotCache/decoded & no join collision b', cache.take('/src/Amp.vue?vue&a=b&c')?.tag, 'two-param');
  // dotted virtual-ext lang sub-blocks of one file (`&lang.ts` vs `&lang.tsx`) carry distinct queries, so
  // their keys must differ - else the second snapshot clobbers the first as the framework marker alone
  // would collapse both to the same key
  cache.store('/src/Dot.vue?vue&type=script&lang.ts', { tag: 'dot-ts' });
  cache.store('/src/Dot.vue?vue&type=script&lang.tsx', { tag: 'dot-tsx' });
  check('SnapshotCache/dotted lang sub-block ts distinct', cache.take('/src/Dot.vue?vue&type=script&lang.ts')?.tag, 'dot-ts');
  check('SnapshotCache/dotted lang sub-block tsx distinct', cache.take('/src/Dot.vue?vue&type=script&lang.tsx')?.tag, 'dot-tsx');
  // a `?marker` that sits in a URL FRAGMENT (`#frag?vue&type=script`) is fragment text, not a query, so
  // the id is NOT an SFC sub-block: it keys on its bare path like any non-sub-block id (detection and the
  // key agree via the one parse, so no malformed `?#frag?...` sub-block key as the two-parser split emitted)
  cache.store('/src/Frag.vue#frag?vue&type=script', { tag: 'frag-bare' });
  check('SnapshotCache/fragment marker keys on bare path',
    cache.take('/src/Frag.vue')?.tag, 'frag-bare');
  // Vite virtual module: `/@id/virtual:foo` must normalize to `virtual:foo` so pre/post
  // pair round-trips when the resolver strips the prefix between passes
  cache.store('/@id/virtual:mod', { tag: 'virt' });
  check('SnapshotCache//@id/ prefix', cache.take('virtual:mod')?.tag, 'virt');
  // case-insensitive prefix match - RFC 3986 allows upper-case URL schemes
  cache.store('FILE:///abs/up.js', { tag: 'upper' });
  check('SnapshotCache/uppercase FILE://', cache.take('/abs/up.js')?.tag, 'upper');
  cache.store('/@FS/abs/up2.js', { tag: 'upper-fs' });
  check('SnapshotCache/uppercase /@FS/', cache.take('/abs/up2.js')?.tag, 'upper-fs');
  // composite scheme chain: `/@id/file:///abs/foo` carries two prefixes back-to-back. iterative
  // strip collapses both, single-pass `replace` would leave residual `file:///abs/foo`
  cache.store('/@id/file:///abs/composite.js', { tag: 'composite' });
  check('SnapshotCache/composite /@id/+file://', cache.take('/abs/composite.js')?.tag, 'composite');
  // HMR `?t=N` strip MUST NOT corrupt path-portion `&` chars. positional gate ensures
  // leading-amp -> `?` swap fires only when the original first `?` was a `?t=` token.
  // regression for greedy-amp-fix that previously rewrote any leading path `&` to `?`
  cache.store('/dir&with/file.js', { tag: 'amp-path' });
  check('SnapshotCache/HMR strip preserves path &', cache.take('/dir&with/file.js?t=1')?.tag, 'amp-path');
  cache.store('/src&dir/App.vue?vue&type=script', { tag: 'amp-sfc' });
  check('SnapshotCache/HMR + SFC preserves path &',
    cache.take('/src&dir/App.vue?vue&type=script&t=1')?.tag, 'amp-sfc');
  // legitimate HMR + extra query: `?t=1&Y=2` -> swap to `?Y=2`
  cache.store('/foo.js?Y=2', { tag: 'hmr-tail' });
  check('SnapshotCache/HMR strip first-token + & tail',
    cache.take('/foo.js?t=1&Y=2')?.tag, 'hmr-tail');
  // a path-portion `&t=N` with NO preceding `?` is literal text, not an HMR marker: it must NOT
  // strip down to the bare path key (else a real `/proj/weird` snapshot is served for it)
  cache.store('/proj/weird&t=123', { tag: 'amp-path-no-query' });
  check('SnapshotCache/HMR path &t= without query != bare path key',
    cache.take('/proj/weird')?.tag, undefined);
  check('SnapshotCache/HMR keeps path &t= without query',
    cache.take('/proj/weird&t=123')?.tag, 'amp-path-no-query');
  // SFC sub-block query-parameter order normalization: `?vue&type=script&lang=ts` and
  // `?vue&lang=ts&type=script` describe the same block; cache key must match regardless of
  // bundler-emitted parameter order
  cache.store('/src/Sort.vue?vue&type=script&lang=ts', { tag: 'sfc-sort' });
  check('SnapshotCache/sfc tail param-order canonical',
    cache.take('/src/Sort.vue?vue&lang=ts&type=script')?.tag, 'sfc-sort');
  // invalidate fanout: changing an SFC source file drops the bare-path snapshot AND every
  // sub-block entry (script / template / style) so a stale post-pass can't pick them up
  cache.store('/src/Fan.vue', { tag: 'fan-bare' });
  cache.store('/src/Fan.vue?vue&type=script', { tag: 'fan-script' });
  cache.store('/src/Fan.vue?vue&type=template', { tag: 'fan-template' });
  cache.invalidate('/src/Fan.vue');
  check('SnapshotCache/invalidate fanout bare', cache.take('/src/Fan.vue'), null);
  check('SnapshotCache/invalidate fanout script', cache.take('/src/Fan.vue?vue&type=script'), null);
  check('SnapshotCache/invalidate fanout template', cache.take('/src/Fan.vue?vue&type=template'), null);
  // Windows drive letter normalization through Vite scheme prefixes. after `/@fs/` strip
  // the path becomes `/C:/src/foo.js`; drive-letter regex must match through the residual
  // leading `/` so the lowercased canonical form aligns with bare `C:/src/foo.js` keys
  cache.store('C:/win/proj.js', { tag: 'win-fs' });
  check('SnapshotCache/win drive via /@fs/', cache.take('/@fs/C:/win/proj.js')?.tag, 'win-fs');
  cache.store('C:/win/file.js', { tag: 'win-file' });
  check('SnapshotCache/win drive via file:///', cache.take('file:///C:/win/file.js')?.tag, 'win-file');
  // upper / lower drive letter must hash identically regardless of bundler-stage casing
  cache.store('C:/win/case.js', { tag: 'win-case' });
  check('SnapshotCache/win drive lower-case canonical', cache.take('c:/win/case.js')?.tag, 'win-case');
  // drive-letter case mismatch BEHIND a scheme prefix: pre emits `/@fs/C:/...` (source case),
  // post emits `/@fs/c:/...` (a stage that lowercased). the lowercase form must ALSO shed its
  // residual leading `/` so both canonicalise to `c:/...` - else snapshot lost (dangling _ref)
  cache.store('/@fs/C:/win/scheme-case.js', { tag: 'win-scheme-case' });
  check('SnapshotCache/win drive scheme-prefixed case mismatch',
    cache.take('/@fs/c:/win/scheme-case.js')?.tag, 'win-scheme-case');
  // scheme-prefixed lowercase vs bare lowercase: one stage adds `/@fs/`, the other doesn't
  cache.store('c:/win/scheme-bare.js', { tag: 'win-scheme-bare' });
  check('SnapshotCache/win drive lowercase scheme vs bare',
    cache.take('/@fs/c:/win/scheme-bare.js')?.tag, 'win-scheme-bare');
  // composite scheme + Windows drive: `/@id/file:///C:/...` strips both prefixes and
  // canonicalises drive case. UNC `\\?\C:\...` flows through the UNC stripper first
  cache.store('C:/win/composite.js', { tag: 'win-composite' });
  check('SnapshotCache/win drive via composite /@id/file://',
    cache.take('/@id/file:///C:/win/composite.js')?.tag, 'win-composite');
  cache.store('C:/win/unc.js', { tag: 'win-unc' });
  check('SnapshotCache/win drive via UNC long-path', cache.take('\\\\?\\C:\\win\\unc.js')?.tag, 'win-unc');
  // SFC sub-block on a Windows path: drive letter normalises in the path portion while the
  // sorted SFC query tail is preserved so distinct sub-blocks keep distinct keys
  cache.store('C:/win/View.vue?vue&type=script', { tag: 'win-sfc-script' });
  check('SnapshotCache/win drive sfc sub-block',
    cache.take('/@fs/C:/win/View.vue?vue&type=script')?.tag, 'win-sfc-script');
  // marker-LESS SFC sub-blocks (admitted by shouldTransform via JS/TS `lang=` alone, no
  // framework marker) of one file must keep DISTINCT keys - else the second pre's store
  // overwrites the first at the shared stripped path key and post inherits the wrong imports
  cache.store('/src/App.vue?type=script&lang=ts', { tag: 'sfc-markerless-a' });
  check('SnapshotCache/marker-less SFC sub-block distinct key',
    cache.take('/src/App.vue?type=script&setup=true&lang=ts'), null);
  check('SnapshotCache/marker-less SFC same sub-block hits',
    cache.take('/src/App.vue?type=script&lang=ts')?.tag, 'sfc-markerless-a');
  // a generic `?lang=en` (non-JS/TS) is NOT an SFC sub-block - its query still strips so an
  // unrelated bundler visiting the same file under different generic queries keeps one key
  cache.store('/src/data.js?lang=en', { tag: 'generic-lang' });
  check('SnapshotCache/generic non-JS lang query still strips',
    cache.take('/src/data.js?lang=fr')?.tag, 'generic-lang');
  // case-fold is scoped to the Windows DRIVE LETTER only - the rest of the path stays
  // case-sensitive (on Linux `SRC` and `src` are different dirs). guards against an over-broad
  // whole-path `.toLowerCase()` that would collide genuinely-distinct files on case-sensitive fs
  cache.store('c:/src/keep-case.js', { tag: 'drive-only-fold' });
  check('SnapshotCache/non-drive path segment stays case-sensitive',
    cache.take('c:/SRC/keep-case.js'), null);
  // recognized sub-block hash is preserved VERBATIM (sliced at the first `#`, never sorted): an
  // in-hash query is NOT folded into the sortable pre-hash tokens. the `#z?b=1&a=2` vs `#z?a=2&b=1`
  // pair would COLLIDE if the whole tail were sorted, so distinct keys here pin verbatim handling -
  // guards against both hash-drop and whole-tail-sort regressions
  cache.store('/src/Hash.vue?vue&type=script#z?b=1&a=2', { tag: 'hash-verbatim' });
  check('SnapshotCache/in-hash query not sorted (verbatim, distinct)',
    cache.take('/src/Hash.vue?vue&type=script#z?a=2&b=1'), null);
  check('SnapshotCache/identical sub-block hash round-trips',
    cache.take('/src/Hash.vue?vue&type=script#z?b=1&a=2')?.tag, 'hash-verbatim');
  // peekWithParse leaves the snapshot intact: callers (post pass with disable-file detection)
  // can inspect cached AST before committing to `take()`. bail paths leave the entry so a
  // subsequent retry can still consume it
  cache.store('/src/Peek.js', { postInput: 'X', ast: { type: 'Program' }, comments: [], snapshot: { tag: 'peeked' } });
  const peek1 = cache.peekWithParse('/src/Peek.js', 'X');
  check('SnapshotCache/peek returns snapshot', peek1.snapshot?.tag, 'peeked');
  check('SnapshotCache/peek non-destructive', cache.take('/src/Peek.js')?.snapshot?.tag, 'peeked');
  check('SnapshotCache/peek then take consumes', cache.take('/src/Peek.js'), null);
}
checkSnapshotKeyNormalization();

// --- patternToRegExp: alternation grouping ---
// `^a|b$` parses as `(^a)|(b$)` and matches `axxx` (starts-with-a) OR `xxxb` (ends-with-b).
// wrapping pattern in `(?:...)` non-capturing group binds alternation to anchors uniformly:
// `^(?:a|b)$` matches whole `a` OR whole `b`. without the group, user-supplied pattern
// `'es.array.from|es.string.repeat'` matched `dummy.es.string.repeat` (ends-with) and
// `es.array.from.dummy` (starts-with) - over-broad include/exclude
function checkPatternAlternation() {
  const re = patternToRegExp('es.array.from|es.string.repeat');
  check('pattern/alternation matches first whole entry', re.test('es.array.from'), true);
  check('pattern/alternation matches second whole entry', re.test('es.string.repeat'), true);
  check('pattern/alternation rejects starts-with', re.test('es.array.from.dummy'), false);
  check('pattern/alternation rejects ends-with', re.test('dummy.es.string.repeat'), false);
}
checkPatternAlternation();

// --- SnapshotCache shared probe ---
// per-test fresh cache: store under one id, query by another, report hit/miss. shared
// helper across HMR / UNC / multi-timestamp / file-localhost suites so the normalization
// pipeline is exercised through one consistent lookup pattern
const sentinelEntry = { code: 'foo', map: null, ast: null, source: 'foo' };
function probeSnapshotHit(storeId, takeId) {
  const cache = new SnapshotCache();
  cache.store(storeId, sentinelEntry);
  return cache.take(takeId) !== null;
}

// --- SnapshotCache: Vite HMR `&t=<timestamp>` stripping ---
// Vite HMR re-fires modules with `?t=<ms>` cache-buster. each fire generates a different
// timestamp, but the logical module is the same. snapshot lookup keyed by normalized id
// (timestamp stripped) so pre->post lookup survives HMR. without the strip, post-pass
// missed pre's snapshot and emitted duplicate `var _ref;` / re-allocated UIDs
function checkSnapshotHMRTimestampStrip() {
  check('snapshot/HMR &t= different timestamp finds same entry',
    probeSnapshotHit('/src/App.vue?vue&type=script&t=1733', '/src/App.vue?vue&type=script&t=9999'), true);
  check('snapshot/SFC sub-block query distinguishes',
    probeSnapshotHit('/src/App.vue?vue&type=script&t=1733', '/src/App.vue?vue&type=template'), false);
  check('snapshot/non-SFC ?t= strip',
    probeSnapshotHit('/src/util.js?t=100', '/src/util.js?t=200'), true);
  check('snapshot/bare ?t=N strips clean',
    probeSnapshotHit('/src/x.js?t=1', '/src/x.js'), true);
}
checkSnapshotHMRTimestampStrip();

// --- SnapshotCache: Windows UNC path normalization ---
// `\\?\C:\src\App.vue` is Windows verbatim long-path prefix - same logical file as
// `C:/src/App.vue` after path-mangling stages. without UNC strip, snapshot lookups
// across pre->post (where mid-pipeline normalization may have run) miss
function checkSnapshotWindowsUNC() {
  // backslash UNC paired with forward-slash POSIX path (after normalize stage)
  check('snapshot/UNC backslash matches forward-slash same path',
    probeSnapshotHit('\\\\?\\C:\\src\\App.vue', 'C:/src/App.vue'), true);
  // forward-slash UNC (Vite-normalized form) matches POSIX
  check('snapshot/UNC forward-slash matches POSIX',
    probeSnapshotHit('//?/C:/src/App.vue', 'C:/src/App.vue'), true);
}
checkSnapshotWindowsUNC();

// --- SnapshotCache: per-file invalidation ---
// `watchChange` hook on Vite/Rollup fires per-file edit. cache.invalidate(id) drops only
// that file's entry (not the whole cache) so unrelated files keep their pre-snapshot state
function checkSnapshotInvalidate() {
  const cache = new SnapshotCache();
  cache.store('/src/a.js', sentinelEntry);
  cache.store('/src/b.js', sentinelEntry);
  check('snapshot/invalidate returns true for existing entry', cache.invalidate('/src/a.js'), true);
  check('snapshot/invalidate returns false for missing entry', cache.invalidate('/src/missing.js'), false);
  check('snapshot/invalidate preserves siblings', cache.take('/src/b.js') !== null, true);
  // path normalization carries through invalidate
  cache.store('/src/c.js?vue&type=script&t=100', sentinelEntry);
  cache.invalidate('/src/c.js?vue&type=script&t=999');
  check('snapshot/invalidate normalizes HMR timestamp',
    cache.take('/src/c.js?vue&type=script&t=1') !== null, false);
}
checkSnapshotInvalidate();

// --- SnapshotCache: HMR multi-`?t=` re-fire chain ---
// Vite HMR appending `?t=N` more than once (re-fire wrapping a previous wrapper) used to
// leave a leftover `&t=N` in the key because the strip regex was non-global. with the
// global flag plus post-strip cleanup the doubled marker collapses to a stable key
function checkSnapshotHMRMultiTimestamp() {
  check('snapshot/HMR ?t=1&t=2 multi-marker collapses',
    probeSnapshotHit('/src/x.js?t=1&t=2', '/src/x.js'), true);
  check('snapshot/HMR ?t=1&type=script preserves type',
    probeSnapshotHit('/src/x.js?t=1&type=script', '/src/x.js?type=script'), true);
  check('snapshot/HMR ?t=1&import preserves marker',
    probeSnapshotHit('/src/x.js?t=1&import', '/src/x.js?import'), true);
  check('snapshot/HMR ?type=script&t=1 strips trailing &t=',
    probeSnapshotHit('/src/x.js?type=script&t=1', '/src/x.js?type=script'), true);
  // triple `?t=N&t=N&t=N` chain - Vite re-fire wrapping multiple times leaves three
  // markers; the global-flag strip plus post-strip cleanup chain must collapse all
  check('snapshot/HMR triple ?t=1&t=2&t=3 collapses to bare',
    probeSnapshotHit('/src/x.js?t=1&t=2&t=3', '/src/x.js'), true);
  // hash component must be preserved across HMR strip - `?t=N#hash` keeps the hash
  // intact (only the query token is stripped). hash-only re-fire (no `?` prefix) must
  // also leave the key stable across the strip pipeline
  check('snapshot/HMR ?t=1#hash preserves hash',
    probeSnapshotHit('/src/x.js?t=1#L10', '/src/x.js#L10'), true);
  // decimal timestamp `?t=N.M` - some bundlers emit fractional ms; integer-only `\d+`
  // would leave the `.M` tail glued to the path, breaking lookup. boundary anchor
  // `(?=[&#]|$)` prevents the regex from truncating path text when `?t=` is followed
  // by something else (e.g. `?t=1.5/foo` should NOT match - real param value never
  // contains `/`, but defensive)
  check('snapshot/HMR ?t=1.5 decimal collapses to bare',
    probeSnapshotHit('/src/x.js?t=1.5', '/src/x.js'), true);
  check('snapshot/HMR ?t=1.5&import preserves marker',
    probeSnapshotHit('/src/x.js?t=1.5&import', '/src/x.js?import'), true);
  check('snapshot/HMR ?t=1.5#hash preserves hash',
    probeSnapshotHit('/src/x.js?t=1.5#L10', '/src/x.js#L10'), true);
  // SFC sub-block keeps query intact (only HMR_TIMESTAMP_RE touches `t=`); these probe
  // the regex shape directly. without SFC marker, `stripQueryHash` would strip the
  // whole query downstream and mask any HMR-strip mistakes
  check('snapshot/HMR SFC ?t=1.5 decimal in sub-block strips token',
    probeSnapshotHit('/src/App.vue?vue&type=script&t=1.5', '/src/App.vue?vue&type=script'), true);
  check('snapshot/HMR SFC empty ?t= preserved (regex rejects)',
    probeSnapshotHit('/src/App.vue?vue&type=script&t=', '/src/App.vue?vue&type=script&t='), true);
}
checkSnapshotHMRMultiTimestamp();

// --- SnapshotCache: file://localhost authority ---
// some bundlers / Node URL helpers serialize file URLs with an explicit `localhost` host
// per RFC 3986 instead of the canonical triple-slash form. without the optional host
// segment in VITE_SCHEME_PREFIX_RE the prefix wouldn't strip and `file://localhost/...`
// stayed distinct from `/...` -> snapshot lookup miss across pre+post pipelines that
// normalize file URLs differently
function checkSnapshotFileLocalhost() {
  check('snapshot/file://localhost matches triple-slash form',
    probeSnapshotHit('file://localhost/abs/foo.js', 'file:///abs/foo.js'), true);
  check('snapshot/file://localhost matches bare path',
    probeSnapshotHit('file://localhost/abs/foo.js', '/abs/foo.js'), true);
  check('snapshot/FILE://LOCALHOST case-insensitive scheme',
    probeSnapshotHit('FILE://LOCALHOST/abs/foo.js', '/abs/foo.js'), true);
  // non-localhost authority MUST NOT strip - `file://otherhost/abs/foo.js` is a remote
  // file URL whose authority is meaningful. stripping `file://` would collapse to
  // `otherhost/abs/foo.js`, an entirely different path. regex `(?:localhost)?` is
  // optional but must not match a stray hostname; the pattern is anchored after the
  // `//` so non-`localhost` authorities pass through untouched
  check('snapshot/file://otherhost authority rejected (different paths)',
    probeSnapshotHit('file://otherhost/abs/foo.js', '/abs/foo.js'), false);
  // four-slash file URL `file:////abs/path` (Windows-friendly absolute) - prefix strips
  // the `file://`, leaves `//abs/path`, REPEATED_SLASHES_RE collapses to `/abs/path`
  check('snapshot/file:/// quad-slash collapses via REPEATED_SLASHES_RE',
    probeSnapshotHit('file:////abs/quad.js', '/abs/quad.js'), true);
}
checkSnapshotFileLocalhost();

// --- skipDirectivePrologue: empty-string directive extends the prologue ---
// an empty-string directive (`'';`) IS part of the prologue per the spec (any string-literal
// statement extends it), so the scan advances past it - a following `'use strict'` stays an
// active directive and the `var _ref;` / import insertion point lands AFTER the full prologue
function checkSkipDirectivePrologueEmpty() {
  const empty = { type: 'ExpressionStatement', directive: '', end: 5 };
  const real = { type: 'ExpressionStatement', directive: 'use strict', end: 16 };
  const laterEmpty = { type: 'ExpressionStatement', directive: '', end: 19 };
  const expr = { type: 'ExpressionStatement', expression: { type: 'Identifier' }, end: 20 };
  // empty `""` advances like any directive; non-directive breaks the scan and returns the
  // last advanced end (or fallback if none seen yet)
  check('skipDirectivePrologue/empty directive advances to its end',
    skipDirectivePrologue([empty], 0), 5);
  check('skipDirectivePrologue/use strict advances to its end',
    skipDirectivePrologue([real], 0), 16);
  check('skipDirectivePrologue/non-directive breaks scan',
    skipDirectivePrologue([expr], 0), 0);
  // mixed: real prologue first, then empty `""` keeps advancing through the full prologue
  check('skipDirectivePrologue/real then empty advances past both',
    skipDirectivePrologue([real, laterEmpty], 0), 19);
  // mixed: real prologue first, then non-directive expression
  check('skipDirectivePrologue/real then expression stops at real',
    skipDirectivePrologue([real, expr], 0), 16);
  // null/undefined statements list (defensive guard via `?? []`)
  check('skipDirectivePrologue/missing statements list returns fallback',
    skipDirectivePrologue(null, 7), 7);
}
checkSkipDirectivePrologueEmpty();

// the DEFER (pre) pass must leave user core-js imports untouched: its emission is deferred
// to post, so a destructive remove would strand the file import-less whenever the post pass
// never lands (evicted snapshot / sibling bail / watch-mode re-run)
function checkDeferPassKeepsUserImports() {
  const src = 'import "core-js/modules/es.array.from.js";\nconst r = Array.from(x);\nuse(r);';
  const opts = { method: 'usage-global', version: '4.0', targets: { ie: 11 } };
  const twoPass = createPlugin(opts);
  const preOut = twoPass.transform(src, '/defer-keep.mjs', 'pre')?.code ?? src;
  check('defer/pre keeps the user global import', preOut.includes('es.array.from'), true);
  const postOut = twoPass.transform(preOut, '/defer-keep.mjs', 'post')?.code ?? preOut;
  check('defer/post converges to a single import', (postOut.match(/es\.array\.from/g) ?? []).length, 1);
}
checkDeferPassKeepsUserImports();

// --- phase: pre+post pipeline pass-through ---
// for `pass: 'pre'` the plugin processes and stores snapshot for the next pass. for
// `pass: 'post'` (re-entered with same code), the plugin should converge to the same
// result as single-pass because the state machine is idempotent given a stable input
function checkPhasePipelinePassThrough() {
  const code = 'export var v = arr?.at?.(0);\nexport var x = "test".at(-1);\nexport var m = new Map();';
  {
    const engine = 'ast';
    const opts = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
    const single = createPlugin(opts).transform(code, '/sm-phase.mjs');
    // pre+post share one plugin instance. internal `runTransform` accepts pass: 'pre'/'post'/'single'
    const twoPass = createPlugin(opts);
    const preOut = twoPass.transform(code, '/sm-phase.mjs', 'pre');
    // post receives pre's output as input, must produce stable result via snapshot lookup
    const postOut = preOut?.code ? twoPass.transform(preOut.code, '/sm-phase.mjs', 'post') : preOut;
    const final = postOut?.code ?? preOut?.code;
    // imports must match (single source of truth for which polyfills are needed)
    const singleImports = (single?.code ?? '').split('\n').filter(l => l.startsWith('import ')).sort().join('\n');
    const twoPassImports = (final ?? '').split('\n').filter(l => l.startsWith('import ')).sort().join('\n');
    check(`phase/pre+post imports match single (${ engine })`, twoPassImports, singleImports);
  }
}
checkPhasePipelinePassThrough();

// --- pre+post snapshot flow, engine axis ---
// two cases only the SNAPSHOT can answer - post's own re-detection cannot: a sibling lowers
// the usage into an undetectable spelling between passes (usage-global defers its imports to
// post, so the pre-detected module arrives via the snapshot alone), and a sibling INJECTS new
// polyfillable code between passes (post must rewrite it, dedup imports against pre's inline
// ones, and mint refs that do not collide with pre's - the suffix state rides the snapshot)
function checkPhaseSnapshotFlow() {
  const engine = 'ast';
  {
    const globalOpts = { method: 'usage-global', version: '4.0', targets: { ie: 11 } };
    const lowered = createPlugin(globalOpts);
    check(`phase/snapshot pre defers usage-global imports (${ engine })`,
      lowered.transform('[1].flat();', '/sm-lowered.mjs', 'pre'), null);
    const loweredOut = lowered.transform('lowFlat([1]);', '/sm-lowered.mjs', 'post')?.code ?? '';
    check(`phase/snapshot carries pre-detected module past a lowering sibling (${ engine })`,
      loweredOut.includes('es.array.flat'), true);

    const pureOpts = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
    const injected = createPlugin(pureOpts);
    const pre = injected.transform('const v = getA().flat?.()?.at(0);\nuse(v);', '/sm-injected.mjs', 'pre');
    const post = injected.transform(`${ pre.code }\nconst w = getB().flat?.()?.at(0);\nuse(w);`, '/sm-injected.mjs', 'post');
    const out = post?.code ?? '';
    const importLines = out.split('\n').filter(l => l.startsWith('import '));
    check(`phase/sibling-injected usage rewritten in post (${ engine })`,
      out.includes('use(w)') && !/getB\(\)\.flat\?\./.test(out), true);
    check(`phase/post dedups imports against pre's inline ones (${ engine })`,
      new Set(importLines).size === importLines.length && importLines.length > 0, true);
    const declared = out.matchAll(/var (?<names>[\w ,]+);/g).flatMap(m => m.groups.names.split(', ')).toArray();
    check(`phase/post refs do not collide with pre refs (${ engine })`,
      declared.filter((name, i) => declared.indexOf(name) !== i).length, 0);

    // an in-pattern opt-out must reach the post pass alive: the pre output re-anchors the
    // directive to the rebuilt remainder statement (property-attached comments die in a
    // sibling lowering between the passes; statement-leading ones survive)
    const directive = createPlugin(pureOpts).transform(
      'const {\n  Map: { groupBy },\n  // core-js-disable-next-line\n  Object: { groupBy: og },\n} = globalThis;\nuse(groupBy, og);',
      '/sm-directive.mjs', 'pre');
    check(`phase/pre keeps the opt-out statement-anchored (${ engine })`,
      /\n\/\/ core-js-disable-next-line\nconst /.test(directive?.code ?? ''), true);
    // ... and the trailing `-line` spelling re-anchors as the same leading form
    const directiveLine = createPlugin(pureOpts).transform(
      'const {\n  Map: { groupBy },\n  Object: { groupBy: og }, // core-js-disable-line\n} = globalThis;\nuse(groupBy, og);',
      '/sm-directive-line.mjs', 'pre');
    check(`phase/pre re-anchors a trailing -line opt-out too (${ engine })`,
      /\n\/\/ core-js-disable-next-line\nconst /.test(directiveLine?.code ?? ''), true);
    // a POSITIONED host - a statement no emission rebuilt - is adopted too: the in-pattern
    // comment dies in the sibling lowering all the same, so pre re-anchors it even though
    // the statement itself needed no rewrite (and, below, even when it is the file's ONLY
    // core-js-relevant content - the directive alone is reason to transform)
    const positionedSrc = 'const arr = [1];\nconst {\n  // core-js-disable-next-line\n  flat: f,\n} = arr;\nuse(f);\n';
    for (const method of ['usage-pure', 'usage-global']) {
      const positioned = createPlugin({ ...pureOpts, method }).transform(
        `${ positionedSrc }[2].at(0);\n`, '/sm-directive-positioned.mjs', 'pre');
      check(`phase/pre re-anchors a positioned-host opt-out (${ method }, ${ engine })`,
        /\n\/\/ core-js-disable-next-line\nconst \{/.test(positioned?.code ?? ''), true);
      const soleDisabled = createPlugin({ ...pureOpts, method }).transform(
        positionedSrc, '/sm-directive-sole.mjs', 'pre');
      check(`phase/pre transforms for a sole disabled claim (${ method }, ${ engine })`,
        /\n\/\/ core-js-disable-next-line\nconst \{/.test(soleDisabled?.code ?? ''), true);
    }

    // a pass over our own output must not re-extract the SE-key sentinel (`{ [k]: _unusedN }`,
    // no rest) as a live binding - the census adopts the computed-key form too, and the
    // dispatchers' shared skip stands down (the file grew a fresh `_unusedN` per pass)
    // the REQUIRE import style re-transforms to a fixpoint too: its pure bindings are
    // `var _x = require(...)` declarators, recognized by the same censuses (an in-file
    // `require` shadow keeps them opaque - the locked fixture's rule)
    {
      const reqOpts = { ...pureOpts, importStyle: 'require' };
      const src = 'let w;\nconst v = (w = globalThis.window)?.self;\nuse(v, w);\nconst { flat: m } = arr;\nuse(m);';
      const one = createPlugin(reqOpts).transform(src, '/sm-req.mjs')?.code ?? src;
      const two = createPlugin(reqOpts).transform(one, '/sm-req.mjs')?.code ?? one;
      check(`re-transform fixpoint: require import style (${ engine })`, two, one);
    }
    // require/import twins of the recognition arms the K2-tail matrix exposed: each shape
    // discriminates one arm (resolve hint fallback / the bare-callee pair arms / the
    // require-binding view and its detect-usage gate)
    for (const [armLabel, styles, armSrc] of [
      ['mutated-static alias readback', ['require'],
        'export const r = (() => { const F = (() => Map)(); const orig = F.of;'
        + ' F.of = function () { return "fp"; }; const out = [Map.of === F.of]; F.of = orig; return out; })();\nuse(r);'],
      ['reflect template-key deopt', ['import', 'require'],
        'export const r = (() => { const _o = Array.from;'
        + ' try { Reflect.defineProperty(Array, `from`, { value: () => "P", configurable: true, writable: true }); return Array.from([1, 2]); }'
        + ' finally { Reflect.defineProperty(Array, `from`, { value: _o, configurable: true, writable: true }); } })();\nuse(r);'],
      ['double-optional proxy hop chain', ['require'],
        'export const r = (() => { const v = globalThis.window?.window?.self.Array.of(5).at(0); return typeof v; })();\nuse(r);'],
    ]) {
      for (const style of styles) {
        const armOpts = { ...pureOpts, importStyle: style };
        const one = createPlugin(armOpts).transform(armSrc, '/sm-arm.mjs')?.code ?? armSrc;
        const two = createPlugin(armOpts).transform(one, '/sm-arm.mjs')?.code ?? one;
        check(`re-transform fixpoint: ${ armLabel } (${ style }, ${ engine })`, two, one);
      }
    }
    const seKeySrc = 'const log = [];\nexport const r = (() => {\n  const { from: f, [(log.push("k"), "from")]: g } = Array;\n  return typeof f;\n})();\nuse(r, log);';
    const oncePlugin = createPlugin(pureOpts);
    const once = oncePlugin.transform(seKeySrc, '/sm-sekey.mjs')?.code;
    const twice = createPlugin(pureOpts).transform(once, '/sm-sekey.mjs')?.code ?? once;
    check(`re-transform of the SE-key sentinel output is a fixpoint (${ engine })`, twice, once);
    // ... and the OVERWRITE-REBIND / sentinel-census forms: a kept-raw destructure with its
    // appended rebind, the assignment-form sentinel PAIR (`var _unusedN;` + pattern value),
    // the nested-instance plain sentinel, and the defaulted guard spellings all re-transform
    // to a fixpoint - each was a growth class (FC-86) before its census arm
    for (const [label, fixSrc] of [
      ['kept-raw overwrite rebind', 'let m;\n({ y: { flat: m } } = { y: arr });\nuse(m);'],
      ['array-instance defaulted rebind', 'let m;\n[{ at: m = null }] = [[7, 8]];\nuse(m);'],
      ['defaulted static guard', 'const log = [];\nconst { [(log.push("e"), "from")]: f = 9 } = Array;\nuse(f, log);'],
      ['assignment-form sentinel pair', 'let from, rest;\n({ from, ...rest } = Array);\nuse(from, rest);'],
      ['substituted assign-se-key default', 'const log = [];\nlet f;\n({ [(log.push("k"), "from")]: f = 9 } = Array);\nuse(f, log);'],
      ['shadow-alias guard alternate', 'const B = Array;\nexport const r = (function () {\n  {\n    const B = {};\n    var h = B;\n  }'
        + '\n  {\n    const { of } = h === Array ? Array : h;\n    return typeof of;\n  }\n})();\nuse(r);'],
      ['param default minted root', 'export const v = (function ({ Promise: P } = globalThis) {\n  return typeof P;\n})({ Promise: Promise });\nuse(v);'],
      ['guarded nav with spent se-key claims', 'const log = [];\nexport const r = (log.push("r"), globalThis)[(log.push("k"), "window")]?.self.Array === Array;\nuse(r, log);'],
      ['symbol read through the minted key', 'export const t = String(typeof [1, 2][Symbol.iterator]);\nuse(t);'],
      ['extracted defineProperty deopt', 'const dp = Object.defineProperty;\nexport const r = (() => { const o = Array.from;'
        + ' try { dp(Array, "from", { value: () => "P", configurable: true }); return Array.from([1, 2]); }'
        + ' finally { dp(Array, "from", { value: o, configurable: true }); } })();\nuse(r);'],
      ['anchored symbol-key default', 'const { [Symbol.iterator]: it = "fb" } = WeakSet;\nuse(it);'],
      ['two-prop overwrite rebinds', 'const a2 = [3, [4]];\nlet m, n;\n({ y: { flat: m }, z: { flat: n } } = { y: arr, z: a2 });\nuse(m, n);'],
      ['guard-alternate deep read', 'const D = cond ? Array : other;\nexport const r = (D === Array ? Array.from : D.from.bind(D))([1]);\nuse(r);'],
      ['sekey keyswap symbol pattern', 'const log = [];\nlet it;\n({ Set: { [(log.push(1), Symbol.iterator)]: it } } = globalThis);\nuse(it, log);'],
      ['double-key literal alias mutation deopt', 'const ND = { M: Array, M: Iterator };\nconst Md = ND.M;'
        + '\nMd.from = function () { return "dk"; };\nexport const out = [Iterator.from === Md.from, typeof Array.from];\nuse(out);'],
      // the five sharpened shapes below each discriminate exactly one census's false-arm
      // (the corpus idempotence sweep found them; the earlier locks routed through siblings)
      ['assign-form se-key extraction', 'const log = [];\nlet f;\n({ [(log.push("e"), "from")]: f } = Array);\nuse(f, log);'],
      ['iife-arg param default ownership', 'export const r = (() => {'
        + '\n  const { Array: { of } } = globalThis, v = (function ({ Promise: P } = globalThis) { return typeof P; })(globalThis);'
        + '\n  return [typeof of, String(typeof v)];\n})();\nuse(r);'],
      ['block-shadowed alias var hoist', 'export const r = (() => { const B = Array; return (function () {'
        + '\n  { const B = {}; var h = B; }\n  { const { of } = h; return typeof of; }\n})(); })();\nuse(r);'],
      ['chained sequence nav receivers', 'const nr = () => globalThis;\nexport const r = ('
        + '\n  (nr().window?.self.probeGen.arr, nr().window?.self.probeGen.arr)?.flat()'
        + '\n    .concat((nr().window?.self.probeGen.arr, nr().window?.self.probeGen.arr)?.flat() ?? [])\n);\nuse(r);'],
      ['optional-first string chain claims', 'export const r = "abcde"?.slice(1).padStart(8, "0");\nuse(r);'],
      // exotic-but-valid module forms flow through the whole pipeline and settle
      ['import attributes on a sibling import', 'import data from "./d.json" with { type: "json" };\nexport const r = Array.from(data);\nuse(r);'],
      ['astral-plane identifier', 'const \u{1D4B6}b = [1];\nexport const r = \u{1D4B6}b.flat();\nuse(r);'],
      ['lone-surrogate string escape', 'export const r = "\\uD800".padStart(3, "x");\nuse(r);'],
      ['top-level await receiver', 'export const r = (await Promise.resolve([1])).flat();\nuse(r);'],
      ['crlf line endings', 'const a = [1, 2];\r\nexport const r = a.flat();\r\nuse(r);'],
    ]) {
      const one = createPlugin(pureOpts).transform(fixSrc, '/sm-fixpoint.mjs')?.code ?? fixSrc;
      const two = createPlugin(pureOpts).transform(one, '/sm-fixpoint.mjs')?.code ?? one;
      check(`re-transform fixpoint: ${ label } (${ engine })`, two, one);
    }
    // boundary contracts around whole-file reprint: a hashbang survives injection, a file
    // with nothing to claim stays untouched byte-for-byte (CRLF included), JSX flows through
    {
      const hbRes = createPlugin(pureOpts).transform('#!/usr/bin/env node\nexport const r = Array.from("ab");\nuse(r);\n', '/sm-hashbang.mjs');
      const hb = hbRes?.code ?? '';
      check(`hashbang survives injection (${ engine })`, hb.startsWith('#!/usr/bin/env node'), true);
      check(`hashbang file still injects (${ engine })`, /core-js/.test(hb), true);
      // the re-emitted hashbang shifts the whole map one generated line down - a claim
      // token must still trace to its ORIGINAL source line (2, under the hashbang)
      {
        const tracer = new TraceMap(hbRes.map);
        const genLines = hb.split('\n');
        const genLine = genLines.findIndex(line => line.includes('"ab"'));
        const pos = originalPositionFor(tracer, { line: genLine + 1, column: genLines[genLine].indexOf('"ab"') });
        check(`hashbang map traces below the shift (${ engine })`, pos.line, 2);
      }
      const noop = 'const a = 1;\r\nconst b = a + 1;\r\nexport { b };\r\n';
      const kept = createPlugin(pureOpts).transform(noop, '/sm-noop-crlf.mjs');
      check(`claimless CRLF file stays untouched (${ engine })`, kept === null || kept === undefined || kept.code === noop, true);
      const jsxSrc = 'const El = () => <div a={[1].flat()} />;\nexport const r = El;\nuse(r);\n';
      const jsxOne = createPlugin(pureOpts).transform(jsxSrc, '/sm-el.jsx')?.code ?? jsxSrc;
      const jsxTwo = createPlugin(pureOpts).transform(jsxOne, '/sm-el.jsx')?.code ?? jsxOne;
      check(`jsx injects and settles (${ engine })`, /core-js/.test(jsxOne) && jsxTwo === jsxOne, true);
    }
    // the bundler pattern: ONE plugin instance transforms many files - no state may leak
    // between files, and instances with different targets may interleave freely
    {
      const srcA = 'export const r = [1, [2]].flat().at(-1);\nconst { from } = Array;\nuse(r, from);\n';
      const srcB = 'let w;\nconst v = (w = globalThis.window)?.self;\nuse(v, w);\n';
      const shared = createPlugin(pureOpts);
      const a1 = shared.transform(srcA, '/sm-leak-a.mjs')?.code;
      const b1 = shared.transform(srcB, '/sm-leak-b.mjs')?.code;
      const a2 = shared.transform(srcA, '/sm-leak-a.mjs')?.code;
      check(`shared instance leaks no state between files (${ engine })`, a1 === a2, true);
      check(`shared instance matches a fresh one (${ engine })`,
        b1 === createPlugin(pureOpts).transform(srcB, '/sm-leak-b.mjs')?.code, true);
      const modern = createPlugin({ ...pureOpts, targets: { chrome: 130 } }).transform(srcA, '/sm-leak-a.mjs')?.code ?? srcA;
      check(`interleaved modern targets stay separate (${ engine })`, /array\/flat|instance\/flat/.test(modern), false);
      const a3 = createPlugin(pureOpts).transform(srcA, '/sm-leak-a.mjs')?.code;
      check(`legacy targets unaffected by the interleave (${ engine })`, a3, a1);
      // cross-config pass-2: output written under a SCOPED `package` must still read as our
      // own under the default config - the census source test's /actual/ arm is exactly this
      const xpkgSrc = 'let m;\n({ y: { flat: m } } = { y: [1, [2]] });\nconst { from } = Array;\nuse(m, from);\n';
      for (const mode of ['actual', 'full']) {
        const scopedOut = createPlugin({ ...pureOpts, package: '@my/scoped-pure', mode })
          .transform(xpkgSrc, '/sm-xpkg.mjs')?.code ?? xpkgSrc;
        check(`scoped ${ mode } package injects under its own name (${ engine })`,
          scopedOut.includes(`@my/scoped-pure/${ mode }/`), true);
        const rescan = createPlugin(pureOpts).transform(scopedOut, '/sm-xpkg.mjs')?.code ?? scopedOut;
        check(`scoped ${ mode } output re-reads as own under the default config (${ engine })`, rescan, scopedOut);
      }
      // absoluteImports output (filesystem specifiers) re-reads as own the same way
      const absoluteOut = createPlugin({ ...pureOpts, absoluteImports: true })
        .transform(xpkgSrc, `${ process.cwd() }/sm-xpkg-abs.mjs`)?.code ?? xpkgSrc;
      check(`absolute-import output re-reads as own (${ engine })`,
        createPlugin(pureOpts).transform(absoluteOut, `${ process.cwd() }/sm-xpkg-abs.mjs`)?.code ?? absoluteOut, absoluteOut);
      // a hand-written ALIASED pure import adopts by its flavor segment even without
      // additionalPackages: the claim reuses it instead of re-importing
      const aliasedSrc = 'import _flat from "my-alias/actual/array/instance/flat";\nlet m;'
        + '\n({ y: { flat: m } } = { y: [1, [2]] });\nm = _flat([1, [2]]);\nuse(m);\n';
      const aliasedOut = createPlugin(pureOpts).transform(aliasedSrc, '/sm-xpkg-alias.mjs');
      check(`aliased pure import adopts, no re-import (${ engine })`,
        aliasedOut === null || aliasedOut === undefined || (aliasedOut.code.match(/instance\/flat/g) ?? []).length === 1, true);
      // the adoption stays SCOPED to pure-package sources: a FOREIGN default import in the
      // same sandwich shape (and one ending exactly at a flavor segment) must still claim
      for (const [foreignLabel, foreignSource] of [
        ['foreign package', 'lodash/flat-tools'],
        ['trailing flavor segment', 'locale-pkg/es'],
        ['prefix-similar package', '@core-js/pure-fake/array/flat-like'],
      ]) {
        const foreignSrc = `import _flat from "${ foreignSource }";\nlet m;`
          + '\n({ y: { flat: m } } = { y: [1, [2]] });\nm = _flat([1, [2]]);\nuse(m);\n';
        const foreignOut = createPlugin(pureOpts).transform(foreignSrc, '/sm-xpkg-foreign.mjs')?.code ?? foreignSrc;
        check(`${ foreignLabel } import is not adopted - the claim still fires (${ engine })`,
          /@core-js\/pure\//.test(foreignOut), true);
      }
      // usage-global's cross-config twin: additionalPackages ADOPTS a prior config's bare
      // imports (no second injection) and the merged block normalizes to the active package
      {
        const gSrc = 'export const r = [1, [2]].flat();\nuse(r);\n';
        function gOpts(extra) {
          return { method: 'usage-global', version: '4.0', targets: { ie: 11 }, ...extra };
        }
        const g1 = createPlugin(gOpts({ package: '@my/scoped-core' })).transform(gSrc, '/sm-xpkg-g.mjs')?.code ?? gSrc;
        const g2 = createPlugin(gOpts({ additionalPackages: ['@my/scoped-core'] })).transform(g1, '/sm-xpkg-g.mjs')?.code ?? g1;
        check(`usage-global adoption keeps the module count (${ engine })`,
          (g2.match(/import "/g) ?? []).length, (g1.match(/import "/g) ?? []).length);
        const g3 = createPlugin(gOpts({ additionalPackages: ['@my/scoped-core'] })).transform(g2, '/sm-xpkg-g.mjs')?.code ?? g2;
        check(`usage-global adopted block is a fixpoint (${ engine })`, g3, g2);
        const eSrc = 'import "@my/scoped-core/actual";\nexport const r = [1, [2]].flat();\nuse(r);\n';
        const e1 = createPlugin({ ...gOpts({}), method: 'entry-global', package: '@my/scoped-core' }).transform(eSrc, '/sm-xpkg-e.mjs')?.code ?? eSrc;
        check(`entry-global expands the scoped entry (${ engine })`, (e1.match(/import "/g) ?? []).length > 5, true);
        const e2 = createPlugin({ ...gOpts({}), method: 'entry-global' }).transform(e1, '/sm-xpkg-e.mjs')?.code ?? e1;
        check(`foreign modules paths stay untouched on rescan (${ engine })`, e2, e1);
      }
    }
  }
}
checkPhaseSnapshotFlow();

// --- AST-engine internals: builders and emit-shared contracts ---
async function checkAstInternalsCore() {
  const b = await import('../../packages/core-js-unplugin/internals/builders.js');
  check('builders identifier shape', JSON.stringify(b.identifier('x')), '{"type":"Identifier","name":"x"}');
  check('builders string literal carries its raw quote', b.literal('a').raw, '"a"');
  check('builders non-string literal has NO raw (printer derives NaN/bigint itself)',
    Object.hasOwn(b.literal(1), 'raw'), false);
  check('builders member defaults plain', JSON.stringify(b.memberExpression(b.identifier('a'), b.identifier('b'))),
    '{"type":"MemberExpression","object":{"type":"Identifier","name":"a"},"property":{"type":"Identifier","name":"b"},"computed":false,"optional":false}');
  check('builders call keeps optional flag', b.callExpression(b.identifier('f'), [], { optional: true }).optional, true);
  check('builders voidZero is `void 0`',
    (() => { const v = b.voidZero(); return v.type === 'UnaryExpression' && v.operator === 'void' && v.argument.value === 0; })(), true);
  const seq = b.sequenceExpression([b.identifier('a'), b.identifier('b')]);
  check('builders sequence holds its expressions', seq.expressions.length, 2);
  const clone = b.cloneNode(seq);
  check('builders cloneNode is deep and detached',
    clone !== seq && clone.expressions[0] !== seq.expressions[0] && clone.expressions[0].name === 'a', true);
  check('builders bareImport has no specifiers', b.bareImport('core-js/modules/es.array.flat').specifiers.length, 0);
  check('builders defaultImport binds its local', b.defaultImport('_at', '@core-js/pure/actual/instance/at').specifiers[0].local.name, '_at');

  const es = await import('../../packages/core-js-unplugin/internals/emit-shared.js');
  const optionalDeep = b.memberExpression(b.callExpression(b.identifier('g'), [], { optional: true }), b.identifier('k'));
  check('emit-shared receiverCarriesOptional sees a buried `?.()`', es.receiverCarriesOptional(optionalDeep), true);
  check('emit-shared receiverCarriesOptional clean spine answers false',
    es.receiverCarriesOptional(b.memberExpression(b.identifier('a'), b.identifier('b'))), false);
  check('emit-shared memberFromKeyName spells a non-ident key computed',
    es.memberFromKeyName(b.identifier('o'), 'has-dash').computed, true);
  check('emit-shared memberFromKeyName spells an ident key plain',
    es.memberFromKeyName(b.identifier('o'), 'flat').computed, false);
  const host = b.expressionStatement(b.identifier('old'));
  check('emit-shared replaceNodeInTree lands by identity',
    es.replaceNodeInTree(host, host.expression, b.identifier('next')) && host.expression.name === 'next', true);
  check('emit-shared replaceNodeInTree reports a missing target', es.replaceNodeInTree(host, b.identifier('ghost'), b.identifier('x')), false);
  const injectorState = { pureImports: new Map([['actual/self', '_self'], ['actual/array/of', '_Array$of']]) };
  check('emit-shared mintedProxyGlobalName resolves a minted proxy root', es.mintedProxyGlobalName('_self', injectorState), 'self');
  check('emit-shared mintedProxyGlobalName rejects a minted non-proxy', es.mintedProxyGlobalName('_Array$of', injectorState), null);
  check('emit-shared mintedProxyGlobalName rejects an unknown name', es.mintedProxyGlobalName('_ref', injectorState), null);
  const spellable = es.proxyStoreIsSpellable(
    b.memberExpression(b.identifier('globalThis'), b.identifier('self')), name => name === 'self' ? { entry: 'self' } : null);
  check('emit-shared proxyStoreIsSpellable accepts a pure-leaf spine', spellable, true);
  check('emit-shared proxyStoreIsSpellable rejects a window-terminated spine',
    es.proxyStoreIsSpellable(b.memberExpression(b.identifier('globalThis'), b.identifier('window')), () => null), false);
}
await checkAstInternalsCore();

// --- AST-engine internals: printProgram contracts (the roundtrip gate holds the corpus;
// these lock the specific promises the emitters lean on) ---
async function checkAstPrintContracts() {
  function reprint(src, anchoredComments = null) {
    // eslint-disable-next-line node/no-sync -- oxc-parser sync-only API
    const parsed = parseSync('/p.mjs', src, { sourceType: 'module' });
    return printProgram({
      program: parsed.program, comments: parsed.comments, source: src, id: '/p.mjs', anchoredComments,
    }).code;
  }
  check('print keeps an explicit longhand property (`x: x` never re-shorthands)',
    reprint('const o = { x: x };\n').includes('{ x: x }'), true);
  check('print keeps a source shorthand property',
    reprint('const o = { x };\n').includes('{ x }'), true);
  check('print normalizes redundant parens off a plain member',
    reprint('use((a).b);\n').includes('use(a.b);'), true);
  check('print keeps the paren a chain boundary needs',
    reprint('use((a?.b).c);\n').includes('(a?.b).c'), true);
  check('print keeps a leading directive line association',
    reprint('// core-js-disable-next-line\nuse(arr.flat);\n').startsWith('// core-js-disable-next-line\nuse('), true);
  const anchoredSrc = 'const { flat } = arr;\nuse(flat);\n';
  // eslint-disable-next-line node/no-sync -- oxc-parser sync-only API
  const anchoredParse = parseSync('/p.mjs', anchoredSrc, { sourceType: 'module' });
  const anchoredOut = printProgram({
    program: anchoredParse.program, comments: anchoredParse.comments, source: anchoredSrc, id: '/p.mjs',
    anchoredComments: new Map([[anchoredParse.program.body[0], ['// core-js-disable-next-line']]]),
  }).code;
  check('print anchoredComments channel writes the text ahead of its statement',
    /\/\/ core-js-disable-next-line\nconst \{ flat \}/.test(anchoredOut), true);
}
await checkAstPrintContracts();

// --- AST-engine internals: flushIntoProgram placement contracts ---
async function checkAstFlushContracts() {
  const { flushIntoProgram } = await import('../../packages/core-js-unplugin/internals/import-injector.js');
  function flushOver(src, injector, opts = {}) {
    // eslint-disable-next-line node/no-sync -- oxc-parser sync-only API
    const parsed = parseSync('/f.mjs', src, { sourceType: 'module' });
    flushIntoProgram({ injector, program: parsed.program, ...opts });
    return parsed.program.body.map(node => node.source?.value ? `${ node.type }:${ node.source.value }` : node.type).join('|');
  }
  const injector = {
    importStyle: 'import', pkg: '@core-js/pure', absoluteImports: false,
    globalImports: new Set(['es.array.flat']), pureImports: new Map([['actual/self', '_self']]),
    existingPureImports: new Set(),
  };
  const shape = flushOver("'use strict';\nuse(_self);\n", injector);
  check('flush lands imports AFTER the directive prologue',
    shape.startsWith('ExpressionStatement|ImportDeclaration'), true);
  check('flush spells the global module path off the pkg',
    shape.includes('@core-js/pure/modules/es.array.flat'), true);
  const requireInjector = { ...injector, importStyle: 'require', globalImports: new Set(['es.array.at']) };
  const requireShape = flushOver('use(_self);\n', requireInjector);
  check('flush spells require() in the require style', requireShape.split('|', 1)[0], 'ExpressionStatement');
}
await checkAstFlushContracts();

// --- AST-engine behavior locks the fixture corpus does not pin directly ---
function checkAstEngineBehaviors() {
  for (const method of ['entry-global', 'usage-global', 'usage-pure']) {
    const opts = { method, version: '4.0', targets: { ie: 11 } };
    // a `core-js-disable-file` directive stands the whole engine down
    check(`ast engine honors disable-file (${ method })`,
      createPlugin(opts).transform('// core-js-disable-file\nimport "core-js";\n[1].flat();\n', '/df.mjs'), null);
  }
  const entryOpts = { method: 'entry-global', version: '4.0', targets: { ie: 11 } };
  const entryOut = createPlugin(entryOpts).transform('import "core-js";\nuse();\n', '/e.mjs')?.code ?? '';
  check('ast entry-global expands the root entry to modules',
    entryOut.includes('core-js/modules/') && !entryOut.includes('import "core-js";'), true);
  const entryMap = createPlugin(entryOpts).transform('import "core-js";\nuse();\n', '/e.mjs')?.map;
  check('ast entry-global emits a sourcemap with content', !!entryMap && Array.isArray(entryMap.sources), true);
  // pre+post map chaining: the post map of a pre-rewritten file omits sourcesContent (the
  // chain reads content from pre's map), a standalone post emits it
  const sandwich = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 } });
  const preOut = sandwich.transform('const v = getA().flat?.();\nuse(v);\n', '/sw.mjs', 'pre');
  const postOut = sandwich.transform(`${ preOut.code }\nconst w = getB().at?.(0);\nuse(w);`, '/sw.mjs', 'post');
  check('ast pre emits a content-bearing map', Array.isArray(preOut?.map?.sourcesContent), true);
  check('ast post map omits sourcesContent when chaining a pre rewrite',
    postOut?.map ? !Array.isArray(postOut.map.sourcesContent) : false, true);
  const standalonePost = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 } })
    .transform('const v = getA().flat?.();\nuse(v);\n', '/sp.mjs', 'post');
  check('ast standalone post map keeps sourcesContent',
    Array.isArray(standalonePost?.map?.sourcesContent), true);
}
checkAstEngineBehaviors();

// `additionalPackages` items must be non-empty non-slash-only strings. validateOptions
// catches this for plugin-options-layer users; direct createPolyfillContext callers also
// get a defensive throw. without it, `''` / `'/'` cascades through `packages` and would
// false-positive every absolute path in `getCoreJSEntry`'s `startsWith('/')` check
function checkAdditionalPackagesShapeGuard() {
  const cases = [
    { additionalPackages: [''], label: 'empty string' },
    { additionalPackages: ['/'], label: 'single slash' },
    { additionalPackages: ['/'.repeat(5)], label: 'multi slash' },
    { additionalPackages: [42], label: 'non-string' },
  ];
  for (const { additionalPackages, label } of cases) {
    try {
      createPolyfillContext({ method: 'usage-pure', version: '4.0', targets: { ie: 11 }, additionalPackages });
      counts.failed++;
      echo`${ red('FAIL') } ${ cyan(`additionalPackages/${ label }`) } :: expected throw`;
    } catch (error) {
      /additionalPackages\[\d+\].*non-empty.*non-slash|additionalPackages.*must be a string/.test(error.message)
        ? counts.passed++
        : counts.failed++;
    }
  }
  // valid additionalPackages still works
  createPolyfillContext({ method: 'usage-pure', version: '4.0', targets: { ie: 11 }, additionalPackages: ['my-core-js'] });
  counts.passed++;
}
checkAdditionalPackagesShapeGuard();

// --- single-post without pre-snapshot still emits pure imports ---
// the flush census filters dead imports by liveness in the FINAL tree (e.g. a
// destructure transform dropping all uses mid-pass); an isolated post pass must still
// see its own emissions as live, or the filter strips every pure import and the emit
// becomes empty
function checkSinglePostPassEmitsPureImports() {
  const code = 'export var x = "test".at(-1);\nexport var m = new Map();';
  const opts = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
  // direct `pass: 'post'` without prior pre - simulates `phase: 'post'`-only build setup
  const out = createPlugin(opts).transform(code, '/single-post.mjs', 'post');
  const importLines = (out?.code ?? '').split('\n').filter(l => l.startsWith('import '));
  check('single-post/emits pure imports', importLines.length > 0, true);
}
checkSinglePostPassEmitsPureImports();

// --- post re-recognizes pre's RELOCATED catch pattern ---
// pre moves a catch pattern off the clause into `let <pattern> = _ref;` at the head of the block,
// and leaves a binding the body never reads as a native read - an `_ref`-bound rewrite there costs
// an import and a dispatcher call nothing observes. on a post re-parse the CatchClause host is
// gone, so without recognizing the relocated shape the phase re-extracts exactly what pre declined
function checkPostKeepsRelocatedCatchLiveness() {
  const opts = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
  const unread = 'let out;\ntry { risky(); } catch ({ [Symbol.iterator]: it, at }) { out = it; }\nexport { out };';
  const pre = createPlugin(opts).transform(unread, '/x31.mjs', 'pre');
  check('relocated-catch/pre leaves the unread prop native', pre?.code?.includes('let { at } = _ref'), true);
  const post = createPlugin(opts).transform(pre.code, '/x31.mjs', 'post');
  check('relocated-catch/post does not re-extract it', (post?.code ?? pre.code).includes('let { at } = _ref'), true);
  check('relocated-catch/post adds no instance import', /instance\/at/u.test(post?.code ?? ''), false);
  // the boundary: a body that DOES read the binding still extracts on the post pass, and a
  // declaration off some other value is an ordinary declarator, not a relocated catch pattern
  const read = 'let out;\ntry { risky(); } catch (_ref) { let { at } = _ref; out = at; }\nexport { out };';
  check('relocated-catch/a read binding still extracts',
    /instance\/at/u.test(createPlugin(opts).transform(read, '/x31r.mjs', 'post')?.code ?? ''), true);
  const foreign = 'const src = [1];\nlet out;\ntry { risky(); } catch (_ref) { let { at } = src; out = 1; }\nexport { out };';
  check('relocated-catch/a declaration off another value is an ordinary declarator',
    /instance\/at/u.test(createPlugin(opts).transform(foreign, '/x31f.mjs', 'post')?.code ?? ''), true);
}
checkPostKeepsRelocatedCatchLiveness();

// --- post-without-pre re-recognizes pre's rest-destructure sentinels ---
// pre rebuilds `const { from, ...rest } = Array` with a `_unused` sentinel keeping the rest
// exclusion. a post pass whose snapshot was lost (sibling invalidation) re-parses that output;
// without sentinel adoption it re-processed the rebuilt pattern - a dead `const _unused =`
// body-extract plus a re-keyed `_unused2` per re-pass, growing on every rebuild cycle
function checkPostAdoptsUnusedSentinels() {
  const code = 'const { from, ...rest } = Array;\nexport const r = [from, rest];';
  const opts = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
  const pre = createPlugin(opts).transform(code, '/x30.mjs', 'pre');
  check('post-adopt-unused/pre rebuilt with sentinel', pre?.code?.includes('_unused'), true);
  const post = createPlugin(opts).transform(pre.code, '/x30.mjs', 'post');
  // idempotent: nothing left for post to change (null/undefined result = no transform)
  check('post-adopt-unused/post-without-pre is idempotent', post?.code ?? null, null);
  // a NESTED-scope sentinel adopts the same way - declared names collect at every depth
  const nested = 'function f() {\n  const { from, ...rest } = Array;\n  return [from, rest];\n}\nexport default f;';
  const nestedPre = createPlugin(opts).transform(nested, '/x30n.mjs', 'pre');
  check('post-adopt-unused/nested pre rebuilt with sentinel', nestedPre?.code?.includes('_unused'), true);
  const nestedPost = createPlugin(opts).transform(nestedPre.code, '/x30n.mjs', 'post');
  check('post-adopt-unused/nested post-without-pre is idempotent', nestedPost?.code ?? null, null);
  // BOTH adoption channels in one file (orphan `_ref` memo + `_unused` sentinel) - the two
  // suffix-state seeds merge instead of clobbering each other, and the post pass is idempotent
  const both = 'const { from, ...rest } = Array;\nexport const r = [from, rest, (arr ?? [1]).at(0)];';
  const bothPre = createPlugin(opts).transform(both, '/x30b.mjs', 'pre');
  check('post-adopt-unused/both channels present in pre',
    bothPre?.code?.includes('_unused') && bothPre?.code?.includes('var _ref'), true);
  const bothPost = createPlugin(opts).transform(bothPre.code, '/x30b.mjs', 'post');
  check('post-adopt-unused/both channels post is idempotent', bothPost?.code ?? null, null);
  // adoption is by POSITION and by ORIGIN, not by name shape: a USER binding named `_unused` in
  // the sentinel position that the file READS is the user's (our sentinel is read by nothing),
  // so it is not adopted and the rest-destructure keeps its rewrite - the read gets the
  // polyfilled `from` instead of the native slot the taken engine lacks. a binding read by
  // nothing adopts only where OUR extraction of the key stands beside it (the shape pre leaves:
  // `const from = _Array$from;` in the same statement list) - an unread alias with no such
  // sibling is the user's too, whatever the file imports, and its importers may read it
  const shadow = 'import "@core-js/pure/actual/array/from";\nconst { from: _unused, ...rest } = Array;\nexport const r = [_unused, rest];';
  const shadowPost = createPlugin(opts).transform(shadow, '/x30s.mjs', 'post');
  check('post-adopt-unused/read user binding in the sentinel position keeps its rewrite',
    /const _unused = _Array\$from;\s*const \{ from: _unused2, \.\.\.rest \} = Array;/.test(shadowPost?.code ?? ''), true);
  const unread = 'import "@core-js/pure/actual/array/from";\nexport const { from: _unused, ...rest } = Array;';
  const unreadPost = createPlugin(opts).transform(unread, '/x30u.mjs', 'post');
  check('post-adopt-unused/unread alias without our extraction beside it keeps its rewrite',
    /export const _unused = _Array\$from;\s*export const \{ from: _unused2, \.\.\.rest \} = Array;/.test(unreadPost?.code ?? ''), true);
  const ours = 'import _Array$from from "@core-js/pure/actual/array/from";\nexport const from = _Array$from;\nexport const { from: _unused, ...rest } = Array;';
  const oursPost = createPlugin(opts).transform(ours, '/x30o.mjs', 'post');
  check('post-adopt-unused/our exported sentinel beside its extraction adopts', oursPost?.code ?? null, null);
  // the extraction must be of the SAME key: a pure import of another member in the same list is
  // not our sibling
  const other = 'import _Array$from from "@core-js/pure/actual/array/from";\nexport const y = _Array$from([1]);\nexport const { at: _unused, ...rest } = [2];';
  const otherPost = createPlugin(opts).transform(other, '/x30k.mjs', 'post');
  check('post-adopt-unused/an extraction of another key is no sibling', /export const _unused = _atMaybeArray\(_ref\);/.test(otherPost?.code ?? ''), true);
  // a READ binding never adopts even when an extraction-lookalike of the same key stands beside it
  // (a user aliasing the ponyfill AND naming their rest-consumed key `_unusedN`): our sentinel is
  // read by nothing, so the read alone proves the name is the user's - the position filter, not
  // the sibling fingerprint, is what keeps this rewrite
  const readBeside = 'import _at from "@core-js/pure/actual/array/instance/at";\nconst arr = [1];\nconst at = _at(arr);\n'
    + 'export const { at: _unused2, ...rest } = arr;\nexport const r = [_unused2, at];';
  const readBesidePost = createPlugin(opts).transform(readBeside, '/x30r.mjs', 'post');
  check('post-adopt-unused/a read binding beside a same-key extraction keeps its rewrite',
    /export const _unused2 = /.test(readBesidePost?.code ?? ''), true);
  // a slot-shaped name OUTSIDE the sentinel position is never a sentinel, whatever the file imports
  const plain = 'import "@core-js/pure/actual/array/from";\nvar _unused = 1;\nexport const { at: _unused2, ...rest } = [2];\nexport const r = [_unused, _unused2];';
  const plainPost = createPlugin(opts).transform(plain, '/x30p.mjs', 'post');
  check('post-adopt-unused/a plain var of the shape does not arm the skip',
    /export const _unused2 = _atMaybeArray\(_ref\);/.test(plainPost?.code ?? ''), true);
}
checkPostAdoptsUnusedSentinels();

// --- phase pre+post with require import style: post must dedup the pre-emitted `var X = require()` ---
// the require import style emits `var _X = require('@core-js/pure/...')`; the post re-scan has to
// recognise that VariableDeclaration+require as an existing pure import or it re-emits a duplicate
// require for the same module (double module-eval)
function checkPrePostRequireDedup() {
  const code = 'export var r = Array.from([1, 2]);';
  const opts = { method: 'usage-pure', version: '4.0', targets: { ie: 11 }, importStyle: 'require' };
  const twoPass = createPlugin(opts);
  const preOut = twoPass.transform(code, '/req-dedup.mjs', 'pre');
  const postOut = preOut?.code ? twoPass.transform(preOut.code, '/req-dedup.mjs', 'post') : preOut;
  const final = postOut?.code ?? preOut?.code ?? '';
  // exactly one require for the array/from pure module survives the post re-scan, not two
  check('pre+post require/no duplicate module require', occurrencesOf(final, '@core-js/pure/actual/array/from'), 1);
}
checkPrePostRequireDedup();

// count non-overlapping occurrences of a literal substring (no regex - avoids backtracking
// lint and substring-in-name surprises). shared by the pre+post import-emission checks
function occurrencesOf(haystack, needle) {
  return haystack.split(needle).length - 1;
}

// default-import binding name for the line importing `sourceSubstr`, or null. line-scoped so the
// pattern stays anchored (`import <name> from "...sourceSubstr..."`) with no cross-line backtracking
function defaultImportNameFor(code, sourceSubstr) {
  for (const line of code.split('\n')) {
    if (!line.startsWith('import ') || !line.includes(sourceSubstr)) continue;
    const name = /^import (?<name>\S+) from /.exec(line)?.groups?.name;
    if (name) return name;
  }
  return null;
}

// every `name(` call site in `code` is backed by an `import name from ...` line. the usage-pure
// rewrites emit `_flat(arr)` / `_flat(_ref)` call shapes, so a referenced-but-unimported binding
// surfaces as a dangling reference (ReferenceError at runtime)
function rewriteBindingsAreImported(code) {
  const declared = new Set();
  for (const line of code.split('\n')) {
    const name = line.startsWith('import ') ? /^import (?<name>\S+) from /.exec(line)?.groups?.name : null;
    if (name) declared.add(name);
  }
  // plugin UID call sites start `_` + identifier chars then `(` (`_flatMaybeArray(`, `_ref(`).
  // bounded length keeps the scan linear (UIDs are short); `$` rarely appears mid-UID but is
  // matched by `\w`-adjacent ids via the explicit alternation char class
  for (const { groups } of code.matchAll(/(?<name>_[\w$]{1,60})\(/g)) {
    if (!declared.has(groups.name)) return false;
  }
  return true;
}

// --- usage-pure pre output is self-contained (imports inline, not deferred) ---
// usage-pure rewrites source text in `pre` (`arr.flat()` -> `_flat(arr).call(arr)`), so the pre
// output references a polyfill binding. the import is emitted INLINE in pre rather than deferred,
// so the pre output is valid standalone even if the matching post never lands anything
function checkUsagePurePreEmitsInlineImports() {
  const plugin = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 } });
  const pre = plugin.transform('const a = [1, 2, 3];\na.flat();\n', '/inline-pre.js', 'pre');
  const code = pre?.code ?? '';
  const name = defaultImportNameFor(code, 'instance/flat');
  check('usage-pure pre/emits inline import', !!name, true);
  // the rewrite that references it is present and backed, so the output runs standalone
  check('usage-pure pre/rewrite references the inline import', !!name && code.includes(`${ name }(a)`), true);
}
checkUsagePurePreEmitsInlineImports();

// --- pre+post: disable-file injected between passes leaves no dangling reference ---
// a sibling plugin (or other skip-eligibility) introduces `core-js-disable-file` AFTER pre ran.
// post bails on the directive, but pre already rewrote `arr.flat()` -> `_flat(arr).call(arr)`.
// because pre emits its import inline, the pre output (which is what gets bundled when post bails)
// still carries the import - no `_flat` reference is left without a backing import
function checkPrePostDisableFileBetweenPassesNoDangling() {
  const plugin = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 } });
  const id = '/disable-between.js';
  const pre = plugin.transform('const a = [1, 2, 3];\na.flat();\n', id, 'pre');
  // sibling prepends the disable directive between passes; post sees it and bails (null)
  const post = plugin.transform(`// core-js-disable-file\n${ pre?.code ?? '' }`, id, 'post');
  check('pre+post disable-between/post bails on injected directive', post, null);
  // the bundled output is pre's (post returned null) - every referenced binding stays backed
  check('pre+post disable-between/referenced binding has a backing import',
    rewriteBindingsAreImported(pre?.code ?? ''), true);
}
checkPrePostDisableFileBetweenPassesNoDangling();

// --- pre+post: snapshot lost before post (fresh worker / cache eviction / --force) ---
// post runs on a FRESH plugin instance whose SnapshotCache never saw pre's snapshot (webpack
// persistent-cache pre-cached + post-fresh worker). pre's inline import makes the output
// re-detectable + self-contained: post re-scans the import as existing and dedups, so the
// optional-chain rewrite (`null == (_ref = foo()) ? ... : _flat(_ref)?.call(_ref)`) keeps its
// backing import - no dangling reference
function checkPrePostSnapshotLostNoDangling() {
  const id = '/snapshot-lost.js';
  const pre = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 } })
    .transform('const r = foo()?.flat?.();\n', id, 'pre');
  // fresh instance: no in-memory snapshot for this id
  const post = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 } })
    .transform(pre?.code ?? '', id, 'post');
  const finalCode = post?.code ?? pre?.code ?? '';
  check('pre+post snapshot-lost/rewrite present', !!defaultImportNameFor(finalCode, 'instance/flat'), true);
  check('pre+post snapshot-lost/referenced binding has a backing import',
    rewriteBindingsAreImported(finalCode), true);
}
checkPrePostSnapshotLostNoDangling();

// --- pre+post: inline-then-inherit must not double-emit the same import ---
// post inherits `pureImports` from pre's snapshot AND re-scans pre's inline import into
// `existingPureImports`. without the pure-import difference against `existingPureImports` in
// `#collectImportLines`, post would emit a second identical `import _flat ...` line on top of
// pre's. assert exactly one occurrence survives the full pre->post round-trip
function checkPrePostNoDoubleImport() {
  const plugin = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 } });
  const id = '/no-double.js';
  const pre = plugin.transform('const a = [1, 2, 3];\na.flat();\n', id, 'pre');
  const post = plugin.transform(pre?.code ?? '', id, 'post');
  const finalCode = post?.code ?? pre?.code ?? '';
  check('pre+post no-double/exactly one flat import after round-trip', occurrencesOf(finalCode, 'instance/flat'), 1);
}
checkPrePostNoDoubleImport();

// --- pre+post: post still adds polyfills for usages siblings injected between passes ---
// the core pre+post purpose: post scans sibling-emitted output for polyfills pre couldn't see.
// pre emits its own import inline; a sibling then adds a NEW usage; post must KEEP pre's import
// AND emit the new one - both present, neither duplicated
function checkPrePostPostAddsSiblingInjectedUsage() {
  const plugin = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 } });
  const id = '/sibling-injected.js';
  const pre = plugin.transform('const a = [1, 2, 3];\na.flat();\n', id, 'pre');
  // sibling appends a usage (`Symbol.iterator`) that wasn't in pre's view
  const post = plugin.transform(`${ pre?.code ?? '' }const s = Symbol.iterator;\n`, id, 'post');
  const finalCode = post?.code ?? '';
  check('pre+post sibling-injected/keeps pre flat import', occurrencesOf(finalCode, 'instance/flat'), 1);
  check('pre+post sibling-injected/adds new symbol-iterator import', occurrencesOf(finalCode, 'symbol/iterator'), 1);
}
checkPrePostPostAddsSiblingInjectedUsage();

// --- entry-global phase gate ---
// `entry-global` always runs at pre, but the d.ts contract advertises `phase?: 'pre'`
// as a legal explicit value. runtime must accept `'pre'` (no-op redundant with default)
// and reject any other phase value. parallel checks: undefined / null are also accepted
function checkEntryGlobalPhaseGate() {
  function noop(ctx) {
    return unplugin.raw({ method: 'entry-global', ...ctx, targets: 'chrome 50' }, { framework: 'vite' });
  }
  function tryFactory(ctx) {
    try {
      noop(ctx);
      return null;
    } catch (error) {
      return error;
    }
  }
  check('entry-global phase: pre accepted (regression lock)', tryFactory({ phase: 'pre' }), null);
  check('entry-global phase: post rejects', tryFactory({ phase: 'post' })?.message?.includes('`phase`'), true);
  check('entry-global phase: pre+post rejects', tryFactory({ phase: 'pre+post' })?.message?.includes('`phase`'), true);
  check('entry-global phase: invalid rejects', tryFactory({ phase: 'lol' })?.message?.includes('`phase`'), true);
  check('entry-global phase: undefined accepted (default)', tryFactory({ phase: undefined }), null);
  check('entry-global phase: null accepted (conditional fallback)', tryFactory({ phase: null }), null);
}
checkEntryGlobalPhaseGate();

// --- entry-global end-to-end transform with explicit phase: 'pre' ---
// regression lock for UPL-16-1 reverify gap B: factory acceptance is locked by
// checkEntryGlobalPhaseGate above, but end-to-end transform path through plugin's
// `transform` hook wasn't covered. simulating the bundler-driven invocation via
// `unplugin.raw` -> sub-plugin.transform asserts the phase doesn't break injection
function checkEntryGlobalTransformWithPhasePre() {
  const subs = unplugin.raw({ method: 'entry-global', phase: 'pre', targets: { ie: '11' } }, { framework: 'vite' });
  // entry-global with phase:'pre' should produce a single sub-plugin (collapses to single stage)
  check('entry-global phase: pre yields single sub-plugin', Array.isArray(subs) && subs.length === 1, true);
  // bind a stub bundler context (`this` carries `warn` / `error` for diagnostic routing)
  // and call the transform hook; entry-global expands `import 'core-js/es/array/at';` to
  // granular module imports filtered by IE 11 targets - the rewrite must produce a non-null
  // result with a `.code` payload, no throw
  const result = subs[0]?.transform?.call({ warn: msg => msg }, 'import "core-js/es/array/at";', '/probe.mjs');
  check('entry-global phase: pre transform fires', !!result?.code, true);
}
checkEntryGlobalTransformWithPhasePre();

// --- usage-pure standalone phase: 'post' wrapper dispatches `pass='post'` ---
// regression lock: the wrapper at unplugin/index.js builds sub-plugins via
// `stage(effective, ...)`; when phase=='post' the second-arg `pass` MUST be 'post' (not
// 'single'), otherwise the post-only machinery (orphan adoption, post-snapshot pickup)
// doesn't fire and an isolated post build emits an empty bundle. mirrors the
// entry-global phase=='pre' end-to-end test above but goes through usage-pure to assert
// pure imports survive the wrapper-driven pass dispatch
function checkUsagePurePhasePostWrapperEmitsImports() {
  const subs = unplugin.raw({ method: 'usage-pure', phase: 'post', targets: { ie: '11' } }, { framework: 'vite' });
  check('usage-pure phase: post yields single sub-plugin', Array.isArray(subs) && subs.length === 1, true);
  const result = subs[0]?.transform?.call({ warn: msg => msg }, 'export var x = "test".at(-1);', '/post-probe.mjs');
  const importLines = (result?.code ?? '').split('\n').filter(l => l.startsWith('import '));
  check('usage-pure phase: post wrapper emits pure imports', importLines.length > 0, true);
}
checkUsagePurePhasePostWrapperEmitsImports();

// --- usage-pure standalone phase: 'pre' wrapper dispatches `pass='single'` ---
// regression lock for the 70-1 test gap: the wrapper at unplugin/index.js maps a standalone
// `phase: 'pre'` to `pass='single'`, NOT `pass='pre'`. dispatching `'pre'` for a standalone
// build sets `deferImports=true` (it expects a follow-up post pass that never comes) and
// emits zero imports silently. mirrors the phase:'post' lock above on the pre side
function checkUsagePurePhasePreWrapperEmitsImports() {
  const subs = unplugin.raw({ method: 'usage-pure', phase: 'pre', targets: { ie: '11' } }, { framework: 'vite' });
  check('usage-pure phase: pre yields single sub-plugin', Array.isArray(subs) && subs.length === 1, true);
  const result = subs[0]?.transform?.call({ warn: msg => msg }, 'export var x = "test".at(-1);', '/pre-probe.mjs');
  const importLines = (result?.code ?? '').split('\n').filter(l => l.startsWith('import '));
  check('usage-pure phase: pre wrapper emits pure imports (pass=single, not deferred)', importLines.length > 0, true);
}
checkUsagePurePhasePreWrapperEmitsImports();

// --- buildEnd / watchChange lifecycle hook attachment ---
// unplugin fires buildEnd / watchChange once per plugin instance to bound snapshot retention across
// watch rebuilds / HMR. the factory attaches them to the LAST sub-plugin only (pre+post shares one drain
// point), wired to plugin.reset() / invalidateSnapshot(). exercised so the wiring can't rot silently
function checkLifecycleHookAttachment() {
  const single = unplugin.raw({ method: 'usage-pure', targets: { ie: '11' } }, { framework: 'vite' });
  check('lifecycle/single sub carries buildEnd', typeof single.at(-1).buildEnd, 'function');
  check('lifecycle/single sub carries watchChange', typeof single.at(-1).watchChange, 'function');
  const prePost = unplugin.raw({ method: 'usage-pure', phase: 'pre+post', targets: { ie: '11' } }, { framework: 'vite' });
  check('lifecycle/pre+post yields two subs', prePost.length, 2);
  check('lifecycle/hooks on the LAST sub only (pre sub has none)', typeof prePost[0].buildEnd, 'undefined');
  check('lifecycle/last sub carries buildEnd', typeof prePost.at(-1).buildEnd, 'function');
  // calling the hooks drives plugin.reset() / invalidateSnapshot() without throwing
  let threw = false;
  try {
    prePost.at(-1).buildEnd();
    prePost.at(-1).watchChange('/some-file.js');
  } catch { threw = true; }
  check('lifecycle/hooks drain snapshot state without throwing', threw, false);
}
checkLifecycleHookAttachment();

// --- deeply-nested scoped refs emit correctly at every level ---
// the input nests `depth` genuine function bodies each hosting its own instance claim - the
// triply-nested flatten-sibling fixture shape scaled
// up well past any handful. every level must emit exactly one `var _ref`; an emission that
// truncated deep nesting (e.g. a depth cap below `depth`) would emit fewer.
// `depth` is bounded by the RECURSIVE AST walk inside our parser dependency (estree-toolkit's
// `Traverser.visitPath`), which overflows the call stack on far deeper nesting regardless of our
// own iterative composition - that ceiling belongs to the traversal library, not the code under
// test. 64 stays well clear of it on every CI runner while still scaling far past any handful
function checkDeeplyNestedBodyWrapsCompose() {
  const depth = 64;
  let expr = `[${ depth }].at(0)`;
  for (let k = depth - 1; k >= 1; k--) expr = `[${ k }].at(0) + ((() => ${ expr })())`;
  const source = `const { Array: { from } } = globalThis, sibling = () => ${ expr };\nconsole.log(from, sibling());`;
  const subs = unplugin.raw({ method: 'usage-pure', targets: { ie: '11' } }, { framework: 'vite' });
  let result = null;
  let threw = false;
  try {
    result = subs[0]?.transform?.call({ warn: msg => msg }, source, '/deep-nest-probe.mjs');
  } catch {
    threw = true;
  }
  check('deeply-nested body-wraps transform without throwing', threw, false);
  // one `var _ref` per composed wrap; the substring also matches `var _ref2` etc.
  const refCount = (result?.code ?? '').split('var _ref').length - 1;
  check('deeply-nested body-wraps emit one var _ref per level (all composed)', refCount, depth);
}
checkDeeplyNestedBodyWrapsCompose();

// --- bundler diagnostic captured by warn hijack ---
// `unknown bundler` value triggers `console.warn` at plugin instantiation. unit test
// asserts that the warn is observable via console.warn (test-runner's captureTransform
// hijack relies on this). regression lock for XCT-16-1: the warn previously leaked to
// stderr because runner only hijacked console.log
function checkUnknownBundlerWarn() {
  const captured = [];
  const orig = console.warn;
  console.warn = (...a) => captured.push(a.map(String).join(' '));
  try {
    createPlugin({ method: 'usage-global', bundler: 'turbopack', targets: { ie: '11' } });
  } finally {
    console.warn = orig;
  }
  check('unknown bundler emits one warn', captured.length, 1);
  check('warn names the bundler', captured[0]?.includes('turbopack'), true);
  check('warn lists known bundlers', captured[0]?.includes('vite'), true);
}
checkUnknownBundlerWarn();

// --- snapshot-cache pre-pass-twice warn (gated `debug: true`) ---
// regression lock for snapshot-cache's duplicate-store warn (`store()`). store() called
// twice with the same id under `debug: true` must emit exactly one diagnostic. without
// debug the warn is suppressed (legit dev-server pattern, no noise)
function checkSnapshotPrePassTwiceWarn() {
  const captured = [];
  const orig = console.warn;
  console.warn = (...a) => captured.push(a.map(String).join(' '));
  try {
    const cache = new SnapshotCache({ debug: true });
    cache.store('/probe.mjs', { code: 'a' });
    cache.store('/probe.mjs', { code: 'b' });
    // unrelated id: no warn
    cache.store('/other.mjs', { code: 'c' });
    check('snapshot pre-pass twice: one warn', captured.length, 1);
    check('warn names the id', captured[0]?.includes('/probe.mjs'), true);
    // debug:false suppresses
    captured.length = 0;
    const silent = new SnapshotCache({ debug: false });
    silent.store('/silent.mjs', { code: 'a' });
    silent.store('/silent.mjs', { code: 'b' });
    check('snapshot pre-pass twice without debug: no warn', captured.length, 0);
  } finally {
    console.warn = orig;
  }
}
checkSnapshotPrePassTwiceWarn();

// --- bundler adapter named exports ---
// supported bundlers per package.json description + exports map: 9 adapters with both
// named export AND `./<name>` sub-entry. unloader is upstream-exposed but core-js does
// not target it (no sub-entry, no docs, no test wiring) - intentionally not exported
async function checkBundlerAdapterExports() {
  const exported = await import('../../packages/core-js-unplugin/index.js');
  for (const name of ['vite', 'webpack', 'rollup', 'esbuild', 'rspack', 'rsbuild', 'rolldown', 'farm', 'bun']) {
    check(`adapter export '${ name }' is callable`, typeof exported[name], 'function');
  }
  check('unloader: not exported (upstream-only, core-js does not target)', exported.unloader, undefined);
}
await checkBundlerAdapterExports();

// --- estree-compat nodeType mapper (adapter divergence: babel vs oxc) ---
// `nodeType()` translates oxc's narrower node taxonomy back to babel's discriminator
// names so shared callsites (resolve-node-type / detect-usage / helpers) can pattern-match
// against a single set of type strings. coverage gap: subtle Property kinds (init/method/
// get/set), MethodDefinition vs PropertyDefinition (instance vs static via .static flag is
// orthogonal), and Literal subtype dispatch (BigInt / RegExp / String / Number / Boolean / Null)
async function checkEstreeNodeTypeMapper() {
  const { nodeType } = await import('../../packages/core-js-unplugin/internals/estree-compat.js');
  function parseTop(src) {
    // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
    return parseSync('test.js', src).program;
  }
  // ChainExpression wraps optional `a?.b` / `a?.()` in oxc; unwrap to inner Member/Call
  function unwrapChain(node) {
    return node?.expression ?? node;
  }

  // Property kinds via parsed object literal: init / method / get / set
  const props = parseTop('const o = { a: 1, b() {}, get c() {}, set c(v) {} };')
    .body[0].declarations[0].init.properties;
  const PROPERTY_CASES = [
    ['init -> ObjectProperty', 0, 'ObjectProperty'],
    ['method -> ObjectMethod', 1, 'ObjectMethod'],
    ['get -> ObjectMethod', 2, 'ObjectMethod'],
    ['set -> ObjectMethod', 3, 'ObjectMethod'],
  ];
  for (const [label, i, expected] of PROPERTY_CASES) check(`nodeType/Property ${ label }`, nodeType(props[i]), expected);

  // MethodDefinition (instance/static) -> ClassMethod, PropertyDefinition -> ClassProperty
  const members = parseTop('class C { m() {} static s() {} f = 1; static t = 2; }')
    .body[0].body.body;
  const CLASS_CASES = [
    ['MethodDefinition -> ClassMethod', 0, 'ClassMethod'],
    ['static MethodDefinition -> ClassMethod', 1, 'ClassMethod'],
    ['PropertyDefinition -> ClassProperty', 2, 'ClassProperty'],
    ['static PropertyDefinition -> ClassProperty', 3, 'ClassProperty'],
  ];
  for (const [label, i, expected] of CLASS_CASES) check(`nodeType/${ label }`, nodeType(members[i]), expected);

  // Literal subtype dispatch: oxc emits one Literal type, mapper splits to babel-style names
  const literals = parseTop('var s = "x"; var n = 1; var b = true; var nu = null; var bi = 42n; var re = /a/g;')
    .body.map(d => d.declarations[0].init);
  const LITERAL_CASES = [
    ['string -> StringLiteral', 0, 'StringLiteral'],
    ['number -> NumericLiteral', 1, 'NumericLiteral'],
    ['boolean -> BooleanLiteral', 2, 'BooleanLiteral'],
    ['null -> NullLiteral', 3, 'NullLiteral'],
    ['bigint -> BigIntLiteral', 4, 'BigIntLiteral'],
    ['regex -> RegExpLiteral', 5, 'RegExpLiteral'],
  ];
  for (const [label, i, expected] of LITERAL_CASES) check(`nodeType/Literal ${ label }`, nodeType(literals[i]), expected);

  // Optional member/call: oxc wraps in ChainExpression with `optional: true` on inner;
  // mapper emits babel's OptionalMemberExpression / OptionalCallExpression
  const opts = parseTop('a?.b; a?.();').body.map(s => unwrapChain(s.expression));
  check('nodeType/MemberExpression optional -> OptionalMemberExpression', nodeType(opts[0]), 'OptionalMemberExpression');
  check('nodeType/CallExpression optional -> OptionalCallExpression', nodeType(opts[1]), 'OptionalCallExpression');

  check('nodeType/null', nodeType(null), null);
  check('nodeType/undefined', nodeType(undefined), null);
}
await checkEstreeNodeTypeMapper();

// --- estree-compat class-member predicates recognise TS abstract members (parity with nodeType) ---
// `abstract m()` / `abstract x` / `abstract accessor x` parse to TSAbstract* nodes on oxc; nodeType()
// already maps them to the babel class-member kinds, so the `types.isClass*` predicates must agree -
// else a consumer gating on the predicate (rather than nodeType) silently skips the abstract member
async function checkAbstractMemberPredicates() {
  const { types, nodeType } = await import('../../packages/core-js-unplugin/internals/estree-compat.js');
  // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
  const members = parseSync('test.ts', 'abstract class C { abstract m(): void; abstract x: number; abstract accessor y: number; }')
    .program.body[0].body.body;
  const [method, property, accessor] = members;
  check('isClassMethod/abstract method', types.isClassMethod(method), true);
  check('isClassProperty/abstract property', types.isClassProperty(property), true);
  check('isClassAccessorProperty/abstract accessor', types.isClassAccessorProperty(accessor), true);
  // the predicates stay in lockstep with nodeType's mapping of the same nodes
  check('nodeType/abstract method -> ClassMethod', nodeType(method), 'ClassMethod');
  check('nodeType/abstract property -> ClassProperty', nodeType(property), 'ClassProperty');
  check('nodeType/abstract accessor -> ClassAccessorProperty', nodeType(accessor), 'ClassAccessorProperty');
  // concrete shapes still match; an unrelated node still rejects
  check('isClassMethod/concrete still matches', types.isClassMethod({ type: 'MethodDefinition' }), true);
  check('isClassProperty/Identifier rejects', types.isClassProperty({ type: 'Identifier' }), false);
}
await checkAbstractMemberPredicates();

// --- createPolyfillContext input validation (defensive checks for direct callers) ---

function checkPolyfillContextRejects(label, opts) {
  try {
    createPolyfillContext(opts);
    counts.failed++;
    echo`${ red('FAIL') } ${ cyan(label) } :: expected throw`;
  } catch (error) {
    if (/\[core-js\]/.test(error.message)) counts.passed++;
    else {
      counts.failed++;
      echo`${ red('FAIL') } ${ cyan(label) } :: unexpected error :: ${ error.message }`;
    }
  }
}

// initPluginOptions enforces these but third-party callers bypassing it (custom plugin
// providers, programmatic invocations) need their own guard - else `pkg === ''` produces
// false-positive entry detection downstream
checkPolyfillContextRejects('createPolyfillContext/empty package',
  { method: 'usage-pure', package: '' });
checkPolyfillContextRejects('createPolyfillContext/slash-only package',
  { method: 'usage-pure', package: '/' });
checkPolyfillContextRejects('createPolyfillContext/multi-slash package',
  { method: 'usage-pure', package: '///' });
checkPolyfillContextRejects('createPolyfillContext/non-string package',
  { method: 'usage-pure', package: 0 });

// the diagnostic must NOT be masked by a secondary `JSON.stringify` throw when the bad
// value can't serialize (BigInt, circular structure, hostile Proxy). `safeStringify` in
// `createPolyfillContext` catches the failure and renders a sentinel instead so the user
// sees the primary "wrong shape" message, not a confusing serialization TypeError
function checkPolyfillContextRejectsCleanly(label, opts) {
  try {
    createPolyfillContext(opts);
    counts.failed++;
    echo`${ red('FAIL') } ${ cyan(label) } :: expected throw`;
  } catch (error) {
    if (/Converting circular|Do not know how to serialize/.test(error.message)) {
      counts.failed++;
      echo`${ red('FAIL') } ${ cyan(label) } :: JSON.stringify secondary throw leaked :: ${ error.message }`;
    } else if (/\[core-js\]/.test(error.message)) counts.passed++;
    else {
      counts.failed++;
      echo`${ red('FAIL') } ${ cyan(label) } :: unexpected error :: ${ error.message }`;
    }
  }
}

const circular = {};
circular.self = circular;
checkPolyfillContextRejectsCleanly('createPolyfillContext/bigint package',
  { method: 'usage-pure', package: 1n });
checkPolyfillContextRejectsCleanly('createPolyfillContext/circular package',
  { method: 'usage-pure', package: circular });
checkPolyfillContextRejectsCleanly('createPolyfillContext/bigint in additionalPackages',
  { method: 'usage-pure', package: 'foo', additionalPackages: [1n] });
checkPolyfillContextRejectsCleanly('createPolyfillContext/circular in additionalPackages',
  { method: 'usage-pure', package: 'foo', additionalPackages: [circular] });

// --- hasCoreJSImport: fingerprint pre-pass against configured packages ---
function checkHasPureImport(label, src, packages, expected) {
  // eslint-disable-next-line node/no-sync -- oxc-parser sync-only API
  const ast = parseSync('/x.mjs', src, { sourceType: 'module' }).program;
  check(label, hasCoreJSImport(ast, packages), expected);
}
checkHasPureImport('hasCoreJSImport/match',
  'import _ from "@core-js/pure/x";\nfoo();', ['@core-js/pure'], true);
checkHasPureImport('hasCoreJSImport/exact-prefix not enough',
  'import _ from "@core-js/pure";\nfoo();', ['@core-js/pure'], false);
checkHasPureImport('hasCoreJSImport/no imports', 'foo();', ['@core-js/pure'], false);
checkHasPureImport('hasCoreJSImport/non-matching package',
  'import _ from "lodash";\nfoo();', ['@core-js/pure'], false);
checkHasPureImport('hasCoreJSImport/multiple packages',
  'import _ from "vendor-pure/y";\nfoo();', ['@core-js/pure', 'vendor-pure'], true);
checkHasPureImport('hasCoreJSImport/relative path mimicking pkg',
  'import _ from "./vendor/@core-js/pure/x";\nfoo();', ['@core-js/pure'], false);
// re-export with source is NOT detected: `pureImportSource` matches ImportDeclaration /
// ExpressionStatement(require()) / VariableDeclaration(...=require()), not
// ExportNamedDeclaration. fingerprint cares about INPUT module record fetches, not
// re-exports - if user re-exports from `@core-js/pure`, the original importer chain
// already had a direct import and would have been flagged there
checkHasPureImport('hasCoreJSImport/re-export with source NOT detected',
  'export { x } from "@core-js/pure/m";\nfoo();', ['@core-js/pure'], false);
checkHasPureImport('hasCoreJSImport/CJS require shape',
  'const x = require("@core-js/pure/y");\nfoo();', ['@core-js/pure'], true);
checkHasPureImport('hasCoreJSImport/lowercased package match',
  'import _ from "@CORE-JS/PURE/x";\nfoo();', ['@core-js/pure'], true);
// usage-global side-effect imports MUST be detected too - they're the pre-pass output for
// global mode. without this, webpack persistent-cache + post-fresh in usage-global would
// fail the orphan-adoption gate even though the source HAS pre's emitted imports
checkHasPureImport('hasCoreJSImport/usage-global side-effect import',
  'import "core-js/modules/es.array.from";\nfoo();', ['core-js'], true);
checkHasPureImport('hasCoreJSImport/usage-global CJS require',
  'require("core-js/modules/es.array.from");\nfoo();', ['core-js'], true);

// --- entryToGlobalHint: entry name (sans `core-js/<head>/` prefix) -> global hint ---
// callers pre-strip `core-js/<bucket>/` (`actual/`, `stable/`, `full/`, etc.); the
// hint resolver consumes the tail. data-driven index covers acronym globals
// (URL / DOMException / ...); fallback derives kebab -> Pascal head when entry is
// `<head>` or `<head>/constructor`. multi-segment entries below the head bail to null
check('entryToGlobalHint/promise constructor strip',
  entryToGlobalHint('promise/constructor'), 'Promise');
check('entryToGlobalHint/array head fallback derives Pascal',
  entryToGlobalHint('array'), 'Array');
check('entryToGlobalHint/url acronym from index',
  entryToGlobalHint('url'), 'URL');
check('entryToGlobalHint/url-search-params acronym',
  entryToGlobalHint('url-search-params'), 'URLSearchParams');
check('entryToGlobalHint/dom-exception acronym',
  entryToGlobalHint('dom-exception'), 'DOMException');
check('entryToGlobalHint/multi-segment below head bails',
  entryToGlobalHint('array/from'), null);
check('entryToGlobalHint/null entry returns null',
  entryToGlobalHint(null), null);
check('entryToGlobalHint/empty string returns null',
  entryToGlobalHint(''), null);

// --- walkAstNodes: visit-all-descendants walker used by injector subtree scans ---
function exprOf(src, sourceType = 'module') {
  // eslint-disable-next-line node/no-sync -- oxc-parser sync-only API
  return parseSync('/x.mjs', src, { sourceType }).program.body[0].expression;
}
function checkWalkVisitsAll() {
  const node = exprOf('foo.bar.baz');
  const types = [];
  walkAstNodes({ root: node, visit: n => types.push(n.type) });
  // depth-first: outer member -> inner member -> root identifier -> property identifiers
  check('walkAstNodes/visits outer first', types[0], 'MemberExpression');
  check('walkAstNodes/visits all member nodes', types.filter(t => t === 'MemberExpression').length, 2);
  check('walkAstNodes/visits all identifier descendants', types.filter(t => t === 'Identifier').length, 3);
}
checkWalkVisitsAll();

function checkWalkParentArg() {
  const node = exprOf('a.b');
  const seen = [];
  walkAstNodes({ root: node, visit: (n, parent) => seen.push([n.type, parent?.type ?? null]) });
  check('walkAstNodes/root has null parent', seen[0][1], null);
  check('walkAstNodes/descendants have parent', seen[1][1], 'MemberExpression');
}
checkWalkParentArg();

function checkWalkSkipsNonNodes() {
  let count = 0;
  walkAstNodes({ root: { type: 'X', noise: 42, str: 's', bool: true, nil: null },
    visit: () => count++ });
  check('walkAstNodes/visits leaf node only', count, 1);
  walkAstNodes({ root: null, visit: () => count++ });
  walkAstNodes({ root: 'string', visit: () => count++ });
  walkAstNodes({ root: { /* no type */ }, visit: () => count++ });
  check('walkAstNodes/no-op on null/non-object/typeless', count, 1);
}
checkWalkSkipsNonNodes();

function checkWalkDepthCap() {
  // build pathologically nested AST 1500 levels deep - walker bails at 1024 to bound CPU
  let nested = { type: 'L', child: null };
  for (let i = 0; i < 1500; i++) nested = { type: 'L', child: nested };
  let count = 0;
  walkAstNodes({ root: nested, visit: () => count++ });
  check('walkAstNodes/depth cap at 1024', count, 1024);
}
checkWalkDepthCap();

// --- unwrapNode: peel parens / chain / TS wrappers down to semantic core ---
function checkUnwrapNode() {
  // bare node passes through
  const ident = { type: 'Identifier', name: 'x' };
  check('unwrapNode/Identifier passes through', unwrapNode(ident), ident);

  // ParenthesizedExpression peeled
  const inner = { type: 'Identifier', name: 'y' };
  check('unwrapNode/ParenthesizedExpression peeled',
    unwrapNode({ type: 'ParenthesizedExpression', expression: inner }), inner);

  // ChainExpression peeled
  check('unwrapNode/ChainExpression peeled',
    unwrapNode({ type: 'ChainExpression', expression: inner }), inner);

  // TSAsExpression / TSNonNullExpression / TSSatisfiesExpression peeled
  check('unwrapNode/TSAsExpression peeled',
    unwrapNode({ type: 'TSAsExpression', expression: inner }), inner);
  check('unwrapNode/TSNonNullExpression peeled',
    unwrapNode({ type: 'TSNonNullExpression', expression: inner }), inner);
  check('unwrapNode/TSSatisfiesExpression peeled',
    unwrapNode({ type: 'TSSatisfiesExpression', expression: inner }), inner);

  // stacked wrappers all peel
  const stacked = { type: 'ParenthesizedExpression',
    expression: { type: 'TSAsExpression',
      expression: { type: 'ChainExpression', expression: inner } } };
  check('unwrapNode/stacked Paren+TS+Chain peeled', unwrapNode(stacked), inner);

  // null / undefined safe
  check('unwrapNode/null', unwrapNode(null), null);
  check('unwrapNode/undefined', unwrapNode(undefined), undefined);
}
checkUnwrapNode();

// --- isCallee: parent is Call/New with `node` as callee (through wrappers) ---
function checkIsCallee() {
  const ident = { type: 'Identifier', name: 'fn' };
  const callDirect = { type: 'CallExpression', callee: ident };
  check('isCallee/CallExpression direct', isCallee(ident, callDirect), true);

  const newDirect = { type: 'NewExpression', callee: ident };
  check('isCallee/NewExpression direct', isCallee(ident, newDirect), true);

  // through TS wrapper - unwrapNode peels
  const callThroughTS = { type: 'CallExpression',
    callee: { type: 'TSAsExpression', expression: ident } };
  check('isCallee/through TSAsExpression', isCallee(ident, callThroughTS), true);

  // not callee: parent is member access, not call
  const memberParent = { type: 'MemberExpression', object: ident };
  check('isCallee/MemberExpression NOT callee', isCallee(ident, memberParent), false);

  // mismatched callee
  const otherIdent = { type: 'Identifier', name: 'fn2' };
  const callOther = { type: 'CallExpression', callee: otherIdent };
  check('isCallee/different callee', isCallee(ident, callOther), false);

  // null parent
  check('isCallee/null parent', isCallee(ident, null), false);
}
checkIsCallee();

// --- SnapshotCache lifecycle: store -> take chains, miss-after-take, invalidate cycles ---
// take() consumes the entry (last-write-wins HMR semantic) and returns `entry ?? null`
function checkSnapshotStoreTakeRoundTrip() {
  const cache = new SnapshotCache();
  cache.store('/a.js', { v: 1 });
  check('SnapshotCache/store+take returns payload', cache.take('/a.js')?.v, 1);
  // single-shot: after take, next take is null (entry consumed)
  check('SnapshotCache/take consumes entry', cache.take('/a.js'), null);
}
checkSnapshotStoreTakeRoundTrip();

function checkSnapshotMissBeforeStore() {
  const cache = new SnapshotCache();
  check('SnapshotCache/miss before store returns null', cache.take('/never-seen.js'), null);
}
checkSnapshotMissBeforeStore();

function checkSnapshotMultipleFilesIsolation() {
  const cache = new SnapshotCache();
  cache.store('/a.js', { tag: 'A' });
  cache.store('/b.js', { tag: 'B' });
  check('SnapshotCache/multi-file/size after 2 stores', cache.size(), 2);
  check('SnapshotCache/multi-file/a take', cache.take('/a.js')?.tag, 'A');
  check('SnapshotCache/multi-file/b take', cache.take('/b.js')?.tag, 'B');
  check('SnapshotCache/multi-file/a re-take is null', cache.take('/a.js'), null);
  check('SnapshotCache/multi-file/size after both taken', cache.size(), 0);
}
checkSnapshotMultipleFilesIsolation();

function checkSnapshotOverwrite() {
  // store followed by store at same id: second overwrites first (HMR semantic)
  const cache = new SnapshotCache();
  cache.store('/a.js', { v: 1 });
  cache.store('/a.js', { v: 2 });
  check('SnapshotCache/overwrite/second store wins', cache.take('/a.js')?.v, 2);
}
checkSnapshotOverwrite();

function checkSnapshotInvalidateLifecycle() {
  const cache = new SnapshotCache();
  cache.store('/a.js', { v: 1 });
  // invalidate returns true when entry existed
  check('SnapshotCache/invalidate hit returns true', cache.invalidate('/a.js'), true);
  check('SnapshotCache/post-invalidate take is null', cache.take('/a.js'), null);
  // invalidate miss returns false
  check('SnapshotCache/invalidate miss returns false', cache.invalidate('/never-seen.js'), false);
}
checkSnapshotInvalidateLifecycle();

function checkSnapshotReset() {
  const cache = new SnapshotCache();
  cache.store('/a.js', { v: 1 });
  cache.store('/b.js', { v: 2 });
  cache.reset();
  check('SnapshotCache/reset clears all', cache.size(), 0);
  check('SnapshotCache/post-reset take is null', cache.take('/a.js'), null);
}
checkSnapshotReset();

// soft cap evicts oldest insertion on overflow. critical for bun / esbuild --watch flows
// where upstream unplugin doesn't dispatch watchChange and per-file invalidation falls
// through. exact cap (1024) is internal; test the bump-on-re-store semantic that makes the
// LRU policy correct - without it, repeated `store(sameKey, ...)` would keep stale keys
// pinned to their original insertion slot and they'd always be evicted ahead of fresh stores.
// the invariants: re-store keeps the LATEST value (not the original) AND both entries stay
// retrievable - re-store doesn't drop the previous slot
function checkSnapshotStoreBumpsRecency() {
  const cache = new SnapshotCache();
  cache.store('/oldest.js', { v: 'oldest' });
  cache.store('/middle.js', { v: 'middle' });
  cache.store('/oldest.js', { v: 'oldest-touched' });
  check('SnapshotCache/size stays 2 on re-store', cache.size(), 2);
  check('SnapshotCache/re-store preserves latest value',
    cache.take('/oldest.js')?.v, 'oldest-touched');
  check('SnapshotCache/re-store does not drop other entries',
    cache.take('/middle.js')?.v, 'middle');
}
checkSnapshotStoreBumpsRecency();

// peekWithParse byte-mismatch must invalidate the parse-cache fields while keeping the snapshot.
// the shared `#withParseShape` helper collapses to the empty-parse shape on any non-byte-match
// (and on a stored null ast); these peekWithParse cases are the regression guard for that helper
function checkSnapshotPeekWithParseMismatch() {
  const cache = new SnapshotCache();
  const snap = { signal: 'peek-mismatch' };
  cache.store('/a.js', { snapshot: snap, ast: { type: 'Program' }, comments: [], postInput: 'before' });
  const result = cache.peekWithParse('/a.js', 'after');
  check('peekWithParse/mismatch snapshot kept', result.snapshot, snap);
  check('peekWithParse/mismatch ast invalidated', result.ast, null);
  check('peekWithParse/mismatch comments invalidated', result.comments, null);
  // entry survives - bail path can retry
  check('peekWithParse/mismatch non-destructive', cache.take('/a.js')?.snapshot?.signal, 'peek-mismatch');
}
checkSnapshotPeekWithParseMismatch();

function checkSnapshotPeekWithParseMiss() {
  const cache = new SnapshotCache();
  const result = cache.peekWithParse('/missing.js', 'anything');
  check('peekWithParse/miss snapshot null', result.snapshot, null);
  check('peekWithParse/miss ast null', result.ast, null);
  check('peekWithParse/miss comments null', result.comments, null);
}
checkSnapshotPeekWithParseMiss();

// post-input byte-matches pre: `#withParseShape` reuses the cached AST/comments (dev-server
// fast-path so post avoids re-parsing pre's input)
function checkSnapshotPeekWithParseReuse() {
  const cache = new SnapshotCache();
  const fakeAst = { type: 'Program', body: [] };
  const fakeComments = [];
  const snap = { signal: 'peek-reuse' };
  cache.store('/a.js', { snapshot: snap, ast: fakeAst, comments: fakeComments, postInput: 'foo();' });
  const result = cache.peekWithParse('/a.js', 'foo();');
  check('peekWithParse/reuse same bytes -> snapshot returned', result.snapshot, snap);
  check('peekWithParse/reuse same bytes -> ast cached', result.ast, fakeAst);
  check('peekWithParse/reuse same bytes -> comments cached', result.comments, fakeComments);
}
checkSnapshotPeekWithParseReuse();

// pre intentionally stored `ast: null` (e.g. mode rewrote pre's output): `#withParseShape` must
// collapse to the empty-parse shape regardless of a postInput byte match while keeping the snapshot
function checkSnapshotPeekWithParseNullAst() {
  const cache = new SnapshotCache();
  const snap = { signal: 'peek-null-ast' };
  cache.store('/a.js', { snapshot: snap, ast: null, comments: null, postInput: 'foo();' });
  const result = cache.peekWithParse('/a.js', 'foo();');
  check('peekWithParse/null ast - snapshot returned', result.snapshot, snap);
  check('peekWithParse/null ast - ast stays null', result.ast, null);
  check('peekWithParse/null ast - comments stay null', result.comments, null);
}
checkSnapshotPeekWithParseNullAst();

// --- collectMutatedStaticMembers ---
// pre-pass scan that backs the usage-pure substitution gate. detects every shape of
// `Object.key` mutation - direct `=`, compound `+=`, update `++`, `delete`, and
// destructure-LHS / pattern-target slots - so reads later in the file bail to preserve
// the user's monkey-patch (polyfill import is `const`, can't see the mutation)
function checkCollectMutatedStaticMembers() {
  const mutationAdapter = createEstreeAdapter({ method: 'usage-pure' });
  function collect(src) {
    // eslint-disable-next-line node/no-sync -- oxc-parser sync-only API
    return collectMutationPrePass(parseSync('unit.js', src).program, mutationAdapter).mutated;
  }
  // direct `=` assignment
  check('collectMutatedStaticMembers/direct assign',
    collect('Array.from = () => [];').has('Array.from'), true);
  // array-destructure LHS - `[Array.from] = X`
  check('collectMutatedStaticMembers/array-destructure LHS',
    collect('[Array.from] = [];').has('Array.from'), true);
  // compound `+=`
  check('collectMutatedStaticMembers/compound assign',
    collect('Array.from += "x";').has('Array.from'), true);
  // update `++`
  check('collectMutatedStaticMembers/update postfix',
    collect('Array.from++;').has('Array.from'), true);
  // `delete`
  check('collectMutatedStaticMembers/delete',
    collect('delete Array.from;').has('Array.from'), true);
  // pure read - NO mutation
  check('collectMutatedStaticMembers/read only',
    collect('Array.from([1, 2, 3]);').has('Array.from'), false);
  // mutation of different member doesn't leak across keys
  const mixed = collect('Array.of = X; Array.from([1, 2, 3]);');
  check('collectMutatedStaticMembers/mixed - mutated key tracked',
    mixed.has('Array.of'), true);
  check('collectMutatedStaticMembers/mixed - read-only key not tracked',
    mixed.has('Array.from'), false);
  // proxy-global chain (`globalThis.Array.from`) IS tracked: the read side resolves the
  // same chains, so an Identifier-only gate let the substitution bypass the user's patch
  // (the node-only walk peels SE / parens per hop - no full receiver resolution needed)
  check('collectMutatedStaticMembers/proxy-global chain tracked',
    collect('globalThis.Array.from = X;').has('Array.from'), true);
  // computed STRING-LITERAL key (`Array["from"] = X`) IS detected - dot and bracket access
  // target the same property, so a bracket-key monkey-patch must suppress the polyfill too
  // (staticMemberKey normalizes the literal bracket key to its dot form for write detection)
  check('collectMutatedStaticMembers/computed string-literal key tracked',
    collect('Array["from"] = X;').has('Array.from'), true);
  // NON-literal computed key (`Array[k] = X`) could have hit ANY member - the receiver deopts
  // whole through the slot channel; no exact pair is fabricated
  const dynamicKey = collect('Array[k] = X;');
  check('collectMutatedStaticMembers/dynamic computed key deopts receiver whole',
    dynamicKey.has('globalThis.Array'), true);
  check('collectMutatedStaticMembers/dynamic computed key fabricates no exact pair',
    dynamicKey.has('Array.from'), false);
  // `Object.assign(Builtin, { ...source })` copies each own key onto Builtin - method shorthand,
  // getter, and data props across multiple object-literal sources all count as a static mutation
  const assigned = collect('Object.assign(Array, { from() {}, get of() { return 1; } }, { isArray: 0 });');
  check('collectMutatedStaticMembers/assign method shorthand', assigned.has('Array.from'), true);
  check('collectMutatedStaticMembers/assign getter', assigned.has('Array.of'), true);
  check('collectMutatedStaticMembers/assign second-source data', assigned.has('Array.isArray'), true);
  // a dynamic source (Identifier) / a computed key in an object source can carry ANY key -
  // the receiver deopts whole instead of guessing exact pairs
  check('collectMutatedStaticMembers/assign dynamic + computed sources deopt receiver whole',
    [...collect('Object.assign(Map, src, { [k]: 1 });')].join(','), 'globalThis.Map');
  // Reflect call-forms monkey-patch a named static slot like the Object.* / assignment forms:
  // defineProperty / deleteProperty / set (set is the call-form of `T.k = v` and the [[Set]] twin
  // of Object.assign). setPrototypeOf is out of scope - it swaps [[Prototype]], not a named key
  check('collectMutatedStaticMembers/Reflect.defineProperty',
    collect("Reflect.defineProperty(Array, 'from', {});").has('Array.from'), true);
  check('collectMutatedStaticMembers/Reflect.deleteProperty',
    collect("Reflect.deleteProperty(Array, 'from');").has('Array.from'), true);
  check('collectMutatedStaticMembers/Reflect.set',
    collect("Reflect.set(Array, 'from', fn);").has('Array.from'), true);
  check('collectMutatedStaticMembers/Reflect.setPrototypeOf not tracked',
    [...collect('Reflect.setPrototypeOf(Array, proto);')].length, 0);
  check('collectMutatedStaticMembers/Reflect.set dynamic key deopts receiver whole',
    [...collect('Reflect.set(Array, k, fn);')].join(','), 'globalThis.Array');
  // identity self-copies: a BARE proxy receiver is exempt, a bound same-named local is not
  // (over-record - the safe direction), and a file that replaces the trusted receiver's own
  // slot re-records the skipped copy in either textual order
  check('collectMutatedStaticMembers/bare-proxy identity self-copy exempt',
    [...collect('Promise = globalThis.Promise;')].length, 0);
  check('collectMutatedStaticMembers/bound self alias not exempt',
    collect('const self = { Promise: 1 }; Promise = self.Promise;').has('globalThis.Promise'), true);
  check('collectMutatedStaticMembers/identity re-records when receiver slot replaced',
    collect('Promise = self.Promise; self = fake;').has('globalThis.Promise'), true);
}
checkCollectMutatedStaticMembers();

// --- isChunkLoaderBundler ---
// dynamic-import chunk-loader semantics: webpack-family bundlers wrap `import()`
// in `Promise.all([...])` of chunk fetches. detect-syntax adds `es.promise.all`
// polyfill only when this predicate fires, so a regression here either loses the
// polyfill on the chunk-loader bundlers or leaks it onto roll-family ones
function checkChunkLoaderBundler() {
  // chunk-loader bundlers: dynamic import wraps in Promise.all([chunks])
  check('chunk-loader/webpack', isChunkLoaderBundler('webpack'), true);
  check('chunk-loader/rspack', isChunkLoaderBundler('rspack'), true);
  check('chunk-loader/rsbuild', isChunkLoaderBundler('rsbuild'), true);
  check('chunk-loader/farm', isChunkLoaderBundler('farm'), true);
  check('chunk-loader/unloader', isChunkLoaderBundler('unloader'), true);
  // roll-family / esbuild / native: dynamic import returns bare module Promise
  check('chunk-loader/rollup', isChunkLoaderBundler('rollup'), false);
  check('chunk-loader/rolldown', isChunkLoaderBundler('rolldown'), false);
  check('chunk-loader/vite', isChunkLoaderBundler('vite'), false);
  check('chunk-loader/esbuild', isChunkLoaderBundler('esbuild'), false);
  check('chunk-loader/bun', isChunkLoaderBundler('bun'), false);
  // unknown / missing bundler: dropped to false (warn already emitted at plugin construction)
  check('chunk-loader/undefined', isChunkLoaderBundler(undefined), false);
  check('chunk-loader/null', isChunkLoaderBundler(null), false);
  check('chunk-loader/turbopack typo', isChunkLoaderBundler('turbopack'), false);
}
checkChunkLoaderBundler();

// --- stripLeadingBOMs ---
// oxc rejects BOM-prefixed shebangs; the plugin strips ALL leading U+FEFF before parsing and
// the output carries none back (babel alignment) - only `sourcesContent` keeps the original
// bytes. multi-BOM survives malformed source or a sibling plugin's per-pass prepend on top of ours
function checkStripLeadingBOMs() {
  // no BOM: returns same instance (cheap fast path)
  const plain = 'export var x = 1;';
  check('stripLeadingBOMs/no BOM returns same instance', stripLeadingBOMs(plain), plain);
  // single BOM: stripped
  check('stripLeadingBOMs/single BOM', stripLeadingBOMs('﻿foo'), 'foo');
  // multi-BOM: ALL leading FEFFs stripped (single-strip would leave residual mid-prefix)
  check('stripLeadingBOMs/double BOM', stripLeadingBOMs('﻿﻿foo'), 'foo');
  check('stripLeadingBOMs/triple BOM', stripLeadingBOMs('﻿﻿﻿foo'), 'foo');
  // BOM only mid-string is NOT stripped (only the leading run)
  check('stripLeadingBOMs/inline BOM untouched', stripLeadingBOMs('foo﻿bar'), 'foo﻿bar');
  // empty string: no crash
  check('stripLeadingBOMs/empty string', stripLeadingBOMs(''), '');
  // lone BOM: stripped to empty
  check('stripLeadingBOMs/lone BOM', stripLeadingBOMs('﻿'), '');
}
checkStripLeadingBOMs();

// --- file strictness: which id / body combination makes the Program a script ---
// Annex-B block-function hoisting exists only in a script, so the strictness answer decides whether
// a block-nested `function Promise(){}` shadows the global. the answer has to be the SAME one that
// picks the import style, in BOTH directions: a `.cjs` parses as script yet is a module when it
// carries top-level ESM, and every other id parses as module yet may be a script by body or option
function checkFileStrictness() {
  const CJS_BODY = '{ function Promise() {} }\nvar out = Promise.withResolvers;\nmodule.exports = out;\n';
  const ESM_BODY = '{ function Promise() {} }\nvar out = Promise.withResolvers;\nexport default out;\n';
  const BARE_BODY = '{ function Promise() {} }\nvar out = Promise.withResolvers;\n';
  // a script honours the shadow and keeps the native read; a module substitutes the pure import
  function strictness(id, source, importStyle) {
    const options = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
    if (importStyle) options.importStyle = importStyle;
    const out = createPlugin(options).transform(source, id)?.code ?? source;
    return /promise\/with-resolvers/.test(out) ? 'module' : 'script';
  }
  for (const [id, body, want] of [
    ['/p.js', CJS_BODY, 'script'],
    ['/p.cjs', CJS_BODY, 'script'],
    ['/p.cts', CJS_BODY, 'script'],
    ['/p.ts', CJS_BODY, 'script'],
    ['/p.mjs', CJS_BODY, 'module'],
    ['/p.mts', CJS_BODY, 'module'],
    ['/p.mjs?vue&type=script', CJS_BODY, 'module'],
    ['/p.js?import', CJS_BODY, 'script'],
    ['/p.js', ESM_BODY, 'module'],
    // source wins over extension in BOTH directions - the regression this pins
    ['/p.cjs', ESM_BODY, 'module'],
    // no marker either way: the plugin has nothing to go on and stays a module
    ['/p.js', BARE_BODY, 'module'],
  ]) {
    check(`strictness/${ id } ${ body === CJS_BODY ? 'cjs-body' : body === ESM_BODY ? 'esm-body' : 'bare' }`,
      strictness(id, body), want);
  }
  // the explicit option is a declaration and reaches strictness too, except where the extension pins
  check('strictness/option require on bare .js', strictness('/p.js', BARE_BODY, 'require'), 'script');
  check('strictness/option import on cjs body', strictness('/p.js', CJS_BODY, 'import'), 'module');
  check('strictness/option require cannot flip .mjs', strictness('/p.mjs', BARE_BODY, 'require'), 'module');
}
checkFileStrictness();

// --- the typed-outer inner default: the composed two-step extraction (a dead mirror
// would polyfill only the branch the default fires on; the composition dispatches the
// LIVE outer step and folds the default through the canonical guard) ---
function checkTypedOuterInnerDefault() {
  const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
  function transformed(form) {
    const source = `const src = [1, [2]];\nconst fallback = { name: 1 };\n${ form }\nexport { src };\n`;
    return createPlugin(OPTIONS).transform(source, '/p.mjs')?.code ?? source;
  }
  function importCount(form) {
    return (transformed(form).match(/@core-js\/pure/g) ?? []).length;
  }
  // the literal inner default COMPOSES: hop dispatch feeds the leaf dispatch through the
  // canonical guard - the babel canon spelling, byte-for-byte
  const composed = transformed('const { at: { name } = {} } = src;');
  check('typed-outer inner default/composes the two-step extraction',
    composed.includes('_nameMaybeFunction((_ref = _atMaybeArray(src)) === void 0 ? {} : _ref)'), true);
  check('typed-outer inner default/both steps import', importCount('const { at: { name } = {} } = src;'), 2);
  // a sibling prop keeps its residual beside the extraction
  check('typed-outer inner default/multi-prop keeps the residual',
    transformed('const { at: { name } = {}, other } = src;').includes('const { other } = src;'), true);
  // the receiver-bearing default folds through the SAME guard (the climb's carriesReceiver
  // answers false on the typed outer, so the hop stays and the composition owns the claim)
  check('typed-outer inner default/receiver default folds into the guard',
    transformed('const { at: { name } = fallback } = src;')
      .includes('_nameMaybeFunction((_ref = _atMaybeArray(src)) === void 0 ? fallback : _ref)'), true);
  check('typed-outer inner default/receiver default imports both steps',
    importCount('const { at: { name } = fallback } = src;'), 2);
  // the ARRAY-pattern default binds the guard to its own pattern (form 2 of the same canon);
  // the bare array value stays native (babel extracts only the defaulted spelling)
  check('typed-outer inner default/array default composes',
    transformed('const { at: [first] = [] } = src;')
      .includes('const [first] = (_ref = _atMaybeArray(src)) === void 0 ? [] : _ref;'), true);
  check('typed-outer inner default/bare array value stays native',
    importCount('const { at: [bare] } = src;'), 0);
  // the LIVE mirrors stay: an empty outer host leaves the default live; a param default is
  // caller-correct; an untyped outer proves nothing
  check('live inner default/empty outer host keeps the mirror', importCount('const { inner: { at } = [1, 2] } = {};'), 1);
  check('live inner default/param default keeps the synth', importCount('export const p = (function ({ at } = [1]) { return at; })();'), 1);
  check('live inner default/untyped outer keeps the mirror', importCount('const { at: { name } = fallback } = opaque;'), 1);
}
checkTypedOuterInnerDefault();

// --- synth-literal key edges: the shared namer and the `__proto__` canon rule ---
function checkSynthKeyEdges() {
  const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
  function out(form) {
    return createPlugin(OPTIONS).transform(form, '/p.mjs')?.code ?? form;
  }
  // an unresolvable computed key names NO slot - the whole synth bails to native (the
  // "[null]" sentinel used to admit it, and later-key-wins overwrote the polyfill)
  const bailed = out('export const f = (function ({ at, [window.k]: alias } = [1, 2]) { return [at, alias]; })();');
  check('synth keys/unresolvable computed key bails the synth', bailed.includes('@core-js/pure'), false);
  check('synth keys/bailed pattern stays native', bailed.includes('{ at, [window.k]: alias } = [1, 2]'), true);
  // `__proto__` re-spells computed-string: an own property, the literal keeps its prototype
  const proto = out('export const g = (function ({ __proto__: p, at } = [1, 2]) { return [p, at]; })();');
  check('synth keys/__proto__ spells computed-string', proto.includes('["__proto__"]: [1, 2].__proto__'), true);
  check('synth keys/__proto__ never spells the setter form', /\{\s*__proto__:/.test(proto.replace(/\{ __proto__: p/, '')), false);
}
checkSynthKeyEdges();

// --- source shape that moves offsets: CRLF, BOM, astral characters ---

// every span the render computes is a PARSER offset into the source, so a byte-order mark, CRLF
// line endings and astral characters each have to leave the emitted guard identical to the plain
// ASCII baseline - a slice taken in the wrong unit would corrupt it silently rather than throw
function checkOffsetShapes() {
  const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
  const BODY = ['globalThis.oBox = { list: [\'ab\'] };',
    'export const plain = globalThis.window?.self.oBox.list?.at(0);',
    'export const layered = (globalThis.window?.self.oBox).list?.at(0);'].join('\n');
  function guardLines(code) {
    const out = createPlugin(OPTIONS).transform(code, '/p.mjs')?.code ?? code;
    // the output never carries a BOM, so no strip is needed for the compare
    check('offsets/output is BOM-free', out.charCodeAt(0) === 0xFEFF, false);
    return out.split(/\r?\n/u).filter(line => line.startsWith('export const')).join(' | ');
  }
  const baseline = guardLines(BODY);
  check('offsets/baseline renders both guards', baseline.includes('_self.oBox.list') && baseline.includes('void 0'), true);
  for (const [label, code] of [
    ['crlf', BODY.replaceAll('\n', '\r\n')],
    ['bom', `\uFEFF${ BODY }`],
    ['astral before', `const e = '\u{1F600}\u{1F680}';\n${ BODY }\nexport { e };`],
    ['astral in comment', `// \u{1F600}\n${ BODY }`],
    ['astral identifier', `const \u{1D49C} = 1;\n${ BODY }\nexport { \u{1D49C} as script };`],
  ]) {
    check(`offsets/${ label } matches the ascii baseline`, guardLines(code), baseline);
  }
}
checkOffsetShapes();

// --- BOM output contract: the output drops the BOM, sourcesContent keeps the bytes ---

// babel alignment: its generator never re-emits a BOM and bundlers strip it before the
// final artifact; devtools compare `sourcesContent` to DISK, so the map keeps the user's
// original bytes - BOM included
function checkBomOutputContract() {
  const source = '\uFEFFexport const r = [1].at(0);\n';
  const out = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 } }).transform(source, '/p.mjs');
  check('bom/output starts with the import, not a BOM', out.code.charCodeAt(0) === 0xFEFF, false);
  check('bom/sourcesContent keeps the original bytes BOM included', out.map.sourcesContent[0], source);
}
checkBomOutputContract();

// --- source map: every mapping the guard render emits stays inside the original ---

// the render replaces spans wholesale, so a mapping that pointed past the source would break every
// consumer downstream. assert the decoded positions land on real source lines, including the line
// the nav sits on
function checkGuardSourceMap() {
  const code = ['globalThis.mBox = { list: [\'ab\'] };',
    'export const r = (globalThis.window?.self.mBox).list?.at(0);', ''].join('\n');
  const out = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 } }).transform(code, '/p.mjs');
  check('sourcemap/emitted', !!out?.map?.mappings, true);
  const tracer = new TraceMap({ ...out.map, sources: ['/p.mjs'], sourcesContent: [code] });
  const lines = code.split('\n');
  const emitted = out.code.split('\n');
  let outside = 0;
  let navLineHits = 0;
  for (const [row, text] of emitted.entries()) {
    for (let col = 0; col < text.length; col += 1) {
      const pos = originalPositionFor(tracer, { line: row + 1, column: col });
      if (pos.line === null || pos.line === undefined) continue;
      if (pos.line > lines.length || pos.column > (lines[pos.line - 1]?.length ?? 0)) outside += 1;
      if (pos.line === 2) navLineHits += 1;
    }
  }
  check('sourcemap/no mapping points outside the source', outside, 0);
  check('sourcemap/the nav line is mapped', navLineHits > 0, true);
}
checkGuardSourceMap();

// --- per-file isolation of the binding registry the composition consults ---

// composition asks the file's injector which names it minted. a bundler reuses ONE plugin instance
// across every module, so a registry that outlived a file would answer for names the next file
// never had - and the next file's own bindings are deliberately different whenever it owns the
// preferred name itself, which is exactly what makes a leak observable
function checkPerFileBindingIsolation() {
  const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
  const NAV = 'globalThis.window?.self.mBox';
  const FILES = [
    ['/a.mjs', `globalThis.mBox = { arr: [3, [1, 2]] };\nexport const r = ('x', ${ NAV }.arr)?.flat();\n`],
    ['/b.mjs', 'globalThis.mBox = { arr: [3, [1, 2]] };\nconst _globalThis = 1, _self = 2;\n'
      + `export const r = (${ NAV }).arr?.flat();\nexport { _globalThis, _self };\n`],
  ];
  const shared = createPlugin(OPTIONS);
  function bindingsOf(out) {
    return out.matchAll(/^import (?<local>\w+) from ["']@core-js/gmu).map(m => m.groups.local).toArray().join(',');
  }
  for (const [id, code] of FILES) {
    const viaShared = shared.transform(code, id)?.code ?? code;
    const viaFresh = createPlugin(OPTIONS).transform(code, id)?.code ?? code;
    check(`per-file isolation/${ id } shared instance matches a fresh one`, viaShared, viaFresh);
  }
  // the two files mint DIFFERENT names (the second owns the preferred ones), so a leaked registry
  // would show up as the wrong set here rather than passing unnoticed
  const first = shared.transform(FILES[0][1], FILES[0][0])?.code ?? '';
  const second = shared.transform(FILES[1][1], FILES[1][0])?.code ?? '';
  check('per-file isolation/first file keeps the preferred names',
    bindingsOf(first), '_flatMaybeArray,_globalThis,_self');
  check('per-file isolation/second file dedupes around the user names',
    bindingsOf(second), '_flatMaybeArray,_globalThis2,_self2');
}
checkPerFileBindingIsolation();

// --- re-transform stability of the guard renders ---

// a second pass over the plugin's own output parses a shape the first pass never saw. every
// family this canon emits must be a fixed point in content - a re-render would double the
// guard or re-memoize
function checkRetransformStability() {
  const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
  const PRELUDE = 'globalThis.iBox = { n: 4, arr: [3, [1, 2]] };\nlet h;\n';
  const NAV = 'globalThis.window?.self.iBox';
  const ASSIGN_ROOT = '(h = globalThis)?.window?.self.iBox';
  for (const [label, expr] of [
    ['plain dispatch', `${ NAV }.arr?.flat()`],
    ['paren layer over nav', `(${ NAV }).arr?.flat()`],
    ['sequence receiver', `('x', ${ NAV }.arr)?.flat()`],
    ['sequence member dispatch', `('x', ${ NAV }).arr?.flat()`],
    ['repeated nav chained consumer', `(${ NAV }.arr, ${ NAV }.arr)?.flat().concat([])`],
    ['chained consumer over paren layer', `(${ NAV }).arr?.flat().concat([])`],
    ['assign root in a sequence', `('x', ${ ASSIGN_ROOT }.arr)?.flat()`],
    ['plain value read', `${ NAV }.n`],
  ]) {
    const source = `${ PRELUDE }export const r = ${ expr };\nexport { h };\n`;
    const plugin = createPlugin(OPTIONS);
    const first = plugin.transform(source, '/p.mjs')?.code ?? source;
    const second = createPlugin(OPTIONS).transform(first, '/p.mjs')?.code ?? first;
    check(`retransform/${ label }`, second, first);
  }
  // a rest-destructure leaves an `_unusedN` SENTINEL in the rewritten pattern. re-reading our own
  // output has to recognise it as ours: adopting it only under `phase: 'pre+post'` left the ordinary
  // (`single`) pass blind, so each re-run re-extracted the previous sentinel as a live exported
  // binding and minted a fresh one - the file grew without bound. FOUR passes, because the first
  // repeat alone would also pass under a scheme that merely alternates
  for (const [label, source] of [
    ['rest sentinel', 'export const { at, ...rest } = [1, 2];\nexport const r = [at, rest];\n'],
    ['rest sentinel, two polyfilled keys',
      'export const { at, flat, ...rest } = [1, [2]];\nexport const r = [at, flat, rest];\n'],
    ['rest sentinel beside a plain sibling',
      'export const { at, ...rest } = [1, 2];\nexport const { length } = [3];\nexport const r = [at, rest, length];\n'],
    // every sentinel SHAPE the rebuild prints - the origin test reads our extraction beside the
    // sentinel, so each shape has to be recognised: a nested proxy key (the extraction hangs off the
    // NAMESPACE the key names), a symbol iterator key (read through get-iterator-method), a `for`
    // head (the extraction is a sibling declarator), a catch param (relocated into the body), an
    // assignment cascade (the extraction follows the pattern), an effectful computed key
    ['nested proxy rest sentinel', 'export const { Array: { from }, ...rest } = globalThis;\nexport const r = [from, rest];\n'],
    ['symbol iterator rest sentinel', 'const arr = [1];\nexport const { [Symbol.iterator]: it, ...rest } = arr;\nexport const r = [it, rest];\n'],
    ['for-head rest sentinel', 'export let r;\nfor (const { from, ...rest } = Array; !r;) r = [from, rest];\n'],
    ['catch rest sentinel', 'export let r;\ntry { throw [1]; } catch ({ at, ...rest }) { r = [at, rest]; }\n'],
    ['assignment cascade rest sentinel', 'let fa;\nlet rest;\n({ Array: { fromAsync: fa }, ...rest } = globalThis);\nexport const r = [fa, rest];\n'],
    ['effectful computed key rest sentinel', 'let n = 0;\nconst arr = [1];\nexport const { [(n++, "at")]: a, ...rest } = arr;\nexport const r = [a, rest, n];\n'],
    ['for-await-head rest sentinel', 'export async function g(iter) {\n  for await (const { at, ...rest } of iter) return [at, rest];\n}\n'],
  ]) {
    let code = createPlugin(OPTIONS).transform(source, '/p.mjs')?.code ?? source;
    const first = code;
    for (let pass = 2; pass <= 4; pass++) code = createPlugin(OPTIONS).transform(code, '/p.mjs')?.code ?? code;
    // the same over the PASS axis: the sentinel skip is about "did WE emit this", so a pre / post
    // cadence must be as idempotent as the default single one - the gate that broke this read the
    // pass, and only the single-pass shape would have caught it
    for (const passes of [['pre'], ['post'], ['pre', 'post']]) {
      let cadence = source;
      for (let round = 0; round < 3; round++) {
        for (const pass of passes) cadence = createPlugin(OPTIONS).transform(cadence, '/p.mjs', pass)?.code ?? cadence;
      }
      check(`retransform/${ label } is stable over the [${ passes.join('->') }] cadence`,
        sentinels(cadence), sentinels(first));
    }
    function sentinels(text) {
      return [...new Set(text.matchAll(/_unused\d*/g).map(m => m[0]))].sort().join(',');
    }
    check(`retransform/${ label } is stable over 4 passes`, code, first);
    // stated separately from the text compare: the failure mode is GROWTH of the sentinel set, and
    // naming it keeps a future regression legible instead of a wall-of-text diff
    check(`retransform/${ label } mints no new sentinel`, sentinels(code), sentinels(first));
  }
}
checkRetransformStability();

// --- params no scope owner walks: the whole crawler-hostile domain, not a list of type names ---
// estree-toolkit consumes a binding pattern only where a scope owner puts one; a params list
// anywhere else reaches the generic identifier crawler, which throws on a `RestElement`,
// `ArrayPattern` or `AssignmentPattern` leaf and aborts the file. The fixture corpus carries the
// shapes a reader recognizes - this table carries the REACH: the type positions and pattern kinds
// the corpus has no line for, crossed with each other. Every row must transform AND still inject
// for the trailing probe, so a neutralization that ate the file is as visible as one that crashed
function checkUnscopedParamPatterns() {
  const patterns = [
    '...a: any[]',
    '[a, b]: any',
    '{ a }: any',
    '{ a, ...r }: any',
    '{ a: [b] }: any',
    '[{ a }]: any',
    '{ a = 1 }: any',
    'a = 1',
  ];
  // the type-level hosts, then the positions a host can sit in that the crawler still reaches:
  // an annotation hanging off a known ESTree node is skipped with its owner, a TS node's is not
  const hosts = {
    'fn-type-alias': param => `type F = (${ param }) => void;`,
    'ctor-type-alias': param => `type C = new (${ param }) => object;`,
    'call-signature': param => `interface I { (${ param }): void }`,
    'construct-signature': param => `interface I { new (${ param }): object }`,
    'method-signature': param => `interface I { m(${ param }): void }`,
    'ambient-function': param => `declare function f(${ param }): void;`,
    'ambient-method': param => `declare class K { m(${ param }): void }`,
    'ambient-constructor': param => `declare class K { constructor(${ param }) }`,
    'abstract-method': param => `abstract class K { abstract m(${ param }): void }`,
    'overload-head': param => `function f(${ param }): void;\nfunction f(...z: any[]): void {}`,
    'method-overload-head': param => `class K { m(${ param }): void; m(...z: any[]): void {} }`,
    'namespace-function': param => `declare namespace N { function f(${ param }): void }`,
    'module-block-function': param => `declare module 'm' { function f(${ param }): void }`,
    'global-block-function': param => `declare global { function f(${ param }): void }`,
    'as-expression': param => `const v = (null as any) as (${ param }) => void;`,
    'satisfies-expression': param => `const v = (null as any) satisfies (${ param }) => void;`,
    'union-member': param => `type U = string | ((${ param }) => void);`,
    'intersection-member': param => `type X = { z: 1 } & ((${ param }) => void);`,
    'tuple-member': param => `type A = [(${ param }) => void];`,
    'array-of': param => `type A = ((${ param }) => void)[];`,
    'indexed-access': param => `type A = ((${ param }) => void)['name'];`,
    'conditional-type': param => `type C<T> = T extends (${ param }) => void ? 1 : 2;`,
    'mapped-type-value': param => `type M = { [K in 'a']: (${ param }) => void };`,
    'type-param-default': param => `type G<T = (${ param }) => void> = T;`,
    'type-param-constraint': param => `type G<T extends (${ param }) => void> = T;`,
    'fn-type-param-default': param => `declare function g<T = (${ param }) => void>(): T;`,
    'type-predicate-return': param => `declare function f(x: unknown): x is (${ param }) => void;`,
    'exported-alias': param => `export type F = (${ param }) => void;`,
    'nested-in-signature-return': param => `interface I { m(${ param }): (...b: any[]) => void }`,
  };
  const probe = '\nconst probe = [1, 2].at(0);\n';
  for (const [hostName, host] of Object.entries(hosts)) {
    for (const param of patterns) {
      check(`unscoped-params/${ hostName }/${ param }`, injectsModule(`${ host(param) }${ probe }`, 'array.at'), true);
    }
  }
}
checkUnscopedParamPatterns();

// --- the mirror obligation: a params list a scope owner DOES walk must come out untouched ---
// The neutralization is keyed on the host, so the way it fails is silent, not loud: touch a runtime
// function's params and its bindings simply stop existing, taking every polyfill inside a parameter
// default with them. Each row therefore carries a polyfillable call in the default slot and asserts
// it is still detected - the same probe answers "not neutralized" and "still walked as a pattern"
function checkRuntimeParamPatternsUntouched() {
  const forms = {
    'function declaration': 'function f([a, b] = [1, 2].flat()) { return a; }\nf();',
    'function expression': 'const f = function ([a, b] = [1, 2].flat()) { return a; };\nf();',
    'named function expression': 'const f = function g([a, b] = [1, 2].flat()) { return a; };\nf();',
    arrow: 'const f = ([a, b] = [1, 2].flat()) => a;\nf();',
    'async function': 'async function f([a, b] = [1, 2].flat()) { return a; }\nf();',
    generator: 'function* f([a, b] = [1, 2].flat()) { yield a; }\nf();',
    'async generator': 'async function* f([a, b] = [1, 2].flat()) { yield a; }\nf();',
    'object method': 'const o = { m([a, b] = [1, 2].flat()) { return a; } };\no.m();',
    'object setter': 'const o = { set v([a, b]) { this.x = a; } };\no.v = [1, 2].flat();',
    'object arrow property': 'const o = { m: ([a, b] = [1, 2].flat()) => a };\no.m();',
    'class method': 'class C { m([a, b] = [1, 2].flat()) { return a; } }\nnew C().m();',
    'class static method': 'class C { static m([a, b] = [1, 2].flat()) { return a; } }\nC.m();',
    'class private method': 'class C { #m([a, b] = [1, 2].flat()) { return a; } run() { return this.#m(); } }\nnew C().run();',
    'class constructor': 'class C { constructor([a, b] = [1, 2].flat()) { this.a = a; } }\nnew C();',
    'class setter': 'class C { set v([a, b]) { this.x = a; } }\nnew C().v = [1, 2].flat();',
    'class field arrow': 'class C { m = ([a, b] = [1, 2].flat()) => a; }\nnew C().m();',
    IIFE: '(function ([a, b] = [1, 2].flat()) { return a; })();',
    'parameter property default': 'class C { constructor(public a = [1, 2].flat()) {} }\nnew C();',
    'annotated destructure with default': 'function f({ head }: { head: number } = { head: [1, 2].flat()[0] }) { return head; }\nf();',
    // the other slots the crawler walks as patterns, none of which goes through a params list
    'catch destructure with default': 'try { null; } catch ({ message = [1, 2].flat() }) { console.log(message); }',
    'destructuring declaration': 'const [a, b] = [1, 2].flat();\nconsole.log(a, b);',
    'destructuring assignment default': 'let a;\n({ a = [1, 2].flat() } = {});\nconsole.log(a);',
    'for-of destructure with default': 'for (const [a = [1, 2].flat()] of [[]]) console.log(a);',
  };
  for (const [name, source] of Object.entries(forms)) {
    check(`walked-params/${ name }`, injectsModule(source, 'array.flat'), true);
  }
}
checkRuntimeParamPatternsUntouched();

// --- a type-argument list is spelled `params` too, and must survive untouched ---
// `ReturnType<typeof fn>` reaches the resolver as a `params` array holding a type query, so a
// neutralizer keyed on "this node has params" instead of "this param is a binding pattern" erases
// the very type the receiver came for. The hostile sibling in the same file is what makes the row
// meaningful: the neutralizer has to run and still leave the type argument alone
function checkTypeArgumentListSurvives() {
  const source = [
    'type Hostile = (...a: any[]) => void;',
    'declare function fn(a: number, ...rest: string[]): number[];',
    'declare const narrowed: ReturnType<typeof fn>;',
    'declare const restElement: Parameters<typeof fn>[1];',
    'narrowed.at(0);',
    'restElement.includes("x");',
  ].join('\n');
  const { code } = createPlugin({ method: 'usage-global', version: '4.0', targets: { ie: 11 } })
    .transform(source, 'input.ts');
  check('type-args/ReturnType narrows to the array family', /es\.array\.at/.test(code), true);
  check('type-args/ReturnType does not widen to string', /es\.string\.at/.test(code), false);
  check('type-args/rest element narrows to the string family', /es\.string\.includes/.test(code), true);
  check('type-args/rest element is not the whole rest array', /es\.array\.includes/.test(code), false);
}
checkTypeArgumentListSurvives();

// --- machine-path normalization (two escaping domains) ---

// the runners' ROOT collapse broke on Windows once and regex escapes once - each time by
// unifying the two domains; these lock them apart
function checkMachinePathDomains() {
  check('slashifyPath walks single-backslash filesystem separators',
    slashifyPath('D:\\a\\core-js\\core-js'), 'D:/a/core-js/core-js');
  check('normalizeMachinePaths rewrites the ESCAPED separator spelling',
    normalizeMachinePaths('import "D:\\\\a\\\\x.js";'), 'import "D:/a/x.js";');
  check('normalizeMachinePaths leaves regex and String.raw escapes alone',
    normalizeMachinePaths('const re = /[\\v\\t]/;'), 'const re = /[\\v\\t]/;');
}
checkMachinePathDomains();

// --- offset-to-loc canon (the AST printer rides it) ---

function checkAstPrintLocator() {
  const at = buildOffsetToLoc('a\nb\r\nc\rd\u2028e\u2029f');
  check('locator: LF breaks a line', JSON.stringify(at(2)), '{"line":2,"column":0}');
  check('locator: CRLF is one ending', JSON.stringify(at(5)), '{"line":3,"column":0}');
  check('locator: lone CR breaks a line', JSON.stringify(at(7)), '{"line":4,"column":0}');
  check('locator: LS breaks a line', JSON.stringify(at(9)), '{"line":5,"column":0}');
  check('locator: PS breaks a line', JSON.stringify(at(11)), '{"line":6,"column":0}');
  check('locator: column counts from the line start', JSON.stringify(at(1)), '{"line":1,"column":1}');
}
checkAstPrintLocator();

// --- ast-print: printer quirks ---

function astPrint(source, file = 'input.ts', options = {}) {
  // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
  const parsed = parseSync(file, source, { sourceType: 'module' });
  return printProgram({ program: parsed.program, comments: parsed.comments, source, id: file, jsx: /\.[jt]sx$/.test(file), ...options });
}

function checkAstPrintQuirks() {
  check('user parens survive the print', astPrint('(a + b) * c;').code, '(a + b) * c;');
  check('type instantiation prints', astPrint('const g = f<number>;').code, 'const g = f<number>;');
  // oxc admits the bare spelling, tsc/babel do not - the printed form must hold to the
  // strict grammar (the differential's ast print-through leg executes through babel)
  check('a cast assignment target keeps its parens', astPrint('(w as any) = [1];').code, '(w as any) = [1];');
  // the workaround widening `Program.loc.end` - without it esrap's strictly-before flush
  // moves the comment onto its own line, off the statement a disable-line directive covers
  check('EOF trailing comment stays inline without a final newline',
    astPrint('console.log(1); // keep me').code, 'console.log(1); // keep me');
  check('CR-only line table keeps a trailing comment inline',
    astPrint('let a = 1;\rlet b = 2; // tail\r').code, 'let a = 1;\nlet b = 2; // tail');
  // esrap's statement-pad space would land INSIDE the comment token and grow it per reprint
  check('a comment-only file does not accrete the pad space', astPrint('// alone').code, '// alone');
  check('the pad trim reaches a fixed point', astPrint(astPrint('// alone').code).code, '// alone');
  // the Property concise-method branch prints `key(` directly - the synthetic key node
  // carries the type parameters through; the computed spelling has no seam after `]` and
  // degrades to the equivalent function-expression property
  check('an object concise method keeps its type parameters',
    astPrint('const o = { m<T>(x: T): T { return x; } };').code, 'const o = {\n\tm<T>(x: T): T {\n\t\treturn x;\n\t}\n};');
  check('an async generator concise method keeps its type parameters',
    astPrint('const o = { async *g<T>(x: T) { yield x; } };').code, 'const o = {\n\tasync *g<T>(x: T) {\n\t\tyield x;\n\t}\n};');
  check('a computed generic concise method degrades to a typed function property',
    astPrint('const o = { [k]<T>(x: T): T { return x; } };').code, 'const o = {\n\t[k]: function <T>(x: T): T {\n\t\treturn x;\n\t}\n};');
  check('a postfix JSDoc-nullable annotation prints', astPrint('function f(a: string?) {}').code, 'function f(a: string?) {}');
  check('hashbang is re-emitted', astPrint('#!/usr/bin/env node\nlet x = 1;').code, '#!/usr/bin/env node\nlet x = 1;');
  check('jsx prints under the tsx language',
    astPrint('const el = <div a={1}>hi</div>;', 'input.tsx').code, 'const el = <div a={1}>hi</div>;');
}
checkAstPrintQuirks();

// --- ast-builders: the minted literal's spelling ---

// what the PRINTER makes of a literal this engine minted. `raw` is its preferred spelling and
// only a string needs one from us (esrap quotes with `'`, babel prints `"`); every other value
// it derives itself, and correctly - which is why the builder must NOT hand it a `JSON.stringify`
// answer: that throws on a bigint and returns `null` for NaN / Infinity, a different VALUE
function checkMintedLiteralSpelling() {
  function printed(value) {
    const program = { type: 'Program', body: [mintStatement(mintLiteral(value))], sourceType: 'module' };
    return printProgram({ program, comments: [], source: '', id: 'input.mjs' }).code.trim();
  }
  check('a minted string keeps babel\'s double quotes', printed('a\'b'), '"a\'b";');
  check('a double quote inside it escapes', printed('a"b'), '"a\\"b";');
  check('null prints null', printed(null), 'null;');
  check('true prints true', printed(true), 'true;');
  check('a number prints itself', printed(0), '0;');
  // the three the stringified `raw` used to get wrong: a bigint THREW at mint time, and both
  // non-finite numbers printed `null` - a literal spelling a value the node does not hold
  check('a bigint prints its own suffix', printed(1n), '1n;');
  check('NaN prints NaN, not null', printed(NaN), 'NaN;');
  check('Infinity prints Infinity, not null', printed(Infinity), 'Infinity;');
  // the mint gate: a parser never puts a negative in a `Literal`, and `-0` both printers
  // would derive from the value as `0` - a wrong VALUE; minting one throws instead
  function mintThrows(value) {
    try {
      mintLiteral(value);
      return false;
    } catch {
      return true;
    }
  }
  check('a negative number is refused at mint', mintThrows(-5), true);
  check('minus zero is refused at mint', mintThrows(-0), true);
  check('negative Infinity is refused at mint', mintThrows(-Infinity), true);
  check('a negative bigint is refused at mint', mintThrows(-1n), true);
  check('undefined is refused at mint', mintThrows(undefined), true);
  check('an object is refused at mint', mintThrows({}), true);
  check('NaN stays mintable', mintThrows(NaN), false);
  check('a fraction stays mintable', mintThrows(1.5), false);
}
checkMintedLiteralSpelling();

// --- ast-print: sourcemap contract ---

function checkAstPrintMapContract() {
  const plain = astPrint('let x = 1;', 'dir/app.vue?vue&type=script');
  check('map sources keep the full id (SFC sub-block identity)', JSON.stringify(plain.map.sources), '["dir/app.vue?vue&type=script"]');
  check('map file is the query-stripped basename', plain.map.file, 'app.vue');
  check('content rides by default', JSON.stringify(plain.map.sourcesContent), '["let x = 1;"]');
  check('includeContent: false drops the content', JSON.stringify(astPrint('let x = 1;', 'input.ts', { includeContent: false }).map.sourcesContent), '[null]');
  const banged = astPrint('#!/usr/bin/env node\nlet x = 1;');
  check('hashbang shifts the mappings one generated line down', banged.map.mappings.startsWith(';'), true);
  const traced = new TraceMap({ ...banged.map, version: 3 });
  check('a mapped token resolves through the hashbang shift',
    JSON.stringify(originalPositionFor(traced, { line: 2, column: 4 }).line), '2');
}
checkAstPrintMapContract();

// --- the retired engine option ---

// the flag died with the text layer (phase 5): the AST engine is the only engine, and a
// leftover `engine` option in a user config surfaces as the ordinary unknown-option error
// instead of silently selecting nothing
function checkEngineOptionRetired() {
  function creationError(options) {
    try {
      createPlugin(options);
      return null;
    } catch (error) {
      return error.message;
    }
  }
  check('a leftover engine option is rejected as unknown',
    creationError({ method: 'usage-pure', engine: 'ast' }),
    '[core-js] Unknown plugin option: engine');
  const viaDefault = createPlugin({ method: 'usage-pure' }).transform('[1].at(0);', 'input.mjs')?.code;
  check('the engine-less default transforms usage-pure',
    viaDefault?.includes('@core-js/pure/'), true);
  // the checks the option section carried that are ENGINE behavior, not flag behavior
  const entryOptions = { method: 'entry-global', version: '4.0', targets: { ie: 11 } };
  const astEntry = createPlugin(entryOptions).transform("import 'core-js/actual/array/from';\nuse();", 'input.mjs');
  check('entry-global transforms', astEntry !== null && astEntry.code.includes('import "core-js/modules/es.array.from";'), true);
  check('the entry output drops the entry statement', astEntry.code.includes('core-js/actual'), false);
  check('entry-global abstains on entry-less files',
    createPlugin(entryOptions).transform('use();', 'input.mjs'), null);
  // a module-import input re-expands to itself: babel reprints it, and this engine follows
  check('a module-import re-transform re-emits the same imports (babel parity)',
    createPlugin(entryOptions).transform(astEntry.code, 'input.mjs')?.code.includes('import "core-js/modules/es.array.from";'), true);
  check('require-style entries render',
    createPlugin({ ...entryOptions, importStyle: 'require' })
      .transform("require('core-js/actual/array/from');", 'input.mjs').code.startsWith('require("core-js/modules/'), true);
  const usageOptions = { method: 'usage-global', version: '4.0', targets: { ie: 11 } };
  const astUsage = createPlugin(usageOptions)
    .transform('import "core-js/modules/es.array.at";\narr.at(0);', 'input.mjs');
  check('usage-global transforms', astUsage?.code.startsWith('import "core-js/modules/es.array.at";'), true);
  check('the swept user module import is not doubled', astUsage.code.match(/es\.array\.at/g).length, 1);
  check('instantiation normalizes before an optional call',
    createPlugin(usageOptions).transform('const r = ((f)<string>)?.(1);\narr.at(0);', 'input.ts')
      .code.includes('f?.<string>(1)'), true);
  // standalone post (no pre snapshot) transforms like the single pass at the plugin layer
  check('phased usage-global transforms at the plugin layer',
    createPlugin(usageOptions).transform('arr.at(0);', 'input.mjs', 'post')
      ?.code.includes('import "core-js/modules/es.array.at";'), true);
}
checkEngineOptionRetired();

// --- ast-engine: walker mutation contract ---

// the emitters' port recipes lean on these traversal semantics; a dependency bump that
// flips one must fail here, not deep inside an emitter
function checkWalkerMutationContract() {
  function names(source, visitors) {
    // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
    const ast = parseSync('t.mjs', source, { sourceType: 'module' }).program;
    const visited = [];
    traverse(ast, visitors(visited));
    return visited.join(',');
  }
  check('replaceWith re-visits the replacement', names('a; b;', visited => ({
    Identifier(path) {
      visited.push(path.node.name);
      if (path.node.name === 'a') path.replaceWith(builders.identifier('z'));
    },
  })), 'a,z,b');
  check('replaceWith visits the replacement subtree', names('a;', visited => ({
    Identifier(path) {
      visited.push(path.node.name);
      if (path.node.name === 'a') path.replaceWith(builders.callExpression(builders.identifier('f'), [builders.identifier('g')]));
    },
  })), 'a,f,g');
  check('insertBefore / insertAfter products are visited', names('a; b;', visited => ({
    ExpressionStatement(path) {
      visited.push(path.node.expression.name);
      if (path.node.expression.name === 'a') {
        path.insertBefore([builders.expressionStatement(builders.identifier('pre'))]);
        path.insertAfter([builders.expressionStatement(builders.identifier('post'))]);
      }
    },
  })), 'a,pre,post,b');
  check('remove keeps later siblings in the walk', names('a; b; c;', visited => ({
    ExpressionStatement(path) {
      visited.push(path.node.expression.name);
      if (path.node.expression.name === 'a') path.remove();
    },
  })), 'a,b,c');
  check('unshift/pushContainer products are visited', names('a;', visited => ({
    Program(path) {
      path.unshiftContainer('body', [builders.expressionStatement(builders.identifier('head'))]);
      path.pushContainer('body', [builders.expressionStatement(builders.identifier('tail'))]);
    },
    ExpressionStatement(path) { visited.push(path.node.expression.name); },
  })), 'head,a,tail');
  check('skip prunes the subtree', names('f(g(h));', visited => ({
    CallExpression(path) {
      visited.push(path.node.callee.name);
      if (path.node.callee.name === 'f') path.skip();
    },
  })), 'f');
  // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
  const scoped = parseSync('t.mjs', 'use(x);', { sourceType: 'module' }).program;
  let bindingBeforeCrawl = null;
  let bindingAfterCrawl = null;
  traverse(scoped, {
    $: { scope: true },
    Program(path) {
      path.unshiftContainer('body', [builders.variableDeclaration('const', [builders.variableDeclarator(builders.identifier('x'), builders.literal(1))])]);
      bindingBeforeCrawl = !!path.scope.getBinding('x');
      path.scope.crawl();
      bindingAfterCrawl = !!path.scope.getBinding('x');
    },
  });
  check('an inserted declaration binds only after scope.crawl', `${ bindingBeforeCrawl },${ bindingAfterCrawl }`, 'false,true');
}
checkWalkerMutationContract();

const { passed, failed } = counts;
echo`\nPassed: ${ green(passed) }, Failed: ${ failed ? red(failed) : green(failed) }`;
if (failed) throw new Error('Some tests have failed');

// --- injectionFusesLeft (shared left-boundary fusion predicate) ---
// hazard-start firstChar fuses leftward into a value / postfix-update / `}` prev, but NOT into a `;`
// terminator or a statement-list opener (`{` block, `:` switch-case / label - the injection is the first
// statement of the list, so no prev value exists to fuse with)
check('injectionFusesLeft/+ after a value (call close) fuses', injectionFusesLeft('+', ')'), true);
check('injectionFusesLeft// after a value fuses', injectionFusesLeft('/', ']'), true);
check('injectionFusesLeft/( after postfix-update tail fuses', injectionFusesLeft('(', '+'), true);
check('injectionFusesLeft/` after a fn-or-class-expr } fuses', injectionFusesLeft('`', '}'), true);
check('injectionFusesLeft/+ after ; terminator is safe', injectionFusesLeft('+', ';'), false);
check('injectionFusesLeft/+ after { block-open is safe', injectionFusesLeft('+', '{'), false);
check('injectionFusesLeft/( after : case-label is safe', injectionFusesLeft('(', ':'), false);
// identifier / numeric / unary-bang starts ASI-split on their own - never in the hazard set
check('injectionFusesLeft/identifier start never fuses', injectionFusesLeft('x', ')'), false);
check('injectionFusesLeft/bang start never fuses', injectionFusesLeft('!', ')'), false);
// the prev alphabet is the open one: a TS non-null `!`, an instantiation's `>`, a `?.`'s `.` all end
// a statement a `(` continues - the deny-list reads them as fusing, where an allow-list of value
// ends was caught short
check('injectionFusesLeft/( after TS non-null ! fuses', injectionFusesLeft('(', '!'), true);
check('injectionFusesLeft/( after instantiation > fuses', injectionFusesLeft('(', '>'), true);
check('injectionFusesLeft/( after optional-call . fuses', injectionFusesLeft('(', '.'), true);

// --- phase: 'pre+post' bundler-specific downgrade (PRE_POST_UNSAFE_BUNDLERS) ---
// bun and esbuild can't honor sibling pre-then-post ordering (bun drops `enforce`; esbuild's
// first-wins onLoad runs only one of two sibling instances), so an explicit `phase: 'pre+post'`
// downgrades to a single 'post' stage with a one-time warn. vite / webpack / farm keep both
// stages (their enforce-to-priority mapping interleaves siblings correctly)
function checkPrePostBundlerDowngrade() {
  const opts = { method: 'usage-global', version: '4.0', phase: 'pre+post' };
  const origWarn = console.warn;
  const warned = [];
  console.warn = (...a) => warned.push(a.join(' '));
  try {
    for (const fw of ['esbuild', 'bun']) {
      const subs = unplugin.raw({ ...opts }, { framework: fw });
      check(`phase pre+post downgrades to one stage on ${ fw }`, subs.length, 1);
      check(`phase pre+post downgraded stage runs at post on ${ fw }`, subs[0].enforce, 'post');
    }
    // membership = EVERY known adapter minus the unsafe pair - a newly added safe bundler
    // must keep both stages by default, and the stages must run pre-THEN-post (the enforce
    // pair is the ordering contract the downgrade exists to protect)
    const KNOWN_BUNDLERS = ['vite', 'webpack', 'rollup', 'esbuild', 'rspack', 'rsbuild', 'rolldown', 'farm', 'bun'];
    const PRE_POST_UNSAFE = new Set(['bun', 'esbuild']);
    const keepBothBundlers = KNOWN_BUNDLERS.filter(name => !PRE_POST_UNSAFE.has(name));
    for (const fw of keepBothBundlers) {
      const subs = unplugin.raw({ ...opts }, { framework: fw });
      check(`phase pre+post keeps both stages on ${ fw }`, subs.length, 2);
      check(`phase pre+post first stage enforces 'pre' on ${ fw }`, subs[0].enforce, 'pre');
      check(`phase pre+post second stage enforces 'post' on ${ fw }`, subs[1].enforce, 'post');
    }
  } finally {
    console.warn = origWarn;
  }
  check('phase pre+post downgrade warns once per unsafe bundler', warned.filter(w => /pre\+post/.test(w)).length, 2);
}
checkPrePostBundlerDowngrade();

// single-stage enforce values: the default phase runs at 'pre'; an explicit standalone `phase: 'post'`
// runs at 'post'; `phase: 'pre'` stays 'pre'. only the pre+post downgrade case (above) had coverage
function checkSingleStageEnforce() {
  for (const fw of ['vite', 'webpack']) {
    const def = unplugin.raw({ method: 'usage-global', version: '4.0' }, { framework: fw });
    check(`default phase is a single stage on ${ fw }`, def.length, 1);
    check(`default phase enforce is 'pre' on ${ fw }`, def[0].enforce, 'pre');
    const post = unplugin.raw({ method: 'usage-global', version: '4.0', phase: 'post' }, { framework: fw });
    check(`phase post is a single stage on ${ fw }`, post.length, 1);
    check(`phase post enforce is 'post' on ${ fw }`, post[0].enforce, 'post');
    const pre = unplugin.raw({ method: 'usage-global', version: '4.0', phase: 'pre' }, { framework: fw });
    check(`phase pre enforce is 'pre' on ${ fw }`, pre[0].enforce, 'pre');
  }
}
checkSingleStageEnforce();

// the GENERAL invalid-phase throw (non-entry-global): a bad string is quoted, a non-string
// value reports its `typeof` (the formatter deliberately avoids JSON.stringify - BigInt /
// Symbol / circular options would blow up the diagnostic itself). the entry-global-specific
// gate has its own test; this covers the shared VALID_PHASES gate
function checkGeneralInvalidPhaseThrow() {
  function throwMessage(phase) {
    try {
      unplugin.raw({ method: 'usage-global', version: '4.0', phase }, { framework: 'vite' });
    } catch (error) {
      return error.message;
    }
    return null;
  }
  check('invalid phase string throws quoted', /invalid `phase` option: 'lol'/.test(throwMessage('lol')), true);
  check('invalid phase number reports typeof', /invalid `phase` option: number/.test(throwMessage(42)), true);
  check('invalid phase symbol reports typeof', /invalid `phase` option: symbol/.test(throwMessage(Symbol('x'))), true);
  check('invalid phase bigint reports typeof', /invalid `phase` option: bigint/.test(throwMessage(1n)), true);
  check('null phase falls back to default (no throw)', throwMessage(null), null);
}
checkGeneralInvalidPhaseThrow();

// --- withoutPhantomDeclarationViolations ---
// estree-toolkit FALSELY records a DECLARATION (over-hoisted `namespace N {}` twin, for-init self)
// as a constant-violation; the filter drops exactly those while PRESERVING real reassignment paths
// (the resolver's `findPrecedingBlockAssignment` consumes them) and the binding identity when there
// is nothing to drop. broadening this to a wholesale recompute fed nodes to a path-consumer and
// reordered every reassigned binding, so the narrow predicate + path-preservation are load-bearing
function checkPhantomViolationFilter() {
  function bindingFor(src, name) {
    let result = null;
    // eslint-disable-next-line node/no-sync -- oxc-parser sync-only API
    traverse(parseSync('unit.ts', src, { lang: 'ts' }).program, {
      $: { scope: true },
      Program(path) { result = path.scope.getBinding(name); },
    });
    return result;
  }
  function bindingInFn(src, fnName, name) {
    let result = null;
    // eslint-disable-next-line node/no-sync -- oxc-parser sync-only API
    traverse(parseSync('unit.ts', src, { lang: 'ts' }).program, {
      $: { scope: true },
      FunctionDeclaration(path) { if (path.node.id?.name === fnName) result = path.scope.getBinding(name); },
    });
    return result;
  }
  function filteredCount(src, name) {
    return withoutPhantomDeclarationViolations(bindingFor(src, name)).constantViolations.length;
  }

  check('phantom namespace-twin declaration violation dropped',
    filteredCount('var x = ({}); namespace N { export var x = [1, 2, 3]; } x.flat();', 'x'), 0);
  check('real assignment violation preserved',
    filteredCount('let x = 1; x = 2; x;', 'x'), 1);
  check('var redeclaration records no violation (unchanged)',
    filteredCount('var x = 1; { var x = 2; } x;', 'x'), 0);
  // every over-hoisted namespace twin is phantom regardless of declaration kind (var/const/function/class)
  check('const namespace-twin declaration violation dropped',
    filteredCount('const K = 1; namespace N { const K = 2; } K;', 'K'), 0);
  check('function namespace-twin declaration violation dropped',
    filteredCount('function F() {} namespace N { function F() {} } F();', 'F'), 0);
  check('class namespace-twin declaration violation dropped',
    filteredCount('class C {} namespace N { class C {} } new C();', 'C'), 0);
  // a same-scope function/class redeclaration is a REAL shadow (last wins), NOT phantom - must be KEPT
  const redecl = bindingInFn('function outer() { function F() { return 1; } function F() { return 2; } F(); }', 'outer', 'F');
  check('same-scope function redeclaration is recorded as a violation', redecl.constantViolations.length, 1);
  check('same-scope function redeclaration violation kept (not phantom)',
    withoutPhantomDeclarationViolations(redecl).constantViolations.length, 1);

  // identity: nothing to drop returns the SAME binding object (no needless wrapping)
  const realBinding = bindingFor('let x = 1; x = 2; x;', 'x');
  check('no-phantom binding returned by identity', withoutPhantomDeclarationViolations(realBinding) === realBinding, true);
  // path-preserving: the scrubbed wrapper keeps the original binding.path (findPrecedingBlockAssignment reads it)
  const twinBinding = bindingFor('var x = ({}); namespace N { export var x = [1, 2, 3]; } x.flat();', 'x');
  const scrubbed = withoutPhantomDeclarationViolations(twinBinding);
  check('scrubbed wrapper preserves binding.path identity', scrubbed.path === twinBinding.path, true);
  // a resolver consumer re-spreads the binding (`{ ...binding, constantViolations: combined }`),
  // so own props (path/scope) must survive object-spread - not live on a prototype
  check('scrubbed wrapper survives object-spread (path own-enumerable)', { ...scrubbed }.path === twinBinding.path, true);
  // `constant` is a prototype getter on the estree Binding (not spread-copyable); the wrapper
  // carries it explicitly, reflecting the filtered list (all-phantom -> effectively constant)
  check('scrubbed wrapper exposes constant from filtered violations', scrubbed.constant, true);
}
checkPhantomViolationFilter();
// a REFUSED alias's member reads stay RAW across passes: pre+post must not re-detect the
// pre-transformed swap (`M = _Map`) into a narrow on the later pass
async function checkRefusedAliasRawPassIdempotent() {
  const src = 'function t(c) { let M; if (c) ({ Map: M } = globalThis); '
    + 'try { return typeof M.groupBy; } catch (e) { return "T"; } }\n'
    + 'function u(c) { let P; if (c) ({ Promise: P } = globalThis); return P.try(() => 1); }\n'
    // the DESTRUCTURE channel of the same guard, and the write-ENUMERATED hint that feeds it (`M2 =
    // globalThis.Map` registers no alias, so the binding's own writes are the hint): both render the
    // guard on the first pass, and the second must not guard the raw branch it left behind
    + 'function d(c) { let M2; if (c) M2 = globalThis.Map; '
    + 'try { const { groupBy: g } = M2; return typeof g; } catch (e) { return "T"; } }\n'
    + 'export const r = [t(true), t(false), d(true), d(false)];\n';
  const plugins = unplugin.rollup({ method: 'usage-pure', version: '4.0', targets: { ie: 11 }, phase: 'pre+post' });
  let code = src;
  for (const p of plugins) {
    const transform = typeof p.transform === 'function' ? p.transform : p.transform?.handler;
    const out = await transform.call({ error(e) { throw new Error(e); } }, code, '/x/probe.mjs');
    if (out?.code) code = out.code;
  }
  // the refused reads get the RUNTIME ctor guard whose raw branch keeps the original member
  // (a callee keeps `this` via `.bind`); the second pass must not re-guard the guard's own
  // raw branch - exactly one guard per read survives pre+post
  check('refused alias guard keeps the raw member branch', /M\.groupBy/.test(code), true);
  check('refused alias callee guard binds the raw branch', /P\.try\.bind\(P\)/.test(code), true);
  check('member guard emitted exactly once across pre+post', code.split('M === _Map ?').length - 1, 1);
  check('callee guard emitted exactly once across pre+post', code.split('P === _Promise ?').length - 1, 1);
  check('destructure guard emitted exactly once across pre+post', code.split('M2 === _Map ?').length - 1, 1);
  check('destructure guard keeps the raw member branch', /M2\.groupBy/.test(code), true);
}
await checkRefusedAliasRawPassIdempotent();

// usage-global indirect-require removal BODY: the fixture comparator for usage-global is
// imports-only, so the extracted SE-prefix statements are never text-validated there - pin
// them here. each removed `(se, require)('core-js/...')` leaves exactly its prefix as a
// bare statement in source order (incl. the optional-call and outer-comma shapes), the
// require call itself is gone, and a polyfillable usage INSIDE a kept prefix stays visited
function checkUsageGlobalIndirectRequirePrefixBody() {
  const plugin = createPlugin({ method: 'usage-global', version: '4.0', targets: { ie: 11 } });
  const source = [
    'let loads = 0;',
    '(loads++, require)("core-js/modules/es.array.from");',
    'let arr = [1];',
    '(arr.includes(1), require)("core-js/modules/es.array.includes");',
    'let opt = 0;',
    '(opt++, require)?.("core-js/modules/es.array.from");',
    'let outer = 0;',
    '0, (outer++, require)("core-js/modules/es.array.of");',
    'Array.from([1]);',
  ].join('\n');
  const code = plugin.transform(source, '/indirect-require-prefix.js')?.code ?? '';
  const body = code.split('\n').filter(line => !line.startsWith('import ')).join('\n');
  check('indirect-require body/prefixes survive as statements in source order',
    /let loads = 0;\s*loads\+\+;\s*let arr = \[1\];\s*arr\.includes\(1\);\s*let opt = 0;\s*opt\+\+;\s*let outer = 0;\s*outer\+\+;\s*Array\.from\(\[1\]\);/.test(body), true);
  check('indirect-require body/no require call survives', /require\(/.test(code), false);
  check('indirect-require body/kept-prefix usage stays visited', /es\.array\.includes/.test(code), true);
}
checkUsageGlobalIndirectRequirePrefixBody();

// the phantom-violation filter returns ONE stable stand-in per native binding: identity
// consumers (per-binding lookup caches, closure Sets, classification Maps) key by object
// identity, and a fresh copy per call silently dropped their recorded writes
function checkPhantomFilterIdentity() {
  const src = 'for (let o = { data: [1, 2] }; cond;) { o.data = "s"; o.data.at(0); break; }';
  // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
  const parsed = parseSync('/pfi.js', src, { sourceType: 'module' });
  let binding = null;
  traverse(parsed.program, {
    $: { scope: true },
    Identifier(path) {
      if (!binding && path.node.name === 'o') binding = path.scope.getBinding('o');
    },
  });
  check('phantom-filter/binding found with violations', !!binding && !!binding.constantViolations?.length, true);
  const a = withoutPhantomDeclarationViolations(binding);
  const b = withoutPhantomDeclarationViolations(binding);
  check('phantom-filter/stable identity across calls', a === b, true);
}
checkPhantomFilterIdentity();

// --- call arity comes from the AST, not from the sliced argument text ---

// every renderer that joins arguments after a dispatch receiver asks ONE helper for the leading
// `, ` separator, and it must read arity off the call node: a zero-arg list holding a comment or a
// line break slices to a NON-EMPTY string, and a separator ahead of it emits `.call(recv, )` - a
// trailing comma, ES2017, which takes the whole module out on the ES5 baseline `usage-pure` targets.
// stated as an invariant rather than an expected spelling: whatever a renderer prints for `m()`, it
// must print for `m(/* c */)` too, so a new renderer joining the text raw fails here without anyone
// having to predict its output
function checkCallArityFromAst() {
  const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
  const PRELUDE = 'const a = [[1]];\nconst o = { m: () => [[1]] };\nconst p = { m: () => ({ x: [[1]] }) };\n';
  // `%s` is the argument list, and a row carries one per separator it renders. one row per renderer -
  // the standalone dispatch and its paren-lookup / optional-call spellings, the guard body that
  // invokes a memoized non-polyfilled callee (bare and with a hop tail), the threaded hops, the
  // combined chain's inner and outer slots, the split emit of an inherited static - plus a second
  // row wherever one renderer owns two spellings of the same primitive, as the split emit does
  const SHAPES = [
    ['standalone dispatch', 'export const r = a.flat(%s);'],
    ['paren-lookup callee', 'export const r = (a?.at)(%s);'],
    ['optional call', 'export const r = a.includes?.(%s);'],
    ['guard body over a memoized callee', 'export const r = o.m?.(%s).flat();'],
    ['guard body with a hop tail', 'export const r = p.m?.(%s).x.flat();'],
    ['threaded hops', 'export const r = a.flat(%s).flat(%s);'],
    ['combined chain, inner slot', 'export const r = a.flat?.(%s).at(0);'],
    ['combined chain, outer slot', 'export const r = a.flat?.(%s)?.at(%s);'],
    ['inherited static split', 'class A extends Array { static f() { return super.from(%s); } }\nexport const r = A.f();'],
    // `this` in a static context resolves through the same inherited-static machinery, so the split
    // emit owns both spellings of the primitive - the twin is what keeps the domain enumerated
    ['inherited static via this', 'class A extends Array { static f() { return this.of(%s); } }\nexport const r = A.f();'],
  ];
  // trivia the parser drops but a source slice keeps
  const TRIVIA = ['\n', ' ', '/* c */', '/* c */\n', '// c\n', '\t/* c */ '];
  function emit(body) {
    return createPlugin(OPTIONS).transform(`${ PRELUDE }${ body }\n`, '/p.mjs')?.code ?? body;
  }
  for (const [label, template] of SHAPES) {
    const slots = template.split('%s').length - 1;
    const zeroArg = emit(template.replaceAll('%s', ''));
    for (const trivia of TRIVIA) {
      // comments and layout may legitimately ride along in the emitted text; the token stream may
      // not move. the comparator's own lexer decides what "token stream" means here - a hand-rolled
      // comment stripper next to it drifted from that answer on the first comment holding a `*`
      check(`arity/${ label } is unmoved by ${ JSON.stringify(trivia) }`,
        collapseWhitespace(emit(template.replaceAll('%s', trivia))), collapseWhitespace(zeroArg));
    }
    // the same rows with a REAL argument, counted rather than matched: one separator per filled slot.
    // this is both the negative (arguments still ride, and ride behind the separator) and the
    // vacuity guard - a row the resolver declines to rewrite renders no separator and lands on 0
    check(`arity/${ label } renders one separator per argument`,
      collapseWhitespace(emit(template.replaceAll('%s', '/* n */ 7'))).split(',7').length - 1, slots);
  }
  // the slice is taken by OFFSET out of the original source, and the shapes below are the ones that
  // move offsets away from a naive character count - a CRLF pair, a leading BOM, an astral character
  // ahead of (and inside) the list. the arity gate has to hold there too, or the separator comes back
  // on exactly the sources whose offsets are hardest to reason about
  const OFFSET_SHAPES = [
    ['CRLF', 'const a = [[1]];\r\nexport const r = a.flat(\r\n);\r\n'],
    ['CRLF inside a comment argument', 'const a = [[1]];\r\nexport const r = a.flat(/* one\r\ntwo */);\r\n'],
    ['BOM', '﻿const a = [[1]];\nexport const r = a.flat(/* c */);\n'],
    ['astral ahead of the call', 'const s = "\u{1F600}\u{1F600}";\nconst a = [[1]];\nexport const r = s.length + a.flat(/* c */).length;'],
    ['astral inside the trivia', 'const a = [[1]];\nexport const r = a.flat(/* \u{1F600} */);'],
  ];
  // both assertions read the emitted text, and a character class spanning the argument slot is the
  // wrong tool for it - an argument may itself carry parens (`_ref = helper(a).call(a)`), so such a
  // pattern answers about the SHAPE of the receiver rather than about the separator. ask the two
  // questions directly instead: does a list end in a comma, and did a dispatch happen at all
  function hasDanglingSeparator(out) {
    return collapseWhitespace(out).includes(',)');
  }
  function dispatches(out, helper) {
    return out.includes(`${ helper }(`) && out.includes('.call(');
  }
  // both predicates answer with a boolean, so a negative row of theirs is only worth as much as the
  // proof that they light up at all - pin the fire condition on literals next to the rows using them
  check('arity/the dangling-separator predicate fires', hasDanglingSeparator('_x(a).call(a, );'), true);
  check('arity/the dispatch predicate fires', dispatches('_flatMaybeArray(a).call(a);', '_flatMaybeArray'), true);
  check('arity/the dispatch predicate stays quiet on untransformed source', dispatches('a.flat();', '_flatMaybeArray'), false);
  for (const [label, source] of OFFSET_SHAPES) {
    const out = createPlugin(OPTIONS).transform(source, '/p.mjs')?.code ?? source;
    check(`arity/no separator survives ${ label }`, hasDanglingSeparator(out), false);
    check(`arity/${ label } still dispatches`, dispatches(out, '_flatMaybeArray'), true);
  }
  // the post pass re-reads the emitter's OWN output, where the trivia the arity gate ignored is gone;
  // a cadence that re-derived arity from that text would drift from the single-pass result
  const CADENCE_SRC = 'const a = [[1]];\nexport const r = a.flat(/* c */).at(/* d */);\n';
  const single = createPlugin(OPTIONS).transform(CADENCE_SRC, '/p.mjs')?.code ?? CADENCE_SRC;
  // the cadence rows below compare against `single`, so they would agree vacuously on a source
  // nothing rewrote - pin that the reference emission is a real one first
  check('arity/the cadence reference is a real emission', dispatches(single, '_atMaybeArray'), true);
  for (const passes of [['pre'], ['post'], ['pre', 'post'], ['pre', 'post', 'pre', 'post']]) {
    let code = CADENCE_SRC;
    for (const pass of passes) code = createPlugin(OPTIONS).transform(code, '/p.mjs', pass)?.code ?? code;
    check(`arity/[${ passes.join('->') }] matches the single-pass emission`, code, single);
  }
}
checkCallArityFromAst();

// the bare-slot reclaim proves the bare prefix free before handing the allocation on. it must not
// be probed AGAIN by the allocator it hands to - in the babel emitter that probe is a whole
// scope-chain lookup, so a duplicate is a real per-allocation cost. counted through
// `isNameTaken`, the single funnel every probe passes through
function checkSingleBareProbePerAllocation() {
  function countingInjector() {
    const inj = new ImportInjector({ mode: 'actual', pkg: 'x' });
    const probes = [];
    const original = inj.isNameTaken.bind(inj);
    inj.isNameTaken = name => {
      probes.push(name);
      return original(name);
    };
    return { inj, probes };
  }
  // reclaim path: cache seeded past bare by an orphan, bare itself free -> exactly one bare probe
  const reclaim = countingInjector();
  reclaim.inj.adoptOrphanRefs(['_ref2']);
  check('probe/reclaim returns bare', reclaim.inj.generateLocalRef(), '_ref');
  check('probe/reclaim probes bare once', reclaim.probes.filter(name => name === '_ref').length, 1);
  // bare taken as well: the reclaim probe fails and the allocator resumes from the cache, so bare
  // is still asked exactly once and the answer skips past the orphan
  const taken = countingInjector();
  taken.inj.adoptOrphanRefs(['_ref', '_ref2']);
  check('probe/bare-taken skips reclaim', taken.inj.generateLocalRef(), '_ref3');
  check('probe/bare-taken probes bare once', taken.probes.filter(name => name === '_ref').length, 1);
  // cold cache: no reclaim decision to make, the allocator's own try-bare-first is the only probe
  const cold = countingInjector();
  check('probe/cold cache returns bare', cold.inj.generateLocalRef(), '_ref');
  check('probe/cold cache probes bare once', cold.probes.filter(name => name === '_ref').length, 1);
}
checkSingleBareProbePerAllocation();

// `generateUnusedName` is a PROTOTYPE method; the cascade path patches it for the duration of one
// plan walk and restores it in `finally`. the restored value has to be the method itself, not a
// bound copy of it - a bound copy is an own property, so each walk would wrap the previous wrapper
// and the chain would grow monotonically for the life of the file
function checkUnusedNameRestoreIdentity() {
  const inj = new ImportInjector({ mode: 'actual', pkg: 'x' });
  const prototypeMethod = Object.getPrototypeOf(inj).generateUnusedName
    ?? Object.getPrototypeOf(Object.getPrototypeOf(inj)).generateUnusedName;
  // wrap `generateUnusedName` the way the emitter's own tracking wrapper does
  function withTracked(target, fn) {
    const orig = inj.generateUnusedName;
    inj.generateUnusedName = () => {
      const name = orig.call(inj);
      target.push(name);
      return name;
    };
    try {
      return fn();
    } finally {
      inj.generateUnusedName = orig;
    }
  }
  check('tracked-unused/prototype method exists', typeof prototypeMethod, 'function');
  const names = [];
  withTracked(names, () => inj.generateUnusedName());
  check('tracked-unused/restores the prototype method', inj.generateUnusedName === prototypeMethod, true);
  // a second walk must restore to the SAME function object - reference equality is what rules the
  // chain out; a bound copy would differ here even though the names still come out right
  const restoredAfterFirst = inj.generateUnusedName;
  withTracked(names, () => inj.generateUnusedName());
  check('tracked-unused/restore is idempotent across walks', inj.generateUnusedName === restoredAfterFirst, true);
  // nesting still composes: the inner walk restores the OUTER wrapper, so the outer keeps tracking
  const outer = [];
  const inner = [];
  withTracked(outer, () => {
    withTracked(inner, () => inj.generateUnusedName());
    inj.generateUnusedName();
  });
  check('tracked-unused/inner walk collects its own name', inner.length, 1);
  check('tracked-unused/outer walk sees both names', outer.length, 2);
  check('tracked-unused/prototype method restored after nesting', inj.generateUnusedName === prototypeMethod, true);
  // and the names themselves stay unique and well-formed through all of it
  check('tracked-unused/names are distinct', new Set([...names, ...outer]).size, names.length + outer.length);
}
checkUnusedNameRestoreIdentity();

// shared probe for the two param-pattern tables below: transform, then report whether the module
// the row is keyed on came out. A throw is reported as its message rather than as `false` so a
// crawler abort is distinguishable from a silently dropped binding
function injectsModule(source, module) {
  try {
    const result = createPlugin({ method: 'usage-global', version: '4.0', targets: { ie: 11 } })
      .transform(source, 'input.ts');
    return new RegExp(`es\\.${ module }`).test(String(result?.code ?? ''));
  } catch (error) {
    return `threw: ${ error.message.split('\n', 1)[0] }`;
  }
}
