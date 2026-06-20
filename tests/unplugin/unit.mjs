import { parseSync } from 'oxc-parser';
import { traverse } from 'estree-toolkit';
import MagicString from 'magic-string';
import { TraceMap, originalPositionFor } from '@jridgewell/trace-mapping';
import unplugin, { shouldTransform } from '../../packages/core-js-unplugin/index.js';
import { createPolyfillContext, entryToGlobalHint } from '../../packages/core-js-polyfill-provider/index.js';
import { ORPHAN_REF_PATTERN } from '../../packages/core-js-polyfill-provider/injector-base.js';
import { collectMutationPrePass, createEstreeAdapter, withoutPhantomDeclarationViolations } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { patternToRegExp } from '../../packages/core-js-polyfill-provider/helpers/pattern-matching.js';
import { tagError } from '../../packages/core-js-polyfill-provider/helpers/error-tag.js';
import TransformQueue, {
  deoptionalizeNeedle,
  deoptionalizeNeedleAtPositions,
  hasIdentifierBoundary,
  replaceNthOccurrence,
} from '../../packages/core-js-unplugin/internals/transform-queue.js';
import ImportInjector from '../../packages/core-js-unplugin/internals/import-injector.js';
import createPlugin, {
  formatLabelLocation,
  formatParseErrorForThrow,
  formatParseErrorForWarn,
  formatParseErrorMessage,
} from '../../packages/core-js-unplugin/internals/plugin.js';
import SnapshotCache from '../../packages/core-js-unplugin/internals/snapshot-cache.js';
import { createTopLevelStatementRemover } from '../../packages/core-js-unplugin/internals/detect-entry.js';
import {
  canFuseWithOpenParen,
  collectAllBindingNames,
  consumeOneLineEnding,
  directivePrologueEnd,
  hasCoreJSImport,
  isBodylessStatementBody,
  isChunkLoaderBundler,
  isLineTerminator,
  isTopLevelImportLike,
  lastUserImportEnd,
  liftSfcLangSuffix,
  skipBlockComment,
  skipDirectivePrologue,
  skipGap,
  stripLeadingBOMs,
  varScopeAnchor,
  walkAstNodes,
} from '../../packages/core-js-unplugin/internals/plugin-helpers.js';
import {
  isCallee,
  isCalleeWrappedInParens,
  isOutermostOptionalChainMember,
  unwrapNode,
} from '../../packages/core-js-unplugin/internals/emit-utils.js';

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
  // Vue / Astro / Svelte SFC sub-blocks: the real language lives in the `lang=` query token
  // SFC sub-block without `lang=`: Svelte 5 / Vue / Astro default-JS scripts (no lang token)
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
  // `.js`/`.ts` token appears only inside the query — strip query before extension-check
  ['/virtual:foo?output=main.js', false, '.js inside query only'],
  ['/virtual:foo?output=main.ts#bar', false, '.ts inside query only'],
  // SFC with a `.js`-like token in the query: `stripQueryHash` leaves `.vue`, SFC path wins
  ['/src/foo.vue?lang=ts&suffix=.js', true, 'SFC with .js token in query'],
  // SFC + `#hash` suffix (sourcemap line markers, plugin-wrapper artifacts) — `lang=` token
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
  // SFC sub-block + Vite asset query mixing: VITE_ASSET_QUERY_RE wins, the body is
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
  // edge: empty lang= - SFC_LANG_RE rejects (alphabet needs a `[jt]` char), default-JS
  // fallback blocked by the explicit `!id.includes('lang=')` gate, so the id bails entirely.
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
// regex is now shared with shouldTransform via internals/sfc-shapes.js, so every shape that
// shouldTransform admits via the lang= path produces a matching extension here by construction;
// drift between admit and lift can't happen now that both consumers import the same regex
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
  // lang= sandwiched in the middle of the query (between marker and trailing param) - the
  // `[&?]lang=` prefix accepts either `&` or `?` so middle-position matches identically
  ['/src/App.vue?vue&lang=ts&type=script', '/src/App.vue.ts'],
  // multiple lang= tokens - regex stops at the first match (RegExp.exec returns leftmost-
  // first per spec), so `lang=ts&lang=tsx` lifts to `.ts`. authoring this shape is a user
  // bug; the test pins the deterministic resolution
  ['/src/App.vue?vue&lang=ts&lang=tsx', '/src/App.vue.ts'],
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
  // author-cased `lang=TS` etc. - SFC_LANG_RE carries `/i` so admission accepts mixed-case
  // suffixes; lifter matches the same shapes and emits the extension lowercased so oxc-parser's
  // extension-based language inference resolves canonical `.ts` / `.tsx` parsers. without the
  // `/i` flag the lifter returned the bare `.vue` baseId and oxc silently rejected TS-only
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
// method / instance entries: user's pure import is a function, not the class — no hint
check('entryToGlobalHint/static method', entryToGlobalHint('promise/try'), null);
check('entryToGlobalHint/instance subpath', entryToGlobalHint('array/instance/at'), null);
check('entryToGlobalHint/kebab subpath', entryToGlobalHint('array-buffer/is-view'), null);
check('entryToGlobalHint/deep kebab subpath', entryToGlobalHint('typed-array/instance/to-sorted'), null);
// edge cases
check('entryToGlobalHint/leading slash', entryToGlobalHint('/promise'), null);
check('entryToGlobalHint/trailing slash', entryToGlobalHint('promise/'), null);
// numeric-leading / underscore-leading heads can never match a real global identifier —
// filtered up front so downstream consumers don't carry a junk hint through to the lookup
check('entryToGlobalHint/numeric prefix', entryToGlobalHint('42'), null);
check('entryToGlobalHint/underscore prefix', entryToGlobalHint('_foo'), null);
check('entryToGlobalHint/null', entryToGlobalHint(null), null);

// --- TransformQueue ---
// partial overlap between two outer transforms — phase 2 must throw with diagnostic
// instead of letting MagicString.overwrite trip on a generic "already edited" error
function checkPartialOverlapThrows() {
  const code = '0123456789abcdef';
  const ms = new MagicString(code);
  const q = new TransformQueue(code, ms);
  q.add(0, 5, 'AAA');
  q.add(3, 8, 'BBB'); // partial overlap on [3, 5)
  try {
    q.apply();
    counts.failed++;
    echo`${ red('FAIL') } ${ cyan('TransformQueue/partial overlap throws') } :: expected throw`;
  } catch (error) {
    if (/partial overlap/.test(error.message)) counts.passed++;
    else {
      counts.failed++;
      echo`${ red('FAIL') } ${ cyan('TransformQueue/partial overlap throws') } :: got ${ error.message }`;
    }
  }
}
checkPartialOverlapThrows();

// addSplit type-checks both content args upfront. without the upfront guard, the prefix
// `add` succeeds and changes #transforms / #byRange / #sorted state before suffix's `add`
// throws on bad content - leaving an orphan half in the queue
function checkAddSplitContentTypeGuard() {
  const code = '0123456789abcdef';
  const q = new TransformQueue(code, new MagicString(code));
  try {
    q.addSplit(2, 5, 8, 'PREFIX', undefined);
    counts.failed++;
    echo`${ red('FAIL') } ${ cyan('TransformQueue/addSplit suffix type guard') } :: expected throw`;
  } catch (error) {
    /content args must be non-empty strings/.test(error.message) ? counts.passed++ : counts.failed++;
  }
  try {
    q.addSplit(2, 5, 8, 42, 'SUFFIX');
    counts.failed++;
    echo`${ red('FAIL') } ${ cyan('TransformQueue/addSplit prefix type guard') } :: expected throw`;
  } catch (error) {
    /content args must be non-empty strings/.test(error.message) ? counts.passed++ : counts.failed++;
  }
  // empty-string content is a caller bug too - a split represents one logical rewrite emitted
  // as two halves, each must carry non-empty replacement text
  try {
    q.addSplit(2, 5, 8, '', 'SUFFIX');
    counts.failed++;
    echo`${ red('FAIL') } ${ cyan('TransformQueue/addSplit empty prefix guard') } :: expected throw`;
  } catch (error) {
    /content args must be non-empty strings/.test(error.message) ? counts.passed++ : counts.failed++;
  }
  try {
    q.addSplit(2, 5, 8, 'PREFIX', '');
    counts.failed++;
    echo`${ red('FAIL') } ${ cyan('TransformQueue/addSplit empty suffix guard') } :: expected throw`;
  } catch (error) {
    /content args must be non-empty strings/.test(error.message) ? counts.passed++ : counts.failed++;
  }
  // valid call should still work after rejected ones - no orphan state from earlier throws
  q.addSplit(2, 5, 8, 'PREFIX', 'SUFFIX');
  counts.passed++;
}
checkAddSplitContentTypeGuard();

// out-of-bounds ranges are caller bugs - range check catches offset arithmetic slipping
// past source bounds with a specific error instead of letting MagicString produce opaque output
function checkOutOfBoundsThrows() {
  const code = '0123456789';
  const q = new TransformQueue(code, new MagicString(code));
  try {
    q.add(-1, 5, 'X');
    counts.failed++;
  } catch (error) {
    /out of bounds/.test(error.message) ? counts.passed++ : counts.failed++;
  }
  try {
    q.add(5, 20, 'X');
    counts.failed++;
  } catch (error) {
    /out of bounds/.test(error.message) ? counts.passed++ : counts.failed++;
  }
}
checkOutOfBoundsThrows();

// zero-length vs inverted range: distinct diagnostics so the caller sees which misuse fired.
// `start === end` -> caller meant insert(); `start > end` -> inverted offset arithmetic
function checkRangeDiagnosticSplit() {
  const code = '0123456789';
  const q = new TransformQueue(code, new MagicString(code));
  try {
    q.add(5, 5, 'X');
    counts.failed++;
    echo`${ red('FAIL') } ${ cyan('range-diag/zero-length') } :: expected throw`;
  } catch (error) {
    check('range-diag/zero-length names the misuse',
      /zero-length range \[5,5\) - use insert\(\)/.test(error.message), true);
  }
  try {
    q.add(7, 3, 'X');
    counts.failed++;
    echo`${ red('FAIL') } ${ cyan('range-diag/inverted') } :: expected throw`;
  } catch (error) {
    check('range-diag/inverted names the misuse',
      /inverted range \[7,3\) - start must be < end/.test(error.message), true);
  }
}
checkRangeDiagnosticSplit();

// non-integer start/end (NaN / undefined / string) silently pass the `>=` / `<` checks
// because NaN comparisons are always false - integer check surfaces the caller bug upfront
function checkNonIntegerRangeThrows() {
  const code = '0123456789';
  const make = () => new TransformQueue(code, new MagicString(code));
  for (const bad of [[NaN, 5], [undefined, 5], [null, 5], ['5', 8], [5, NaN], [0.5, 5], [5, 5.5]]) {
    try {
      make().add(bad[0], bad[1], 'X');
      counts.failed++;
      echo`${ red('FAIL') } ${ cyan('TransformQueue/integer check') } :: accepted ${ JSON.stringify(bad) }`;
    } catch (error) {
      /must be integers/.test(error.message) ? counts.passed++ : counts.failed++;
    }
  }
}
checkNonIntegerRangeThrows();

// split entries own [start, logicalEnd) logically even though their physical halves stop
// at the mid. an inner [3, 8) contained within a split [0, 10) (prefix [0,5) + suffix [5,10))
// crosses the physical mid but stays within the logical span - assertNoPartialOverlap must
// not trip on it. before the fix, physical .end comparison flagged inner vs prefix as
// partial overlap and threw spuriously. apply() may still throw downstream on the actual
// MagicString overwrite (touching chunks); only the assertion's diagnostic is verified here
function expectNoPartialOverlapAssertion(label, code, build) {
  const q = new TransformQueue(code, new MagicString(code));
  build(q);
  let assertionThrew = false;
  try { q.apply(); } catch (error) {
    if (/partial overlap/.test(error.message)) assertionThrew = true;
  }
  if (assertionThrew) {
    counts.failed++;
    echo`${ red('FAIL') } ${ cyan(label) } :: false partial overlap`;
  } else counts.passed++;
}

function expectPartialOverlapAssertion(label, code, build) {
  const q = new TransformQueue(code, new MagicString(code));
  build(q);
  try { q.apply(); } catch (error) {
    if (/partial overlap/.test(error.message)) {
      counts.passed++;
      return;
    }
    counts.failed++;
    echo`${ red('FAIL') } ${ cyan(label) } :: unexpected error ${ error.message }`;
    return;
  }
  counts.failed++;
  echo`${ red('FAIL') } ${ cyan(label) } :: expected partial-overlap throw`;
}

// inner contained within a split's logical span crosses the physical mid - must not throw
expectNoPartialOverlapAssertion('TransformQueue/split logical end contains inner',
  '0123456789abcdef', q => { q.addSplit(0, 5, 10, 'PRE', 'SUF', null, null); q.add(3, 8, 'INNER'); });

// inner starting inside a split's logical span and ending past its logical end is a
// genuine partial overlap (e.g. inner [7,14) vs split [5,11) gives the [7,11) overlap).
// entryLogicalEnd still detects this; the suffix-skip doesn't mask it because the prefix
// (the only walked half) is the entry whose logical span is overrun
expectPartialOverlapAssertion('TransformQueue/inner crossing split logical end throws',
  '0123456789abcdef', q => { q.addSplit(5, 8, 11, 'PRE', 'SUF', null, null); q.add(7, 14, 'TAIL'); });

// two splits sharing the same groupId (prefix + suffix pair from a single addSplit call)
// must not trip the assertion against each other. the same-groupId exclusion still gates
// the suffix-walk path through the prefix-only entry
expectNoPartialOverlapAssertion('TransformQueue/split pair same groupId pass',
  '0123456789', q => { q.addSplit(0, 5, 10, 'PRE', 'SUF', null, null); });

// two independent splits placed side-by-side (different groupIds) with no overlap pass
expectNoPartialOverlapAssertion('TransformQueue/two adjacent splits pass',
  '0123456789abcdef', q => {
    q.addSplit(0, 2, 4, 'A', 'B', null, null);
    q.addSplit(8, 10, 12, 'C', 'D', null, null);
  });

// non-consecutive partial overlap: sorted by start gives [A=[0,10), B=[3,5), C=[7,14)].
// consecutive-pair iteration wouldn't flag A vs C (B sits between, neither pair is partial);
// running max-end catches it. this is the shape agent audit 4 flagged as TQ-13-4
function checkNonConsecutivePartialOverlapThrows() {
  const code = '0123456789abcdef';
  const q = new TransformQueue(code, new MagicString(code));
  q.add(0, 10, 'A');
  q.add(3, 5, 'B');
  q.add(7, 14, 'C');
  try {
    q.apply();
    counts.failed++;
    echo`${ red('FAIL') } ${ cyan('TransformQueue/non-consecutive partial overlap') } :: expected throw`;
  } catch (error) {
    if (/partial overlap/.test(error.message)) counts.passed++;
    else {
      counts.failed++;
      echo`${ red('FAIL') } ${ cyan('TransformQueue/non-consecutive partial overlap') } :: got ${ error.message }`;
    }
  }
}
checkNonConsecutivePartialOverlapThrows();

// `#assertNoInsertInsideOverwrite` must catch inserts that land inside ANY enclosing
// overwrite range, not just the largest-start one. binary search alone returned the
// inner [5,7) for pos=8 (whose end < pos), missing outer [0,10) - MagicString then
// threw an opaque "Cannot split a chunk that has already been edited" instead of our
// clear assertion. prefix-max-end scan picks up the enclosing range
function checkInsertInsideEnclosingOuterThrows() {
  const code = '0123456789';
  const ms = new MagicString(code);
  const q = new TransformQueue(code, ms, 'fixture-file');
  q.add(0, 10, 'PRE23456POST'); // outer with valid needle for compose
  q.add(2, 7, 'YY'); // inner with smaller-end than insert pos
  q.insert(8, 'X'); // pos=8 is inside outer [0,10) but past inner [2,7)
  try {
    q.apply();
    counts.failed++;
    echo`${ red('FAIL') } ${ cyan('TransformQueue/insert inside enclosing outer') } :: expected throw`;
  } catch (error) {
    if (/insert at 8 lands inside overwrite \[0,10\)/.test(error.message)) counts.passed++;
    else {
      counts.failed++;
      echo`${ red('FAIL') } ${ cyan('TransformQueue/insert inside enclosing outer') } :: got ${ error.message }`;
    }
  }
}
checkInsertInsideEnclosingOuterThrows();

// Unicode-aware identifier-boundary check: ASCII `\w` misses `α` and other ID_Continue
// chars, so `Map` substring inside `Mapα` slipped past the boundary check and got
// substituted, corrupting the source identifier. fix: `/[\p{ID_Continue}$]/u`
function checkUnicodeIdentifierBoundary() {
  const code = 'Mapα()';
  const ms = new MagicString(code);
  const q = new TransformQueue(code, ms);
  // outer wraps the whole call; inner uses raw "Map" as needle (would substitute substring
  // inside Mapα without Unicode-aware boundary). simulate via guard'd compose path
  q.add(0, 6, 'Mapα()'); // outer (identical to source — degenerate but valid)
  q.add(0, 3, '_Map'); // inner needle = "Map", substr of "Mapα" - must NOT substitute
  // expect throw on "needle missing" (or substitute happens correctly with boundary check)
  try {
    q.apply();
    // with proper boundary check, the inner can't find a standalone "Map" in outer content
    // -> hits phantom-skip path (substring exists but only inside identifier).
    // result: outer content emitted as-is, "Map" inside "Mapα" stays intact
    check('TransformQueue/unicode ident-boundary phantom-skip', ms.toString(), 'Mapα()');
  } catch (error) {
    counts.failed++;
    echo`${ red('FAIL') } ${ cyan('TransformQueue/unicode ident-boundary') } :: ${ error.message }`;
  }
}
checkUnicodeIdentifierBoundary();

// phantom-skip with identifier-boundary check: `content.includes(needle)` alone could
// mask legitimate misses where needle appears as a TRUE standalone token in content (a
// real bug that should throw). fix scans all occurrences and only skips when every
// match sits inside a larger identifier
function checkPhantomSkipBoundaryGuard() {
  const code = 'Map foo';
  const ms = new MagicString(code);
  const q = new TransformQueue(code, ms);
  // outer wraps the whole code, content keeps a STANDALONE `Map` (not inside another ident).
  // inner has range [4,7) which is `foo` - its needle is `foo`. compose substitutes
  // `foo` -> `bar` inside outer's content. since `Map` is standalone in outer's content,
  // the phantom-skip path doesn't trigger for an unrelated needle. sanity: succeeds
  q.add(0, 7, 'Map foo');
  q.add(4, 7, 'bar');
  q.apply();
  check('TransformQueue/phantom-skip sanity', ms.toString(), 'Map bar');
}
checkPhantomSkipBoundaryGuard();

// verbatim-skip fast-path: a deeply-nested receiver chain (`r.a().b().c()`) where each hop's
// content preserves the source slice of the hop below it. once `.b` substitutes via its raw
// source slice, the narrower `.a` nested in `.b`'s source range is a phantom and is skipped
// before its own `content` scan - the short-circuit that keeps compose quadratic (not cubic)
// in chain depth. asserts the skip still produces the fully-composed nesting
function checkVerbatimSkipNestedChain() {
  const code = 'r.a().b().c()';
  const ms = new MagicString(code);
  const q = new TransformQueue(code, ms);
  q.add(0, 5, 'A(r)');          // .a  - innermost, receiver `r` carries no polyfill
  q.add(0, 9, 'B(r.a())');      // .b  - preserves `r.a()` so .a can fold into it
  q.add(0, 13, 'C(r.a().b())'); // .c - preserves `r.a().b()` so .b can fold into it
  q.apply();
  check('TransformQueue/verbatim-skip nested chain', ms.toString(), 'C(B(A(r)))');
}
checkVerbatimSkipNestedChain();

// verbatim-skip must NOT absorb across an equal-range split sibling that hasn't composed yet.
// the arrow-body wrap (non-split, [0,9]) and the outermost instance method `.b` (split, equal
// [0,9]) are siblings; `#scanInners` lists the split as an inner of the wrap, and the wrap
// composes first. when the wrap substitutes `.b` it gets `.b`'s RAW (un-composed) content,
// where the inner `.a` is still un-substituted - so `.a` must NOT be skipped. the
// `innerWasComposed` gate enforces this; without it `.a` is dropped (output `{B(r.a())}`)
function checkVerbatimSkipUncomposedSiblingNotAbsorbed() {
  const code = 'r.a().b()';
  const ms = new MagicString(code);
  const q = new TransformQueue(code, ms);
  q.add(0, 9, '{r.a().b()}');          // arrow-body-wrap analogue: non-split, preserves source
  q.addSplit(0, 2, 9, 'B(', 'r.a())'); // .b - split, EQUAL range, raw content preserves `r.a()`
  q.add(0, 5, 'A(r)');                 // .a - strict inner, must still substitute
  q.apply();
  check('TransformQueue/verbatim-skip uncomposed sibling not absorbed', ms.toString(), '{B(A(r))}');
}
checkVerbatimSkipUncomposedSiblingNotAbsorbed();

// compose-complexity regression guard for finding 46-1. wall-clock is too machine-dependent
// for CI, so this counts a DETERMINISTIC proxy: total chars scanned by String.prototype.indexOf
// during one compose pass (the substitution scans dominate). the pathological shape is a nested
// chain `r.f().f()...f()` where every hop's content preserves the receiver slice below it. the
// pre-fix code scanned each narrower phantom hop -> ~8x more work per depth-doubling (cubic);
// the verbatim phantom-skip keeps it ~4x (quadratic). assert the doubling ratio stays under 5.5,
// which sits between the two regimes with wide margin (measured 3.95 quadratic vs 7.9 cubic) -
// noise can only dilute the ratio downward, so a cubic regression (ratio -> 8) always trips it
function checkComposeStaysSubCubic() {
  function composeNestedChain(depth) {
    let code = 'r';
    const ends = [];
    for (let i = 0; i < depth; i++) {
      code += '.f()';
      ends.push(code.length);
    }
    const ms = new MagicString(code);
    const q = new TransformQueue(code, ms);
    for (let i = 0; i < depth; i++) {
      // hop i wraps the verbatim receiver slice [0, ends[i-1]], mirroring the instance-method
      // emitter preserving its receiver text so the hop below can fold into it
      const receiver = i === 0 ? 'r' : code.slice(0, ends[i - 1]);
      q.add(0, ends[i], `F(${ receiver })`);
    }
    const realIndexOf = String.prototype.indexOf;
    let scanned = 0;
    // test-only scan-cost probe: tally haystack length per indexOf, restored in finally
    /* eslint-disable no-extend-native -- transient indexOf counter, removed in the finally below */
    String.prototype.indexOf = function indexOfProbe(...args) {
      scanned += this.length;
      return realIndexOf.apply(this, args);
    };
    try {
      q.apply();
    } finally {
      String.prototype.indexOf = realIndexOf;
    }
    /* eslint-enable no-extend-native -- probe removed, native restored */
    return { scanned, out: ms.toString() };
  }
  // correctness at depth: the deepest hop must fully fold, no phantom-skip corruption
  check('TransformQueue/compose nested-chain output', composeNestedChain(3).out, 'F(F(F(r)))');
  const ratio = composeNestedChain(80).scanned / composeNestedChain(40).scanned;
  if (ratio < 5.5) counts.passed++;
  else {
    counts.failed++;
    echo`${ red('FAIL') } ${ cyan('TransformQueue/compose stays sub-cubic') } :: depth-doubling scan ratio ${ ratio.toFixed(2) } >= 5.5 (cubic regression?)`;
  }
}
checkComposeStaysSubCubic();

// verbatim-skip must NOT cross disjoint sibling inners, and identical needles at sibling
// positions must each resolve to their own slot via nth-accounting. `f(a.m(),a.m())` has two
// `a.m()` inners at disjoint ranges under one outer; neither nests in the other, so the
// rightmost absorbs nothing the leftmost needs and both substitute (rightmost nth=1, leftmost
// nth=0). a buggy absorb that keyed on needle-equality instead of range would drop one
function checkSiblingIdenticalNeedles() {
  const code = 'f(a.m(),a.m())';
  const ms = new MagicString(code);
  const q = new TransformQueue(code, ms);
  q.add(0, 14, 'F(a.m(),a.m())'); // outer wrapper preserves both siblings verbatim
  q.add(2, 7, 'M(a)');            // first  a.m()
  q.add(8, 13, 'M(a)');           // second a.m()
  q.apply();
  check('TransformQueue/sibling identical needles', ms.toString(), 'F(M(a),M(a))');
}
checkSiblingIdenticalNeedles();

// nested chain `r.f().f()...` with a DISTINCT content wrapper per hop must fold to the exact
// nesting order `F{d-1}(...F0(r))` at every depth - distinct wrappers make the assertion
// sensitive to any hop mis-routing into the wrong slot. sweeps depth 1..10 to catch
// depth-dependent off-by-one in the verbatim-skip / nth bookkeeping
function checkNestedChainDepthSweep() {
  for (let depth = 1; depth <= 10; depth++) {
    let code = 'r';
    const ends = [];
    for (let i = 0; i < depth; i++) {
      code += '.f()';
      ends.push(code.length);
    }
    const ms = new MagicString(code);
    const q = new TransformQueue(code, ms);
    for (let i = 0; i < depth; i++) {
      const receiver = i === 0 ? 'r' : code.slice(0, ends[i - 1]);
      q.add(0, ends[i], `F${ i }(${ receiver })`);
    }
    q.apply();
    let expected = 'r';
    for (let i = 0; i < depth; i++) expected = `F${ i }(${ expected })`;
    check(`TransformQueue/nested chain depth=${ depth }`, ms.toString(), expected);
  }
}
checkNestedChainDepthSweep();

// `mergeEqualRange` invariant errors carry the bare `transform-queue: ` subsystem prefix - NOT a
// self-applied `[core-js] [<fileId>] ` brand. the brand + file tag are owned by the outer `tagError`
// (runTransform's catch), matching the parse-error throw-path convention; self-prefixing here would
// make tagError double-stamp the brand and id (X10-1). the message head must be `transform-queue: `
// with no leading `[core-js]`
function checkMergeEqualRangePrefix() {
  const code = 'abcdef';
  const ms = new MagicString(code);
  const q = new TransformQueue(code, ms);
  // construct two equal-range transforms where neither contains the original needle
  // (`abcdef`). mergeEqualRange should throw with the unbranded subsystem prefix
  q.add(0, 6, 'XX');
  q.add(0, 6, 'YY');
  try {
    q.apply();
    counts.failed++;
    echo`${ red('FAIL') } ${ cyan('TransformQueue/mergeEqualRange prefix') } :: expected throw`;
  } catch (error) {
    if (error.message.startsWith('transform-queue: mergeEqualRange invariant')) counts.passed++;
    else {
      counts.failed++;
      echo`${ red('FAIL') } ${ cyan('TransformQueue/mergeEqualRange prefix') } :: got ${ error.message }`;
    }
  }
}
checkMergeEqualRangePrefix();

// `mergeEqualRange` locates the needle through the boundary-aware occurrence scan, not a raw
// indexOf: the needle (`at`) appears MID-IDENTIFIER inside the wrapper (`flat`) before its standalone
// occurrence. a raw scan would splice at the `flat` offset, corrupting the output to `flX(at)`; the
// identifier-boundary filter skips the embedded hit and splices the inner at the real `(at)` slot
function checkMergeEqualRangeBoundaryNeedle() {
  const code = 'at';
  const ms = new MagicString(code);
  const q = new TransformQueue(code, ms);
  q.add(0, 2, 'flat(at)'); // wrapper preserves the original `at`, but `flat` embeds it first
  q.add(0, 2, 'X');        // inner polyfill replacement
  q.apply();
  check('TransformQueue/mergeEqualRange boundary-aware needle', ms.toString(), 'flat(X)');
}
checkMergeEqualRangeBoundaryNeedle();

// U05-1: addSplit must validate the FULL range up front (before the first add) so ANY bad offset
// fails ATOMICALLY with an addSplit-specific diagnostic. a bad `end` is the orphan-critical case
// (it would pass the prefix add() and throw only in the suffix add(), orphaning the prefix half and
// corrupting the next apply()); a bad start/mid is caught by the first add() but the upfront check
// gives the clear addSplit message and validates uniformly. assert the message is addSplit-owned
// (not add()'s fall-through) AND that no orphan remains
function checkAddSplitAtomicRange() {
  const code = '0123456789';
  for (const [start, mid, end, pattern, label] of [
    [2, 5, 15, /addSplit range \[2,15\) out of bounds/, 'out-of-bounds end'],
    [2, 5, 8.5, /addSplit offsets must be integers/, 'non-integer end'],
    [2, 5.5, 8, /addSplit offsets must be integers/, 'non-integer mid'],
    [-1, 5, 8, /addSplit range \[-1,8\) out of bounds/, 'out-of-bounds start'],
  ]) {
    const ms = new MagicString(code);
    const q = new TransformQueue(code, ms);
    let message = null;
    try {
      q.addSplit(start, mid, end, 'PRE', 'SUF', null, null);
    } catch (error) {
      message = error.message;
    }
    check(`TransformQueue/addSplit atomic ${ label } throws addSplit-specific`, !!message && pattern.test(message), true);
    q.apply();
    check(`TransformQueue/addSplit atomic ${ label } leaves no orphan`, ms.toString(), code);
  }
}
checkAddSplitAtomicRange();

// a SPLIT prefix's physical end understates its logical range: with a same-start non-split
// sibling the outermost filter must swallow the narrower one (tiebreak by LOGICAL end), or
// two overlapping splices reach the caller and silently corrupt relocated text
function checkSameStartSplitTiebreak() {
  const code = '0123456789abcdef';
  const q = new TransformQueue(code, new MagicString(code));
  q.addSplit(0, 4, 10, '[012345]', '+S');
  q.add(0, 6, 'XYZ');
  const splices = q.composeAndDrainRange(0, 16);
  let disjoint = splices.length > 0;
  for (let i = 1; i < splices.length; i++) {
    if (splices[i].start < splices[i - 1].end) disjoint = false;
  }
  check('TransformQueue/same-start split-prefix tiebreak yields disjoint splices', disjoint, true);
}
checkSameStartSplitTiebreak();

// U05-2: composeAndDrainRange drains entries and returns splices the caller bakes into relocated
// text via spliceInRange, which cannot detect a partial overlap. it must run the same partial-overlap
// guard apply() does, surfacing the composition bug instead of silently corrupting the relocated text
function checkComposeAndDrainRangeOverlapThrows() {
  const code = '0123456789abcdefghij';
  const ms = new MagicString(code);
  const q = new TransformQueue(code, ms);
  q.add(0, 10, 'XXX');
  q.add(5, 15, 'YYY'); // partial overlap with [0,10)
  try {
    q.composeAndDrainRange(0, 20);
    counts.failed++;
    echo`${ red('FAIL') } ${ cyan('TransformQueue/composeAndDrainRange overlap') } :: expected throw`;
  } catch (error) {
    check('TransformQueue/composeAndDrainRange surfaces partial overlap',
      /partial overlap/.test(error.message), true);
  }
}
checkComposeAndDrainRangeOverlapThrows();

// the new overlap guard must NOT false-throw on VALID (non-partial-overlapping) entries - disjoint
// ranges compose/relocate fine and return one splice each, draining from the queue
function checkComposeAndDrainRangeValid() {
  const code = '0123456789';
  const ms = new MagicString(code);
  const q = new TransformQueue(code, ms);
  q.add(0, 3, 'A');
  q.add(5, 8, 'B'); // disjoint from [0,3) - no overlap
  let splices = null;
  try {
    splices = q.composeAndDrainRange(0, 10);
  } catch (error) {
    counts.failed++;
    echo`${ red('FAIL') } ${ cyan('TransformQueue/composeAndDrainRange valid') } :: false throw ${ error.message }`;
  }
  if (splices) check('TransformQueue/composeAndDrainRange valid returns disjoint splices', splices.length, 2);
}
checkComposeAndDrainRangeValid();

// X10-1: a transform-queue throw routed through runTransform's `tagError(error, id)` must carry
// EXACTLY one `[core-js]` brand and one file id. the queue throws an unbranded `transform-queue: `
// message (no self-applied `[core-js] [<id>] `), so tagError stamps the brand + id exactly once -
// matching the parse-error throw-path convention
function checkSingleBrandAfterTagError() {
  const id = '/src/app.js';
  const code = 'aaaaaaaaaa';
  const ms = new MagicString(code);
  const q = new TransformQueue(code, ms);
  let message = '';
  try {
    q.add(0, 6, 'X');
    q.add(3, 9, 'Y'); // partial overlap -> #invariant throw
    q.apply();
  } catch (error) {
    tagError(error, id); // exactly what runTransform's catch does
    message = error.message;
  }
  check('TransformQueue/tagError single [core-js] brand', (message.match(/\[core-js\]/g) || []).length, 1);
  check('TransformQueue/tagError single file id', message.split(id).length - 1, 1);
  check('TransformQueue/tagError keeps unbranded subsystem prefix',
    /^\[core-js\] \[\/src\/app\.js\] transform-queue: /.test(message), true);
}
checkSingleBrandAfterTagError();

// `extractContent` operates on LOGICAL ranges. a split pair is keyed in #byRange by its two
// PHYSICAL halves, never its logical [start, end], so only the logical range resolves the
// assembled pair AND removes both halves. a physical-half range has no logical owner: it returns
// null and leaves the pair queued, so apply() still emits the whole rewrite. returning a lone half
// (or orphaning a peer) would corrupt output - a half covers only part of the logical range
function checkExtractSplitLogicalContract() {
  const code = '0123456789';
  // logical range -> assembled pair, both halves drained, apply leaves source untouched
  {
    const ms = new MagicString(code);
    const q = new TransformQueue(code, ms);
    q.addSplit(0, 5, 10, 'PREFIX', 'SUFFIX');
    check('TransformQueue/extractContent logical range assembles pair', q.extractContent(0, 10), 'PREFIXSUFFIX');
    q.apply();
    check('TransformQueue/extractContent logical range drains both halves', ms.toString(), code);
  }
  // physical prefix half -> null, pair stays queued and applies whole
  {
    const ms = new MagicString(code);
    const q = new TransformQueue(code, ms);
    q.addSplit(0, 5, 10, 'PREFIX', 'SUFFIX');
    check('TransformQueue/extractContent physical prefix half returns null', q.extractContent(0, 5), null);
    q.apply();
    check('TransformQueue/extractContent physical prefix half leaves pair intact', ms.toString(), 'PREFIXSUFFIX');
  }
  // physical suffix half -> null, pair intact
  {
    const ms = new MagicString(code);
    const q = new TransformQueue(code, ms);
    q.addSplit(0, 5, 10, 'PREFIX', 'SUFFIX');
    check('TransformQueue/extractContent physical suffix half returns null', q.extractContent(5, 10), null);
    q.apply();
    check('TransformQueue/extractContent physical suffix half leaves pair intact', ms.toString(), 'PREFIXSUFFIX');
  }
}
checkExtractSplitLogicalContract();

// composeAndDrainRange membership is by LOGICAL span: a split half qualifies only together with
// its peer. a drain range beginning inside a split (covering the suffix's physical start but not
// the prefix's) must NOT admit the suffix alone - draining it while leaving the prefix would emit
// the receiver fragment by itself. nothing is drained; the pair survives and apply() emits it whole
function checkComposeAndDrainRangePartialSplitLeavesPairIntact() {
  const code = '0123456789';
  const ms = new MagicString(code);
  const q = new TransformQueue(code, ms);
  q.addSplit(2, 5, 10, 'PRE', 'SUF'); // logical [2,10); physical halves [2,5) + [5,10)
  const splices = q.composeAndDrainRange(5, 10); // begins at the split mid - touches suffix half only
  check('TransformQueue/composeAndDrainRange partial split drains nothing', splices.length, 0);
  q.apply();
  check('TransformQueue/composeAndDrainRange partial split leaves pair intact', ms.toString(), '01PRESUF');
}
checkComposeAndDrainRangePartialSplitLeavesPairIntact();

// composeAndDrainRange covering a split's FULL logical range drains BOTH halves (peer-aware) and
// returns one assembled splice - no half is left orphaned in the queue for apply() to emit alone
function checkComposeAndDrainRangeWholeSplitDropsBothHalves() {
  const code = '0123456789';
  const ms = new MagicString(code);
  const q = new TransformQueue(code, ms);
  q.addSplit(2, 5, 10, 'PRE', 'SUF');
  const splices = q.composeAndDrainRange(0, 10);
  check('TransformQueue/composeAndDrainRange whole split returns one splice', splices.length, 1);
  if (splices.length) check('TransformQueue/composeAndDrainRange whole split assembles pair', splices[0].content, 'PRESUF');
  q.apply(); // both halves drained -> source untouched, no orphan peer emitted
  check('TransformQueue/composeAndDrainRange whole split drains both halves', ms.toString(), code);
}
checkComposeAndDrainRangeWholeSplitDropsBothHalves();

// hasTransformWithin is split-aware on the logical START: a split that STRADDLES the queried range
// (prefix outside, suffix inside) is NOT "within" - only a split whose full logical span fits counts.
// a physical-start test would admit the suffix alone and wrongly report the straddling split as nested
function checkHasTransformWithinSplitLogicalStart() {
  const code = '0123456789abcdef';
  const q = new TransformQueue(code, new MagicString(code));
  q.addSplit(2, 5, 10, 'PRE', 'SUF'); // logical [2,10); physical halves [2,5) + [5,10)
  // [3,10) begins inside the prefix half, so the split straddles it - prefix lies outside -> not within
  check('TransformQueue/hasTransformWithin straddling split is not within', q.hasTransformWithin(3, 10), false);
  // full logical span fits inside the query -> within
  check('TransformQueue/hasTransformWithin enclosed split is within', q.hasTransformWithin(0, 12), true);
  check('TransformQueue/hasTransformWithin exact logical range is within', q.hasTransformWithin(2, 10), true);
}
checkHasTransformWithinSplitLogicalStart();

// the relocation path (composedRangeSrc) drains a node range through BOTH drainInsertsInRange (point
// inserts) and composeAndDrainRange (overwrites/splits). a split + a point-insert in the same range
// must each drain cleanly without corrupting the other: the split assembles as one logical splice and
// both its halves leave the queue (peer-aware), the insert leaves as a zero-length splice
function checkDrainSplitAndInsertSameRange() {
  const code = '0123456789abcdef';
  const ms = new MagicString(code);
  const q = new TransformQueue(code, ms);
  q.addSplit(2, 5, 10, 'PRE', 'SUF'); // logical [2,10)
  q.insert(11, 'INS'); // point-insert outside the split, inside the drained range
  const inserts = q.drainInsertsInRange(0, 16);
  const splices = q.composeAndDrainRange(0, 16);
  check('TransformQueue/drain split+insert: insert drained as zero-length splice', inserts.length, 1);
  check('TransformQueue/drain split+insert: split assembled as one splice', splices.length === 1 && splices[0].content, 'PRESUF');
  q.apply(); // queue fully drained (both split halves + insert) -> source untouched
  check('TransformQueue/drain split+insert: queue empty, source untouched', ms.toString(), code);
}
checkDrainSplitAndInsertSameRange();

// --- ImportInjector.snapshot() ---
// snapshot must hand the post-pass an immutable view; mutating the pre injector after
// a snapshot was taken should NOT leak into the snapshot's collections
function checkSnapshotDeepCopy() {
  const ms = new MagicString('');
  const inj = new ImportInjector({ mode: 'actual', pkg: 'x', ms });
  inj.globalImports.add('a');
  inj.pureImports.set('p1', { source: 's1' });
  inj.usedNames.add('u1');
  const snap = inj.snapshot();
  // mutate after snapshot
  inj.globalImports.add('b');
  inj.pureImports.set('p2', { source: 's2' });
  inj.usedNames.add('u2');
  check('snapshot/globals isolated', snap.globals.has('b'), false);
  check('snapshot/pure isolated', snap.pure.has('p2'), false);
  check('snapshot/usedNames isolated', snap.usedNames.has('u2'), false);
  // pre-mutation contents preserved
  check('snapshot/globals carried', snap.globals.has('a'), true);
  check('snapshot/pure carried', snap.pure.has('p1'), true);
  check('snapshot/usedNames carried', snap.usedNames.has('u1'), true);
}
checkSnapshotDeepCopy();

// adoptOrphanRefs must not duplicate refs that pre already flushed; otherwise post
// would emit a second `var _ref;` on top of pre's
function checkAdoptOrphanRespectsFlushed() {
  const ms = new MagicString('');
  const inj = new ImportInjector({ mode: 'actual', pkg: 'x', ms,
    inherit: { globals: new Set(), pure: new Map(), usedNames: new Set(),
      unusedNames: new Set(), existingGlobals: new Set(), existingPure: new Map(),
      refs: ['_ref'], flushedRefs: ['_ref'] } });
  inj.adoptOrphanRefs(['_ref', '_ref2']);
  const snap = inj.snapshot();
  // _ref was already flushed by pre — adoptOrphan should skip it (no double declaration)
  // _ref2 is brand new — should be in refs but not flushedRefs
  check('adoptOrphan/skips flushed', snap.refs.filter(r => r === '_ref').length, 1);
  check('adoptOrphan/adds new', snap.refs.includes('_ref2'), true);
  check('adoptOrphan/flushed carried', snap.flushedRefs.includes('_ref'), true);
}
checkAdoptOrphanRespectsFlushed();

// adoptOrphanRefs must reject non-`ORPHAN_REF_PATTERN`-conforming names BEFORE mutating
// refs / usedNames. without the upfront validation, a stale snapshot carrying a user-
// written `_user_ref` or `myRef` slipped past the regex-only seed-cache check and joined
// refs - flush later emits `var <bad-name>;` polluting output
function checkAdoptOrphanRejectsNonConforming() {
  const ms = new MagicString('');
  const inj = new ImportInjector({ mode: 'actual', pkg: 'x', ms });
  inj.adoptOrphanRefs(['_ref', '_ref2', 'weirdName', '_user_var']);
  const snap = inj.snapshot();
  check('adoptOrphan/rejects non-conforming weirdName', snap.refs.includes('weirdName'), false);
  check('adoptOrphan/rejects non-conforming _user_var', snap.refs.includes('_user_var'), false);
  check('adoptOrphan/keeps conforming _ref', snap.refs.includes('_ref'), true);
  check('adoptOrphan/keeps conforming _ref2', snap.refs.includes('_ref2'), true);
  // usedNames mirror - same filter
  check('adoptOrphan/usedNames excludes non-conforming',
    snap.usedNames.has('weirdName') || snap.usedNames.has('_user_var'), false);
}
checkAdoptOrphanRejectsNonConforming();

// the orphan pattern caps the numeric tail at 15 digits (< Number.MAX_SAFE_INTEGER). a user
// `_ref` with a 16+-digit suffix would parseInt into a float-collapsed integer that seeds the
// nextSuffix cache to a value `findUniqueName` can never increment past, hanging the allocator.
// such an over-long suffix must NOT match the pattern (-> reserved as a user name, never adopted)
function checkAdoptOrphanRejectsUnsafeSuffix() {
  check('orphanPattern/accepts 15-digit suffix', ORPHAN_REF_PATTERN.test(`_ref${ '9'.repeat(15) }`), true);
  check('orphanPattern/rejects 16-digit suffix', ORPHAN_REF_PATTERN.test(`_ref${ '9'.repeat(16) }`), false);
  // regression: the canonical generator-shaped names still match, the user-only forms still do not
  check('orphanPattern/accepts bare _ref', ORPHAN_REF_PATTERN.test('_ref'), true);
  check('orphanPattern/accepts _ref2', ORPHAN_REF_PATTERN.test('_ref2'), true);
  check('orphanPattern/accepts _ref100', ORPHAN_REF_PATTERN.test('_ref100'), true);
  check('orphanPattern/rejects _ref1', ORPHAN_REF_PATTERN.test('_ref1'), false);
  check('orphanPattern/rejects _ref0', ORPHAN_REF_PATTERN.test('_ref0'), false);
  const ms = new MagicString('');
  const inj = new ImportInjector({ mode: 'actual', pkg: 'x', ms });
  const giant = `_ref${ '9'.repeat(18) }`;
  inj.adoptOrphanRefs([giant, '_ref2']);
  const snap = inj.snapshot();
  check('adoptOrphan/rejects unsafe-length suffix', snap.refs.includes(giant), false);
  check('adoptOrphan/adopts safe suffix alongside', snap.refs.includes('_ref2'), true);
}
checkAdoptOrphanRejectsUnsafeSuffix();

// sequential transforms via one plugin instance must not bleed state between them.
// runTransformInner installs `currentInjector` AFTER its early-return guards and the
// try/finally restores the previous slot - a second transform sees a fresh tree and
// the third must not be polluted by either. core-js-internal short-circuit between
// real transforms confirms the early-return path doesn't touch the slot either
function checkRunTransformStateIsolation() {
  const plugin = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 } });
  const a = plugin.transform('Array.from([1]);', '/a.ts');
  // core-js-internal early-return between real transforms must not corrupt state
  plugin.transform('var x = 1;', '/some/path/core-js/internals/foo.js');
  const b = plugin.transform('Promise.resolve(1);', '/b.ts');
  // each transform emits its own polyfill family, neither pollutes the other
  check('isolation/transform a emits Array.from', /array\/from/.test(a?.code ?? ''), true);
  check('isolation/transform a has no Promise import', /promise\//.test(a?.code ?? ''), false);
  check('isolation/transform b emits Promise.resolve', /promise\/resolve/.test(b?.code ?? ''), true);
  check('isolation/transform b has no Array import', /array\/from/.test(b?.code ?? ''), false);
  // `currentMutatedStatics` is the second per-transform slot (saved/restored together with
  // `currentInjector`). a transform whose source monkey-patches a static suppresses that static's pure
  // rewrite; a later transform using the same static UNMUTATED must still rewrite it - the suppression
  // slot is per-transform, not instance-global. (true re-entrancy - an inner transform clobbering the
  // outer's slot mid-scan - is bundler-specific and not reproducible via direct transform calls; the
  // save/restore makes that case safe, this guards the per-transform set + that the slot does not bleed.)
  const mutated = plugin.transform('Array.from = () => [];\nArray.from([1]);', '/m.ts');
  const clean = plugin.transform('Array.from([1]);', '/n.ts');
  check('isolation/mutated static suppresses its own rewrite', /array\/from/.test(mutated?.code ?? ''), false);
  check('isolation/later clean transform still rewrites the static', /array\/from/.test(clean?.code ?? ''), true);
}
checkRunTransformStateIsolation();

// orphan list missing bare `_ref` but containing `_ref2+` must not seed the suffix cache
// past bare. snapshot loss after user-edited removal of `_ref` declaration means bare is
// free again; allocator must reuse it before claiming a new numeric slot
function checkBareSlotReclaim() {
  const newInj = () => new ImportInjector({ mode: 'actual', pkg: 'x', ms: new MagicString('') });
  // baseline: only numbered orphan adopted -> bare reclaimed on first allocation
  const a = newInj();
  a.adoptOrphanRefs(['_ref2']);
  check('reclaim/single numbered orphan', a.generateLocalRef(), '_ref');
  // multi numbered orphans (`_ref2`, `_ref5`) -> bare still free, reclaim it.
  // next call must skip past the highest numbered orphan, not back to `_ref2`
  const b = newInj();
  b.adoptOrphanRefs(['_ref2', '_ref5']);
  check('reclaim/multi numbered orphans', b.generateLocalRef(), '_ref');
  check('reclaim/post-reclaim advances past highest', b.generateLocalRef(), '_ref6');
  // bare also taken -> reclaim must NOT pick bare; allocator falls through to next free slot
  const c = newInj();
  c.adoptOrphanRefs(['_ref', '_ref2']);
  check('reclaim/bare-taken skips reclaim', c.generateLocalRef(), '_ref3');
  // empty cache (no orphans, no prior calls) -> first allocation gets bare normally
  const d = newInj();
  check('reclaim/empty cache returns bare', d.generateLocalRef(), '_ref');
  // sequential allocations after bare reclaim preserve monotonic numbering across the
  // pre-existing cache ceiling - third call must produce `_ref7`, not loop back to `_ref3`
  const e = newInj();
  e.adoptOrphanRefs(['_ref2', '_ref5']);
  check('reclaim/sequence step 1', e.generateLocalRef(), '_ref');
  check('reclaim/sequence step 2', e.generateLocalRef(), '_ref6');
  check('reclaim/sequence step 3', e.generateLocalRef(), '_ref7');
}
checkBareSlotReclaim();

// --- generateDeclaredRef vs generateLocalRef contract ---
// `generateDeclaredRef` is the unplugin counterpart of babel's `generateDeclaredRef(scope)`
// abstract method declared in injector-base.js's docstring. it queues the ref for
// hoisted `var _refN;` emission at flush, whereas `generateLocalRef` returns the name
// only and leaves it up to the caller to emit a binding. parity check ensures the rename
// from `generateHoistedRef` to `generateDeclaredRef` doesn't drift the
// behavior: declared refs land in the flushed `var` line, local refs do not
function checkGenerateDeclaredRefHoists() {
  function freshInjector() {
    const ms = new MagicString('');
    return { ms, injector: new ImportInjector({ mode: 'actual', pkg: 'x', ms }) };
  }
  function flushOutput(injector, ms) {
    injector.flush();
    return ms.toString();
  }

  // both flavours allocate ref names; only declared lands in the hoisted `var` line
  const { ms, injector } = freshInjector();
  const declared = injector.generateDeclaredRef();
  const local = injector.generateLocalRef();
  const out = flushOutput(injector, ms);
  check('declared/local return distinct names', declared !== local, true);
  check('declaredRef in flushed var line', out.includes(`var ${ declared };`), true);
  check('localRef NOT in flushed var line', out.includes(`var ${ local };`), false);

  // localRef-only path emits no `var` at all - caller owns its own binding emission
  const { ms: msLocal, injector: injLocal } = freshInjector();
  injLocal.generateLocalRef();
  check('localRef-only flush emits no var', flushOutput(injLocal, msLocal).includes('var _ref'), false);
}
checkGenerateDeclaredRefHoists();

// a leading `'use strict'` directive must survive the import-injector's appendRight-failure fallback:
// a sibling plugin overwriting the prologue range leaves no chunk boundary for appendRight, and a
// naive prepend at 0 lands the ref/import block ABOVE the directive, silently demoting strict mode
function checkDirectiveSafeFallback() {
  const src = '"use strict";\nfoo();';
  const directiveEnd = directivePrologueEnd(programOf(src));
  const ms = new MagicString(src);
  // overwrite [directiveEnd, end] (same content) so the prologue-end appendRight target sits inside an
  // overwritten chunk with no boundary - exactly the sibling-plugin conflict the fallback handles
  ms.overwrite(directiveEnd, src.length, src.slice(directiveEnd));
  const inj = new ImportInjector({ mode: 'actual', pkg: 'x', ms, directiveEnd });
  inj.generateDeclaredRef();
  inj.flush();
  const out = ms.toString();
  check('directive survives appendRight fallback (stays first)', out.startsWith('"use strict";'), true);
  check('ref block lands after the directive, not above', out.indexOf('var _ref') > out.indexOf('use strict'), true);
}
checkDirectiveSafeFallback();

// the same fallback must keep a leading `#!` hashbang at offset 0: a block prepended above it is a
// SyntaxError (hashbangs are only legal as the first characters), worse than the directive's sloppy-
// mode demotion. the fallback anchors after the shebang's last char with a leading newline
function checkShebangSafeFallback() {
  const src = '#!/usr/bin/env node\nfoo();';
  const shebangContentEnd = src.indexOf('\n'); // offset the fallback anchors at (before the terminator)
  const ms = new MagicString(src);
  ms.overwrite(shebangContentEnd, src.length, src.slice(shebangContentEnd));
  const inj = new ImportInjector({ mode: 'actual', pkg: 'x', ms, directiveEnd: 0 });
  inj.generateDeclaredRef();
  inj.flush();
  const out = ms.toString();
  check('hashbang survives appendRight fallback (stays at offset 0)', out.startsWith('#!/usr/bin/env node'), true);
  check('ref block lands below the hashbang line', out.indexOf('var _ref') > out.indexOf('#!'), true);
}
checkShebangSafeFallback();

// post-pass map must carry the `file` field so devtools and combineSourceMaps consumers
// see the output filename hint. omitting it (spec-optional) makes the chained map
// ambiguous when bundlers merge multiple plugin maps. MagicString basenames the hint
// internally - presence + non-empty is what consumers rely on
function checkSourceMapFileField() {
  const source = 'const x = Array.from([1]);';
  const plugin = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 } });
  const result = plugin.transform(source, '/src/sm-file.js');
  check('sourceMap/file populated', typeof result?.map?.file === 'string' && result.map.file.length > 0, true);
  check('sourceMap/file basename matches id', result?.map?.file, 'sm-file.js');
  // sources[0] must be the FULL id - MagicString collapses to basename when source === file,
  // losing dirname for every emitted map. devtools / bundler chain-merge can't distinguish
  // files with the same basename in different dirs without the dirname
  check('sourceMap/sources[0] preserves full id', result?.map?.sources?.[0], '/src/sm-file.js');
}
checkSourceMapFileField();

// a namespace specifier-export (`function make() {}; export { make };`) attaches the
// runtime static like the declaration form does; the merged-namespace shadow gate must
// see it (oxc parses this shape; the babel parser rejects it, so this lock is text-side)
function checkNamespaceSpecifierExportShadow() {
  const source = 'class Base { static make(): number[] { return [1]; } }\n'
    + 'class Sub extends Base { static go() { return this.make().at(0); } }\n'
    + 'namespace Sub { function make(): string { return "s"; } export { make }; }\nSub.go();';
  const plugin = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 } });
  const result = plugin.transform(source, '/src/ns-spec.ts');
  check('nsMerge/specifier export bails to generic', result?.code?.includes('actual/instance/at'), true);
  check('nsMerge/specifier export no array narrow', result?.code?.includes('array/instance/at'), false);
}
checkNamespaceSpecifierExportShadow();

// the nth-replacement and the occurrence counter must share ONE enumeration: a
// self-bordered needle (`a.a` in `a.a.a`) has an OVERLAPPING second match that the
// non-overlap counter never tallies, so the replacer must not reach it either
function checkReplaceNthEnumeration() {
  check('replaceNth/self-bordered n=0', replaceNthOccurrence({ str: 'a.a.a', needle: 'a.a', replacement: 'X', n: 0 }), 'X.a');
  check('replaceNth/self-bordered n=1 out of range', replaceNthOccurrence({ str: 'a.a.a', needle: 'a.a', replacement: 'X', n: 1 }), 'a.a.a');
  check('replaceNth/plain n=1', replaceNthOccurrence({ str: 'b(c), b(c)', needle: 'b(c)', replacement: 'X', n: 1 }), 'b(c), X');
  check('replaceNth/boundary reject', replaceNthOccurrence({ str: '_ab + ab', needle: 'ab', replacement: 'X', n: 0 }), '_ab + X');
}
checkReplaceNthEnumeration();

// the proxy-hop normalization rides the text-rewrite + re-parse rails, which a CommonJS
// script must traverse with `sourceType: 'script'` - the reshaped output keeps require-style
// imports and the flat constructor receiver
function checkProxyHopNormalizeCJS() {
  const source = 'const { Map: { customJ } } = globalThis;\nmodule.exports = { customJ };';
  const plugin = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 } });
  const result = plugin.transform(source, '/src/hop.cjs');
  check('proxyHop/cjs flat receiver', result?.code?.includes('const { customJ } = _Map'), true);
  check('proxyHop/cjs require import', result?.code?.includes('var _Map = require('), true);
}
checkProxyHopNormalizeCJS();

// `storeName: true` on generateMap populates `map.names` with the original token text
// for each overwrite that supplied an explicit name. without it the names array stays
// empty and devtools can't reverse-resolve renamed bindings (`_Array$from` -> `Array.from`)
// for stack traces / scope panels. tests that the option is actually set in plugin.js
function checkSourceMapStoreName() {
  const source = 'const x = Array.from([1]);';
  const plugin = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 } });
  const result = plugin.transform(source, '/src/sm-names.js');
  // names array must exist and be a (possibly empty) array - presence alone confirms
  // storeName: true was passed; pre-fix this was undefined per MagicString defaults
  check('sourceMap/names is array', Array.isArray(result?.map?.names), true);
}
checkSourceMapStoreName();

// super.X(args) static-dispatch emits as a SPLIT transform: prefix replaces `super.X(`,
// args stay verbatim at their source positions. test traces the source-map mapping for a
// column INSIDE the arg range and confirms it resolves to the original arg's source
// column - the single-chunk emission collapsed every col inside super.X(args) to super.start.
// `Symbol.iterator` access on parent class hits the static-dispatch super branch since
// `Symbol.iterator` is a polyfilled property accessor
function checkSuperCallArgColPrecision() {
  // `super.all(myArg)` -> `_Promise$all.call(this, myArg)`. with split-emit `myArg` keeps
  // its source position (line 3 col 22); single-chunk emission would collapse to super's
  // start (line 3 col 11). probes the OUTPUT `myArg` column and confirms reverse-mapping
  const source = 'class C extends Promise {\n  static m(myArg) {\n    return super.all(myArg);\n  }\n}\n';
  const plugin = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 } });
  const result = plugin.transform(source, '/src/super-col.js');
  if (!result?.map) {
    check('superCall/transform emitted map', false, true);
    return;
  }
  const tm = new TraceMap(result.map);
  const outLines = result.code.split('\n');
  // find the ARGUMENT `myArg` occurrence (preceded by `, ` in `.call(this, myArg)`), NOT
  // the parameter (preceded by `(` in `static m(myArg)`). substring `, myArg` is unique
  let outLine = -1;
  let outCol = -1;
  for (let i = 0; i < outLines.length; i++) {
    const idx = outLines[i].indexOf(', myArg');
    if (idx !== -1) {
      outLine = i + 1;
      outCol = idx + 2;
      break;
    }
  }
  if (outLine === -1) {
    check('superCall/myArg argument present', false, true);
    return;
  }
  const probe = originalPositionFor(tm, { line: outLine, column: outCol });
  // source `myArg` argument lives at line 3, col 21 (after `    return super.all(`).
  // split-emit preserves col precision; single-chunk emission would land at col 11 (`super`)
  check('superCall/arg col maps to original source pos', probe.line === 3 && probe.column === 21, true);
}
checkSuperCallArgColPrecision();

// no-args super-call: `super.foo()`. split-point falls back to `closingParen`, the
// transform covers `super.foo(` and the original `)` stays verbatim at its source col
function checkSuperCallNoArgsClosingParen() {
  const source = 'class C extends Promise {\n  static m() {\n    return super.race();\n  }\n}\n';
  const plugin = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 } });
  const result = plugin.transform(source, '/src/super-noargs.js');
  if (!result?.map) {
    check('superCall/no-args transform emitted map', false, true);
    return;
  }
  const tm = new TraceMap(result.map);
  const outLines = result.code.split('\n');
  // find the closing `)` of the polyfill call: `_Promise$race.call(this)` ends with `)`
  let outLine = -1;
  let outCol = -1;
  for (let i = 0; i < outLines.length; i++) {
    const idx = outLines[i].indexOf('.call(this)');
    if (idx !== -1) {
      outLine = i + 1;
      outCol = idx + '.call(this'.length;
      break;
    }
  }
  if (outLine === -1) {
    check('superCall/no-args output present', false, true);
    return;
  }
  const probe = originalPositionFor(tm, { line: outLine, column: outCol });
  // source closing `)` lives at line 3, col 22 (after `    return super.race(`)
  check('superCall/no-args closing-paren col preserved', probe.line === 3 && probe.column === 22, true);
}
checkSuperCallNoArgsClosingParen();

// multi-args super-call: `super.foo(a, b, c)`. each arg lives at its own source position;
// split-emit preserves all of them. probes the THIRD argument to confirm the verbatim
// range covers everything inside the call's parens (not just the first arg)
function checkSuperCallMultiArgColPrecision() {
  const source = 'class C extends Promise {\n  static m(a, b, c) {\n    return super.race(a, b, c);\n  }\n}\n';
  const plugin = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 } });
  const result = plugin.transform(source, '/src/super-multi.js');
  if (!result?.map) {
    check('superCall/multi-arg transform emitted map', false, true);
    return;
  }
  const tm = new TraceMap(result.map);
  const outLines = result.code.split('\n');
  // find the line containing the polyfill .call(this, ...) - the args are on THAT line.
  // matching `.call(this, a` anchors to the polyfilled invocation (not the param list)
  let outLine = -1;
  let outCol = -1;
  for (let i = 0; i < outLines.length; i++) {
    const idx = outLines[i].indexOf('.call(this, a, b, c)');
    if (idx !== -1) {
      outLine = i + 1;
      outCol = idx + '.call(this, a, b, '.length;
      break;
    }
  }
  if (outLine === -1) {
    check('superCall/multi-arg third-arg present', false, true);
    return;
  }
  const probe = originalPositionFor(tm, { line: outLine, column: outCol });
  // source third arg `c` lives at line 3, col 28 (after `    return super.race(a, b, `)
  check('superCall/multi-arg third-arg col preserved', probe.line === 3 && probe.column === 28, true);
}
checkSuperCallMultiArgColPrecision();

// decorator double-walk: node types estree-toolkit does not define (no `is.<type>` predicate) take
// the Object.keys traversal fallback, which auto-walks their `decorators`; the manual decorator walk
// must skip such owners or it queues two colliding rewrites for the same span and crashes the whole
// transform. covers the auto-accessor / abstract-member shapes and a TSParameterProperty constructor
// param. assert: no crash + exactly one polyfill rewrite each. the accessor and TSParameterProperty
// shapes also have shared transpiler fixtures; the abstract-FIELD shape is unit-only because babel@8's
// parser rejects a decorator on an abstract field, so it cannot live in a cross-plugin fixture
function checkDecoratorDoubleWalkNoCrash() {
  const plugin = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 } });
  const cases = [
    ['accessor field', 'class C { @(Array.from([1])) accessor x = 1; }'],
    ['abstract accessor', 'abstract class C { @(Array.from([1])) abstract accessor x: number; }'],
    ['abstract field', 'abstract class C { @(Array.from([1])) abstract x: number; }'],
    ['TSParameterProperty', 'class Foo { constructor(@inject(Array.from([1])) private p: number) {} }'],
  ];
  for (const [label, source] of cases) {
    let result;
    let threw = false;
    try {
      result = plugin.transform(source, '/src/decorator-double-walk.ts');
    } catch {
      threw = true;
    }
    check(`decorator double-walk: ${ label } no crash`, threw, false);
    // count the polyfill CALL (`_Array$from(`), not the default-import binding (`import _Array$from`)
    const count = (result?.code?.match(/_Array\$from\(/g) ?? []).length;
    check(`decorator double-walk: ${ label } single rewrite`, count, 1);
  }
}
checkDecoratorDoubleWalkNoCrash();

// per-branch synth-swap with a bare-global computed-key sibling (`[Set]`) must not emit the global
// raw into a branch synth literal (`{ [Set]: Array[Set] }`) - a ReferenceError on the target engine.
// it bails the per-branch synth; assert only the ABSENCE of the leak (the bare global is rewritten
// to its import `[_Set]`). a conditional receiver has no body-extract fallback, so the `from` shorthand
// is not synth-polyfilled here - that residual gap is the deeper per-branch-synth rework, not asserted
function checkPerBranchBareGlobalComputedKeyNoLeak() {
  const src = 'const { from, [Set]: y } = (1 > 0) ? Array : Object; use(from, y);';
  const plugin = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 } });
  const code = plugin.transform(src, '/src/per-branch-bare-global.ts')?.code ?? '';
  check('per-branch bare-global computed key: no raw global leak', code.includes('[Set]'), false);
  check('per-branch bare-global computed key: global rewritten to import', code.includes('_Set'), true);
}
checkPerBranchBareGlobalComputedKeyNoLeak();

// --- directivePrologueEnd ---
// scans leading directive-shaped statements ('use strict', 'use asm', etc.) and returns the
// offset right after the last directive's source range. Inject point starts there so user
// directives stay at the head of the file. Stops at the first non-directive statement
function checkDirectivePrologueEnd() {
  const empty = programOf('');
  check('directivePrologueEnd/empty', directivePrologueEnd(empty), 0);
  const noDirective = programOf('foo();');
  check('directivePrologueEnd/no directive', directivePrologueEnd(noDirective), 0);
  const single = programOf('"use strict";\nfoo();');
  check('directivePrologueEnd/single directive', directivePrologueEnd(single), 13);
  const multi = programOf('"use strict";\n"use asm";\nfoo();');
  check('directivePrologueEnd/multi directive walks past last', directivePrologueEnd(multi), 24);
  const directiveAfterStmt = programOf('foo();\n"use strict";');
  check('directivePrologueEnd/directive after stmt stops at 0', directivePrologueEnd(directiveAfterStmt), 0);
}
checkDirectivePrologueEnd();

// --- lastUserImportEnd: re-export and interleave shapes ---
// `var _ref;` lands AFTER the trailing user import / re-export so the injected line
// doesn't sit between two import statements (lint `import/first` would warn). re-exports
// with a `.source` (`export { x } from 'mod'`, `export * as ns from 'mod'`, `export *
// from 'mod'`, `export { default } from 'mod'`) count as imports because the module
// record fetches them at evaluation entry. local re-exports without `.source` are NOT
// imports and break the scan. interleaved shapes that mix declarations and code break
// the scan at the first non-import statement, matching babel-plugin's reorderRefsAfterImports
function checkLastUserImportEnd() {
  // eslint-disable-next-line node/no-sync -- oxc-parser sync-only API
  const tsProgramOf = src => parseSync('/x.ts', src, { sourceType: 'module' }).program;
  // empty body returns null (no anchor)
  check('lastUserImportEnd/empty', lastUserImportEnd(programOf('')), null);
  // single import: end at the import's `;`
  const singleImport = 'import a from "a";\nfoo();';
  check('lastUserImportEnd/single import', lastUserImportEnd(programOf(singleImport)), 18);
  // re-export with source acts as import - scan continues past it
  const reexportNamed = 'import a from "a";\nexport { y } from "m";\nfoo();';
  check('lastUserImportEnd/re-export named extends region',
    lastUserImportEnd(programOf(reexportNamed)), 41);
  // `export { default } from 'mod'` - default re-export still has .source
  const reexportDefault = 'import a from "a";\nexport { default } from "m";\nfoo();';
  check('lastUserImportEnd/re-export default extends region',
    lastUserImportEnd(programOf(reexportDefault)), 47);
  // `export * as ns from 'mod'` - namespace re-export with .source
  const reexportNs = 'import a from "a";\nexport * as ns from "m";\nfoo();';
  check('lastUserImportEnd/re-export ns extends region',
    lastUserImportEnd(programOf(reexportNs)), 43);
  // `export * from 'mod'` - ExportAllDeclaration variant
  const reexportAll = 'import a from "a";\nexport * from "m";\nfoo();';
  check('lastUserImportEnd/re-export * extends region',
    lastUserImportEnd(programOf(reexportAll)), 37);
  // local re-export (no source) breaks the scan - it's a binding re-export, not an import
  const localReexport = 'import a from "a";\nvar localVar = 1;\nexport { localVar };\nimport z from "z";';
  check('lastUserImportEnd/local re-export (no source) breaks at code',
    lastUserImportEnd(programOf(localReexport)), 18);
  // interleave: import -> re-export -> import all run as one contiguous import region
  const interleave = 'import a from "a";\nexport { y } from "m";\nimport z from "z";\nfoo();';
  check('lastUserImportEnd/import + re-export + import contiguous region',
    lastUserImportEnd(programOf(interleave)), 60);
  // user code between imports breaks the scan immediately
  const codeBreaks = 'import a from "a";\nfoo();\nimport z from "z";';
  check('lastUserImportEnd/code statement breaks scan',
    lastUserImportEnd(programOf(codeBreaks)), 18);
  // type-only re-export `export type { X } from 'm'` - has .source, treated as import
  // (TC39 spec fetches the module record even when the export is tsc-elided)
  const typeReexport = 'import a from "a";\nexport type { X } from "m";\nfoo();';
  check('lastUserImportEnd/type-only re-export extends region',
    lastUserImportEnd(tsProgramOf(typeReexport)), 46);
}
checkLastUserImportEnd();

// --- isTopLevelImportLike: paren / sequence-wrapped require ---
// a top-level `require('m')` counts as an import-like statement so `var _ref;` lands after it.
// the callee is peeled of skippable wrappers first, so a parenthesized or comma-sequence
// `require` (minifier / bundler output like `(0, require)('m')`) is still recognized
function checkIsTopLevelImportLikeWrappedRequire() {
  const stmtOf = src => programOf(src, 'script').body[0];
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
  const [head, tail] = msg.split('\n');
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

// --- flush() skips through multi-comment directive tails ---
// directiveEnd lands after `"use strict";`; skipLineEnd must walk past `/*a*/ //b` so the
// injected import block appears on its own line, not shoved into the middle of the comment
// chain (which would shred `//b` or comment-out the import itself at runtime)
function checkFlushPastChainedComments() {
  const src = '"use strict"; /*a*/ //b\nfoo();';
  const ms = new MagicString(src);
  const inj = new ImportInjector({ mode: 'actual', pkg: 'core-js', ms, directiveEnd: 13 });
  inj.globalImports.add('es.promise.try');
  inj.flush();
  const out = ms.toString();
  // import block must land AFTER the newline following `//b`, not before it
  const importIdx = out.indexOf('import "core-js/modules/es.promise.try"');
  const commentIdx = out.indexOf('//b');
  const newlineAfterComment = out.indexOf('\n', commentIdx);
  check('skipLineEnd/imports after chained comments', importIdx > newlineAfterComment, true);
}
checkFlushPastChainedComments();

// --- flush() lands imports on a fresh line when the directive line carries trailing code ---
// `"use strict"; /*x*/ foo();` has real code after the block comment with no line terminator on
// the directive's physical line, so skipLineEnd returns a mid-line position. the import block
// must still land on its own line below the directive, not jam onto `"use strict"; /*x*/ <import>`
function checkFlushPastDirectiveSameLineCode() {
  const src = '"use strict"; /*x*/ foo();';
  const ms = new MagicString(src);
  const inj = new ImportInjector({ mode: 'actual', pkg: 'core-js', ms, directiveEnd: 13 });
  inj.globalImports.add('es.promise.try');
  inj.flush();
  const out = ms.toString();
  const firstLine = out.slice(0, out.indexOf('\n'));
  // the import must NOT be jammed onto the directive+comment line
  check('skipLineEnd/import not jammed on directive+code line', firstLine.includes('import "core-js'), false);
}
checkFlushPastDirectiveSameLineCode();

// --- flush() keeps a trailing same-line comment attached to the last user import ---
// `import x from 'y' // trailing` ends (oxc stmt.end) before ` // trailing`, so anchoring
// `var _ref;` at that offset would split the comment off its import onto a line below the ref.
// the ref block must skip past the trailing comment so the comment stays on the import line
function checkFlushRefAfterTrailingImportComment() {
  const src = "import x from 'y' // trailing\nfoo();";
  const ms = new MagicString(src);
  // userImportEnd = closing-quote offset of `import x from 'y'`, before ` // trailing`
  const userImportEnd = src.indexOf("'y'") + 3;
  const inj = new ImportInjector({ mode: 'actual', pkg: 'x', ms, userImportEnd });
  inj.generateDeclaredRef();
  inj.flush();
  const out = ms.toString();
  const importLine = out.slice(0, out.indexOf('\n'));
  check('refBlock/trailing comment stays on import line', importLine.includes('// trailing'), true);
  check('refBlock/var _ref lands below the trailing comment', out.indexOf('var _ref') > out.indexOf('// trailing'), true);
}
checkFlushRefAfterTrailingImportComment();

// --- flush() puts the ref block on its own line after a `;`-terminated import (no trailing newline) ---
// `import x from "y";foo()` ends with `;` then code on the SAME line. a `;`-terminated prior
// statement is syntactically safe to abut, but `import x from "y";var _ref;` jammed onto one line
// is a cosmetic regression - the memo must drop onto its own line below the import
function checkFlushRefAfterSemicolonSameLine() {
  const src = 'import x from "y";foo();';
  const ms = new MagicString(src);
  // userImportEnd = just past the import's `;` (the next char is `f`, same line)
  const userImportEnd = src.indexOf(';') + 1;
  const inj = new ImportInjector({ mode: 'actual', pkg: 'x', ms, userImportEnd });
  inj.generateDeclaredRef();
  inj.flush();
  const out = ms.toString();
  const firstLine = out.slice(0, out.indexOf('\n'));
  check('refBlock/ref not jammed onto `;`-terminated import line', firstLine.includes('var _ref'), false);
  check('refBlock/import preserved alone on first line', firstLine, 'import x from "y";');
}
checkFlushRefAfterSemicolonSameLine();

// sibling plugin may overwrite a range that contains the prologueEnd insertion point.
// `appendRight` then throws "Cannot split a chunk that has already been edited"; the build
// dies with a stack pointing into MagicString rather than the import emission. fallback to
// `prepend` lets the build continue with imports at the head (loses post-shebang/post-directive
// position but that's strictly better than a hard crash)
function checkFlushFallsBackOnEditedRange() {
  const src = '/* large header comment that the sibling plugin overwrites */\nfoo();';
  const ms = new MagicString(src);
  // simulate sibling plugin overwriting a range that contains prologueEnd (index 62 here)
  ms.overwrite(0, 62, '/* z */');
  const inj = new ImportInjector({ mode: 'actual', pkg: 'core-js', ms });
  inj.globalImports.add('es.promise.try');
  // must not throw despite the overlap
  inj.flush();
  const out = ms.toString();
  check('flush/falls back when prologueEnd inside overwritten range',
    out.includes('import "core-js/modules/es.promise.try"'), true);
}
checkFlushFallsBackOnEditedRange();

// asymmetric fallback: imports land at the prologue end (importPos) but a sibling overwrite straddles
// the trailing-user-import anchor (refPos), so the refs' appendRight throws. the refs must FOLD BACK
// to the import anchor (after the directive) - NOT prepend at position 0, which would land `var _ref;`
// above the `'use strict';` directive prologue, silently demoting the module to sloppy mode and
// violating import/first. assert the directive still leads and the ref sits after it
function checkFlushAsymmetricFallbackKeepsDirective() {
  const src = "'use strict';\nimport x from 'y';\nfoo;\n";
  const ms = new MagicString(src);
  const userImportEnd = "'use strict';\nimport x from 'y';".length;
  // straddle refPos (end of the user import) so refs' appendRight fails while imports' succeeds
  ms.overwrite(userImportEnd - 2, userImportEnd + 2, 'Q');
  const inj = new ImportInjector({ mode: 'actual', pkg: 'core-js', ms,
    userImportEnd, directiveEnd: "'use strict';".length });
  inj.addGlobalImport('es.array.at');
  inj.generateDeclaredRef();
  inj.flush();
  const out = ms.toString();
  check('flush/asymmetric fallback keeps directive leading', out.indexOf("'use strict'"), 0);
  check('flush/asymmetric fallback keeps var after directive',
    out.indexOf('var _ref') > out.indexOf("'use strict'"), true);
}
checkFlushAsymmetricFallbackKeepsDirective();

// --- ImportInjector dedup behaviour ---
// mixed `import Def, { default as Alt }` registers Def first (default specifier comes before
// named in source order). last-write-wins on `existingPureImports` would pick `Alt` as dedup
// target — asymmetric with `#importInfoByName` (first-write-wins) and counter to user intent
// (Def is the canonical handle). first-write-wins on both maps keeps dedup stable
function checkExistingImportFirstWriteWins() {
  const ms = new MagicString('');
  const inj = new ImportInjector({ mode: 'actual', pkg: '@core-js/pure', ms });
  inj.registerUserPureImport('promise/try', '_Def');
  inj.registerUserPureImport('promise/try', '_Alt');
  // dedup target should be the FIRST registered name, not the second
  check('existingPureImports/first-write-wins', inj.addPureImport('promise/try', 'Promise$try'), '_Def');
}
checkExistingImportFirstWriteWins();

// --- BOM in sourcesContent ---
// MagicString.prepend('\uFEFF') updates the output but the slice it captured for
// `sourcesContent` is the BOM-stripped original. without restoration, devtools show the file
// 1 byte short of its on-disk size and the source view doesn't match the file. plugin restores
// the BOM in `map.sourcesContent[0]` after `generateMap`
function checkBomSourcesContent() {
  const id = '/src/with-bom.js';
  // BOM + a polyfillable expression so plugin actually transforms (no-transform path skips map)
  const source = '\uFEFFconst x = Array.from([1]);';
  const plugin = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 } });
  const result = plugin.transform(source, id);
  if (!result?.map?.sourcesContent?.[0]) {
    counts.failed++;
    echo`${ red('FAIL') } ${ cyan('sourceMap/BOM sourcesContent') } :: missing sourcesContent`;
    return;
  }
  check('sourceMap/BOM length', result.map.sourcesContent[0].length, source.length);
  check('sourceMap/BOM prefix', result.map.sourcesContent[0].charCodeAt(0), 0xFEFF);
}
checkBomSourcesContent();

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

// --- collectAllBindingNames orphan-ref heuristic ---
// parent-tracking distinguishes plugin's nested `_ref = X` emission (inside a ConditionalExpression
// guard or a call argument) from user's stand-alone sloppy-mode `_ref = X;` statement. without
// parent context, user `_ref = window.data;` at top level matches the complex-RHS heuristic
// and gets adopted - resulting `var _ref;` shadows the user's intended global assignment
function collectBindings(src) {
  // eslint-disable-next-line node/no-sync -- oxc-parser sync-only API
  return collectAllBindingNames(parseSync('unit.js', src).program);
}
function checkOrphan(label, src, orphans, names = null) {
  const result = collectBindings(src);
  check(`collectBindings/${ label }/orphans`, [...result.orphanRefs].sort().join(','), orphans.join(','));
  if (names) check(`collectBindings/${ label }/names.has`, names.every(n => result.names.has(n)), true);
}
// `declaredNames` separates true bindings from Identifier-traversal reservations so the
// orphan adopt-filter can distinguish "user wrote `var _ref;`" from "Identifier traversal
// saw the orphan target itself in `(_ref = ...)`". without this, every plugin-shaped orphan
// hits its own Identifier slot in `names` and gets filtered out as if user-declared
function checkDeclared(label, src, declared, undeclared = []) {
  const result = collectBindings(src);
  for (const name of declared) check(`collectBindings/${ label }/declared/${ name }`, result.declaredNames.has(name), true);
  for (const name of undeclared) check(`collectBindings/${ label }/not-declared/${ name }`, result.declaredNames.has(name), false);
}
// orphan-only: `_ref` appears only as the LHS of plugin-shaped assignment + recursive read
// of itself. nothing in the AST `declares` it, so adoption gate must let it through
checkDeclared('orphan-only', 'null == (_ref = foo()) ? void 0 : _ref;', [], ['_ref']);
// user `var _ref;` declares - orphan-adoption must skip
checkDeclared('user var', 'var _ref; null == (_ref = foo()) ? void 0 : _ref;', ['_ref']);
// user catch param declares
checkDeclared('user catch', 'try {} catch (_ref) {} null == (_ref = foo()) ? void 0 : _ref;', ['_ref']);
// plugin-shaped: nested `_ref = X` inside a ConditionalExpression (guard emission)
checkOrphan('nested call', 'null == (_ref = foo()) ? void 0 : _ref;', ['_ref']);
checkOrphan('nested member', 'null == (_ref = foo.bar) ? void 0 : _ref;', ['_ref']);
checkOrphan('nested new', 'null == (_ref = new Foo()) ? void 0 : _ref;', ['_ref']);
// user sloppy-mode: stand-alone `_ref = X;` - never plugin's shape regardless of RHS
checkOrphan('top-level call', '_ref = foo();', [], ['_ref']);
checkOrphan('top-level member', '_ref = window.data;', [], ['_ref']);
checkOrphan('top-level new', '_ref = new Foo();', [], ['_ref']);
checkOrphan('top-level literal', '_ref = 42;', [], ['_ref']);
// user: `let _ref` reserves, never orphan
checkOrphan('let decl', 'let _ref = foo();', [], ['_ref']);
// mixed: user's top-level `_ref = X;` + plugin-style nested `_ref2 = foo()` in one file
checkOrphan('mixed shapes', '_ref = window.x; null == (_ref2 = bar()) ? void 0 : _ref2;',
  ['_ref2'], ['_ref']);
// scope-depth gate: `_ref = foo()` inside a function is user code regardless of RHS.
// plugin's orphan emission only happens at module top-level (post-pass rehydrate declares
// `var _ref;` there), so nested-scope occurrences reserve the name instead of adopting it
checkOrphan('nested in function body',
  'function f() { null == (_ref = bar()) ? void 0 : _ref; }', [], ['_ref']);
checkOrphan('nested in arrow body',
  'const f = () => null == (_ref = bar()) ? void 0 : _ref;', [], ['_ref']);
checkOrphan('nested in class method',
  'class C { run() { null == (_ref = bar()) ? void 0 : _ref; } }', [], ['_ref']);

// user-shape assignments in structural control positions: switch-case / throw / loop / if /
// while / do-while / return heads. plugin never emits `_ref = X` in any of these, so they are
// always user code and must NOT be adopted as orphans (would shadow the user's intent)
checkOrphan('switch case test',
  'switch (x) { case (_ref = foo()): break; }', [], ['_ref']);
checkOrphan('throw argument',
  'throw (_ref = foo());', [], ['_ref']);
checkOrphan('for-init',
  'for (_ref = foo(); false;) {}', [], ['_ref']);
checkOrphan('if test',
  'if (_ref = foo()) {}', [], ['_ref']);
checkOrphan('while test',
  'while (_ref = foo()) break;', [], ['_ref']);
checkOrphan('do-while test',
  'do {} while (_ref = foo());', [], ['_ref']);
checkOrphan('return argument',
  'function g() { return (_ref = foo()); }', [], ['_ref']);

// user assignment as a direct ternary branch (`cond ? (_ref = X) : f()`). the plugin's own
// memoize emit puts `_ref =` inside the `null == (...)` test (a BinaryExpression), never as a
// bare branch - so a ConditionalExpression parent is user-only and must reserve, not adopt
checkOrphan('conditional consequent',
  'cond ? (_ref = foo()) : f();', [], ['_ref']);
checkOrphan('conditional alternate',
  'cond ? f() : (_ref = foo());', [], ['_ref']);
checkDeclared('conditional consequent reserves', 'cond ? (_ref = foo()) : f();', ['_ref']);
// user assignment chained as the RHS of another assignment (`x = _ref = X`). plugin only emits
// memo refs inside `null == (...)` tests or call arguments, never a nested assignment RHS
checkOrphan('nested assignment rhs',
  'x = _ref = foo();', [], ['_ref']);
checkDeclared('nested assignment rhs reserves', 'x = _ref = foo();', ['_ref']);
// user assignment as a direct logical operand (`flag && (_ref = X)` / `||` / `??`). the plugin's
// memoize emit lives inside a `null == (...)` test or a call arg, never as a bare `&&`/`||`/`??`
// operand - so a LogicalExpression parent is user-only and must reserve, not adopt (else the
// post-pass injects a module-level `var _ref;` that localizes the user's implicit-global `_ref`)
checkOrphan('logical && operand', 'flag && (_ref = foo());', [], ['_ref']);
checkOrphan('logical || operand', 'flag || (_ref = foo());', [], ['_ref']);
checkOrphan('logical ?? operand', 'flag ?? (_ref = foo());', [], ['_ref']);
checkDeclared('logical operand reserves', 'flag && (_ref = foo());', ['_ref']);
// nested logical operand (`a && b && (_ref = c)`) - the direct parent is still a LogicalExpression
checkOrphan('nested logical operand', 'a && b && (_ref = foo());', [], ['_ref']);
// precision: a user logical-operand `_ref` + a real plugin binary-test `_ref2` in one file -> only
// the plugin orphan is adopted (the LogicalExpression blacklist must not suppress real orphans)
checkOrphan('mixed logical-user + plugin orphan',
  'flag && (_ref = foo()); null == (_ref2 = bar()) ? void 0 : _ref2;', ['_ref2'], ['_ref']);
// plugin's own emit shapes stay adopted: `_ref =` inside the `null == (...)` BinaryExpression
// test and as a call argument are both still recognized as orphans (regression guard for the
// new ConditionalExpression / AssignmentExpression blacklist entries)
checkOrphan('plugin binary-test emit still orphan',
  'null == (_ref = foo()) ? void 0 : _ref;', ['_ref']);
checkOrphan('plugin call-arg emit still orphan',
  'foo(_ref = bar());', ['_ref']);
// deeper edges of the user-only positions: the same `_ref` written in BOTH ternary branches,
// and chained through more than one `=` (`a = b = _ref = X`). still a single user binding the
// plugin never emits, so it must reserve once and never adopt
checkOrphan('conditional both branches',
  'cond ? (_ref = foo()) : (_ref = bar());', [], ['_ref']);
checkDeclared('conditional both branches reserves', 'cond ? (_ref = foo()) : (_ref = bar());', ['_ref']);
checkOrphan('multi-level assignment chain',
  'a = b = _ref = foo();', [], ['_ref']);
checkDeclared('multi-level assignment chain reserves', 'a = b = _ref = foo();', ['_ref']);
// nested-assignment parent also covers a user `_ref` written as the RHS of a member-target
// assignment - the plugin never threads a memo write through `obj.x = _ref = ...`
checkOrphan('assignment rhs of member target',
  'obj.prop = _ref = foo();', [], ['_ref']);

// TS expression wrappers (`as` / `!` / `satisfies`) are transparent to the orphan classifier's
// parent check, exactly like parens: a top-level user `_ref = X` wrapped in a TS cast inside a
// throw / case / if head is still user code and must NOT be adopted - a wrapper-blind parent walk
// would see the TS node, miss the structural blacklist, and inject a module `var _ref;` that
// localizes the user's implicit-global write. parsed as TS so the wrapper nodes are produced
function collectBindingsTS(src) {
  // eslint-disable-next-line node/no-sync -- oxc-parser sync-only API
  return collectAllBindingNames(parseSync('unit.ts', src).program);
}
function checkOrphanTS(label, src, orphans) {
  const result = collectBindingsTS(src);
  check(`collectBindings/${ label }/orphans`, [...result.orphanRefs].sort().join(','), orphans.join(','));
}
checkOrphanTS('throw + as-cast', 'throw ((_ref = foo()) as any);', []);
checkOrphanTS('case + as-cast', 'switch (x) { case ((_ref = foo()) as any): break; }', []);
checkOrphanTS('if + as-cast', 'if (((_ref = foo()) as any)) {}', []);
checkOrphanTS('throw + non-null', 'throw ((_ref = foo())!);', []);
// regression: a genuine plugin-shape `null == (...)` test is still adopted with TS in the file
checkOrphanTS('plugin binary-test still orphan (ts)', 'null == (_ref = foo()) ? void 0 : _ref;', ['_ref']);

// --- deoptionalizeNeedle ---
// `?.(`/`?.[` drop both chars regardless of intervening whitespace - ECMAScript parsers
// allow `obj ?. (args)` / `obj?.\n[i]`, so the source slice the queue sees may have
// whitespace between the optional marker and the call/index token
check('deopt/dot prop', deoptionalizeNeedle('obj?.foo'), 'obj.foo');
check('deopt/call', deoptionalizeNeedle('obj?.(args)'), 'obj(args)');
check('deopt/index', deoptionalizeNeedle('obj?.[i]'), 'obj[i]');
check('deopt/newline before call', deoptionalizeNeedle('obj?.\n(args)'), 'obj\n(args)');
check('deopt/space before call', deoptionalizeNeedle('obj?. (args)'), 'obj (args)');
check('deopt/space before index', deoptionalizeNeedle('obj?. [i]'), 'obj [i]');
check('deopt/at end', deoptionalizeNeedle('obj?.'), 'obj.');

// --- deoptionalizeNeedleAtPositions ---
// strip `?.` only at the SELECTED absolute positions an outer transform recorded, mirroring
// the emitter's per-hop deopt. `arr?.at(0)?.flat()` lives at absolute [10,28); an outer that
// folded only the `?.flat` hop kept the leading `?.at` verbatim and stripped the marker at 20
check('deopt-at/single hop kept-leading', deoptionalizeNeedleAtPositions('arr?.at(0)?.flat()', 10, [20]), 'arr?.at(0).flat()');
check('deopt-at/single hop kept-trailing', deoptionalizeNeedleAtPositions('arr?.at(0)?.flat()', 10, [13]), 'arr.at(0)?.flat()');
check('deopt-at/both positions', deoptionalizeNeedleAtPositions('arr?.at(0)?.flat()', 10, [13, 20]), 'arr.at(0).flat()');
// `?.(` / `?.[` drop both chars when targeted; `?.prop` keeps the dot. position is the offset
// of the `?.` marker (the emitter records `object.end`), which is 3 for `obj?.` (`obj` ends at 3)
check('deopt-at/call marker', deoptionalizeNeedleAtPositions('obj?.(a)', 0, [3]), 'obj(a)');
check('deopt-at/index marker', deoptionalizeNeedleAtPositions('obj?.[i]', 0, [3]), 'obj[i]');
// positions outside the slice are skipped, leaving the needle untouched - an outer's full
// deopt list applied to a sub-slice only affects markers that fall inside it
check('deopt-at/out-of-range skipped', deoptionalizeNeedleAtPositions('arr?.flat()', 100, [200]), 'arr?.flat()');
check('deopt-at/empty positions', deoptionalizeNeedleAtPositions('arr?.flat()', 0, []), 'arr?.flat()');

// --- hasIdentifierBoundary: astral-adjacent needle ---
// the needle replacer only fires at standalone token boundaries. an astral (surrogate-pair)
// identifier char immediately BEFORE the needle must suppress the boundary - testing only the
// trailing low surrogate (not the whole code point) mis-classifies it as a non-identifier and
// would wrongly treat the needle as standalone, replacing a fragment of a larger identifier
check('boundary/astral ident char before needle suppresses boundary',
  hasIdentifierBoundary(`${ String.fromCodePoint(0x1D400) }Promise`, 2, 'Promise'), false);
// a plain non-identifier (space) before the needle is a genuine standalone boundary
check('boundary/space before needle is a boundary',
  hasIdentifierBoundary(' Promise', 1, 'Promise'), true);
// astral ident char immediately AFTER the needle also suppresses (leading high surrogate)
check('boundary/astral ident char after needle suppresses boundary',
  hasIdentifierBoundary(`Promise${ String.fromCodePoint(0x1D400) }`, 0, 'Promise'), false);
// an astral NON-identifier code point (emoji) before the needle is a GENUINE boundary - the fix
// reads the whole code point and classifies it, it does not blindly suppress on any surrogate pair
check('boundary/astral non-ident char before needle is a boundary',
  hasIdentifierBoundary(`${ String.fromCodePoint(0x1F600) }Promise`, 2, 'Promise'), true);

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

// --- TransformQueue: partial-overlap detection picks the actually-intersecting pair ---
// running-max approach reported `[outerMax]` even when the actual conflict was between
// non-max intervals. open-list approach drops intervals fully behind, so `find` returns
// the closest still-open interval that `curr` partially overlaps - the diagnostic now
// names the pair the user can act on
function checkPartialOverlapDiagnostic() {
  const ms = new MagicString('xxxxxxxxxxxxxxxxxxxxxxxxxx');
  const q = new TransformQueue(ms.original, ms);
  // [0,10), [3,8), [5,12) - [0,10) is running-max, but actual partial overlap is
  // ALSO between [3,8) and [5,12). closest-open should report [3,8) vs [5,12) since
  // [0,10) was already closed in some scenarios. here the closest open at curr=[5,12)
  // is the smaller [3,8) (filter keeps both since both end > 5)
  q.add(0, 10, 'A');
  q.add(3, 8, 'B');
  let threw = false;
  try {
    q.add(5, 12, 'C');
    q.apply();
  } catch (error) {
    threw = true;
    check('partial-overlap message names true conflict', error.message.includes('[0,10)') || error.message.includes('[3,8)'), true);
  }
  check('partial-overlap throws', threw, true);
}
checkPartialOverlapDiagnostic();

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
// (timestamp stripped) so pre→post lookup survives HMR. without the strip, post-pass
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
// across pre→post (where mid-pipeline normalization may have run) miss
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
  check('phase/pre+post imports match single', twoPassImports, singleImports);
}
checkPhasePipelinePassThrough();

// `additionalPackages` items must be non-empty non-slash-only strings. validateOptions
// catches this for plugin-options-layer users; direct createPolyfillContext callers also
// get a defensive throw. without it, `''` / `'/'` cascades through `packages` and would
// false-positive every absolute path в `getCoreJSEntry`'s `startsWith('/')` check
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
// `enableReferenceTracking` fires for every post pass to filter dead imports (e.g.
// destructure-transform dropping all uses mid-pass). without parity Identifier visitor
// mounted in the SAME post-pass case, no `trackReferencedName` ever fires and
// pruneUnusedRefs strips ALL pure imports as unreferenced - emit becomes empty
function checkSinglePostPassEmitsPureImports() {
  const code = 'export var x = "test".at(-1);\nexport var m = new Map();';
  const opts = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
  // direct `pass: 'post'` without prior pre - simulates `phase: 'post'`-only build setup
  const out = createPlugin(opts).transform(code, '/single-post.mjs', 'post');
  const importLines = (out?.code ?? '').split('\n').filter(l => l.startsWith('import '));
  check('single-post/emits pure imports', importLines.length > 0, true);
}
checkSinglePostPassEmitsPureImports();

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
  const noop = ctx => unplugin.raw({ method: 'entry-global', ...ctx, targets: 'chrome 50' }, { framework: 'vite' });
  const tryFactory = ctx => {
    try {
      noop(ctx);
      return null;
    } catch (error) {
      return error;
    }
  };
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
// 'single'), otherwise `enableReferenceTracking` / `pruneUnusedRefs` / post-snapshot
// pickup don't fire and an isolated post build emits an empty bundle. mirrors the
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

// --- deeply-nested body-wraps compose correctly (iterative post-order) ---
// regression lock for the scope-tracker body-wrap composition: `#composeBodyWrapText` walks the
// wrap nesting iteratively (heap stack, no per-level re-filter, no recursion-depth footgun). the
// input nests `depth` genuine body-wraps - the triply-nested flatten-sibling fixture shape scaled
// up well past any handful. every level must emit exactly one `var _ref`; a composition that
// truncated deep wraps (e.g. a re-introduced depth cap below `depth`) would emit fewer.
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

// --- TransformQueue.addSplit invariant diagnostic ---
// regression lock for TQ-16-05: caller-side gate at polyfill-emitter:300 prevents
// zero-length halves today, but the runtime invariant must surface a clear message
// when a future caller forgets the gate. previously fell through to add()'s [X,X)
// RangeError without indicating which side was bad
function checkAddSplitInvariant() {
  const tq = new TransformQueue('abcdefghij');
  const tryCall = args => {
    try {
      tq.addSplit(...args);
      return null;
    } catch (error) {
      return error?.message;
    }
  };
  check('addSplit valid call: no throw', tryCall([0, 5, 10, 'p', 's', null, null]), null);
  const zeroLeft = tryCall([5, 5, 8, 'p', 's', null, null]);
  check('addSplit zero-left half: throws with positions', !!zeroLeft?.includes('[5,5,8)'), true);
  const zeroRight = tryCall([0, 8, 8, 'p', 's', null, null]);
  check('addSplit zero-right half: throws with positions', !!zeroRight?.includes('[0,8,8)'), true);
  const inverted = tryCall([5, 3, 8, 'p', 's', null, null]);
  check('addSplit inverted: throws (mid < start)', !!inverted?.includes('addSplit invariant'), true);
}
checkAddSplitInvariant();

// --- TransformQueue.containsRange logical-end semantics for split entries ---
// regression lock for TQ-16-02: containsRange / hasGuardFor previously used physical
// `entry.end` (= mid for split prefix) instead of `splitInfo.logicalEnd`. queries inside
// (mid, logicalEnd) on a split-bearing range were wrongly reported as not-contained
function checkContainsRangeOnSplitEntries() {
  const tq = new TransformQueue('abcdefghij');
  // split [0, 5, 10): physical prefix end = 5, logical end = 10
  tq.addSplit(0, 5, 10, 'p', 's', null, null);
  check('split-prefix sub-range contained', tq.containsRange(1, 4), true);
  check('split sub-range crossing mid is contained', tq.containsRange(2, 8), true);
  check('split-suffix sub-range contained logically', tq.containsRange(6, 9), true);
  // strict containment: equal range is NOT contained (both transforms must apply)
  check('split exact logical match is not contained', tq.containsRange(0, 10), false);
  check('split sub-range past logical end is not contained', tq.containsRange(5, 11), false);
}
checkContainsRangeOnSplitEntries();

// `deoptionalizeNeedle` skips ASCII whitespace AND comments (line + block) between `?.`
// and the next token. line-comment terminator covers all four ECMAScript line terminators
// (LF / CR / U+2028 LS / U+2029 PS) - WS_RE alone matched all four but the LF-only scan
// would walk past LS/PS into real code, then misclassify the next char. positive locks
// for each terminator + block comment + mixed prefix so a future regression to indexOf('\n')
// or a slot-position miscount fails here before it reaches a real fixture
function checkDeoptWhitespaceSkip() {
  check('deopt/tab before call', deoptionalizeNeedle('obj?.\t(args)'), 'obj\t(args)');
  check('deopt/CR before call', deoptionalizeNeedle('obj?.\r\n(args)'), 'obj\r\n(args)');
  check('deopt/line comment LF call', deoptionalizeNeedle('obj?.// c\n(args)'), 'obj// c\n(args)');
  check('deopt/line comment LS call', deoptionalizeNeedle('obj?.// c\u2028(args)'), 'obj// c\u2028(args)');
  check('deopt/line comment PS call', deoptionalizeNeedle('obj?.// c\u2029(args)'), 'obj// c\u2029(args)');
  check('deopt/line comment LS prop', deoptionalizeNeedle('obj?.// c\u2028prop'), 'obj.// c\u2028prop');
  check('deopt/block comment call', deoptionalizeNeedle('obj?./*c*/(args)'), 'obj/*c*/(args)');
  check('deopt/block comment prop', deoptionalizeNeedle('obj?./*c*/prop'), 'obj./*c*/prop');
}
checkDeoptWhitespaceSkip();

// `findOuterGuardRef` tie-break: when two transforms share the SAME guardedRoot AND the
// SAME range size, the strict-`>` comparator keeps the earliest registered. Production
// shape is parent-first visit (outer always wider), so ties are rare; the lock catches
// any accidental shift to LIFO ordering during refactor
function checkFindOuterGuardRefTieBreak() {
  const code = '0123456789abcdef';
  const tq = new TransformQueue(code, new MagicString(code));
  const root = { id: 'shared-root' };
  tq.add(0, 10, 'AAA', root, { rootRaw: 'src', guardRef: '_first', deoptPositions: [],
    objectStart: 0, absorbsRoot: false });
  tq.add(0, 10, 'BBB', root, { rootRaw: 'src', guardRef: '_second', deoptPositions: [],
    objectStart: 0, absorbsRoot: false });
  check('findOuterGuardRef tie-break: earliest wins',
    tq.findOuterGuardRef(root), '_first');
}
checkFindOuterGuardRefTieBreak();

// --- bundler adapter named exports ---
// supported bundlers per package.json description + exports map: 8 adapters with both
// named export AND `./<name>` sub-entry. unloader is upstream-exposed but core-js does
// not target it (no sub-entry, no docs, no test wiring) — intentionally not exported
async function checkBundlerAdapterExports() {
  const exported = await import('../../packages/core-js-unplugin/index.js');
  for (const name of ['vite', 'webpack', 'rollup', 'esbuild', 'rspack', 'rolldown', 'farm', 'bun']) {
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
  // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
  const parseTop = src => parseSync('test.js', src).program;
  // ChainExpression wraps optional `a?.b` / `a?.()` in oxc; unwrap to inner Member/Call
  const unwrapChain = node => node?.expression ?? node;

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

// --- isLineTerminator: ES spec LineTerminator set (LF / CR / LS / PS) ---
check('isLineTerminator/LF', isLineTerminator('\n'), true);
check('isLineTerminator/CR', isLineTerminator('\r'), true);
check('isLineTerminator/LS U+2028', isLineTerminator('\u2028'), true);
check('isLineTerminator/PS U+2029', isLineTerminator('\u2029'), true);
check('isLineTerminator/space', isLineTerminator(' '), false);
check('isLineTerminator/tab', isLineTerminator('\t'), false);
check('isLineTerminator/empty rejects', isLineTerminator(''), false);
check('isLineTerminator/NBSP not LT', isLineTerminator('\u00A0'), false);

// --- skipBlockComment: forward-scan past `/* ... */`, returns position after `*/` ---
// caller has verified `src[p]==='/' && src[p+1]==='*'`; unterminated comment falls back
// to src.length so upstream raw-text scanners can't infinite-loop on broken source
check('skipBlockComment/normal', skipBlockComment('/* x */y', 0), 7);
check('skipBlockComment/empty body', skipBlockComment('/**/a', 0), 4);
check('skipBlockComment/multi-line', skipBlockComment('/*\n*\n*/z', 0), 7);
check('skipBlockComment/unterminated -> src.length',
  skipBlockComment('/* no close', 0), 'no close'.length + '/* '.length);
check('skipBlockComment/offset-relative scan', skipBlockComment('zz/* y */a', 2), 9);

// --- skipGap: forward-scan past whitespace + line comments + block comments ---
check('skipGap/no gap', skipGap('foo', 0), 0);
check('skipGap/spaces only', skipGap('   foo', 0), 3);
check('skipGap/tabs and newlines', skipGap('\t\n\r foo', 0), 4);
check('skipGap/line comment', skipGap('// hi\nfoo', 0), 6);
check('skipGap/line comment hits EOF', skipGap('// hi', 0), 5);
check('skipGap/block comment', skipGap('/* x */ foo', 0), 8);
check('skipGap/mixed gap chain', skipGap('  // a\n /* b */\t foo', 0), 17);
check('skipGap/U+2028 inside gap', skipGap('\u2028foo', 0), 1);
check('skipGap/U+2029 inside gap', skipGap('\u2029foo', 0), 1);
check('skipGap/NBSP inside gap', skipGap('\u00A0foo', 0), 1);
check('skipGap/unterminated block returns src.length',
  skipGap('/* no close', 0), '/* no close'.length);
check('skipGap/from offset', skipGap('xx  yy', 2), 4);

// --- canFuseWithOpenParen: prev significant char fuses with `(` per ASI semantics ---
// `\w` / `"` / `$` / `)` / `/` / `]` / `` ` `` / `}` form a callable / member-access /
// computed-key / template-tag boundary; `(` after them parses as a CallExpression and
// breaks any subsequent injection that expects to live on its own statement
check('canFuseWithOpenParen/identifier end', canFuseWithOpenParen('foo (', 4), true);
check('canFuseWithOpenParen/digit', canFuseWithOpenParen('a1 (', 3), true);
check('canFuseWithOpenParen/closing paren', canFuseWithOpenParen('a() (', 4), true);
check('canFuseWithOpenParen/closing bracket', canFuseWithOpenParen('a[1] (', 5), true);
check('canFuseWithOpenParen/closing brace', canFuseWithOpenParen('{} (', 3), true);
check('canFuseWithOpenParen/string end', canFuseWithOpenParen('"x" (', 4), true);
check('canFuseWithOpenParen/template end', canFuseWithOpenParen('`x` (', 4), true);
check('canFuseWithOpenParen/start of file', canFuseWithOpenParen('(', 0), false);
check('canFuseWithOpenParen/only whitespace before', canFuseWithOpenParen('   (', 3), false);
check('canFuseWithOpenParen/semicolon before', canFuseWithOpenParen('foo; (', 5), false);
// astral (surrogate-pair) identifier char at the prev-significant position: the ASI guard must test
// the WHOLE code point, not the lone trailing low surrogate (which matches nothing and would skip
// the guard, fusing the `(` into the prior identifier). a non-identifier astral char does NOT fuse
check('canFuseWithOpenParen/astral identifier end', canFuseWithOpenParen('\u{1D4CF} (', 3), true);
check('canFuseWithOpenParen/astral non-identifier end', canFuseWithOpenParen('\u{1F600} (', 3), false);
check('canFuseWithOpenParen/skips line comment',
  canFuseWithOpenParen('foo // tail\n(', 12), true);
check('canFuseWithOpenParen/skips block comment',
  canFuseWithOpenParen('foo /* tail */(', 14), true);
check('canFuseWithOpenParen/block comment hides fuse',
  canFuseWithOpenParen('; /* foo */ (', 12), false);
// regex literal `/a*/`: the `*/` looks like a block-comment closer at first glance,
// but `lastIndexOf('/*')` from BEFORE the `*` returns -1 (no matching opener); the `/`
// is then a regex literal terminator (fuses with `(`). without the fix, the backward
// scan returned -1 and ASI guard was skipped, parsing `/a*/(arr)()` as a regex call
check('canFuseWithOpenParen/regex closer not block comment',
  canFuseWithOpenParen('var rx = /a*/\n(', 14), true);
// apostrophe inside `/* don't */` previously flipped quote-state inside
// `realLineCommentStart`, causing the real `//` after it to NOT be detected and the
// backward walk to land inside the "comment" text. block-comment skip in the forward
// scan fixes the quote-state contamination - prev significant = `)` of `x()`
check('canFuseWithOpenParen/apostrophe in block comment',
  canFuseWithOpenParen("x() /* don't */ // c\n", 21), true);
// `//` INSIDE a block comment isn't a real line comment; without block-comment skip in
// `realLineCommentStart`, the backward walk lands inside the block-comment body
// (`a` of `/* a // b */`). with the skip, prev significant = `r` of `bar`
check('canFuseWithOpenParen/double-slash inside block comment',
  canFuseWithOpenParen('foo /* a // b */ bar\n', 20), true);
// Unicode ID_Continue chars (`α`) end an identifier; ASCII `\w` missed them and the
// `(` would fuse silently into a CallExpression
check('canFuseWithOpenParen/unicode identifier end',
  canFuseWithOpenParen('var Mapα\n(', 9), true);
// NBSP / FF / VT / BOM / ogham / mongolian / em-quad - JS WhiteSpace beyond ASCII space
// and tab. previous 6-char allowlist missed them, treating them as significant chars
check('canFuseWithOpenParen/NBSP between token and paren',
  canFuseWithOpenParen('foo() \n(', 7), true);
check('canFuseWithOpenParen/BOM mid-file as whitespace',
  canFuseWithOpenParen('foo()﻿\n(', 7), true);
// multi-line string via `\<LineTerminator>` continuation: line 2 starts INSIDE the string,
// so a `//` there is content, not a line comment. closing `"` IS the significant boundary
check('canFuseWithOpenParen/line-continuation string',
  canFuseWithOpenParen('var s = "foo\\\n//bar"\n', 20), true);
// multi-line template literal: `\n` inside backticks doesn't break the template; `//`
// inside is content. closing `` ` `` IS significant
check('canFuseWithOpenParen/multi-line template',
  canFuseWithOpenParen('var t = `a\n//b`\n', 15), true);
// `${...}` template expression - chunk before and after `${...}` are template regions;
// the expression body is JS context. closing `` ` `` IS significant
check('canFuseWithOpenParen/template with expression',
  // eslint-disable-next-line no-template-curly-in-string -- intentional template literal as plain string for the source-under-test
  canFuseWithOpenParen('var t = `a${1}b`\n', 16), true);
// `/*` substring inside a string literal - lastIndexOf-based block-comment back-scan
// previously matched it as a real opener. with the literal-region scanner, the `/` at end
// (an unrelated `*/` shape) is correctly significant since it sits OUTSIDE any region
check('canFuseWithOpenParen/asterisk-slash with /* in earlier string',
  canFuseWithOpenParen('var s = "/* x"; */', 18), true);
// nested template inside `${...}` expression: scanner must recursively classify the inner
// template's content too. inner closing `` ` `` is the significant boundary
check('canFuseWithOpenParen/nested template in expression',
  // eslint-disable-next-line no-template-curly-in-string -- intentional source-under-test
  canFuseWithOpenParen('var t = `a${`b`}c`', 18), true);
// triple-nested template (`${`${`x`}`}`) - exercises depth-N recursion in tryScanLiteralAt
check('canFuseWithOpenParen/triple-nested template',
  // eslint-disable-next-line no-template-curly-in-string -- intentional source-under-test
  canFuseWithOpenParen('var t = `a${`b${`c`}b`}a`', 25), true);
// string literal inside `${...}` body must classify as JS context's literal (not as
// part of template). closing `` ` `` of outer template IS the significant boundary
check('canFuseWithOpenParen/string in template expression',
  // eslint-disable-next-line no-template-curly-in-string -- intentional source-under-test
  canFuseWithOpenParen('var t = `${"hi"}`', 17), true);
// block comment inside `${...}` body: `//` is a real comment in JS context, not template
// content. tested via no-shadow case - presence of comment doesn't change classification
check('canFuseWithOpenParen/block comment in template expression',
  // eslint-disable-next-line no-template-curly-in-string -- intentional source-under-test
  canFuseWithOpenParen('var t = `${/* c */1}`', 21), true);
// escaped quote inside string - `\\"` doesn't close the string; closing `"` IS the one
// after the escape
check('canFuseWithOpenParen/escaped quote in string',
  canFuseWithOpenParen('var s = "a\\"b"', 14), true);
// unescaped line terminator ends a string (spec SyntaxError but scanner stays robust).
// scanner bails at the LT; the LT itself is whitespace, the `'` opener is significant
check('canFuseWithOpenParen/unterminated string at newline',
  canFuseWithOpenParen("var s = 'foo\n", 13), true);
// unterminated template extends to end of source. closing `` ` `` is missing; the LAST
// char of the source (still inside the template region) is reported as significant
check('canFuseWithOpenParen/unterminated template',
  canFuseWithOpenParen('var t = `foo', 12), true);
// CRLF inside `\<CR><LF>` line continuation - both chars consumed by the escape
check('canFuseWithOpenParen/CRLF line continuation in string',
  canFuseWithOpenParen('var s = "a\\\r\nb"', 16), true);
// mixed quote styles - each closes only on its own opening char
check('canFuseWithOpenParen/single quotes inside double',
  canFuseWithOpenParen('var s = "a\'b\'c"', 15), true);
check('canFuseWithOpenParen/double quotes inside single',
  canFuseWithOpenParen('var s = \'a"b"c\'', 15), true);

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

// --- varScopeAnchor: anchor for `var _ref;` insertion at function/block scope ---
function programOf(src, sourceType = 'module') {
  // eslint-disable-next-line node/no-sync -- oxc-parser sync-only API
  return parseSync('/x.mjs', src, { sourceType }).program;
}
function checkVarScopeAnchor() {
  // BlockStatement: insertPos is `{` + 1 (open-brace position + 1)
  const [block] = programOf('{ a; b; }').body;
  const blockAnchor = varScopeAnchor(block, '{ a; b; }');
  check('varScopeAnchor/BlockStatement statements ref', blockAnchor?.statements, block.body);
  check('varScopeAnchor/BlockStatement insertPos after {', blockAnchor?.insertPos, block.start + 1);

  // StaticBlock: insertPos skips `static` keyword + whitespace + comments before `{`
  const [cls] = programOf('class C { static /* x */ { a; } }').body;
  const [sb] = cls.body.body;
  const code = 'class C { static /* x */ { a; } }';
  const sbAnchor = varScopeAnchor(sb, code);
  check('varScopeAnchor/StaticBlock statements', sbAnchor?.statements, sb.body);
  check('varScopeAnchor/StaticBlock insertPos after { past comment',
    code[sbAnchor.insertPos - 1], '{');

  // non-anchor shapes return null - plugin walks past them
  check('varScopeAnchor/Identifier returns null', varScopeAnchor({ type: 'Identifier', name: 'x' }, 'x'), null);
  check('varScopeAnchor/IfStatement returns null',
    varScopeAnchor({ type: 'IfStatement', body: null }, 'if (x);'), null);
}
checkVarScopeAnchor();

// --- isBodylessStatementBody: is this path the body slot of an if/loop/arrow? ---
// path stubs mirror the `node` / `parentPath.node` shape the helper uses. NOTE: the
// helper passes the (parent.node, node) pair to `isBodylessStatementSlot` without an
// extra BlockStatement gate - so a BlockStatement IN a body slot returns true. real
// callers (destructure-emitter) pass declaration paths INSIDE the BlockStatement,
// whose parent is the BlockStatement itself (not a body-slot host), so the false case
// arises naturally there
function checkIsBodylessStatementBody() {
  // unbraced single-statement consequent: `if (cond) call();` - call is body slot of if
  const [ifStmt] = programOf('if (cond) call();').body;
  const callPath = { node: ifStmt.consequent, parentPath: { node: ifStmt } };
  check('isBodylessStatementBody/unbraced if consequent', isBodylessStatementBody(callPath), true);

  // a polyfill-target sitting INSIDE the BlockStatement has parent=BlockStatement (not
  // IfStatement) - BlockStatement is not a body-slot host type, so returns false. this
  // is the real usage path - destructure-emitter passes the declaration path inside the
  // block, not the BlockStatement itself
  const [ifBraced] = programOf('if (cond) { call(); }').body;
  const [stmtInsideBlock] = ifBraced.consequent.body;
  const insidePath = { node: stmtInsideBlock, parentPath: { node: ifBraced.consequent } };
  check('isBodylessStatementBody/stmt inside BlockStatement', isBodylessStatementBody(insidePath), false);

  // bodyless else clause: `if(c) a(); else b();` - else slot is also body-slot of IfStatement
  const [ifElse] = programOf('if (c) a(); else b();').body;
  const elsePath = { node: ifElse.alternate, parentPath: { node: ifElse } };
  check('isBodylessStatementBody/unbraced else alternate', isBodylessStatementBody(elsePath), true);

  // unbraced while body
  const [whileStmt] = programOf('while (c) call();').body;
  const whileBody = { node: whileStmt.body, parentPath: { node: whileStmt } };
  check('isBodylessStatementBody/while body', isBodylessStatementBody(whileBody), true);

  // null parent path returns false (defensive)
  check('isBodylessStatementBody/no parentPath returns false',
    isBodylessStatementBody({ node: ifStmt.consequent, parentPath: null }), false);
}
checkIsBodylessStatementBody();

// --- emit-utils.unwrapNode: peel parens / chain / TS wrappers down to semantic core ---
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

// --- emit-utils.isCallee: parent is Call/New with `node` as callee (through wrappers) ---
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

// --- emit-utils.isCalleeWrappedInParens: any paren between parent.callee and node ---
function checkIsCalleeWrappedInParens() {
  const node = { type: 'OptionalMemberExpression', name: 'leaf' };

  // direct - no paren
  const direct = { callee: node };
  check('isCalleeWrappedInParens/direct callee no paren', isCalleeWrappedInParens(direct, node), false);

  // paren wraps node
  const paren = { callee: { type: 'ParenthesizedExpression', expression: node } };
  check('isCalleeWrappedInParens/paren wraps node', isCalleeWrappedInParens(paren, node), true);

  // TS wrapping paren wrapping node
  const tsThenParen = { callee: { type: 'TSAsExpression',
    expression: { type: 'ParenthesizedExpression', expression: node } } };
  check('isCalleeWrappedInParens/TS then paren', isCalleeWrappedInParens(tsThenParen, node), true);

  // TS only, no paren
  const tsOnly = { callee: { type: 'TSNonNullExpression', expression: node } };
  check('isCalleeWrappedInParens/TS only no paren', isCalleeWrappedInParens(tsOnly, node), false);

  // null parent
  check('isCalleeWrappedInParens/null parent', isCalleeWrappedInParens(null, node), false);

  // node not callee at all
  const unrelated = { callee: { type: 'Identifier', name: 'other' } };
  check('isCalleeWrappedInParens/node not under callee', isCalleeWrappedInParens(unrelated, node), false);
}
checkIsCalleeWrappedInParens();

// --- emit-utils.isOutermostOptionalChainMember: path-aware chain-boundary detection ---
function checkIsOutermostOptionalChainMember() {
  const leaf = { type: 'OptionalMemberExpression' };

  // direct child of ChainExpression
  const chainPath = { node: leaf, parentPath: { node: { type: 'ChainExpression' } } };
  check('isOutermostOptionalChainMember/direct chain child', isOutermostOptionalChainMember(chainPath), true);

  // wrapped via CallExpression-with-leaf-as-callee then ChainExpression (instance-call shape)
  const callPath = {
    node: leaf,
    parentPath: {
      node: { type: 'CallExpression', callee: leaf },
      parentPath: { node: { type: 'ChainExpression' } },
    },
  };
  check('isOutermostOptionalChainMember/wrapped through call', isOutermostOptionalChainMember(callPath), true);

  // through TS wrapper before chain
  const tsPath = {
    node: leaf,
    parentPath: {
      node: { type: 'TSAsExpression' },
      parentPath: { node: { type: 'ChainExpression' } },
    },
  };
  check('isOutermostOptionalChainMember/through TS wrapper', isOutermostOptionalChainMember(tsPath), true);

  // not in chain - parent is statement
  const stmtPath = { node: leaf, parentPath: { node: { type: 'ExpressionStatement' } } };
  check('isOutermostOptionalChainMember/non-chain context',
    isOutermostOptionalChainMember(stmtPath), false);

  // null path
  check('isOutermostOptionalChainMember/null path',
    isOutermostOptionalChainMember(null), false);
}
checkIsOutermostOptionalChainMember();

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
  const mutationAdapter = createEstreeAdapter(() => null, 'usage-pure');
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
  // NON-literal computed key (`Array[k] = X`) stays out of scope - resolving a dynamic key
  // would need full value analysis the fast pre-walk doesn't do
  check('collectMutatedStaticMembers/dynamic computed key not tracked',
    collect('Array[k] = X;').has('Array.from'), false);
  // `Object.assign(Builtin, { ...source })` copies each own key onto Builtin - method shorthand,
  // getter, and data props across multiple object-literal sources all count as a static mutation
  const assigned = collect('Object.assign(Array, { from() {}, get of() { return 1; } }, { isArray: 0 });');
  check('collectMutatedStaticMembers/assign method shorthand', assigned.has('Array.from'), true);
  check('collectMutatedStaticMembers/assign getter', assigned.has('Array.of'), true);
  check('collectMutatedStaticMembers/assign second-source data', assigned.has('Array.isArray'), true);
  // a dynamic source (Identifier) + a computed key in an object source stay out of scope (the
  // fast pre-walk under-collects rather than guess - bias-safe for the usage-pure bail)
  check('collectMutatedStaticMembers/assign dynamic + computed sources not tracked',
    [...collect('Object.assign(Map, src, { [k]: 1 });')].length, 0);
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
  check('collectMutatedStaticMembers/Reflect.set dynamic key not tracked',
    [...collect('Reflect.set(Array, k, fn);')].length, 0);
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
// oxc rejects BOM-prefixed shebangs; the plugin strips ALL leading U+FEFF before parsing
// and re-prepends a single one to the final output. multi-BOM survives malformed source
// or a sibling plugin's per-pass re-prepend stacking on top of ours
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

// --- consumeOneLineEnding ---
// LS / PS via fromCharCode keeps file bytes pure ASCII: a literal LineTerminator in a
// surrounding line comment would split the comment at the LT and crash the parser.
// inside template-literal interpolation it's safe (string literals allow LS/PS since ES2019)
const LS = String.fromCharCode(0x2028);
const PS = String.fromCharCode(0x2029);

// each case: starting position 0 in the input. helper consumes the leading LineTerminator
// run (one logical pair OR one single char) and returns the new position. the spec-shaped
// "one logical pair" is CRLF (Windows) or LFCR (mis-configured tool inverse). single LTs
// covered: LF, CR, U+2028 LINE SEPARATOR, U+2029 PARAGRAPH SEPARATOR
check('consumeOneLineEnding/no LT returns same pos', consumeOneLineEnding('abc', 0), 0);
check('consumeOneLineEnding/single LF', consumeOneLineEnding('\nfoo', 0), 1);
check('consumeOneLineEnding/single CR', consumeOneLineEnding('\rfoo', 0), 1);
check('consumeOneLineEnding/CRLF pair', consumeOneLineEnding('\r\nfoo', 0), 2);
check('consumeOneLineEnding/LFCR pair', consumeOneLineEnding('\n\rfoo', 0), 2);
check('consumeOneLineEnding/U+2028', consumeOneLineEnding(`${ LS }foo`, 0), 1);
check('consumeOneLineEnding/U+2029', consumeOneLineEnding(`${ PS }foo`, 0), 1);
// multi-LT run beyond first logical pair: only one LT consumed (preserves blank gap)
check('consumeOneLineEnding/double LF stops after one', consumeOneLineEnding('\n\nfoo', 0), 1);
check('consumeOneLineEnding/CRLF + LF stops after pair',
  consumeOneLineEnding('\r\n\nfoo', 0), 2);
// pos at end of string: no-op
check('consumeOneLineEnding/EOF', consumeOneLineEnding('foo', 3), 3);
// non-zero starting pos: relative to that pos, not absolute
check('consumeOneLineEnding/non-zero start', consumeOneLineEnding('abc\nfoo', 3), 4);

// --- createTopLevelStatementRemover ---
const IMPORT_X = "import 'x';";

// stub-node driver: caller passes source + byte length of the leading `import ...;`
// segment; the stub node mirrors what oxc would emit (end at `;` byte + 1). exercises
// trailing-LT consumption and ASI guard injection without spinning up a full AST
function applyRemove(source, importEnd) {
  const ms = new MagicString(source);
  const remove = createTopLevelStatementRemover(ms);
  remove({ start: 0, end: importEnd });
  return ms.toString();
}

// single LF: consumed alongside the statement so the output joins cleanly
check('remove/single LF consumed',
  applyRemove(`${ IMPORT_X }\nfoo();`, IMPORT_X.length), 'foo();');

// CRLF pair: both chars consumed as one logical line ending (no stray LF / CR left)
check('remove/CRLF pair consumed',
  applyRemove(`${ IMPORT_X }\r\nfoo();`, IMPORT_X.length), 'foo();');

// LFCR pair: rare-but-valid inverse of CRLF that a mis-configured tool may emit. without
// pair handling, only the LF would be consumed and the stray CR would print as an extra
// blank line. pair handling parallels CRLF
check('remove/LFCR pair consumed',
  applyRemove(`${ IMPORT_X }\n\rfoo();`, IMPORT_X.length), 'foo();');

// U+2028 LINE SEPARATOR: single LT char per ES spec, consumed via isLineTerminator
check('remove/U+2028 consumed',
  applyRemove(`${ IMPORT_X }${ LS }foo();`, IMPORT_X.length), 'foo();');

// U+2029 PARAGRAPH SEPARATOR: same shape as U+2028
check('remove/U+2029 consumed',
  applyRemove(`${ IMPORT_X }${ PS }foo();`, IMPORT_X.length), 'foo();');

// multi-LT run beyond the first logical pair: user's intentional blank line between
// import block and code body MUST survive (only one LT belongs to the statement's row)
check('remove/double LF preserves blank line',
  applyRemove(`${ IMPORT_X }\n\nfoo();`, IMPORT_X.length), '\nfoo();');

// ASI hazard: TS TypeAssertion `<MyType>foo` after a no-semi prev statement needs a `;`
// injection on removal. previously `<` was NOT in ASI_HAZARD_STARTS so the fuse risk
// `prev < MyType > foo` slipped through silently
function checkRemoveAsiGuardTypeAssertion() {
  const source = `var x = 1\n${ IMPORT_X }\n<MyType>raw`;
  const ms = new MagicString(source);
  const remove = createTopLevelStatementRemover(ms);
  remove({ start: 10, end: 10 + IMPORT_X.length });
  check('remove/TS type assertion triggers ASI guard',
    ms.toString(), 'var x = 1\n;<MyType>raw');
}
checkRemoveAsiGuardTypeAssertion();

// ASI hazard hidden behind a line comment terminated by U+2028. the comment scan must
// stop AT the separator, then continue past it as whitespace, landing on the hazard
// char `(`. previously the scan only stopped at LF / CR and ran to EOF, missing the
// hazard and skipping the `;` injection
function checkRemoveAsiGuardLineCommentLsTerminator() {
  const source = `var x = 1\n${ IMPORT_X }//c${ LS }(foo)();`;
  const ms = new MagicString(source);
  const remove = createTopLevelStatementRemover(ms);
  remove({ start: 10, end: 10 + IMPORT_X.length });
  check('remove/line-comment U+2028 terminator surfaces hazard',
    ms.toString(), `var x = 1\n;//c${ LS }(foo)();`);
}
checkRemoveAsiGuardLineCommentLsTerminator();

// batch removal: two adjacent imports between a no-semi prev and a hazard char. each
// closure instance owns a `removedRanges` log; the second `remove()` call's backward
// ASI scan must SKIP past the first removed range, else the prev statement's `;` (now
// gone with the imports) appears to still be there and `;` injection gets suppressed.
// regression lock on the `findPrevSignificantChar` loop that re-enters when
// `prevSignificantPos` lands inside an earlier removed range
function checkRemoveBatchSkipsPriorRange() {
  const a = "import 'a';";
  const b = "import 'b';";
  const source = `var x = 1\n${ a }\n${ b }\n(foo)();`;
  const ms = new MagicString(source);
  const remove = createTopLevelStatementRemover(ms);
  // first import starts after `var x = 1\n` (10 bytes); second after first + LT (11+1)
  remove({ start: 10, end: 10 + a.length });
  remove({ start: 10 + a.length + 1, end: 10 + a.length + 1 + b.length });
  // semicolon must appear ONCE at the second removal's boundary (the first removal had
  // a non-hazard next char, the second sees `(`)
  check('remove/batch skips prior removed range',
    ms.toString(), 'var x = 1\n;(foo)();');
}
checkRemoveBatchSkipsPriorRange();

// reverse processing order (right-to-left) matches the real caller's loop over
// `resolveBatchDirectivePromotionPolicy({...}).toRemove`, which is filled in descending
// body position. forward `skipGap` from the LEFTMOST removal must be range-aware about
// the already-removed RIGHTMOST sibling - else it lands on the soon-to-be-erased
// neighbour's text, mis-reads it as non-hazard, and skips the `;` injection. without
// the guard fix, both removals decline injection and `var x = 1` fuses with `(foo)()`
function checkRemoveBatchRightToLeftForwardScansRangeAware() {
  const a = "import 'a';";
  const b = "import 'b';";
  const source = `var x = 1\n${ a }\n${ b }\n(foo)();`;
  const ms = new MagicString(source);
  const remove = createTopLevelStatementRemover(ms);
  // process RIGHTMOST first (mirrors `for (node of toRemove)` over descending-order list)
  remove({ start: 10 + a.length + 1, end: 10 + a.length + 1 + b.length });
  remove({ start: 10, end: 10 + a.length });
  // expected: `;` injection at the leftmost removal's boundary, which is where the survivor
  // `(foo)()` starts after both imports drain. without range-aware forward scan, both
  // removals see non-hazard next and decline injection, producing `var x = 1\n(foo)();`
  // (which JS parses as a call to `1`)
  check('remove/batch reverse-order forward scan is range-aware',
    ms.toString(), 'var x = 1\n;(foo)();');
}
checkRemoveBatchRightToLeftForwardScansRangeAware();

// triple-removal batch: the range-aware walker must compose across multiple chained
// `removedRanges`, jumping each in turn. without sequential composition the middle range
// would block the walk and the leftmost removal would land inside a stale-source region
function checkRemoveBatchTripleRemovalForwardScan() {
  const a = "import 'a';";
  const b = "import 'b';";
  const c = "import 'c';";
  const source = `var x = 1\n${ a }\n${ b }\n${ c }\n(foo)();`;
  const ms = new MagicString(source);
  const remove = createTopLevelStatementRemover(ms);
  const aStart = 10;
  const bStart = aStart + a.length + 1;
  const cStart = bStart + b.length + 1;
  // descending order: c -> b -> a
  remove({ start: cStart, end: cStart + c.length });
  remove({ start: bStart, end: bStart + b.length });
  remove({ start: aStart, end: aStart + a.length });
  // c sees `(` -> hazard, prev `;` of b -> no inject
  // b sees `i` of c-source under raw scan; range-aware jumps c-range, lands on `(` -> hazard,
  //   prev `;` of a -> no inject. PLUS `hasInjectedSemiBetween` is false (no `;` between)
  // a sees `i` of b-source under raw scan; range-aware jumps b-range then c-range, lands
  //   on `(` -> hazard, prev `1` of `var x = 1` -> INJECT
  // single `;` at a's boundary
  check('remove/batch triple removal forward scan composes ranges',
    ms.toString(), 'var x = 1\n;(foo)();');
}
checkRemoveBatchTripleRemovalForwardScan();

// no survivor after a batch (all removed up to EOF): forward scan returns src.length,
// guard short-circuits without inject. previously raw skipGap would still see in-range
// `i` characters as non-hazard which happened to behave correctly; with range-aware scan
// we must reach src.length and bail explicitly
function checkRemoveBatchEofNoSurvivorBails() {
  const a = "import 'a';";
  const b = "import 'b';";
  const source = `var x = 1\n${ a }\n${ b }\n`;
  const ms = new MagicString(source);
  const remove = createTopLevelStatementRemover(ms);
  remove({ start: 10 + a.length + 1, end: 10 + a.length + 1 + b.length });
  remove({ start: 10, end: 10 + a.length });
  // both removals reach EOF (no hazard char), so no `;` should be injected
  check('remove/batch EOF survivor bails without injection',
    ms.toString(), 'var x = 1\n');
}
checkRemoveBatchEofNoSurvivorBails();

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
    for (const fw of ['vite', 'webpack', 'farm']) {
      const subs = unplugin.raw({ ...opts }, { framework: fw });
      check(`phase pre+post keeps both stages on ${ fw }`, subs.length, 2);
    }
  } finally {
    console.warn = origWarn;
  }
  check('phase pre+post downgrade warns once per unsafe bundler', warned.filter(w => /pre\+post/.test(w)).length, 2);
}
checkPrePostBundlerDowngrade();

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
  const filteredCount = (src, name) => withoutPhantomDeclarationViolations(bindingFor(src, name)).constantViolations.length;

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

const { passed, failed } = counts;
echo`\nPassed: ${ green(passed) }, Failed: ${ failed ? red(failed) : green(failed) }`;
if (failed) throw new Error('Some tests have failed');
