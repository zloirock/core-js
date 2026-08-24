import { parseSync } from 'oxc-parser';
import { builders, traverse } from 'estree-toolkit';
import MagicString from 'magic-string';
import { TraceMap, originalPositionFor } from '@jridgewell/trace-mapping';
import unplugin, { shouldTransform } from '../../packages/core-js-unplugin/index.js';
import { createPolyfillContext, entryToGlobalHint } from '../../packages/core-js-polyfill-provider/index.js';
import { ORPHAN_REF_PATTERN } from '../../packages/core-js-polyfill-provider/injector-base.js';
import { collectMutationPrePass, createEstreeAdapter, withoutPhantomDeclarationViolations } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { patternToRegExp } from '../../packages/core-js-polyfill-provider/helpers/pattern-matching.js';
import { buildOffsetToLoc } from '../../packages/core-js-polyfill-provider/helpers/source-scan.js';
import { normalizeMachinePaths, slashifyPath } from './fixture-lang.mjs';
import { tagError } from '../../packages/core-js-polyfill-provider/helpers/error-tag.js';
import TransformQueue, {
  createRewriteHint,
  deoptionalizeNeedle,
  deoptionalizeNeedleAtPositions,
  hasIdentifierBoundary,
  replaceNthOccurrence,
  trimTrailingOptional,
} from '../../packages/core-js-unplugin/internals/transform-queue.js';
import ImportInjector, { shebangFallbackAnchor } from '../../packages/core-js-unplugin/internals/import-injector.js';
import { canonicalizeRefNumbering } from '../../packages/core-js-unplugin/internals/ref-canon.js';
import createPlugin, {
  formatLabelLocation,
  formatParseErrorForThrow,
  formatParseErrorForWarn,
  formatParseErrorMessage,
} from '../../packages/core-js-unplugin/internals/plugin.js';
import SnapshotCache from '../../packages/core-js-unplugin/internals/snapshot-cache.js';
import ScopeTracker from '../../packages/core-js-unplugin/internals/scope-tracker.js';
import { printProgram } from '../../packages/core-js-unplugin/internals/ast/print.js';
import { expressionStatement as mintStatement, literal as mintLiteral } from '../../packages/core-js-unplugin/internals/ast/builders.js';
import { createTopLevelStatementRewriter } from '../../packages/core-js-unplugin/internals/detect-entry.js';
import { collapseWhitespace } from './collapse-whitespace.mjs';
import {
  canFuseWithOpenParen,
  collectAllBindingNames,
  consumeOneLineEnding,
  directivePrologueEnd,
  hasCoreJSImport,
  injectionFusesLeft,
  isBodylessStatementBody,
  dropRedundantRootParens,
  isChunkLoaderBundler,
  isTopLevelImportLike,
  lastUserImportEnd,
  liftSfcLangSuffix,
  skipDirectivePrologue,
  statementOverwriteFusesLeft,
  stripLeadingBOMs,
  varScopeAnchor,
  walkAstNodes,
} from '../../packages/core-js-unplugin/internals/plugin-helpers.js';
import {
  isLineTerminator,
  isOptionalChainAt,
  literalRegionsOf,
  prevSignificantPos,
  scanTokens,
  setLexDialect,
  skipBlockComment,
  skipGap,
} from '../../packages/core-js-unplugin/internals/text-scan.js';
import {
  isCallee,
  isCalleeWrappedInParens,
  outerGuardOwnedRoot,
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

// the nesting gate is POSITIONAL: compose locates a nested range by its ORDINAL among
// identical needles, so the gate must ask whether the container kept an occurrence at THAT
// ordinal. an existence-only answer made the verdict depend on ARRIVAL ORDER - look-alike
// twins each believed the surviving slot was theirs, so the second to ask died on the compose
// invariant, and asking in reverse silently spliced the WRONG twin into it
function checkNestingGateIsPositional() {
  const code = 'wrap( pick(x) , pick(x) )';
  const first = code.indexOf('pick(x)');
  const second = code.lastIndexOf('pick(x)');
  const span = 'pick(x)'.length;
  function gatesFor(containerContent) {
    const q = new TransformQueue(code, new MagicString(code));
    q.add(0, code.length, containerContent);
    return {
      first: q.containingContentIncludes(first, first + span),
      second: q.containingContentIncludes(second, second + span),
    };
  }
  // container kept ONLY the first occurrence: its slot belongs to the first range
  const keptFirst = gatesFor('KEEP( pick(x) )');
  check('nesting gate/kept twin admitted', keptFirst.first, true);
  check('nesting gate/dropped twin rejected', keptFirst.second, false);
  // both kept - both compose, each into its own ordinal
  const keptBoth = gatesFor('KEEP( pick(x) , pick(x) )');
  check('nesting gate/both twins admitted when both kept', keptBoth.first && keptBoth.second, true);
  // a DROPPING consumer keeps nothing
  const dropped = gatesFor('DROPPED');
  check('nesting gate/dropping consumer rejects', dropped.first || dropped.second, false);
  // the verdict must not depend on which range asks first
  function applyInOrder(order) {
    const ms = new MagicString(code);
    const q = new TransformQueue(code, ms);
    q.add(0, code.length, 'KEEP( pick(x) )');
    for (const [name, at] of order) {
      if (q.containingContentIncludes(at, at + span)) q.add(at, at + span, `INNER_${ name }`);
    }
    q.apply();
    return ms.toString();
  }
  check('nesting gate/natural order splices the kept twin',
    applyInOrder([['A', first], ['B', second]]), 'KEEP( INNER_A )');
  check('nesting gate/reverse order splices the same twin',
    applyInOrder([['B', second], ['A', first]]), 'KEEP( INNER_A )');
  // a SPLIT container answers from its joined halves, per ordinal on each side
  function splitGates(prefix, suffix) {
    const q = new TransformQueue(code, new MagicString(code));
    q.addSplit(0, 14, code.length, prefix, suffix);
    return {
      first: q.containingContentIncludes(first, first + span),
      second: q.containingContentIncludes(second, second + span),
    };
  }
  const splitKeptBoth = splitGates('KEEP( pick(x) ', ' , pick(x) )');
  check('nesting gate/split container keeps both ordinals',
    splitKeptBoth.first && splitKeptBoth.second, true);
  const splitDropped = splitGates('KEEP( pick(x) ', ' )');
  check('nesting gate/split container drops the second ordinal', splitDropped.second, false);
}
checkNestingGateIsPositional();

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
  function make() {
    return new TransformQueue(code, new MagicString(code));
  }
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
  const q = new TransformQueue(code, ms);
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

// an insert landing in the SUFFIX half of a split overwrite must report the split's logical
// range - the suffix entry's raw start points mid-rewrite and misdirects the diagnostic
function checkInsertInsideSplitSuffixReportsLogicalRange() {
  const code = '0123456789ABCDEF';
  const ms = new MagicString(code);
  const q = new TransformQueue(code, ms);
  q.addSplit(0, 5, 10, 'PRE', 'SUF');
  q.insert(8, 'X'); // pos=8 sits in the suffix half [5,10) of the logical rewrite [0,10)
  try {
    q.apply();
    counts.failed++;
    echo`${ red('FAIL') } ${ cyan('TransformQueue/insert inside split suffix') } :: expected throw`;
  } catch (error) {
    if (/insert at 8 lands inside overwrite \[0,10\)/.test(error.message)) counts.passed++;
    else {
      counts.failed++;
      echo`${ red('FAIL') } ${ cyan('TransformQueue/insert inside split suffix') } :: got ${ error.message }`;
    }
  }
}
checkInsertInsideSplitSuffixReportsLogicalRange();

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

// compose invariant errors carry the bare `transform-queue: ` subsystem prefix - NOT a
// self-applied `[core-js] [<fileId>] ` brand. the brand + file tag are owned by the outer `tagError`
// (runTransform's catch), matching the parse-error throw-path convention; self-prefixing here would
// make tagError double-stamp the brand and id (X10-1). the message head must be `transform-queue: `
// with no leading `[core-js]`
function checkComposeInvariantPrefix() {
  const code = 'abcdef';
  const ms = new MagicString(code);
  const q = new TransformQueue(code, ms);
  // two equal-range transforms where neither contains the original needle (`abcdef`) - compose
  // should throw with the unbranded subsystem prefix
  q.add(0, 6, 'XX');
  q.add(0, 6, 'YY');
  try {
    q.apply();
    counts.failed++;
    echo`${ red('FAIL') } ${ cyan('TransformQueue/compose invariant prefix') } :: expected throw`;
  } catch (error) {
    if (error.message.startsWith('transform-queue: equal-range conflict')) counts.passed++;
    else {
      counts.failed++;
      echo`${ red('FAIL') } ${ cyan('TransformQueue/compose invariant prefix') } :: got ${ error.message }`;
    }
  }
}
checkComposeInvariantPrefix();

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

// addSplit must validate the FULL range up front (before the first add) so ANY bad offset
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

// compose drops an inner when an ANCESTOR's copy already carries its emit - the guard rendered the
// receiver before the inner reached composition, so the source needle is gone and the replacement
// stands in its place. the drop must stay tied to an ancestor that really encloses the inner: a
// coincidence elsewhere in an unrelated entry may not silently swallow a live rewrite
function checkAncestorReplacementDrop() {
  const code = 'pre(aaa.bbb) + zzz';
  function compose(outerContent, innerContent) {
    const q = new TransformQueue(code, new MagicString(code));
    q.add(0, 12, outerContent);
    q.add(4, 7, innerContent);
    return q.composeAndDrainRange(0, code.length).map(s => s.content).join('|');
  }
  // the outer carries the inner's SOURCE: ordinary composition
  check('compose/outer carrying the source composes the inner', compose('pre(aaa.bbb)', 'XXX'), 'pre(XXX.bbb)');
  // the outer already carries the inner's EMIT: the inner is a phantom and is dropped, not thrown on
  let threw = null;
  try {
    check('compose/outer carrying the emit drops the inner', compose('pre(XXX.bbb)', 'XXX'), 'pre(XXX.bbb)');
  } catch (error) {
    threw = error.message;
  }
  check('compose/carrying the emit does not abort the build', threw, null);
}
checkAncestorReplacementDrop();

// the deferred insert is RECORDED at the call and spliced once the owner's inners are composed, so
// two of them in nested blocks no longer make each other's search space unrecognisable. one that
// finds no slot after composition must not vanish quietly - the declaration would go with it
function checkDeferredOwnerInserts() {
  const code = 'a(() => { b(() => { c; }); }, 0)';
  const outer = { start: code.indexOf('{'), end: code.lastIndexOf('}') + 1 };
  const inner = { start: code.indexOf('{', outer.start + 1), end: code.indexOf('}') + 1 };
  const q = new TransformQueue(code, new MagicString(code));
  q.add(0, code.length, code);
  check('deferred insert/outer block accepted',
    q.insertIntoOwnerContent({ start: outer.start, end: outer.end, offset: 1, text: ' var _o;' }), true);
  check('deferred insert/nested block accepted',
    q.insertIntoOwnerContent({ start: inner.start, end: inner.end, offset: 1, text: ' var _i;' }), true);
  const [splice] = q.composeAndDrainRange(0, code.length);
  check('deferred insert/both land in the composed content',
    splice.content.includes('{ var _o;') && splice.content.includes('{ var _i;'), true);
  // an insert whose owner never carries it must be REFUSED at the call, not lost later
  const q2 = new TransformQueue(code, new MagicString(code));
  q2.add(0, code.length, 'REPLACED()');
  check('deferred insert/an owner that carries nothing is refused',
    q2.insertIntoOwnerContent({ start: outer.start, end: outer.end, offset: 1, text: ' var _x;' }), false);
}
checkDeferredOwnerInserts();

// a range whose two ends come from DIFFERENT nodes can straddle a wrapper paren: the emitter takes
// its spans from PEELED nodes, so an inner start sits past an opener whose closer lies inside the
// outer end. queuing that range verbatim drops the closer, strands the opener and the emitted
// module stops parsing - the queue extends such a range left over the opener instead
function checkWrapperStraddlingRanges() {
  const code = 'const v = (a.b.c)(1);';
  const inner = code.indexOf('a.b.c');
  const outerEnd = code.indexOf(';');
  const q = new TransformQueue(code, new MagicString(code));
  q.add(inner, outerEnd, 'X');
  const [entry] = q.composeAndDrainRange(0, code.length);
  check('straddling range/extends left over the stranded opener', entry.start, inner - 1);
  check('straddling range/the swapped span is balanced', code.slice(entry.start, entry.end), '(a.b.c)(1)');

  // a BALANCED range is the common case and must come back exactly as the caller spelled it
  const q2 = new TransformQueue(code, new MagicString(code));
  q2.add(inner, code.indexOf(')'), 'Y');
  check('straddling range/a balanced range is untouched', q2.composeAndDrainRange(0, code.length)[0].start, inner);

  // the closer may belong to a construct the replacement was never meant to swallow: only a paren
  // standing DIRECTLY before the range is the wrapper this range broke
  const other = 'const v = f(a.b) + 1;';
  const q3 = new TransformQueue(other, new MagicString(other));
  const from = other.indexOf('a.b');
  q3.add(from, other.indexOf('+') - 1, 'Z');
  check('straddling range/refuses when the opener is not adjacent',
    q3.composeAndDrainRange(0, other.length)[0].start, from);

  // `claim` probes ownership at the range `add` will actually take, not the one the caller spelled
  const q4 = new TransformQueue(code, new MagicString(code));
  q4.add(inner - 1, outerEnd, 'OWNED');
  check('straddling range/claim probes the balanced range', q4.claim(inner, outerEnd, 'W'), false);
}
checkWrapperStraddlingRanges();

// an outer entry renders its spans off PEELED nodes, so a grouping paren the source wrote around
// part of an inner's needle has no place in the outer's content. the inner still has a slot there -
// the same text without that pair - and the queue must find it rather than abort the build. dropped
// as a PAIR and only on a UNIQUE standalone hit: a lone-token tolerance was measured and it matched
// slots differing by a real token, turning locate failures into unparsable output
function checkWrapperSpelledSlots() {
  const code = 'const v = (a.b)(1);';
  const at = code.indexOf('(a.b)');
  const q = new TransformQueue(code, new MagicString(code));
  q.add(at, code.indexOf(';'), 'W(a.b, 1)');
  q.add(at, at + 5, 'INNER');
  check('wrapper spelling/inner composes into the peeled slot',
    q.composeAndDrainRange(0, code.length)[0].content, 'W(INNER, 1)');

  // two candidate slots mean the queue cannot tell which one is the inner's own - it must abort
  const q2 = new TransformQueue(code, new MagicString(code));
  q2.add(at, code.indexOf(';'), 'W(a.b, a.b)');
  q2.add(at, at + 5, 'INNER');
  let threw = false;
  try {
    q2.composeAndDrainRange(0, code.length);
  } catch {
    threw = true;
  }
  check('wrapper spelling/an ambiguous peeled slot is refused', threw, true);
}
checkWrapperSpelledSlots();

// the ASI guard is decided by POSITION when an entry is queued. composing that entry into another
// entry's content moves it off statement position, where its `;` is no longer a separator but a
// token in the middle of an expression
function checkComposedAsiGuard() {
  const code = 'x\na.b.c;';
  const inner = 2;
  function starts() {
    return new Set([inner]);
  }
  const q = new TransformQueue(code, new MagicString(code), starts);
  q.add(inner, code.indexOf(';'), '(OUT(a.b))');
  q.add(inner, inner + 3, '(X)');
  check('asi guard/a composed inner drops its statement-position separator',
    q.composeAndDrainRange(0, code.length)[0].content, ';(OUT((X)))');

  // standing alone at that position it still needs the separator
  const q2 = new TransformQueue(code, new MagicString(code), starts);
  q2.add(inner, inner + 3, '(X)');
  check('asi guard/a standalone entry keeps it',
    q2.composeAndDrainRange(0, code.length)[0].content, ';(X)');
}
checkComposedAsiGuard();

// a deferred insert (a scoped `var` after a block's `{`) has to land in the OWNER's rendered copy of
// that block. three ways to find the slot, and the last one is the only address a fully re-rendered
// block still has: the ordinal of its opening brace. the ordinal is trustworthy only while the
// render kept the brace COUNT - an owner that DISCARDED the block has fewer, and its brace 0 belongs
// to something else entirely
function checkInsertIntoOwnerContentSlots() {
  const code = 'a(() => { b; }, 0)';
  const block = { start: code.indexOf('{'), end: code.indexOf('}') + 1 };
  function insertWith(ownerContent) {
    const q = new TransformQueue(code, new MagicString(code));
    q.add(0, code.length, ownerContent);
    const ok = q.insertIntoOwnerContent({ start: block.start, end: block.end, offset: 1, text: ' var _r;' });
    return { ok, content: q.composeAndDrainRange(0, code.length)[0].content };
  }
  // the raw block text survives in the owner's copy: plain positional hit
  const verbatim = insertWith('X(() => { b; }, 0)');
  check('insertIntoOwnerContent/verbatim owner takes the insert', verbatim.ok, true);
  check('insertIntoOwnerContent/verbatim insert lands after the brace',
    verbatim.content.includes('{ var _r; b; }'), true);
  // an owner that REWROTE the block end to end has no address for it: a brace-ordinal fallback was
  // implemented for exactly this and removed by measurement (it never fired on either corpus), so
  // the caller re-emits the block instead
  check('insertIntoOwnerContent/a fully rewritten owner is refused',
    insertWith('X(() => { _b; }, 0)').ok, false);
  // the owner DISCARDED the block: its remaining brace belongs to an object literal, and taking it
  // would splice the declaration into somebody else's group
  const discarded = insertWith('X({ q: 1 })');
  check('insertIntoOwnerContent/discarding owner is refused', discarded.ok, false);
  check('insertIntoOwnerContent/discarding owner is left untouched',
    discarded.content, 'X({ q: 1 })');
  // the NEAREST owner decides, even when a wider one still carries the block. walking outward was
  // implemented and REVERTED by measurement: the insert then lands in a copy that still-queued
  // transforms search by raw source needle, and cutting one of those needles aborts the build on
  // real input. the caller's own fallback - re-emitting the block - is the answer here
  const wide = 'z; a(() => { b; }, 0)';
  const wideBlock = { start: wide.indexOf('{'), end: wide.indexOf('}') + 1 };
  const q = new TransformQueue(wide, new MagicString(wide));
  q.add(3, wide.length, 'X({ q: 1 })');
  q.add(0, wide.length, 'Z; X(() => { _b; }, 0)');
  check('insertIntoOwnerContent/a discarding nearest owner refuses, wider one is not consulted',
    q.insertIntoOwnerContent({ start: wideBlock.start, end: wideBlock.end, offset: 1, text: ' var _r;' }), false);
}
checkInsertIntoOwnerContentSlots();

// `claim` is check-and-add as one call, so a channel cannot probe one range and queue another. the
// range it refuses is the LOGICAL one, which is what a split pair owns - a physical-only refusal
// let a late whole-span claimant queue a rival entry over the pair and abort the merge
function checkClaimIsCheckAndAdd() {
  const code = '0123456789abcdef';
  const q = new TransformQueue(code, new MagicString(code));
  check('TransformQueue/claim takes a free range', q.claim(0, 4, 'A'), true);
  check('TransformQueue/claim refuses an owned range', q.claim(0, 4, 'B'), false);
  check('TransformQueue/claim leaves the owner untouched', q.composeAndDrainRange(0, 4)[0].content, 'A');
  const split = new TransformQueue(code, new MagicString(code));
  split.addSplit(2, 5, 9, '[', ']');
  check('TransformQueue/claim refuses a split pair by its logical range', split.claim(2, 9, 'X'), false);
  check('TransformQueue/claim takes a range no pair owns', split.claim(10, 14, 'Y'), true);
}
checkClaimIsCheckAndAdd();

// `containsRange` is the ownership verdict every channel asks before claiming a span outright, so
// which boundaries it treats as strict is a contract, not an implementation detail: PROPER
// containment, i.e. a container anchored at the same start (or ending at the same end) still owns
// the span, and only the exact range does not - that one is the asking transform itself
function checkContainsRangeIsProperNotStrict() {
  const code = 'aaa.bbb.ccc.ddd';
  const q = new TransformQueue(code, new MagicString(code));
  q.add(0, 11, 'OWNER'); // aaa.bbb.ccc: same start as the queried span, wider end
  check('TransformQueue/containsRange sees a same-start wider owner', q.containsRange(0, 7), true);
  check('TransformQueue/containsRange sees a same-end wider owner', q.containsRange(4, 11), true);
  check('TransformQueue/containsRange excludes the exact range', q.containsRange(0, 11), false);
  check('TransformQueue/containsRange leaves an unowned span free', q.containsRange(12, 15), false);
}
checkContainsRangeIsProperNotStrict();

// composeAndDrainRange drains entries and returns splices the caller bakes into relocated
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
    q.add(3, 9, 'Y'); // partial overlap -> composition invariant throw
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

// --- queue diagnostics ---

// helper for the diagnostics locks: run `fn`, return the thrown error (or null)
function caught(fn) {
  try {
    fn();
    return null;
  } catch (error) {
    return error;
  }
}

function checkThrow(label, fn, { Ctor, includes = [], excludes = [] }) {
  const error = caught(fn);
  if (!error) {
    counts.failed++;
    echo`${ red('FAIL') } ${ cyan(label) } :: expected throw`;
    return;
  }
  check(`${ label }: error class`, error.constructor, Ctor);
  check(`${ label }: single subsystem prefix`, error.message.split('transform-queue: ').length - 1, 1);
  check(`${ label }: prefix leads`, error.message.startsWith('transform-queue: '), true);
  for (const part of includes) check(`${ label }: names ${ JSON.stringify(part) }`, error.message.includes(part), true);
  for (const part of excludes) check(`${ label }: omits ${ JSON.stringify(part) }`, error.message.includes(part), false);
}

// EVERY throw this module raises goes through the one `queueError` factory, so all of them
// carry exactly one `transform-queue: ` prefix AND keep the error class their misuse deserves
// (`TypeError` for a wrong-typed argument, `RangeError` for a bad offset, `Error` for a
// composition invariant). every throw reachable through the public API is driven here, not a
// sample: a new one that spells its own prefix, or an existing one that loses its class to a
// factory refactor, must fail. two are deliberately absent because nothing can drive them -
// `locateFailureError`'s standalone-occurrence branch (the renamed-slot recovery accepts every
// standalone occurrence first) and `mergeEqualRange`'s needle-missing-from-both precondition
// (compose settles the claim multiset first and reports that shape as an equal-range conflict)
function checkQueueErrorCanon() {
  const code = '0123456789';
  function freshMagicString() {
    return new MagicString(code);
  }
  function fresh() {
    return new TransformQueue(code, freshMagicString());
  }
  const sites = [
    ['constructor/asiFusableStarts type', () => new TransformQueue(code, freshMagicString(), 'fixture-file'), TypeError, 'asiFusableStarts must be a function or null'],
    ['add/non-integer offsets', () => fresh().add('0', 5, 'X'), TypeError, 'start/end must be integers'],
    ['add/zero-length range', () => fresh().add(5, 5, 'X'), RangeError, 'zero-length range'],
    ['add/inverted range', () => fresh().add(5, 2, 'X'), RangeError, 'inverted range'],
    ['add/out of bounds', () => fresh().add(0, 99, 'X'), RangeError, 'range [0,99) out of bounds'],
    ['add/non-string content', () => fresh().add(0, 5, null), TypeError, 'content must be a string'],
    ['insert/non-integer pos', () => fresh().insert(1.5, 'X'), TypeError, 'insert pos must be an integer'],
    ['insert/out of bounds', () => fresh().insert(99, 'X'), RangeError, 'insert pos 99 out of bounds'],
    ['insert/non-string content', () => fresh().insert(1, null), TypeError, 'insert content must be a string'],
    ['addSplit/non-integer offsets', () => fresh().addSplit(0, '2', 5, 'A', 'B'), TypeError, 'addSplit offsets must be integers'],
    ['addSplit/ordering', () => fresh().addSplit(0, 5, 2, 'A', 'B'), RangeError, 'addSplit invariant violated'],
    ['addSplit/out of bounds', () => fresh().addSplit(0, 5, 99, 'A', 'B'), RangeError, 'addSplit range [0,99) out of bounds'],
    ['addSplit/empty content half', () => fresh().addSplit(0, 2, 5, 'A', ''), TypeError, 'addSplit content args must be non-empty strings'],
    ['createRewriteHint/guardRef without rootRaw', () => createRewriteHint({ guardRef: '_r' }), Error, 'createRewriteHint: guardRef requires rootRaw'],
    ['apply/insert inside overwrite', () => {
      const q = fresh();
      q.add(0, 10, 'PRE23456POST');
      q.insert(8, 'X');
      q.apply();
    }, RangeError, 'insert at 8 lands inside overwrite'],
    ['apply/partial overlap', () => {
      const q = fresh();
      q.add(0, 6, 'X');
      q.add(3, 9, 'Y');
      q.apply();
    }, Error, 'partial overlap between transforms'],
    ['apply/locate failure', () => {
      const q = fresh();
      q.add(0, 10, 'REPLACED');
      q.add(2, 5, 'INNER');
      q.apply();
    }, Error, 'could not locate inner needle in outer content'],
    ['compose/equal-range conflict', () => {
      const q = fresh();
      q.add(0, 10, 'W(0123456789)');
      q.add(0, 10, 'AAA');
      q.add(0, 10, 'BBB');
      q.apply();
    }, Error, 'equal-range conflict'],
    ['compose/mergeEqualRange doubled needle', () => {
      const q = fresh();
      q.add(0, 10, 'W(0123456789)(0123456789)');
      q.add(0, 10, 'P');
      q.apply();
    }, Error, 'wrapper contains needle >1 times'],
    ['compose/mergeEqualRange ambiguous wrapper', () => {
      const q = fresh();
      q.add(0, 10, 'O(0123456789)');
      q.add(0, 10, 'I(0123456789)');
      q.apply();
    }, Error, 'both sides contain needle - ambiguous wrapper'],
    ['apply/hoisted guard found no anchor', () => {
      const q = fresh();
      q.add(0, 10, 'SLOT(234)', null, createRewriteHint({ guardSlot: '_absentAnchor' }));
      q.add(2, 5, 'GRD:BODY', null, createRewriteHint({ guardOwn: { prefixEnd: 4 } }));
      q.apply();
    }, Error, 'hoisted guard rewrite(s) found no anchor'],
    ['asiFusableStarts result type', () => {
      new TransformQueue(code, freshMagicString(), () => ['nope']).add(2, 5, '(x)');
    }, TypeError, 'asiFusableStarts must return a Set of offsets'],
  ];
  // each row pins the throw it drives, not just its class: without that a future change could
  // collapse two entries onto one throw and the enumeration would silently stop being complete
  for (const [label, fn, Ctor, includes] of sites) {
    checkThrow(`TransformQueue/${ label }`, fn, { Ctor, includes: [includes] });
  }
  check('TransformQueue/queueError canon drives distinct throws', new Set(sites.map(site => site[3])).size, sites.length);
}
checkQueueErrorCanon();

// the locate-failure throw computes the discriminator that tells its two possible causes apart
// (no occurrence at all = the container dropped the range, a CALLER contract violation; a
// standalone occurrence the ordinal walk missed = the queue's own bug) one line before throwing.
// it must spend it: blaming the queue for a dropped range sent every past report chasing the
// wrong layer. the container's CONTENT is the datum that names the culprit channel
function checkLocateFailureAttribution() {
  const code = '0123456789';
  const q = new TransformQueue(code, new MagicString(code));
  q.add(0, 10, 'REPLACED');
  q.add(2, 5, 'INNER');
  checkThrow('TransformQueue/locate failure attributes the caller', () => q.apply(), {
    Ctor: Error,
    includes: [
      'could not locate inner needle in outer content.',
      'outer=[0,10)',
      'outerContent="REPLACED"',
      'inner=[2,5)',
      'needle="234"',
      'must skip-mark it or stand down',
    ],
    // the wording reserved for a genuine queue bug must NOT appear on the caller-side cause
    excludes: ['please report with a reproducer'],
  });
}
checkLocateFailureAttribution();

// the same needle scan drives a third state that must stay SILENT: every occurrence buried
// inside a longer identifier means the outer already substituted at every reachable position
// and the inner is a phantom. locking it keeps the attribution split from turning a phantom
// into a crash - the direction that costs a working build
function checkLocateFailurePhantomStaysSilent() {
  const code = 'Map()';
  const ms = new MagicString(code);
  const q = new TransformQueue(code, ms);
  q.add(0, 5, '_MapPrime()');   // outer spells the needle only inside a longer identifier
  q.add(0, 3, '_polyfillMap');  // inner whose effect the outer already encoded
  const error = caught(() => q.apply());
  check('TransformQueue/phantom inner does not throw', error, null);
  check('TransformQueue/phantom inner keeps outer content', ms.toString(), '_MapPrime()');
}
checkLocateFailurePhantomStaysSilent();

// a hoisted guard prefix / root rewrite that finds no anchor loses a null-check or a whole
// claim. the pending entries name the ref their slot promised to publish, so the throw must
// print them - a bare count says only that something was lost
function checkNoAnchorNamesPendingEntries() {
  const code = '0123456789';
  const ms = new MagicString(code);
  const q = new TransformQueue(code, ms);
  // slot publishes an anchor its content never spells, so the migrated prefix never lands
  q.add(0, 10, 'SLOT(234)', null, createRewriteHint({ guardSlot: '_absentAnchor' }));
  q.add(2, 5, 'GRD:BODY', null, createRewriteHint({ guardOwn: { prefixEnd: 4 } }));
  checkThrow('TransformQueue/no-anchor names the stranded rewrite', () => q.apply(), {
    Ctor: Error,
    includes: ['1 hoisted guard rewrite(s) found no anchor', 'guard-prefix anchor="_absentAnchor"', 'text="GRD:"'],
  });
}
checkNoAnchorNamesPendingEntries();

// every range in the queue came from a channel's `add` / `addSplit`; the queue never widens one,
// so a crossing pair is two channels disagreeing about who owns the text - a caller contract
// violation, not a queue bug. the contents are what say WHICH channels
function checkPartialOverlapAttribution() {
  const code = '0123456789';
  const q = new TransformQueue(code, new MagicString(code));
  q.add(0, 6, 'FIRST');
  q.add(3, 9, 'SECOND');
  checkThrow('TransformQueue/partial overlap attributes the channels', () => q.apply(), {
    Ctor: Error,
    includes: ['partial overlap between transforms', '[0,6) content="FIRST"', '[3,9) content="SECOND"', 'must nest or stay disjoint'],
    excludes: ['this is a composition bug'],
  });
}
checkPartialOverlapAttribution();

// the insert-inside-overwrite assertion named the offsets but not the two texts, so the report
// could say WHERE the anchor was swallowed and never WHICH channels did it
function checkInsertInsideOverwriteNamesContents() {
  const code = '0123456789';
  const q = new TransformQueue(code, new MagicString(code));
  q.add(0, 10, 'PRE23456POST');
  q.insert(8, 'var _ref;');
  checkThrow('TransformQueue/insert inside overwrite names both texts', () => q.apply(), {
    Ctor: RangeError,
    includes: ['insert at 8 lands inside overwrite [0,10)', 'insert="var _ref;"', 'overwrite="PRE23456POST"'],
  });
}
checkInsertInsideOverwriteNamesContents();

// `mergeEqualRange` is binary and each fold spends the accumulator's needle slot, so a SECOND
// needle-less claimant on one range can never fold - in any order. reporting that as the binary
// "needle missing from both transforms" describes a broken single caller, which is the one thing
// it is not: it is two channels collapsing one range two different ways
function checkEqualRangeConflictDiagnostic() {
  const code = '0123456789';
  const q = new TransformQueue(code, new MagicString(code));
  q.add(0, 10, 'W(0123456789)'); // wrapper: keeps the source slice
  q.add(0, 10, 'AAA');           // first collapse
  q.add(0, 10, 'BBB');           // second collapse - no slot left
  checkThrow('TransformQueue/equal-range conflict names the claimants', () => q.apply(), {
    Ctor: Error,
    includes: ['equal-range conflict at [0,10)', 'more than one transform replaces the source slice "0123456789"',
      'claims="W(0123456789)", "AAA", "BBB"'],
    excludes: ['needle missing from both transforms'],
  });
}
checkEqualRangeConflictDiagnostic();

// every text a queue diagnostic quotes is bounded - the head names the culprit channel and an
// unbounded dump buries the ranges printed beside it. the SOURCE SLICE is the same kind of text
// as the replacement, and just as long: quoting one raw next to the other truncated defeats the
// bound. checked on both, on the same throw
function checkDiagnosticTextIsBounded() {
  const long = `L${ 'x'.repeat(400) }R`;
  const code = `${ long }.at(0)`;
  const q = new TransformQueue(code, new MagicString(code));
  q.add(0, code.length, 'REPLACED');
  q.add(0, long.length, 'INNER');
  const error = caught(() => q.apply());
  check('TransformQueue/diagnostic quotes the slice truncated',
    /needle="Lx{190,199}\.\.\."/.test(error?.message ?? ''), true);
  check('TransformQueue/diagnostic drops the slice tail',
    (error?.message ?? '').includes('R"'), false);

  // and the claim texts, on the throw that quotes several of them at once
  const wide = new TransformQueue(code, new MagicString(code));
  wide.add(0, code.length, `W(${ code })${ 'y'.repeat(400) }`);
  wide.add(0, code.length, `A${ 'z'.repeat(400) }`);
  wide.add(0, code.length, 'B');
  const conflict = caught(() => wide.apply());
  check('TransformQueue/conflict quotes every claim truncated',
    /"Az{190,199}\.\.\.", "B"/.test(conflict?.message ?? ''), true);

  // `addSplit` rejects when EITHER half is empty, so the other half can be arbitrarily long and
  // still be echoed. both halves go through the same bound, and a non-string still reports its type
  const halves = new TransformQueue(code, new MagicString(code));
  checkThrow('TransformQueue/addSplit echoes a long half bounded', () => halves.addSplit(0, 2, 5, long, ''), {
    Ctor: TypeError,
    includes: ['content args must be non-empty strings', 'suffix=""'],
    excludes: [`prefix="${ long }"`],
  });
  checkThrow('TransformQueue/addSplit echoes a non-string half by type', () => halves.addSplit(0, 2, 5, 'A', 7), {
    Ctor: TypeError,
    includes: ['prefix="A"', 'suffix=number'],
  });

  // a short text is quoted whole - the bound must not clip what already fits
  const short = new TransformQueue('abcdef', new MagicString('abcdef'));
  short.add(0, 6, 'W(abcdef)(abcdef)');
  short.add(0, 6, 'P');
  checkThrow('TransformQueue/short texts are quoted whole', () => short.apply(), {
    Ctor: Error,
    includes: ['needle="abcdef"', 'transforms="W(abcdef)(abcdef)", "P"'],
  });
}
checkDiagnosticTextIsBounded();

// a split pair owns its LOGICAL range through two physical halves, so a diagnostic that prints
// an entry's raw `.content` next to that range describes half of what it points at. every site
// that pairs text with a logical range must assemble the pair - the halves are a symmetric pair,
// and only one of them carries the range's head
function checkDiagnosticsAssembleSplitHalves() {
  const code = '0123456789ABCDEF';
  const insideSplit = new TransformQueue(code, new MagicString(code));
  insideSplit.addSplit(0, 5, 10, 'PRE', 'SUF');
  insideSplit.insert(8, 'X');
  checkThrow('TransformQueue/insert inside split names the assembled text', () => insideSplit.apply(), {
    Ctor: RangeError,
    includes: ['insert at 8 lands inside overwrite [0,10)', 'overwrite="PRESUF"'],
  });

  // partial overlap where the earlier claimant is the split: its logical [0,10) is printed, so
  // its text must span [0,10) too
  const overlapSplitFirst = new TransformQueue(code, new MagicString(code));
  overlapSplitFirst.addSplit(0, 5, 10, 'PRE', 'SUF');
  overlapSplitFirst.add(7, 14, 'LATER');
  checkThrow('TransformQueue/partial overlap names the split as conflict', () => overlapSplitFirst.apply(), {
    Ctor: Error,
    includes: ['[0,10) content="PRESUF"', '[7,14) content="LATER"'],
  });

  // and the other side of the pair: the split as the LATER claimant
  const overlapSplitSecond = new TransformQueue(code, new MagicString(code));
  overlapSplitSecond.add(0, 8, 'EARLIER');
  overlapSplitSecond.addSplit(5, 10, 14, 'P2', 'S2');
  checkThrow('TransformQueue/partial overlap names the split as later claim', () => overlapSplitSecond.apply(), {
    Ctor: Error,
    includes: ['[0,8) content="EARLIER"', '[5,14) content="P2S2"'],
  });
}
checkDiagnosticsAssembleSplitHalves();

// `mergeEqualRange`'s invariants named the needle and the range but never the two texts, so the
// reader's next question - WHICH channels collapsed the range - had no answer in the message.
// each carries both sides now. the third (needle missing from BOTH sides) is unreachable through
// compose, which settles the claim multiset first and reports that shape as an equal-range
// conflict - it stays as the helper's own precondition guard
function checkMergeEqualRangeNamesBothSides() {
  const code = 'ab';
  function queue() {
    return new TransformQueue(code, new MagicString(code));
  }
  const doubledNeedle = queue();
  doubledNeedle.add(0, 2, 'W(ab)(ab)');
  doubledNeedle.add(0, 2, 'P');
  checkThrow('TransformQueue/mergeEqualRange doubled needle names both sides', () => doubledNeedle.apply(), {
    Ctor: Error,
    includes: ['wrapper contains needle >1 times', 'transforms="W(ab)(ab)", "P"'],
  });

  const ambiguous = queue();
  ambiguous.add(0, 2, 'O(ab)');
  ambiguous.add(0, 2, 'I(ab)'); // no `innerWrapper` marker - the queue cannot pick a nesting
  checkThrow('TransformQueue/mergeEqualRange ambiguous wrapper names both sides', () => ambiguous.apply(), {
    Ctor: Error,
    includes: ['both sides contain needle - ambiguous wrapper', 'transforms="O(ab)", "I(ab)"'],
  });
}
checkMergeEqualRangeNamesBothSides();

// negatives for the conflict gate - the shapes the fold DOES support must keep folding.
// a wrapper nests around a needle slot, so any number of wrappers is fine; only needle-less
// claimants compete for the single slot
function checkEqualRangeFoldNegatives() {
  const code = 'abcdefghij';
  const oneWrapperOneInner = new MagicString(code);
  const q1 = new TransformQueue(code, oneWrapperOneInner);
  q1.add(0, 10, '(abcdefghij, 1)');
  q1.add(0, 10, 'P');
  check('TransformQueue/1 wrapper + 1 inner folds', caught(() => q1.apply()), null);
  check('TransformQueue/1 wrapper + 1 inner output', oneWrapperOneInner.toString(), '(P, 1)');

  // two wrappers + one inner: the `innerWrapper` marker resolves which nests inside, the
  // merged wrapper still carries a needle slot, and the inner drops into it
  const twoWrappers = new MagicString(code);
  const q2 = new TransformQueue(code, twoWrappers);
  q2.add(0, 10, 'OUT(abcdefghij)');
  q2.add(0, 10, 'IN(abcdefghij)', null, { innerWrapper: true });
  q2.add(0, 10, 'P');
  check('TransformQueue/2 wrappers + 1 inner folds', caught(() => q2.apply()), null);
  check('TransformQueue/2 wrappers + 1 inner output', twoWrappers.toString(), 'OUT(IN(P))');

  // a repeat of a claim already taken is idempotent and dropped before the fold - the
  // redundant-collapse shape (one range collapsed once per firing meta) never reaches the merge
  const identical = new MagicString(code);
  const q3 = new TransformQueue(code, identical);
  q3.add(0, 10, 'P');
  q3.add(0, 10, 'P');
  q3.add(0, 10, 'P');
  check('TransformQueue/identical collapses fold to one', caught(() => q3.apply()), null);
  check('TransformQueue/identical collapses output', identical.toString(), 'P');
}
checkEqualRangeFoldNegatives();

// the idempotent-repeat drop compares against the CLAIMS already taken, not the accumulator:
// after one fold the accumulator is a merge product no raw claim can equal, so a repeat sitting
// behind a wrapper stopped being recognized and became a spurious build failure. it is one
// range, one text, however many channels re-queued it and in whatever order
function checkIdempotentRepeatBehindWrapper() {
  const code = 'abcdefghij';
  const shapes = [
    ['wrapper first', ['W(abcdefghij)', 'P', 'P']],
    ['repeat straddling the wrapper', ['P', 'W(abcdefghij)', 'P']],
    ['repeats first', ['P', 'P', 'W(abcdefghij)']],
    ['three repeats', ['W(abcdefghij)', 'P', 'P', 'P']],
  ];
  for (const [label, contents] of shapes) {
    const ms = new MagicString(code);
    const q = new TransformQueue(code, ms);
    for (const content of contents) q.add(0, 10, content);
    check(`TransformQueue/idempotent repeat ${ label } folds`, caught(() => q.apply()), null);
    check(`TransformQueue/idempotent repeat ${ label } output`, ms.toString(), 'W(P)');
  }

  // the drop is by TEXT identity, so two DIFFERENT collapses behind a wrapper stay a conflict -
  // the queue still cannot pick which one wins, and that is the shape the diagnostic is for
  const distinct = new TransformQueue(code, new MagicString(code));
  distinct.add(0, 10, 'W(abcdefghij)');
  distinct.add(0, 10, 'P');
  distinct.add(0, 10, 'Q');
  checkThrow('TransformQueue/distinct collapses behind a wrapper still conflict', () => distinct.apply(), {
    Ctor: Error,
    includes: ['equal-range conflict at [0,10)', 'claims="W(abcdefghij)", "P", "Q"'],
  });
}
checkIdempotentRepeatBehindWrapper();

// exhaustive sweep of the equal-range fold instead of hand-picked shapes: every arrangement of
// up to four claims over one range, checked against the contract rather than against the
// implementation. the fold nests WRAPPERS (they carry the source slice, so each keeps a slot for
// the next) and places at most one needle-less COLLAPSE, since the first one spends that slot;
// repeats of a claim already taken are idempotent and drop out. two consequences, both swept:
// it fails exactly when two DISTINCT collapses compete, and the result never depends on the
// order the channels queued their claims in
function checkEqualRangeFoldSweep() {
  const code = 'abcdefghij';
  const CLAIMS = {
    W: { content: `W(${ code })` },                            // wrapper: keeps the source slice
    V: { content: `V(${ code })`, hint: { innerWrapper: true } }, // wrapper declaring it nests inside
    P: { content: 'P' },                                       // collapse: replaces the slice
    Q: { content: 'Q' },                                       // a different collapse
  };
  function run(names) {
    const ms = new MagicString(code);
    const q = new TransformQueue(code, ms);
    for (const name of names) q.add(0, 10, CLAIMS[name].content, null, CLAIMS[name].hint);
    const error = caught(() => q.apply());
    return error ? { threw: true, message: error.message } : { threw: false, out: ms.toString() };
  }
  function permutations(names) {
    if (names.length <= 1) return [names];
    const out = [];
    for (let i = 0; i < names.length; i++) {
      for (const rest of permutations([...names.slice(0, i), ...names.slice(i + 1)])) out.push([names[i], ...rest]);
    }
    return out;
  }
  // every multiset of size 2..4 over the four claim kinds
  const multisets = [];
  const kinds = Object.keys(CLAIMS);
  for (const a of kinds) {
    for (const b of kinds) {
      multisets.push([a, b]);
      for (const c of kinds) {
        multisets.push([a, b, c]);
        for (const d of kinds) multisets.push([a, b, c, d]);
      }
    }
  }
  let orderDependent = 0;
  let contractBreaks = 0;
  let wrongDiagnosis = 0;
  let swept = 0;
  for (const multiset of multisets) {
    // sorted so each multiset is visited once regardless of which permutation generated it
    const key = [...multiset].sort().join('');
    if (key !== multiset.join('')) continue;
    const distinctCollapses = new Set(multiset.filter(name => name === 'P' || name === 'Q')).size;
    const mustThrow = distinctCollapses > 1;
    const results = permutations(multiset).map(run);
    swept += results.length;
    for (const result of results) {
      if (result.threw !== mustThrow) contractBreaks++;
      // the failure is diagnosed at the compose level, never by `mergeEqualRange`'s binary
      // precondition guard - compose settles the claim multiset before folding, so the guard
      // is unreachable from here and a sighting of it means that ordering broke
      if (result.threw && !result.message.includes('equal-range conflict')) wrongDiagnosis++;
    }
    const [first] = results;
    if (results.some(r => r.threw !== first.threw || r.out !== first.out)) orderDependent++;
  }
  check('TransformQueue/fold sweep covers every arrangement', swept >= 400, true);
  check('TransformQueue/fold fails exactly on two distinct collapses', contractBreaks, 0);
  check('TransformQueue/fold failure is always the compose-level diagnosis', wrongDiagnosis, 0);
  check('TransformQueue/fold result is order-independent', orderDependent, 0);
}
checkEqualRangeFoldSweep();

// `#outermostComposed` hands its composed text to the per-half sourcemap partition, so a split
// sharing its logical range with an equal-range claim runs the fold and the partition against the
// same string. neither the emitted text nor the mapping may shift when the claim joins
function checkSplitMapSurvivesEqualRangeClaim() {
  const code = '0123456789ABCDEF';
  function build(withClaim) {
    const ms = new MagicString(code);
    const q = new TransformQueue(code, ms);
    q.addSplit(0, 5, 10, '_poly(R)', '.call(R)');
    if (withClaim) q.add(0, 10, `W(${ code.slice(0, 10) })`);
    q.apply();
    const [firstRow] = ms.generateMap({ hires: true }).mappings.split(';', 1);
    return { text: ms.toString(), rowSegments: firstRow.split(',').length };
  }
  const plain = build(false);
  check('TransformQueue/split alone emits both halves', plain.text, '_poly(R).call(R)ABCDEF');
  check('TransformQueue/split alone maps per half', plain.rowSegments, 8);
  const wrapped = build(true);
  check('TransformQueue/split under an equal-range claim nests', wrapped.text, 'W(_poly(R).call(R))ABCDEF');
  check('TransformQueue/split under an equal-range claim still maps', wrapped.rowSegments, 7);
}
checkSplitMapSurvivesEqualRangeClaim();

// the fold has two consumers - `apply()` splicing onto the magic-string and
// `composeAndDrainRange` baking into relocated text - and they share `#composeEntries`. the drain
// path's own tests never queue equal-range claims, so a fold change could land correct on one
// consumer and not the other. same multisets, both consumers, same verdict
function checkFoldSameThroughDrain() {
  const code = 'abcdefghij';
  function build(contents) {
    const ms = new MagicString(code);
    const q = new TransformQueue(code, ms);
    for (const content of contents) {
      q.add(0, 10, content, null, content.startsWith('V(') ? { innerWrapper: true } : undefined);
    }
    return { ms, q };
  }
  const sets = [
    [`W(${ code })`, 'P'],
    [`W(${ code })`, 'P', 'P'],
    ['P', `W(${ code })`, 'P'],
    [`W(${ code })`, `V(${ code })`, 'P'],
    ['P', 'P', 'P'],
    [`W(${ code })`, 'P', 'Q'],
  ];
  for (const contents of sets) {
    const applied = build(contents);
    const viaApply = caught(() => applied.q.apply());
    const drained = build(contents);
    let viaDrain = null;
    const drainError = caught(() => {
      viaDrain = drained.q.composeAndDrainRange(0, 10).map(splice => splice.content).join('');
    });
    const label = contents.join('+');
    check(`TransformQueue/drain matches apply on ${ label } (throws)`, !!drainError, !!viaApply);
    if (!viaApply && !drainError) check(`TransformQueue/drain matches apply on ${ label }`, viaDrain, applied.ms.toString());
    else check(`TransformQueue/drain matches apply on ${ label } (message)`, drainError?.message, viaApply?.message);
  }
}
checkFoldSameThroughDrain();

// the constructor's third slot has held two different meanings (a `fileId` string, now the
// lazy ASI-offset provider). `add`/`insert`/`addSplit` validate at the gate precisely so a slot
// mismatch is attributed to the caller; without the same check here a wrong-typed value stays
// inert until some replacement happens to lead with `(`, then dies as `not a function` inside
// `#asiGuarded` at an unrelated later call
function checkConstructorAsiSlotContract() {
  const code = 'a\nb.flat()';
  const accepted = [null, undefined, () => new Set()];
  for (const value of accepted) {
    check(`TransformQueue/ctor accepts ${ typeof value } asiFusableStarts`,
      caught(() => new TransformQueue(code, new MagicString(code), value)), null);
  }
  const rejected = [['string', 'fixture-file'], ['number', 0], ['plain object', {}], ['Set', new Set()]];
  for (const [name, value] of rejected) {
    checkThrow(`TransformQueue/ctor rejects ${ name } asiFusableStarts`,
      () => new TransformQueue(code, new MagicString(code), value),
      { Ctor: TypeError, includes: ['asiFusableStarts must be a function or null'] });
  }
  // the slot stays LIVE after the check: a `(`-leading replacement at a fusable statement
  // start still gets its `;`, so the guard did not cost the channel it protects
  const ms = new MagicString(code);
  const q = new TransformQueue(code, ms, () => new Set([2]));
  q.add(2, 10, '(x)');
  q.apply();
  check('TransformQueue/ctor keeps the ASI channel live', ms.toString(), 'a\n;(x)');
}
checkConstructorAsiSlotContract();

// the ASI slot has TWO typed surfaces and the constructor can only reach the first: the callable
// is checked there, its RESULT only exists inside the guard. an offset Set is what the guard
// reads, and a wrong one used to surface as `.has is not a function` at whichever `(`-leading
// add happened to be first - the same late, unattributed shape the argument check exists to stop
function checkAsiProviderResultContract() {
  const code = 'a\nb.flat()';
  for (const [name, result] of [['array', ['not a set']], ['plain object', {}], ['null', null], ['undefined', undefined]]) {
    checkThrow(`TransformQueue/asi provider returning ${ name } is rejected`,
      () => new TransformQueue(code, new MagicString(code), () => result).add(2, 10, '(x)'),
      { Ctor: TypeError, includes: ['asiFusableStarts must return a Set of offsets'] });
  }

  // a Map has `.has` too, so a `.has`-shaped duck check would let it through and then silently
  // never match an offset key - the contract is a Set of offsets, not "something with .has"
  checkThrow('TransformQueue/asi provider returning a Map is rejected',
    () => new TransformQueue(code, new MagicString(code), () => new Map([[2, true]])).add(2, 10, '(x)'),
    { Ctor: TypeError, includes: ['asiFusableStarts must return a Set of offsets'] });

  // the provider's own throw belongs to the provider: the queue must not wrap it, or the real
  // stack is buried under a queue frame that did nothing wrong
  const raised = caught(() => new TransformQueue(code, new MagicString(code), () => {
    throw new RangeError('provider blew up');
  }).add(2, 10, '(x)'));
  check('TransformQueue/asi provider throw propagates unwrapped class', raised?.constructor, RangeError);
  check('TransformQueue/asi provider throw propagates unwrapped message', raised?.message, 'provider blew up');

  // the guard runs BEFORE `add` validates its own arguments, so it must stay out of the way:
  // a bad offset with `(`-leading content still gets the offset diagnostic, not an ASI failure
  function badOffset(fn) {
    return caught(() => fn(new TransformQueue(code, new MagicString(code), () => new Set([2]))));
  }
  const offsetCases = [
    ['non-integer start', q => q.add('0', 5, '(x)'), 'start/end must be integers'],
    ['NaN start', q => q.add(NaN, 5, '(x)'), 'start/end must be integers'],
    ['out of bounds', q => q.add(9999, 10000, '(x)'), 'out of bounds'],
    ['negative start', q => q.add(-5, 5, '(x)'), 'out of bounds'],
  ];
  for (const [label, fn, expected] of offsetCases) {
    check(`TransformQueue/asi guard does not mask ${ label }`,
      (badOffset(fn)?.message ?? '').includes(expected), true);
  }
}
checkAsiProviderResultContract();

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

// ctor-alias registrations (decl hints + checked assignment writes) must survive the pre->post
// snapshot handoff: without the carry, post's re-parse loses the alias hint AND its trusted write
// span, so member reads through the alias stop narrowing on the second pass
function checkSnapshotCarriesGlobalAliases() {
  const ms = new MagicString('');
  const inj = new ImportInjector({ mode: 'actual', pkg: 'x', ms });
  // BLIND (binding-less) entries ride the snapshot; PER-BINDING entries intentionally do not -
  // their work completes in the pass that registered them (post re-parses transformed text
  // where nothing alias-shaped remains), and their spans would be stale against the new offsets
  const declNode = { type: 'VariableDeclarator' };
  inj.registerGlobalAlias('M', 'Map', {
    bindingNode: declNode, write: { start: 10, end: 40 }, scopeSpan: { start: 0, end: 100 }, verified: true,
  });
  inj.registerGlobalAlias('S', 'Symbol');
  const snap = inj.snapshot();
  inj.registerGlobalAlias('L', 'Set');
  const post = new ImportInjector({ mode: 'actual', pkg: 'x', ms: new MagicString('') });
  post.applySnapshot ? post.applySnapshot(snap) : post.rehydrateGlobalAliases(snap.globalAliases);
  check('snapshot/blind alias carried', post.getBindingInfo('S')?.hint, 'Symbol');
  check('snapshot/per-binding entry NOT carried', post.getBindingInfo('M'), null);
  check('snapshot/aliases isolated', snap.globalAliases.has('L'), false);
  // the live injector still resolves both views
  check('live/binding view', inj.getBindingAliasInfo(declNode)?.aliasWrite?.start, 10);
  check('live/name view unique fallback', inj.getBindingInfo('M', 50)?.hint, 'Map');
}
checkSnapshotCarriesGlobalAliases();

// adoptOrphanRefs must not duplicate refs that pre already flushed; otherwise post
// would emit a second `var _ref;` on top of pre's
function checkAdoptOrphanRespectsFlushed() {
  const ms = new MagicString('');
  const inj = new ImportInjector({ mode: 'actual', pkg: 'x', ms,
    inherit: { globals: new Set(), pure: new Map(), usedNames: new Set(),
      unusedNames: new Set(), existingPure: new Map(),
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

// `_unused` counterpart of orphan-ref adoption: post-without-pre must re-recognize pre's
// rest-destructure sentinels via adoptUnusedNames, with the same generator-shape validation
// and suffix seeding, so the idempotency skip re-arms and the allocator can't re-mint an
// adopted name
// shebang fallback anchor: just before the consumed line terminator - and when the shebang
// runs to EOF with NO terminator, the anchor is the END (backing up one char would splice the
// injected block mid-shebang: `#!/usr/bin/env nod<block>e`)
function checkShebangFallbackAnchor() {
  check('shebangAnchor/no shebang', shebangFallbackAnchor('const x = 1;'), 0);
  check('shebangAnchor/terminator-less EOF', shebangFallbackAnchor('#!/usr/bin/env node'), '#!/usr/bin/env node'.length);
  check('shebangAnchor/LF', shebangFallbackAnchor('#!x\ncode();'), 3);
  check('shebangAnchor/CRLF', shebangFallbackAnchor('#!x\r\ncode();'), 3);
  check('shebangAnchor/CR only', shebangFallbackAnchor('#!x\rcode();'), 3);
  check('shebangAnchor/LS', shebangFallbackAnchor('#!x\u2028code();'), 3);
  check('shebangAnchor/PS', shebangFallbackAnchor('#!x\u2029code();'), 3);
}
checkShebangFallbackAnchor();

// a per-binding registration invalidates a pre-existing BLIND entry's "no binding" claim -
// the stale blind entry must not shadow the per-binding judgment (a GUARDED write would
// otherwise read as unconditionally trusted through the name view). minted allocator UIDs
// are exempt: a user binding can never collide with them
function checkPerBindingDropsStaleBlindAlias() {
  const inj = new ImportInjector({ mode: 'actual', pkg: 'x', ms: new MagicString('') });
  inj.registerGlobalAlias('M', 'Map');
  inj.registerGlobalAlias('M', 'Map', {
    bindingNode: { type: 'Identifier', name: 'M' },
    guarded: true, write: { start: 10 }, scopeSpan: { start: 0, end: 100 },
  });
  const info = inj.getBindingInfo('M', 50);
  check('blindDrop/per-binding judgment wins', info?.aliasTrusted, false);
  check('blindDrop/guard flag visible', info?.aliasGuarded, true);
  // the drop is durable: a pre->post snapshot carries no stale blind entry to resurrect
  check('blindDrop/snapshot carries no stale blind', inj.snapshot().globalAliases.has('M'), false);
  // the existence view still reports the name bound through the per-binding list
  check('blindDrop/hasAliasName still true via per-binding', inj.hasAliasName('M', 50), true);
  // minted (allocator-owned) blind entries survive a same-name per-binding registration
  const inj2 = new ImportInjector({ mode: 'actual', pkg: 'x', ms: new MagicString('') });
  inj2.registerGlobalAlias('_r', 'Map', { minted: true });
  inj2.registerGlobalAlias('_r', 'Map', {
    bindingNode: { type: 'Identifier', name: '_r' },
    guarded: true, write: { start: 10 }, scopeSpan: { start: 0, end: 100 },
  });
  check('blindDrop/minted blind survives', inj2.getBindingInfo('_r', 50)?.aliasTrusted, true);
}
checkPerBindingDropsStaleBlindAlias();

function checkAdoptUnusedNames() {
  const ms = new MagicString('');
  const inj = new ImportInjector({ mode: 'actual', pkg: 'x', ms });
  inj.adoptUnusedNames(['_unused', '_unused9', 'notASentinel', '_unused_user', '_ref']);
  check('adoptUnused/arms the sentinel skip', inj.hasGeneratedUnusedName('_unused'), true);
  check('adoptUnused/arms suffixed sentinel', inj.hasGeneratedUnusedName('_unused9'), true);
  check('adoptUnused/rejects non-conforming', inj.hasGeneratedUnusedName('notASentinel'), false);
  check('adoptUnused/rejects underscore tail', inj.hasGeneratedUnusedName('_unused_user'), false);
  check('adoptUnused/rejects ref-shaped name', inj.hasGeneratedUnusedName('_ref'), false);
  // suffix state seeded past the adopted maximum - a fresh allocation may not collide
  check('adoptUnused/allocator resumes past adopted', inj.generateUnusedName(), '_unused10');
  // unsafe-length numeric tail stays out of the allocator cache (same cap as orphan refs)
  const inj2 = new ImportInjector({ mode: 'actual', pkg: 'x', ms: new MagicString('') });
  inj2.adoptUnusedNames([`_unused${ '9'.repeat(18) }`]);
  check('adoptUnused/rejects unsafe-length suffix', inj2.hasGeneratedUnusedName(`_unused${ '9'.repeat(18) }`), false);
}
checkAdoptUnusedNames();

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
  function newInj() {
    return new ImportInjector({ mode: 'actual', pkg: 'x', ms: new MagicString('') });
  }
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

// registerBodyExtractAlias treats the aliasing destructure's OWN write as the aliasing event, not a
// disqualifying reassignment: the assignment form `let x; ({ x } = Source)` is the binding's single
// constantViolation with no declarator init. the gate counts writes + checks init, so it is parser-
// agnostic (babel's violation node is the assignment, estree's the bound identifier - both count as one).
// a real later reassignment, or a write alongside a declarator init, still poisons.
function checkBodyExtractAliasCleanGate() {
  function newInj() {
    return new ImportInjector({ mode: 'actual', pkg: 'x', ms: new MagicString('') });
  }
  const queryBinding = { identifier: { start: 0 } };

  // assignment form: exactly one write, no declarator init -> the aliasing event, not a reassignment
  const assign = newInj();
  assign.registerBodyExtractAlias('from', 'array/from',
    { kind: 'let', identifier: { start: 0 }, path: { node: { init: null } }, constantViolations: [{}] });
  check('single destructure write with no init does not poison the alias',
    assign.isReassignedBinding('from', queryBinding), false);

  // declarator form: the destructure IS the init, so there is no separate write -> clean
  const decl = newInj();
  decl.registerBodyExtractAlias('keys', 'object/keys',
    { kind: 'let', identifier: { start: 0 }, path: { node: { init: {} } }, constantViolations: [] });
  check('declarator-form alias with no writes does not poison',
    decl.isReassignedBinding('keys', queryBinding), false);

  // a real later reassignment is a second write -> poison
  const reassigned = newInj();
  reassigned.registerBodyExtractAlias('of', 'array/of',
    { kind: 'let', identifier: { start: 0 }, path: { node: { init: null } }, constantViolations: [{}, {}] });
  check('a second write poisons the alias',
    reassigned.isReassignedBinding('of', queryBinding), true);

  // a single write ALONGSIDE a declarator init is a reassignment of the init, not the aliasing event
  const withInit = newInj();
  withInit.registerBodyExtractAlias('entries', 'object/entries',
    { kind: 'let', identifier: { start: 0 }, path: { node: { init: {} } }, constantViolations: [{}] });
  check('a write alongside a declarator init poisons the alias',
    withInit.isReassignedBinding('entries', queryBinding), true);
}
checkBodyExtractAliasCleanGate();

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

// per-half sourcemap precision for a NESTED split reaching the compose path: the optional-chain suffix
// (`?.call`) maps to its OWN source columns (the `.at?.(` site), not the receiver. the compose path used
// to emit one overwrite over the whole logical range, mapping the suffix to the receiver column (coarse)
function checkSplitSuffixSourcemapPrecision() {
  const source = 'const arr = [1, 2, 3];\nexport const r = (arr.flat()).at?.(0);';
  const plugin = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 } });
  const result = plugin.transform(source, 'split-precision.js');
  // the output reads `_atMaybeArray(_ref = _flatMaybeArray(arr).call(arr))?.call(_ref, 0)`
  const lines = result.code.split('\n');
  let genLine = -1; let genCol = -1;
  for (let i = 0; i < lines.length; i++) {
    const col = lines[i].indexOf('?.call');
    if (col !== -1) {
      genLine = i + 1;
      genCol = col;
      break;
    }
  }
  const tm = new TraceMap(result.map);
  const orig = originalPositionFor(tm, { line: genLine, column: genCol });
  const [, srcLine] = source.split('\n', 2);
  const atCol = srcLine.indexOf('.at?.');
  const receiverCol = srcLine.indexOf('(arr.flat');
  check('split-suffix-sourcemap/suffix maps to .at site not receiver',
    orig.line === 2 && orig.column >= atCol && orig.column > receiverCol, true);
}
checkSplitSuffixSourcemapPrecision();

// double-nested optional chain: the FOLDED inner split's suffix (`.at?.`) must map to its own site, not
// the outer receiver - `#splitSegments` partitions the composed string by every split, not just the outer
function checkNestedSplitSuffixSourcemapPrecision() {
  const source = 'const arr = [1, 2, 3];\nexport const r = ((arr.flat()).at?.(0)).flat?.();';
  const plugin = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 } });
  const result = plugin.transform(source, 'nested-split-precision.js');
  const lines = result.code.split('\n');
  let genLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('?.call')) {
      genLine = i + 1;
      break;
    }
  }
  const line = lines[genLine - 1];
  const tm = new TraceMap(result.map);
  // first `?.call` is the inner `.at?.` suffix; last is the outer `.flat?.` suffix
  const inner = originalPositionFor(tm, { line: genLine, column: line.indexOf('?.call') });
  const outer = originalPositionFor(tm, { line: genLine, column: line.lastIndexOf('?.call') });
  const [, srcLine] = source.split('\n', 2);
  const atCol = srcLine.indexOf('.at?.');
  const flatCol = srcLine.lastIndexOf('.flat?.');
  check('split-suffix-sourcemap/folded inner suffix maps to .at site',
    inner.line === 2 && inner.column >= atCol && inner.column < flatCol, true);
  check('split-suffix-sourcemap/outer suffix maps to .flat site',
    outer.line === 2 && outer.column >= flatCol, true);
}
checkNestedSplitSuffixSourcemapPrecision();

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
  // a REJECTED match consumed the text it covered, so a real occurrence STARTING inside it was
  // skipped and every later ordinal pointed one slot short. `a.a` at index 1 is rejected (the `x`
  // before it), and the valid one at index 3 begins inside that rejected width
  check('replaceNth/rejected match does not consume the next', replaceNthOccurrence({
    str: 'xa.a.a.b', needle: 'a.a', replacement: 'X', n: 0,
  }), 'xa.X.b');
  // the needle's own edges are read as CODE POINTS: an astral identifier char is a surrogate PAIR,
  // and reading one unit reports no identifier edge, which skips the boundary check entirely and
  // accepts a match buried in a wider identifier
  check('replaceNth/astral needle edge keeps its boundary', replaceNthOccurrence({
    str: 'a\u{1D465}.at + \u{1D465}.at', needle: '\u{1D465}.at', replacement: 'X', n: 0,
  }), 'a\u{1D465}.at + X');
  check('replaceNth/astral needle tail edge', replaceNthOccurrence({
    str: 'at.\u{1D465}b + at.\u{1D465}', needle: 'at.\u{1D465}', replacement: 'X', n: 0,
  }), 'at.\u{1D465}b + X');
  // "replaced with identical text" is a HIT, not a miss: the public wrapper cannot say so (its
  // answer is the string either way), which is why compose asks the splice itself. pinned here so
  // a future caller reading `result !== input` as "found" fails against this row instead of
  // dropping into ordinal recovery and landing the emit on another slot
  check('replaceNth/identity replacement is a hit', replaceNthOccurrence({
    str: 'b(c), b(c)', needle: 'b(c)', replacement: 'b(c)', n: 1,
  }), 'b(c), b(c)');
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
  function tsProgramOf(src) {
    // eslint-disable-next-line node/no-sync -- oxc-parser sync-only API
    return parseSync('/x.ts', src, { sourceType: 'module' }).program;
  }
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

// --- collectAllBindingNames orphan-ref heuristic ---
// parent-tracking distinguishes plugin's nested `_ref = X` emission (inside a `null == (...)`
// guard test or a call argument) from user's stand-alone sloppy-mode `_ref = X;` statement. without
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
// a local export names a binding of THIS module; a re-export names one of the other module
checkDeclared('local export', 'var _ref; export { _ref as foo };', ['_ref']);
checkDeclared('re-export', "export { _ref as foo } from './m'; export { _ref2 } from './n';", [], ['_ref', '_ref2']);
// source-text names the AST emitter's scope never claims either: an import attribute's key, a
// private name - the census must not reserve them, or the two emitters number apart
check('collectBindings/import attribute key not reserved',
  collectBindings("import j from './j.json' with { _ref: 'json' };").names.has('_ref'), false);
check('collectBindings/private name not reserved',
  collectBindings('class K { #_ref = 1; m() { return this.#_ref; } }').names.has('_ref'), false);
// plugin-shaped: nested `_ref = X` inside a ConditionalExpression (guard emission)
checkOrphan('nested call', 'null == (_ref = foo()) ? void 0 : _ref;', ['_ref']);
checkOrphan('nested member', 'null == (_ref = foo.bar) ? void 0 : _ref;', ['_ref']);
checkOrphan('nested new', 'null == (_ref = new Foo()) ? void 0 : _ref;', ['_ref']);
// plugin-shaped: the combined chain's raw member get over a memoized receiver - the write is the
// OBJECT of a member read (`(_ref = recv).method`), the third emit position
checkOrphan('member-get receiver memo', 'null == (_ref = foo()).m ? void 0 : _ref;', ['_ref']);
checkOrphan('member-get receiver memo, computed', '_f((_ref = foo())[k], _ref);', ['_ref']);
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

// user-shape assignments in structural control positions: switch-case / switch discriminant /
// with object / throw / loop / if / while / do-while / return heads. plugin never emits
// `_ref = X` in any of these, so they are always user code and must NOT be adopted as
// orphans (would shadow the user's intent)
checkOrphan('switch case test',
  'switch (x) { case (_ref = foo()): break; }', [], ['_ref']);
checkOrphan('switch discriminant',
  'switch (_ref = foo()) { default: }', [], ['_ref']);
checkDeclared('switch discriminant reserves', 'switch (_ref = foo()) { default: }', ['_ref']);
checkOrphan('with object',
  'with (_ref = foo()) {}', [], ['_ref']);
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
// the plugin orphan is adopted (a user-position decline must not suppress real orphans)
checkOrphan('mixed logical-user + plugin orphan',
  'flag && (_ref = foo()); null == (_ref2 = bar()) ? void 0 : _ref2;', ['_ref2'], ['_ref']);
// plugin's own emit shapes stay adopted: `_ref =` inside the `null == (...)` BinaryExpression
// test and as a call argument are both still recognized as orphans (regression guard: the
// emit-position set must keep admitting exactly these while user positions decline)
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

// the classifier admits ONLY the plugin's emit positions (`null == (...)` binary test, call
// argument) - every expression-container position is user code and must reserve, not adopt:
// declarator inits, literal elements / values, template interpolations, spread and new args.
// unknown positions fail SAFE by construction (reserved; the plugin allocates `_ref2`)
checkOrphan('declarator init', 'const x = (_ref = foo());', [], ['_ref']);
checkDeclared('declarator init reserves', 'const x = (_ref = foo());', ['_ref']);
checkOrphan('exported declarator init', 'export const x = (_ref = foo());', [], ['_ref']);
checkOrphan('array element', '[_ref = foo()];', [], ['_ref']);
checkOrphan('object property value', '({ a: _ref = foo() });', [], ['_ref']);
// eslint-disable-next-line no-template-curly-in-string -- the SOURCE under test embeds an interpolation
checkOrphan('template interpolation', 'use(`${ _ref = foo() }`);', [], ['_ref']);
checkOrphan('spread argument', 'use(...(_ref = foo()));', [], ['_ref']);
checkOrphan('new-expression argument', 'new Foo(_ref = bar());', [], ['_ref']);

// TS expression wrappers (`as` / `!` / `satisfies`) are transparent to the orphan classifier's
// parent check, exactly like parens: a top-level user `_ref = X` wrapped in a TS cast inside a
// throw / case / if head is still user code and must NOT be adopted - a wrapper-blind parent walk
// would see the TS node, miss the structural position check, and inject a module `var _ref;` that
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
checkOrphanTS('switch discriminant + as-cast', 'switch ((_ref = foo()) as any) { default: }', []);
// TS namespaces and enums compile to IIFEs - their bodies are var-scopes, never the plugin's
// module-top-level emission position, so even emit-shaped assignments inside them are user code
checkOrphanTS('namespace body call-arg', 'namespace N { register(_ref = makeThing()); }', []);
checkOrphanTS('namespace body binary-test', 'namespace N { null == (_ref = foo()) ? void 0 : _ref; }', []);
checkOrphanTS('enum member initializer', 'enum E { A = (register(_ref = makeThing()), 1) }', []);
// a namespace-scoped decline must not poison a REAL module-top-level orphan beside it
checkOrphanTS('namespace decline + top-level orphan sibling',
  'namespace N { register(_ref = makeThing()); }\nnull == (_ref2 = foo()) ? void 0 : _ref2;', ['_ref2']);
// regression: a genuine plugin-shape `null == (...)` test is still adopted with TS in the file
checkOrphanTS('plugin binary-test still orphan (ts)', 'null == (_ref = foo()) ? void 0 : _ref;', ['_ref']);

// a name written in type space claims a UID slot only up to the wrapper node a `:` slot introduces.
// a type-alias RHS carries no wrapper and is walked at ANY depth, so nesting is NOT the criterion -
// what matters is whether a `:` stands between. a real declaration is reserved either way: the
// boundary gates only the bare-reference arm, never the structural declaration cases
function checkNameTakenTS(label, src, taken) {
  check(`collectBindings/annot/${ label }`, collectBindingsTS(src).names.has('_ref'), taken);
}
checkNameTakenTS('type-alias RHS member', 'type Flat = { _ref(): void };', true);
checkNameTakenTS('type-alias RHS at depth 3', 'type Deep = Map<string, Set<{ _ref(): void }>>;', true);
checkNameTakenTS('interface body member', 'interface I { _ref(): void }', true);
checkNameTakenTS('past `:` on a declaration', 'declare const v: { _ref(): void };', false);
checkNameTakenTS('past `:` on a parameter', 'export function f(p: { _ref(): void }) { return p; }', false);
checkNameTakenTS('past `:` at depth 2', 'type T = { a: { _ref(): void } };', false);
checkNameTakenTS('declared binding read in an annotation', 'const _ref = 1;\ndeclare const v: typeof _ref;', true);
// the boundary gates the annotation subtree only - an ordinary read of the SAME name elsewhere in the
// file still takes the slot, so a guard that swallowed a whole enclosing scope would be caught here
checkNameTakenTS('bare read beside an annotation naming it',
  'declare const v: { _ref(): void };\nexport const q = _ref;', true);
// an interface body inside `declare global` carries no `:` wrapper, so it is walked like any other
checkNameTakenTS('interface inside declare global',
  'declare global { interface Window { _ref(): void } }\nexport {};', true);
// the same holds for every other wrapper-less type host - a cast, a call type ARGUMENT and a
// type-parameter constraint all keep the name taken. these pin the boundary's narrowness from the
// census side: widening it to the general "is this type-space" test would free them and collide
checkNameTakenTS('as-cast type literal', 'export const b = (mk() as { _ref(): void });', true);
checkNameTakenTS('call type argument', 'export const b = mk<{ _ref(): void }>();', true);
checkNameTakenTS('type-parameter constraint', 'export function f<T extends { _ref(): void }>(x: T) { return x; }', true);

// --- trimTrailingOptional ---
// an erase claim swallows the optional token of the hop above it, so the survivor's needle ends in a
// lone `?`. enumerated over every way a needle can end rather than the two shapes that motivated it:
// a wrong trim here does not crash, it matches a DIFFERENT occurrence and rewrites the wrong text
check('trimOptional/dotted survivor drops the token', trimTrailingOptional('x?'), 'x');
check('trimOptional/computed survivor drops token and dot', trimTrailingOptional('x?.'), 'x');
check('trimOptional/member root', trimTrailingOptional('a.b?.'), 'a.b');
check('trimOptional/the gap before the token goes with it', trimTrailingOptional('x ?.'), 'x');
check('trimOptional/nullish operator is not an optional token', trimTrailingOptional('x??'), 'x??');
check('trimOptional/nullish before a dot is not one either', trimTrailingOptional('x??.'), 'x??.');
check('trimOptional/no token, unchanged', trimTrailingOptional('x'), 'x');
check('trimOptional/a plain dot end is not a token', trimTrailingOptional('x.'), 'x.');
// degenerate needles trim to empty rather than to a stray character - the caller drops those
check('trimOptional/bare token', trimTrailingOptional('?'), '');
check('trimOptional/bare token with dot', trimTrailingOptional('?.'), '');
check('trimOptional/empty stays empty', trimTrailingOptional(''), '');

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
// a needle ending exactly at end-of-source has NO following char: the tail index must short-circuit
// before the code-point read, otherwise `codePointAt(length)` is undefined and `fromCodePoint` throws
check('boundary/needle at end of source is a boundary',
  hasIdentifierBoundary('Promise', 0, 'Promise'), true);
check('boundary/needle at end of source after a space is a boundary',
  hasIdentifierBoundary(' Promise', 1, 'Promise'), true);

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
  for (const engine of ['text', 'ast']) {
    const opts = { method: 'usage-pure', version: '4.0', targets: { ie: 11 }, engine };
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
  for (const engine of ['text', 'ast']) {
    const globalOpts = { method: 'usage-global', version: '4.0', targets: { ie: 11 }, engine };
    const lowered = createPlugin(globalOpts);
    check(`phase/snapshot pre defers usage-global imports (${ engine })`,
      lowered.transform('[1].flat();', '/sm-lowered.mjs', 'pre'), null);
    const loweredOut = lowered.transform('lowFlat([1]);', '/sm-lowered.mjs', 'post')?.code ?? '';
    check(`phase/snapshot carries pre-detected module past a lowering sibling (${ engine })`,
      loweredOut.includes('es.array.flat'), true);

    const pureOpts = { method: 'usage-pure', version: '4.0', targets: { ie: 11 }, engine };
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
      // exotic-but-valid module forms flow through both engines and settle
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
          return { method: 'usage-global', version: '4.0', targets: { ie: 11 }, engine, ...extra };
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
  const b = await import('../../packages/core-js-unplugin/internals/ast/builders.js');
  check('ast/builders identifier shape', JSON.stringify(b.identifier('x')), '{"type":"Identifier","name":"x"}');
  check('ast/builders string literal carries its raw quote', b.literal('a').raw, '"a"');
  check('ast/builders non-string literal has NO raw (printer derives NaN/bigint itself)',
    Object.hasOwn(b.literal(1), 'raw'), false);
  check('ast/builders member defaults plain', JSON.stringify(b.memberExpression(b.identifier('a'), b.identifier('b'))),
    '{"type":"MemberExpression","object":{"type":"Identifier","name":"a"},"property":{"type":"Identifier","name":"b"},"computed":false,"optional":false}');
  check('ast/builders call keeps optional flag', b.callExpression(b.identifier('f'), [], { optional: true }).optional, true);
  check('ast/builders voidZero is `void 0`',
    (() => { const v = b.voidZero(); return v.type === 'UnaryExpression' && v.operator === 'void' && v.argument.value === 0; })(), true);
  const seq = b.sequenceExpression([b.identifier('a'), b.identifier('b')]);
  check('ast/builders sequence holds its expressions', seq.expressions.length, 2);
  const clone = b.cloneNode(seq);
  check('ast/builders cloneNode is deep and detached',
    clone !== seq && clone.expressions[0] !== seq.expressions[0] && clone.expressions[0].name === 'a', true);
  check('ast/builders bareImport has no specifiers', b.bareImport('core-js/modules/es.array.flat').specifiers.length, 0);
  check('ast/builders defaultImport binds its local', b.defaultImport('_at', '@core-js/pure/actual/instance/at').specifiers[0].local.name, '_at');

  const es = await import('../../packages/core-js-unplugin/internals/ast/emit-shared.js');
  const optionalDeep = b.memberExpression(b.callExpression(b.identifier('g'), [], { optional: true }), b.identifier('k'));
  check('emit-shared receiverCarriesOptional sees a buried `?.()`', es.receiverCarriesOptional(optionalDeep), true);
  check('emit-shared receiverCarriesOptional clean spine answers false',
    es.receiverCarriesOptional(b.memberExpression(b.identifier('a'), b.identifier('b'))), false);
  check('emit-shared memberFromKeyName spells a non-ident key computed',
    es.memberFromKeyName(b.identifier('o'), 'has-dash').computed, true);
  check('emit-shared memberFromKeyName spells an ident key plain',
    es.memberFromKeyName(b.identifier('o'), 'flat').computed, false);
  const wrapped = { type: 'ParenthesizedExpression', expression: { type: 'TSNonNullExpression', expression: b.identifier('z') } };
  check('emit-shared peelExpressionWrappers strips paren + TS layers', es.peelExpressionWrappers(wrapped).name, 'z');
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
  const { shiftFirstLineColumns } = await import('../../packages/core-js-unplugin/internals/ast/print.js');
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
  const { encode, decode } = await import('@jridgewell/sourcemap-codec');
  const shifted = { mappings: encode([[[0, 0, 0, 0]], [[0, 0, 1, 0]]]) };
  shiftFirstLineColumns(shifted, 1);
  const decoded = decode(shifted.mappings);
  check('print shiftFirstLineColumns moves line 0 only',
    decoded[0][0][0] === 1 && decoded[1][0][0] === 0, true);
}
await checkAstPrintContracts();

// --- AST-engine internals: flushIntoProgram placement contracts ---
async function checkAstFlushContracts() {
  const { flushIntoProgram } = await import('../../packages/core-js-unplugin/internals/ast/import-injector.js');
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
    const opts = { method, version: '4.0', targets: { ie: 11 }, engine: 'ast' };
    // a `core-js-disable-file` directive stands the whole engine down, ast leg included
    check(`ast engine honors disable-file (${ method })`,
      createPlugin(opts).transform('// core-js-disable-file\nimport "core-js";\n[1].flat();\n', '/df.mjs'), null);
  }
  const entryOpts = { method: 'entry-global', version: '4.0', targets: { ie: 11 }, engine: 'ast' };
  const entryOut = createPlugin(entryOpts).transform('import "core-js";\nuse();\n', '/e.mjs')?.code ?? '';
  check('ast entry-global expands the root entry to modules',
    entryOut.includes('core-js/modules/') && !entryOut.includes('import "core-js";'), true);
  const entryMap = createPlugin(entryOpts).transform('import "core-js";\nuse();\n', '/e.mjs')?.map;
  check('ast entry-global emits a sourcemap with content', !!entryMap && Array.isArray(entryMap.sources), true);
  // pre+post map chaining: the post map of a pre-rewritten file omits sourcesContent (the
  // chain reads content from pre's map), a standalone post emits it
  const sandwich = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 }, engine: 'ast' });
  const preOut = sandwich.transform('const v = getA().flat?.();\nuse(v);\n', '/sw.mjs', 'pre');
  const postOut = sandwich.transform(`${ preOut.code }\nconst w = getB().at?.(0);\nuse(w);`, '/sw.mjs', 'post');
  check('ast pre emits a content-bearing map', Array.isArray(preOut?.map?.sourcesContent), true);
  check('ast post map omits sourcesContent when chaining a pre rewrite',
    postOut?.map ? !Array.isArray(postOut.map.sourcesContent) : false, true);
  const standalonePost = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 }, engine: 'ast' })
    .transform('const v = getA().flat?.();\nuse(v);\n', '/sp.mjs', 'post');
  check('ast standalone post map keeps sourcesContent',
    Array.isArray(standalonePost?.map?.sourcesContent), true);
}
checkAstEngineBehaviors();

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
  function tryCall(args) {
    try {
      tq.addSplit(...args);
      return null;
    } catch (error) {
      return error?.message;
    }
  }
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

// the memo-value fallback rewrites the slot behind a `(<ref> = ` anchor, and the walk that finds
// that slot's end counts parens in EMITTED text. a paren inside a string is text: counted, it ends
// the range at the wrong token and the rewrite swallows whatever follows. the value's own balanced
// groups must not end it either - only the `)` closing the group the anchor stands in
function checkMemoValueRewriteIsLexerAware() {
  const code = 'srcsrcsrc';
  function composed(memoValue) {
    const content = `null == (_g = ${ memoValue }) ? void 0 : _g.x`;
    const tq = new TransformQueue(code, new MagicString(code));
    const root = { id: 'memo-root' };
    tq.add(0, 9, content, root, { rootRaw: 'src', guardRef: '_g', deoptPositions: [], objectStart: 0, absorbsRoot: false });
    tq.add(0, 3, 'INNER');
    return tq.composeAndDrainRange(0, 9)[0].content;
  }
  check('memo-value rewrite keeps the tail past a string-borne paren',
    composed('f(")")').endsWith(') ? void 0 : _g.x'), true);
  check('memo-value rewrite keeps the tail past a balanced inner group',
    composed('f(a)').endsWith(') ? void 0 : _g.x'), true);
  check('memo-value rewrite lands the inner emit in the slot',
    composed('f(a)').includes('INNER'), true);
}
checkMemoValueRewriteIsLexerAware();

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
// supported bundlers per package.json description + exports map: 9 adapters with both
// named export AND `./<name>` sub-entry. unloader is upstream-exposed but core-js does
// not target it (no sub-entry, no docs, no test wiring) — intentionally not exported
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
// triple-nested template (`${`${`x`}`}`) - the hole-mode stack must nest to depth N
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

// --- emit-utils.outerGuardOwnedRoot: the chain root a queued OUTER guard already memoized ---
// the single descent both consumers share - the static emit needs the owned ROOT node to split
// effects on, the standalone guard-bail only needs to know whether one exists. every hop is
// probed, and the root reached past the last member is probed too
function checkOuterGuardOwnedRoot() {
  const ident = { type: 'Identifier', name: 'g' };
  const midHop = { type: 'MemberExpression', object: ident };
  const outerHop = { type: 'OptionalMemberExpression', object: midHop };
  const node = { type: 'MemberExpression', object: outerHop };
  function queue(owned) {
    return { findOuterGuardRef: root => root === owned ? '_ref' : null };
  }

  // nothing queued anywhere on the spine
  check('outerGuardOwnedRoot/no guard', outerGuardOwnedRoot(node, queue(null)), null);

  // the guard sits on the receiver's outermost hop - returned as-is, not descended past
  check('outerGuardOwnedRoot/outermost hop owned', outerGuardOwnedRoot(node, queue(outerHop)), outerHop);

  // MID-chain ownership (a collapsed proxy-hop prefix): the descent must probe EVERY hop,
  // not just the first and the terminal
  check('outerGuardOwnedRoot/mid-chain hop owned', outerGuardOwnedRoot(node, queue(midHop)), midHop);

  // the non-member root past the last hop is probed too (`call()?.hop` memoizes the call)
  check('outerGuardOwnedRoot/non-member root owned', outerGuardOwnedRoot(node, queue(ident)), ident);

  // `node` ITSELF is never the answer: the guard question is about the receiver's spine
  check('outerGuardOwnedRoot/node itself is out of the spine', outerGuardOwnedRoot(node, queue(node)), null);

  // a receiver-less node bottoms out on `undefined`, which the queue answers null for
  check('outerGuardOwnedRoot/no receiver', outerGuardOwnedRoot({ type: 'Identifier' }, queue(null)), null);
}
checkOuterGuardOwnedRoot();

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

// --- createTopLevelStatementRewriter ---
const IMPORT_X = "import 'x';";

// stub-node driver: caller passes source + byte length of the leading `import ...;`
// segment; the stub node mirrors what oxc would emit (end at `;` byte + 1). exercises
// trailing-LT consumption and ASI guard injection without spinning up a full AST
function applyRemove(source, importEnd) {
  const ms = new MagicString(source);
  const rewriter = createTopLevelStatementRewriter(ms);
  rewriter.remove({ start: 0, end: importEnd });
  rewriter.apply();
  return ms.toString();
}

// remove every stub node of `source` in the given order, then apply the batch
function applyBatch(source, nodes) {
  const ms = new MagicString(source);
  const rewriter = createTopLevelStatementRewriter(ms);
  for (const node of nodes) rewriter.remove(node);
  rewriter.apply();
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
check('remove/TS type assertion triggers ASI guard',
  applyBatch(`var x = 1\n${ IMPORT_X }\n<MyType>raw`, [{ start: 10, end: 10 + IMPORT_X.length }]),
  'var x = 1\n;<MyType>raw');

// ASI hazard hidden behind a line comment terminated by U+2028. the comment scan must
// stop AT the separator, then continue past it as whitespace, landing on the hazard
// char `(`. previously the scan only stopped at LF / CR and ran to EOF, missing the
// hazard and skipping the `;` injection
check('remove/line-comment U+2028 terminator surfaces hazard',
  applyBatch(`var x = 1\n${ IMPORT_X }//c${ LS }(foo)();`, [{ start: 10, end: 10 + IMPORT_X.length }]),
  `var x = 1\n;//c${ LS }(foo)();`);

// batch removal: two adjacent imports between a no-semi prev and a hazard char. the seam is
// read through the batch's disposition map, in EITHER request order: the prev `;` of the
// earlier import is gone with it, the next surviving char is the `(`, and the two removals
// share the one seam - exactly one `;`
{
  const a = "import 'a';";
  const b = "import 'b';";
  const source = `var x = 1\n${ a }\n${ b }\n(foo)();`;
  const aRange = { start: 10, end: 10 + a.length };
  const bRange = { start: 10 + a.length + 1, end: 10 + a.length + 1 + b.length };
  check('remove/batch ascending injects one semi', applyBatch(source, [aRange, bRange]), 'var x = 1\n;(foo)();');
  check('remove/batch descending injects one semi', applyBatch(source, [bRange, aRange]), 'var x = 1\n;(foo)();');
}

// two INDEPENDENT removal seams, each followed by its own hazard: the second seam must not see
// the first seam's `;` (different prev), so BOTH seams get exactly one `;` each
{
  const a = "import 'a';";
  const b = "import 'b';";
  const source = `var x = 1\n${ a }\n(foo)();\nvar y = 2\n${ b }\n(bar)();`;
  const bStart = source.indexOf(b);
  check('remove/two independent seams each get one semi',
    applyBatch(source, [{ start: 10, end: 10 + a.length }, { start: bStart, end: bStart + b.length }]),
    'var x = 1\n;(foo)();\nvar y = 2\n;(bar)();');
}

// CRLF line endings through the batch: the removal range consumes the `\r\n` pair, and the
// seam still gets exactly one `;` before the hazard
{
  const a = "import 'a';";
  const b = "import 'b';";
  const source = `var x = 1\r\n${ a }\r\n${ b }\r\n(foo)();`;
  check('remove/CRLF batch injects one semi',
    applyBatch(source, [{ start: 11, end: 11 + a.length }, { start: 11 + a.length + 2, end: 11 + a.length + 2 + b.length }]),
    'var x = 1\r\n;(foo)();');
}

// removal ending FLUSH against the hazard char (no trailing space or line ending to consume):
// the injected `;` position coincides with the hazard index and must still land once
{
  const a = "import 'a';";
  const b = "import 'b';";
  check('remove/flush single against hazard',
    applyBatch(`var x = 1\n${ a }(foo)();`, [{ start: 10, end: 10 + a.length }]), 'var x = 1\n;(foo)();');
  check('remove/flush double against hazard still one semi',
    applyBatch(`var x = 1\n${ a }${ b }(foo)();`, [{ start: 10, end: 10 + a.length }, { start: 10 + a.length, end: 10 + a.length + b.length }]),
    'var x = 1\n;(foo)();');
}

// a U+2028 / U+2029 separator is a valid connector gap before `?.` too: the root-boundary read
// must treat it like any whitespace, keep the guardRef needle, and the transform must not throw
{
  const plugin = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 } });
  for (const [label, sep] of [['U+2028', '\u2028'], ['U+2029', '\u2029']]) {
    const source = `const a = { b: { c: [[1], [2]] } };\na.b${ sep }?.c.slice(1).flat(2);`;
    const out = plugin.transform(source, 'ls.mjs')?.code ?? '';
    check(`transform/${ label } connector gap keeps the guard memo`,
      out.includes('null == (_ref = a.b)') && out.includes('.call(_ref3, 1)'), true);
  }
}

// triple-removal batch: the survivor walk hops every removed neighbour in turn, so the leftmost
// removal sees the `(` three statements down and the `1` of `var x = 1` before it
{
  const a = "import 'a';";
  const b = "import 'b';";
  const c = "import 'c';";
  const source = `var x = 1\n${ a }\n${ b }\n${ c }\n(foo)();`;
  const aStart = 10;
  const bStart = aStart + a.length + 1;
  const cStart = bStart + b.length + 1;
  check('remove/batch triple removal composes ranges',
    applyBatch(source, [{ start: cStart, end: cStart + c.length }, { start: bStart, end: bStart + b.length }, { start: aStart, end: aStart + a.length }]),
    'var x = 1\n;(foo)();');
}

// no survivor after a batch (all removed up to EOF): nothing follows the seam, so no `;`
{
  const a = "import 'a';";
  const b = "import 'b';";
  check('remove/batch EOF survivor bails without injection',
    applyBatch(`var x = 1\n${ a }\n${ b }\n`, [{ start: 10 + a.length + 1, end: 10 + a.length + 1 + b.length }, { start: 10, end: 10 + a.length }]),
    'var x = 1\n');
}

// a `0;` placeholder is a survivor that ENDS in a terminator: a removal right after it needs no
// `;` even when the original statement there had none (the map reads the replacement, not the
// source text it overwrote)
{
  const a = "import 'a'";
  const b = "import 'b'";
  const source = `'use strict'\n${ a }\n${ b }\n(foo)();`;
  const ms = new MagicString(source);
  const rewriter = createTopLevelStatementRewriter(ms);
  rewriter.replaceWithNoop({ start: 13, end: 13 + a.length });
  rewriter.remove({ start: 13 + a.length + 1, end: 13 + a.length + 1 + b.length });
  rewriter.apply();
  check('remove/noop survivor is a terminator - no extra semi', ms.toString(), "'use strict'\n0;\n(foo)();");
}

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

// statementOverwriteFusesLeft pairs the comment/whitespace-aware prev-char scan with the predicate -
// used where an in-place statement overwrite re-roots a line (minifier split, destructure lifted-SE)
check('overwriteFuses/postfix ++ prev + hazard fuses', statementOverwriteFusesLeft('i++\n+x', 4, '+'), true);
check('overwriteFuses/; prev is safe', statementOverwriteFusesLeft('i++;\n+x', 5, '+'), false);
// start-of-file: no prev statement to fuse with
check('overwriteFuses/start-of-file bails', statementOverwriteFusesLeft('+x', 0, '+'), false);
// the scan skips an intervening block comment to reach the real prev significant char
check('overwriteFuses/comment-aware prev', statementOverwriteFusesLeft('a\n/*c*/\n+x', 7, '+'), true);
// block-open `{` / case-label `:` are list openers - the overwrite is the FIRST statement, no fusion
check('overwriteFuses/block-open prev safe', statementOverwriteFusesLeft('{\n+x', 2, '+'), false);
check('overwriteFuses/case-label prev safe', statementOverwriteFusesLeft('case 1:\n+x', 8, '+'), false);

// a malformed literal ending on a lone backslash at EOF (unterminated string / regex / template): the
// `\X` escape must not consume past src.length. an overshooting region end made prevSignificantPos report
// a boundary one char BEYOND the input (a past-EOF position with an undefined char), corrupting fusion
check('prevSignificantPos/string trailing backslash at EOF stays in bounds', prevSignificantPos('x="ab\\', 6), 5);
check('prevSignificantPos/regex trailing backslash at EOF stays in bounds', prevSignificantPos('y=/re\\', 6), 5);
check('prevSignificantPos/template trailing backslash at EOF stays in bounds', prevSignificantPos('z=`t\\', 5), 4);

// --- the kept SE prefix of an indirect-require entry ---
// the rewriter keeps the observable prefix of `(prefix, require)('core-js/...')` as statements. unlike
// a removal (where the NEXT surviving char fuses with the prev), here the kept text's FIRST char meets
// the prev surviving char - and the node-was-detected-separate guarantee does NOT carry over: a postfix
// `++` / `--` prev ASI-splits from the node's ORIGINAL leading `(` (spec bans `UpdateExpression
// Arguments`) yet a kept `+spy()` / `[spy()]` / `/re/...` prefix re-roots the line and fuses in.
// the driver parses a real statement so the prefix elements carry source spans
function applySePrefixRewrite(prevSrc, stmtSrc, { alsoRemove = null } = {}) {
  const source = `${ prevSrc }\n${ alsoRemove ? `${ alsoRemove }\n` : '' }${ stmtSrc }`;
  // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
  const { program } = parseSync('/p.js', source, { sourceType: 'module' });
  const node = program.body.at(-1);
  const ms = new MagicString(source);
  const rewriter = createTopLevelStatementRewriter(ms);
  if (alsoRemove) rewriter.remove(program.body.at(-2));
  const prefix = rewriter.remove(node);
  rewriter.apply();
  return { out: ms.toString(), kept: prefix.length };
}

// `+spy()` re-roots the line on `+`: `i++ + spy()` fuses silently (a valid but wrong single statement)
check('inject/plus-rooted prefix after postfix ++ injects ;',
  applySePrefixRewrite('i++', "(+spy(), require)('core-js/x')").out, 'i++\n;+spy();');
// `[spy()]` -> `i++[spy()]` member-access fusion
check('inject/bracket-rooted prefix after postfix ++ injects ;',
  applySePrefixRewrite('i++', "([spy()], require)('core-js/x')").out, 'i++\n;[spy()];');
// `/re/.test(spy())` -> `i++ / re / .test(...)` is a hard parse error
check('inject/regex-rooted prefix after postfix ++ injects ;',
  applySePrefixRewrite('i++', "(/re/.test(spy()), require)('core-js/x')").out, 'i++\n;/re/.test(spy());');
// `-spy()` -> `i-- - spy()` fusion
check('inject/minus-rooted prefix after postfix -- injects ;',
  applySePrefixRewrite('i--', "(-spy(), require)('core-js/x')").out, 'i--\n;-spy();');
// a `;`-terminated prev is provably safe - no spurious injection
check('inject/semicolon-terminated prev needs no guard',
  applySePrefixRewrite('i++;', "(+spy(), require)('core-js/x')").out, 'i++;\n+spy();');
// an identifier-rooted prefix ASI-splits from `i++` on its own (`++ spy` is illegal); ID-start chars are
// not in the hazard set, so no spurious `;`
check('inject/identifier-rooted prefix needs no guard',
  applySePrefixRewrite('i++', "(spy(), require)('core-js/x')").out, 'i++\nspy();');
// several prefix elements, at two nesting levels (outer sequence AND callee), each its own statement
check('inject/every prefix element is kept, in source order',
  applySePrefixRewrite('i++;', "0, (a(), (b(), require))('core-js/x')").out, 'i++;\na();\nb();');
// a `{`-led element is parenthesized so it stays an expression statement
check('inject/object-led element is parenthesized',
  applySePrefixRewrite('i++;', "({ k: spy() }, require)('core-js/x')").out, 'i++;\n({ k: spy() });');
// the kept elements keep their SOURCE spans unedited: a later rewrite inside one (the usage sweep
// polyfills `arr.at(0)` there) must not meet an already-edited chunk
{
  const source = "i++;\n(arr.at(0), require)('core-js/x')";
  // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
  const { program } = parseSync('/p.js', source, { sourceType: 'module' });
  const ms = new MagicString(source);
  const rewriter = createTopLevelStatementRewriter(ms);
  const [element] = rewriter.remove(program.body[1]);
  rewriter.apply();
  let threw = false;
  try {
    ms.overwrite(element.start, element.end, '_at(arr).call(arr, 0)');
  } catch {
    threw = true;
  }
  check('inject/kept element span stays editable', threw, false);
  check('inject/kept element rewrite composes', ms.toString(), 'i++;\n_at(arr).call(arr, 0);');
}
// a removed sibling sits between the postfix-++ prev and the SE-prefix node, in EITHER request
// order: the two dispositions share one seam, so exactly one `;` lands - the removal's `;` is no
// longer a separate edit a later `remove()` can erase
check('inject/removed left neighbour and kept prefix share one seam',
  applySePrefixRewrite('i++', "(+spy(), require)('core-js/x')", { alsoRemove: "import 'a';" }).out, 'i++\n;+spy();');
{
  const source = "var x = obj\nimport 'a'\n((0, spy)(), require)('core-js/x')";
  // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
  const { program } = parseSync('/p.js', source, { sourceType: 'module' });
  const ms = new MagicString(source);
  const rewriter = createTopLevelStatementRewriter(ms);
  // the entry pass hands the batch over in DESCENDING position
  rewriter.remove(program.body[2]);
  rewriter.remove(program.body[1]);
  rewriter.apply();
  check('inject/descending order: kept prefix after a removed import keeps its ;', ms.toString(), 'var x = obj\n;(0, spy)();');
}

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

// createRewriteHint's four branches: (1) no guard + no deopt -> null; (2) no guard + deopt
// positions -> inert deopt-only hint with absorbsRoot coerced false; (3) guardRef without rootRaw
// -> throws (compose needs rootRaw); (4) guardRef + rootRaw -> full hint, absorbsRoot coerced boolean
function checkCreateRewriteHint() {
  check('createRewriteHint/no guard no deopt -> null',
    createRewriteHint({ rootRaw: null, guardRef: null, deoptPositions: [] }), null);
  const deoptOnly = createRewriteHint({ guardRef: null, deoptPositions: [3], objectStart: 5, absorbsRoot: true });
  check('createRewriteHint/deopt-only keeps positions', deoptOnly?.deoptPositions?.[0], 3);
  check('createRewriteHint/deopt-only nulls rootRaw', deoptOnly?.rootRaw, null);
  check('createRewriteHint/deopt-only forces absorbsRoot false', deoptOnly?.absorbsRoot, false);
  let threw = false;
  try {
    createRewriteHint({ guardRef: '_ref', rootRaw: null });
  } catch (error) {
    threw = /requires rootRaw/.test(error.message);
  }
  check('createRewriteHint/guardRef without rootRaw throws', threw, true);
  const full = createRewriteHint({ rootRaw: 'a.b', guardRef: '_ref', deoptPositions: [1], objectStart: 0, absorbsRoot: 1 });
  check('createRewriteHint/full keeps guardRef', full?.guardRef, '_ref');
  check('createRewriteHint/full coerces absorbsRoot to boolean', full?.absorbsRoot, true);
}
checkCreateRewriteHint();

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

// the paren normalizer element-wise over its whole domain: what it must strip (a redundant pair
// around an injected path, with or without an effect-free literal ahead of it, and a doubled layer
// whatever it holds) and what it must NOT (a paren the grouping needs, a non-injected identifier, a
// pair not in an object position, and text that only LOOKS like one inside a string)
function checkDropRedundantRootParens() {
  const strip = [
    ['bare path', '(_globalThis).Box', '_globalThis.Box'],
    ['dotted path', '(_globalThis.writeBox).n', '_globalThis.writeBox.n'],
    ['computed consumer', '(_globalThis)[k]', '_globalThis[k]'],
    ['literal prefix', '(0, _globalThis).Promise', '_globalThis.Promise'],
    ['string prefix', "('x', _globalThis).Promise", '_globalThis.Promise'],
    ['doubled layer', '((n++, _globalThis)).Box', '(n++, _globalThis).Box'],
    ['doubled bare', '((_globalThis)).Box', '_globalThis.Box'],
  ];
  for (const [label, input, want] of strip) check(`paren strip: ${ label }`, dropRedundantRootParens(input), want);
  const keep = [
    ['effectful prefix', '(eff(), _globalThis).Promise'],
    ['sequence of two paths', '(_self, _globalThis).Promise'],
    ['user identifier', '(userRoot).Box'],
    ['not an object position', '(_globalThis) + 1'],
    ['call of the group', '(_globalThis)(1)'],
    ['paren inside a string', '"(_globalThis).Box"'],
    ['assignment needs its parens', '(w = _globalThis).Box'],
  ];
  for (const [label, input] of keep) check(`paren keep: ${ label }`, dropRedundantRootParens(input), input);
  // non-string input rides through untouched - the callers hand it whatever their render produced
  check('paren strip: non-string passes through', dropRedundantRootParens(null), null);
}
checkDropRedundantRootParens();

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

// --- ref-canon: final print-order renumber ---
// a mock injector: the canon pass only consumes the registry views + the rename sink
function makeCanonInjector(families, { foreign = [] } = {}) {
  const familyMap = new Map(families.map(([prefix, names]) => [prefix, new Set(names)]));
  const foreignSet = new Set(foreign);
  const calls = [];
  return {
    calls,
    generatedRefFamilies() { return familyMap; },
    isRefSlotForeign(name) { return foreignSet.has(name); },
    canonicalizeRefs(renameMap) { calls.push({ renameMap }); },
  };
}

function checkRefCanonPrintOrderSwap() {
  // allocation order inverted vs print order: the guard ref allocated second but printed
  // first - the rename is a SWAP and must not corrupt either occurrence set
  const splices = [{ start: 10, end: 20, content: 'null == (_ref2 = t = w) ? void 0 : _f(_ref = A(2))?.call(_ref)' }];
  const injector = makeCanonInjector([['_ref', ['_ref', '_ref2']]]);
  canonicalizeRefNumbering({ splices, inserts: [], injector });
  check('ref-canon/print-order swap', splices[0].content,
    'null == (_ref = t = w) ? void 0 : _f(_ref2 = A(2))?.call(_ref2)');
}
checkRefCanonPrintOrderSwap();

function checkRefCanonProtectedSpans() {
  // string literals, template CHUNK text, and comments never rename; a template HOLE is code
  const splices = [
    // eslint-disable-next-line no-template-curly-in-string -- the template-hole SPELLING inside a plain string is the scan subject
    { start: 0, end: 5, content: 'log("_ref2 raw", `x${ _ref2 }y _ref2`, _ref2) // _ref2 trail' },
    { start: 9, end: 12, content: 'use(_ref)' },
  ];
  const injector = makeCanonInjector([['_ref', ['_ref', '_ref2']]]);
  canonicalizeRefNumbering({ splices, inserts: [], injector });
  check('ref-canon/protected spans', splices[0].content,
    // eslint-disable-next-line no-template-curly-in-string -- the template-hole SPELLING inside a plain string is the scan subject
    'log("_ref2 raw", `x${ _ref }y _ref2`, _ref) // _ref2 trail');
  check('ref-canon/second splice follows rank', splices[1].content, 'use(_ref2)');
}
checkRefCanonProtectedSpans();

function checkRefCanonWriteOnlyMemoKept() {
  // a write-only guard memo is deliberate canon (the AST emitter spells one in the same
  // landing): it survives and renumbers like any ref - print-first takes the low slot
  const splices = [{ start: 0, end: 9, content: 'null == (_ref3 = w = g.window) ? void 0 : _m(_ref = A(5))?.call(_ref)' }];
  const injector = makeCanonInjector([['_ref', ['_ref', '_ref3']]]);
  canonicalizeRefNumbering({ splices, inserts: [], injector });
  check('ref-canon/write-only memo kept', splices[0].content,
    'null == (_ref = w = g.window) ? void 0 : _m(_ref2 = A(5))?.call(_ref2)');
}
checkRefCanonWriteOnlyMemoKept();

function checkRefCanonRegexLiteralProtection() {
  // a regex literal is a protected span (the canonical region scanner disambiguates `/`):
  // the slot-shaped text inside it stays, the real reference renames
  const splices = [{ start: 0, end: 4, content: 'm(a / 2, / _ref2 /, _ref2)' }];
  const injector = makeCanonInjector([['_ref', ['_ref2']]]);
  canonicalizeRefNumbering({ splices, inserts: [], injector });
  check('ref-canon/regex literal protected', splices[0].content, 'm(a / 2, / _ref2 /, _ref)');
}
checkRefCanonRegexLiteralProtection();

function checkRefCanonObjectKeySkip() {
  // a slot-shaped OBJECT KEY is a property spelling, not our binding - it stays; the
  // computed-key and argument references rename
  const splices = [{ start: 0, end: 4, content: 'f({ _ref2: 1, [_ref2]: 2 }, _ref2)' }];
  const injector = makeCanonInjector([['_ref', ['_ref2']]]);
  canonicalizeRefNumbering({ splices, inserts: [], injector });
  check('ref-canon/object key stays', splices[0].content, 'f({ _ref2: 1, [_ref]: 2 }, _ref)');
}
checkRefCanonObjectKeySkip();

function checkRefCanonFamilies() {
  // `_unused` sentinels renumber inside their own family, sharing one print sweep
  const splices = [{ start: 0, end: 6, content: 'h(_ref2, _unused3); var _unused3;' }];
  const injector = makeCanonInjector([['_ref', ['_ref2']], ['_unused', ['_unused3']]]);
  canonicalizeRefNumbering({ splices, inserts: [], injector });
  check('ref-canon/per-family slots', splices[0].content, 'h(_ref, _unused); var _unused;');
}
checkRefCanonFamilies();

function checkRefCanonForeignSlots() {
  // a foreign-owned slot (user binding) is never handed out - assignment skips over it
  const splices = [{ start: 0, end: 3, content: 'q(_ref5)' }];
  const injector = makeCanonInjector([['_ref', ['_ref5']]], { foreign: ['_ref', '_ref2'] });
  canonicalizeRefNumbering({ splices, inserts: [], injector });
  check('ref-canon/foreign slots skipped', splices[0].content, 'q(_ref3)');
}
checkRefCanonForeignSlots();

// --- scope-tracker: the claim window of a drained range ---
// a block's var slot sits one past its `{`; a drained node that STARTS right there is the block's
// first statement, and the slot belongs to the enclosing block, not to the range - the window is
// strict at the low end. a slot one further in (a block nested inside the range) is claimed
function checkScopedVarClaimWindow() {
  const code = '{const { at } = [1]; return [2].at(0);}';
  const injector = { generateLocalRef: () => '_ref', generateDeclaredRef: () => '_ref' };
  function claimed(scope, start, end) {
    const tracker = new ScopeTracker({ code, injector });
    tracker.scope = scope;
    tracker.genRef();
    return tracker.consumeRefBindingsInRange(start, end).map(s => s.start).join(',');
  }
  check('scope-tracker/slot at the range start belongs to the enclosing block', claimed(1, 1, 20), '');
  check('scope-tracker/slot inside the range is claimed', claimed(1, 0, 20), '1');
  check('scope-tracker/slot past the range is not claimed', claimed(25, 0, 20), '');
}
checkScopedVarClaimWindow();

// --- import-injector: every generated-name registry follows a rename / drop ---
// the final canonicalization renames by a map that can be SWAP-shaped (`_ref -> _ref2`,
// `_ref2 -> _ref`): a registry rebuilt by sequential delete / add funnels into its last target,
// and a registry left out keeps a spelling the text no longer has. five registries, one rename
function checkInjectorRegistriesFollowRename() {
  const inj = new ImportInjector({ mode: 'actual', pkg: 'x', ms: new MagicString('') });
  const a = inj.generateDeclaredRef();
  const b = inj.generateDeclaredRef();
  const u = inj.generateUnusedName();
  const u2 = inj.generateUnusedName();
  check('registries/allocation', [a, b, u, u2].join(','), '_ref,_ref2,_unused,_unused2');
  inj.registerGlobalAlias(a, 'Map', { minted: true });
  // pretend pre flushed `_ref` already
  inj.snapshot();
  inj.canonicalizeRefs(new Map([[a, b], [b, a], [u, u2], [u2, u]]));
  const snap = inj.snapshot();
  check('registries/declared refs keep both members', [...snap.refs].sort().join(','), '_ref,_ref2');
  check('registries/taken names keep both members', ['_ref', '_ref2', '_unused', '_unused2'].every(n => snap.usedNames.has(n)), true);
  check('registries/sentinels keep both members', [...snap.unusedNames].sort().join(','), '_unused,_unused2');
  check('registries/generated families follow', [...inj.generatedRefFamilies().get('_ref')].sort().join(','), '_ref,_ref2');
  check('registries/minted alias follows its ref', inj.getBindingInfo('_ref2')?.hint, 'Map');
  check('registries/old minted key is gone', inj.getBindingInfo('_ref'), null);
  // a dropped ref leaves every registry, the minted alias included
  inj.dropRefs(['_ref2']);
  const after = inj.snapshot();
  check('registries/drop leaves declared refs', [...after.refs].join(','), '_ref');
  check('registries/drop leaves taken names', after.usedNames.has('_ref2'), false);
  check('registries/drop leaves minted aliases', inj.getBindingInfo('_ref2'), null);
  check('registries/drop frees the slot for the renumber', inj.isRefSlotForeign('_ref2'), false);
  // the flushed set follows too: a flush, a swap-shaped rename, a second flush - the renamed
  // names are the flushed ones under their new spellings, so nothing is declared twice
  const ms = new MagicString('code();');
  const inj2 = new ImportInjector({ mode: 'actual', pkg: 'x', ms });
  const r1 = inj2.generateDeclaredRef();
  const r2 = inj2.generateDeclaredRef();
  inj2.flush();
  inj2.canonicalizeRefs(new Map([[r1, r2], [r2, r1]]));
  inj2.flush();
  check('registries/flushed refs follow a rename', (ms.toString().match(/var _ref/g) ?? []).length, 1);
}
checkInjectorRegistriesFollowRename();

// the dead-memo strip is applied even when no rename follows it: an early exit on an empty rename
// map once discarded the strip's own edits AFTER the injector had dropped the ref - `_refN = ...`
// stayed in the text with no declaration to print. here the nested memo holds the higher slot, so
// the survivor is already canonical and the map is empty
function checkRefCanonStripWithoutRename() {
  const splices = [{ start: 0, end: 9, content: 'null == (_ref = null == (_ref2 = w) ? void 0 : _f(1)) ? void 0 : _g(_ref)' }];
  const inserts = [{ pos: 0, content: '\n  var _ref, _ref2;' }];
  const injector = makeCanonInjector([['_ref', ['_ref', '_ref2']]]);
  injector.dropRefs = names => injector.calls.push({ dropped: [...names].sort() });
  canonicalizeRefNumbering({ splices, inserts, injector });
  check('ref-canon/strip applies without a rename', splices[0].content, 'null == (_ref = null == w ? void 0 : _f(1)) ? void 0 : _g(_ref)');
  check('ref-canon/strip excises the dead declarator', inserts[0].content, '\n  var _ref;');
  check('ref-canon/strip drops the ref from the injector', JSON.stringify(injector.calls[0]), '{"dropped":["_ref2"]}');
}
checkRefCanonStripWithoutRename();

// the unwrapped memo value keeps its group only when it needs one: an assignment (`w = root`) does,
// a member chain or a call does not - the AST emitter prints those bare
function checkRefCanonStripGroup() {
  function run(test) {
    const splices = [{ start: 0, end: 9, content: `null == (_ref = null == (_ref2 = ${ test }) ? void 0 : _f(1)) ? void 0 : _g(_ref)` }];
    const injector = makeCanonInjector([['_ref', ['_ref', '_ref2']]]);
    injector.dropRefs = () => null;
    canonicalizeRefNumbering({ splices, inserts: [], injector });
    return splices[0].content;
  }
  check('ref-canon/strip keeps the group of an assignment value', run('w = g.window'), 'null == (_ref = null == (w = g.window) ? void 0 : _f(1)) ? void 0 : _g(_ref)');
  check('ref-canon/strip drops the group of a member chain', run('g.window'), 'null == (_ref = null == g.window ? void 0 : _f(1)) ? void 0 : _g(_ref)');
  check('ref-canon/strip drops the group of a call', run('h(x)'), 'null == (_ref = null == h(x) ? void 0 : _f(1)) ? void 0 : _g(_ref)');
  check('ref-canon/strip keeps the group of an operator value', run('a || b'), 'null == (_ref = null == (a || b) ? void 0 : _f(1)) ? void 0 : _g(_ref)');
}
checkRefCanonStripGroup();

// a declaration list losing SEVERAL declarators is rebuilt once, so neighbouring excisions cannot
// overlap; a list losing all of them loses the whole statement. all three keywords are lists
function checkRefCanonDeclarationExcision() {
  function run(declaration) {
    const splices = [
      { start: 10, end: 20, content: 'null == (_ref3 = null == (_ref = w) ? void 0 : _f(1)) ? void 0 : _g(_ref3)' },
      { start: 30, end: 40, content: 'null == (_ref4 = null == (_ref2 = v) ? void 0 : _f(2)) ? void 0 : _g(_ref4)' },
    ];
    const inserts = [{ pos: 0, content: declaration }];
    const injector = makeCanonInjector([['_ref', ['_ref', '_ref2', '_ref3', '_ref4']]]);
    injector.dropRefs = names => injector.calls.push({ dropped: [...names] });
    canonicalizeRefNumbering({ splices, inserts, injector });
    return inserts[0].content;
  }
  check('ref-canon/adjacent dead declarators leave a clean list', run('\n  var _ref, _ref2, _ref3, _ref4;'), '\n  var _ref, _ref2;');
  check('ref-canon/dead tail run takes the separator before it', run('\n  var _ref3, _ref4, _ref, _ref2;'), '\n  var _ref, _ref2;');
  check('ref-canon/dead declarators around a survivor', run('\n  var _ref, _ref3, _ref2;\n  var _ref4;'), '\n  var _ref;\n  var _ref2;');
  check('ref-canon/a list losing every declarator loses the statement', run('\n  var _ref, _ref2;\n  var _ref3, _ref4;'), '\n  var _ref, _ref2;');
  check('ref-canon/let and const lists are lists too', run('\n  let _ref, _ref2;\n  const _ref3 = 1, _ref4 = 2;'), '\n  const _ref = 1, _ref2 = 2;');
}
checkRefCanonDeclarationExcision();

// a declarator that carries an INITIALIZER keeps its ref alive whatever the single write looks
// like (the AST emitter's rule - an init-bearing declarator is a survivor): no strip, no excision
function checkRefCanonInitSurvives() {
  const splices = [{ start: 10, end: 20, content: 'null == (_ref2 = null == (_ref = w) ? void 0 : _f(1)) ? void 0 : _g(_ref2)' }];
  const inserts = [{ pos: 0, content: '\n  var _ref = seed(), _ref2;' }];
  const injector = makeCanonInjector([['_ref', ['_ref', '_ref2']]]);
  let dropped = null;
  injector.dropRefs = names => { dropped = [...names]; };
  canonicalizeRefNumbering({ splices, inserts, injector });
  check('ref-canon/init-bearing declarator is not stripped', splices[0].content,
    'null == (_ref = null == (_ref2 = w) ? void 0 : _f(1)) ? void 0 : _g(_ref)');
  check('ref-canon/init-bearing declarator is not excised', inserts[0].content, '\n  var _ref2 = seed(), _ref;');
  check('ref-canon/init-bearing declarator is not dropped', dropped, null);
}
checkRefCanonInitSurvives();

// a declarator after an INITIALIZED neighbour is still a declarator (`const from = x, _unused = y`):
// it never ranks, so the canonical slot goes to the names the text actually reads first - the
// AST emitter numbers the same way. a back-scan that expected `name ,` pairs stopped at the `=`
function checkRefCanonDeclaratorAfterInit() {
  const splices = [{ start: 0, end: 9, content: 'const from = _Array$from, _unused = (eff(), g); use(_unused2)' }];
  const injector = makeCanonInjector([['_unused', ['_unused', '_unused2']]]);
  canonicalizeRefNumbering({ splices, inserts: [], injector });
  check('ref-canon/declarator after an initialized neighbour ranks last', splices[0].content,
    'const from = _Array$from, _unused2 = (eff(), g); use(_unused)');
}
checkRefCanonDeclaratorAfterInit();

// spellings that are not our binding, inside a user slice the emitted text carries: a private name
// (`#_ref2` is not `_ref2`), a label with its `break` / `continue`. renaming them breaks the code
// they belong to - the class no longer declares the private name, the label no longer exists
function checkRefCanonNonReferenceSpellings() {
  const splices = [{ start: 0, end: 9, content: 'h(_ref2, this.#_ref2); _ref2: for (;;) { break _ref2; continue _ref2; } use(_ref)' }];
  const injector = makeCanonInjector([['_ref', ['_ref', '_ref2']]]);
  canonicalizeRefNumbering({ splices, inserts: [], injector });
  check('ref-canon/private name and label spellings stay', splices[0].content,
    'h(_ref, this.#_ref2); _ref2: for (;;) { break _ref2; continue _ref2; } use(_ref2)');
}
checkRefCanonNonReferenceSpellings();

// member KEYS inside a user slice: a class field / method / accessor key, an object-literal
// method key, an enum member, an interface member - all source-text names of the member, not our
// binding; the SAME spelling in a method body, an initializer or a computed key is a reference
function checkRefCanonMemberKeys() {
  const splices = [{ start: 0, end: 9, content: [
    'class K extends B { _ref2 = _ref2; static _ref2() {} get _ref2() { return this._ref2 + _ref2; } [_ref2] = 1; static { use(_ref2); } }',
    'const o = { _ref2() {}, async _ref2() {}, get _ref2() {}, _ref2: 1, [_ref2]: 2, k: _ref2 };',
    'enum E { _ref2, _ref3 = _ref2 } interface I { _ref2: T; _ref2(): void }',
    'use(_ref)',
  ].join(' ') }];
  const injector = makeCanonInjector([['_ref', ['_ref', '_ref2']]]);
  canonicalizeRefNumbering({ splices, inserts: [], injector });
  check('ref-canon/member keys stay, references rename', splices[0].content, [
    'class K extends B { _ref2 = _ref; static _ref2() {} get _ref2() { return this._ref2 + _ref; } [_ref] = 1; static { use(_ref); } }',
    'const o = { _ref2() {}, async _ref2() {}, get _ref2() {}, _ref2: 1, [_ref]: 2, k: _ref };',
    'enum E { _ref2, _ref3 = _ref } interface I { _ref2: T; _ref2(): void }',
    'use(_ref2)',
  ].join(' '));
}
checkRefCanonMemberKeys();

// JSX text inside emitted content (a `.jsx` file's slice) is text: the apostrophe in `Don't` does
// not open a string that hides the refs after it. lexed in the file's dialect
function checkRefCanonJsxText() {
  const previous = setLexDialect({ jsx: true });
  try {
    const splices = [{ start: 0, end: 9, content: "_f(_ref2 = g(<li>Don't</li>)).call(_ref2, <a title=\"it's\">x</a>); use(_ref)" }];
    const injector = makeCanonInjector([['_ref', ['_ref', '_ref2']]]);
    canonicalizeRefNumbering({ splices, inserts: [], injector });
    check('ref-canon/jsx text is not a string opener', splices[0].content,
      "_f(_ref = g(<li>Don't</li>)).call(_ref, <a title=\"it's\">x</a>); use(_ref2)");
  } finally {
    setLexDialect(previous);
  }
}
checkRefCanonJsxText();

// --- text-scan: the tokenizer ---
// the region map every lexer-aware walk reads. each case states the ONE classification that a
// previous-token heuristic gets wrong and this one gets right
function regionsOf(src, dialect = { jsx: false, script: false }) {
  const previous = setLexDialect(dialect);
  try {
    return literalRegionsOf(src).map(r => `${ r.kind }:${ src.slice(r.start, r.end) }`).join(' | ');
  } finally {
    setLexDialect(previous);
  }
}
function tokensOf(src, dialect = { jsx: false, script: false }) {
  const out = [];
  scanTokens(src, (type, start, end) => {
    if (type !== 'ws' && type !== 'lt') out.push(`${ type }:${ src.slice(start, end) }`);
  }, dialect);
  return out.join(' ');
}
// a head paren's closer (`if` / `while` / `for` / `with`) and a block's `}` end a HEAD, not a value:
// the `/` after them opens a regex, whose quote is then regex text - not a string swallowing the line
check('lexer/regex after an if head', regionsOf("if (a) /re'/.test(b); x = 'y'"), "regex:/re'/ | string:'y'");
check('lexer/regex after a while head', regionsOf("while (a) /re'/.test(b); x = 'y'"), "regex:/re'/ | string:'y'");
check('lexer/regex after a function body', regionsOf("function f() {} /re'/.test(b); x = 'y'"), "regex:/re'/ | string:'y'");
check('lexer/regex after an async function declaration', regionsOf("async function f() {} /re'/.test(b); x = 'y'"), "regex:/re'/ | string:'y'");
check('lexer/regex after an exported default function', regionsOf("export default function () {} /re'/.test(b); x = 'y'"), "regex:/re'/ | string:'y'");
// a function EXPRESSION's body and an arrow's body end a VALUE - the `/` after them divides
check('lexer/division after a function expression body', regionsOf("x = function () {} / 2 / 'x'"), "string:'x'");
check('lexer/division after an async function expression body', regionsOf("x = async function named() {} / 2 / 'x'"), "string:'x'");
check('lexer/division after an arrow body', regionsOf("x = () => {} / 2 / 'x'"), "string:'x'");
check('lexer/division after a function expression argument', regionsOf("f(function () {} / 2, 'x')"), "string:'x'");
// accepted heuristic limits, pinned so a drift is a decision: a label's `:` reads as a ternary /
// case `:` (an object literal follows those), so a labeled block's `}` reads as a value; a `>`
// reads as a comparison end, so a `/` after `y<z>` reads as a regex - both match js-tokens
check('lexer/accepted: labeled block reads as an object', regionsOf("label: { } /re'/; x = 'y'"), "string:'/; x = ' | string:'");
check('lexer/accepted: comparison end reads as regex position', regionsOf("x = y<z> /re'/; x = 'y'"), "regex:/re'/ | string:'y'");
// class bodies carry the same decl-vs-expression split as function bodies: a declaration's `}`
// ends a statement (a `/` after it is a regex), an expression's ends a value (it divides) - and
// an `extends` clause's operand between the keyword and the body does not claim the body's `{`
check('lexer/regex after a class declaration body', regionsOf("class B {} /re'/; x = 'y'"), "regex:/re'/ | string:'y'");
check('lexer/regex after a class declaration with extends', regionsOf("class B extends mix(A) {} /re'/; x = 'y'"), "regex:/re'/ | string:'y'");
check('lexer/division after a class expression body', regionsOf("x = class {} / 2 / 'x'"), "string:'x'");
check('lexer/division after a named class expression with extends', regionsOf("x = class B extends A {} / 2 / 'x'"), "string:'x'");
check('lexer/class member keys lex inside the body', regionsOf("x = class { m() { return 're' } } / 2 / 'x'"), "string:'re' | string:'x'");
// a class in an `extends` operand opens ITS body first - the pending bodies stack
check('lexer/division after a class expression extending a class', regionsOf("x = class extends class B {} {} / 2 / 'x'"), "string:'x'");
check('lexer/regex after a class declaration extending a class', regionsOf("class A extends class B {} {} /re'/; x = 'y'"), "regex:/re'/ | string:'y'");
// the tokenizer TILES its input: every emitted token starts where the previous ended and the last
// ends at the input's end - no gaps, no overlaps, on valid and malformed fragments alike (the
// region map and every offset-consumer build on this)
{
  const fragments = ['\\', '"a', '`x${', '/re', '#!', '#', '@', '\uD800', 'a?.', '<', '<!--', '${}', '}',
    // eslint-disable-next-line no-template-curly-in-string -- template-hole SPELLINGS are the fragments under test
    'x=/', '`${`${', 'class', 'for await (', "x = <a>don't</a>; `t${ {k:1} }`"];
  let tiled = true;
  for (const frag of fragments) {
    let cursor = 0;
    scanTokens(frag, (type, start, end) => {
      if (start !== cursor || end < start) tiled = false;
      cursor = end;
    }, { jsx: true, script: false });
    if (cursor !== frag.length) tiled = false;
  }
  check('lexer/tokens tile the input', tiled, true);
}
// the region memo keys on the dialect too: the SAME string re-asked under another dialect re-lexes
{
  const src = "x = <a>don't</a>";
  const asJs = regionsOf(src);
  const asJsx = regionsOf(src, { jsx: true });
  check('lexer/memo keyed by dialect', asJs !== asJsx && asJsx.includes('jsx-text'), true);
}
check('lexer/regex after a block', regionsOf("if (a) { } /re'/.test(b)"), "regex:/re'/");
check('lexer/regex after else', regionsOf("if (a) b; else /re'/.test(c)"), "regex:/re'/");
check('lexer/regex after return and a line break', regionsOf("return\n/re'/"), "regex:/re'/");
// a value end - a call's `)`, an object literal's `}`, a postfix `++`, a TS non-null `!`, a
// trailing-dot number, a name, a string - makes the `/` a division
check('lexer/division after a call', regionsOf("f(a) / 2 / 'x'"), "string:'x'");
check('lexer/division after an object literal', regionsOf("x = {} / 2 / 'x'"), "string:'x'");
check('lexer/division after postfix ++', regionsOf("i++ / 2 / 'x'"), "string:'x'");
check('lexer/division after TS non-null', regionsOf("a! / 2 / 'x'"), "string:'x'");
check('lexer/division after a trailing-dot number', regionsOf("5. / 2 / 'x'"), "string:'x'");
check('lexer/division after a property named like a keyword', regionsOf("a.return / 2 / 'x'"), "string:'x'");
// an unterminated regex candidate is a division operator after all
check('lexer/unterminated regex candidate is division', regionsOf("a = /re\n'x'"), "string:'x'");
// the tokens the old character walk could not see: a hashbang, a private name (NOT an identifier
// occurrence of `_ref`), a line separator inside a string, HTML-like comments of a script
check('lexer/hashbang is a comment', regionsOf("#!/usr/bin/env node\nx = 'y'"), "comment:#!/usr/bin/env node | string:'y'");
check('lexer/private name is its own token', tokensOf('this.#_ref / 2'), 'ident:this punct:. private:#_ref punct:/ number:2');
check('lexer/LS inside a string does not end it', regionsOf("'a\u2028b' / 2 / 'x'"), "string:'a\u2028b' | string:'x'");
check('lexer/html comments in a script', regionsOf('<!-- c\nx = 1\n--> c', { script: true }), 'comment:<!-- c | comment:--> c');
check('lexer/html comments are operators in a module', regionsOf('<!-- c\nx = 1\n--> c'), '');
// template chunks around holes; the hole's code is code (its `//` is a comment, its `}` closes nothing)
// eslint-disable-next-line no-template-curly-in-string -- the template-hole SPELLING inside a plain string is the scan subject
check('lexer/template chunks around a hole', regionsOf('`a${ b // c\n }d${ `e` }f`'), 'template:`a${ | comment:// c | template:}d${ | template:`e` | template:}f`');
// `?.` is the optional-chaining punctuator only without a digit after it
check('lexer/optional chain vs conditional over .5', tokensOf('a?.b; c?.5:1'), 'ident:a punct:?. ident:b punct:; ident:c punct:? number:.5 punct:: number:1');
check('lexer/isOptionalChainAt', [isOptionalChainAt('a?.b', 1), isOptionalChainAt('c?.5:1', 1), isOptionalChainAt('a?.[0]', 1)].join(','), 'true,false,true');
// JSX, in the dialect of the file only: text and attribute strings are regions, a generic arrow's
// type parameter list is not a tag, and a comparison is not a tag
check('lexer/jsx text and attribute string', regionsOf('x = <a title="it\'s">Don\'t {f("q")}</a>', { jsx: true }), 'jsx-string:"it\'s" | jsx-text:Don\'t  | string:"q"');
check('lexer/jsx off by dialect', regionsOf('x = <a>don\'t</a>; y = \'z\''), 'string:\'t</a>; y = \' | string:\'');
check('lexer/tsx generic arrow is not a tag', regionsOf("const f = <T,>(x: T) => x; y = 'z'", { jsx: true }), "string:'z'");
check('lexer/tsx constrained generic arrow is not a tag', regionsOf("const f = <T extends U>(x: T) => x; y = 'z'", { jsx: true }), "string:'z'");
check('lexer/type arguments after ?. are not a tag', regionsOf("foo?.<Map<number>>(); y = 'z'", { jsx: true }), "string:'z'");
check('lexer/comparison is not a tag', regionsOf("x = a <b> c; y = 'z'", { jsx: true }), "string:'z'");
check('lexer/jsx fragment', regionsOf("x = <>a'b</>", { jsx: true }), "jsx-text:a'b");
// the backward significant-char scan reads JSX text as a value (its last char), a comment as nothing
{
  const previous = setLexDialect({ jsx: true });
  try {
    const src = "x = <li>Don't</li>\n(y)";
    check('lexer/prevSignificantPos over jsx', src[prevSignificantPos(src, src.indexOf('(y)'))], '>');
  } finally {
    setLexDialect(previous);
  }
}

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
    return out.split(/\r?\n/u).filter(line => line.startsWith('export const')).join(' | ').replace(/^\u{FEFF}/u, '');
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

// --- renamed-slot recovery: only names the injector minted count as a resolved head ---

// an outer builds its text with the chain root already resolved, so an inner's raw source needle is
// absent while its own slot sits right there under the minted name. the recovery must key on the
// injector's registry, not on the name's shape: a user identifier of the same shape is DATA, and
// treating it as the slot rewrote the user's expression and left the real one unrewritten
function checkRenamedSlotRecovery() {
  const code = 'F(_own.window.self.box, g.window.self.box);';
  const inner = code.indexOf('g.window.self.box');
  const outerContent = 'OUT(_own.window.self.box, _g.window.self.box)';
  function compose(hint) {
    const ms = new MagicString(code);
    const q = new TransformQueue(code, ms);
    if (hint) q.useBindingHints(name => name === '_g' ? 'g' : null);
    q.add(0, code.length, outerContent);
    q.add(inner, inner + 'g.window.self.box'.length, 'RENDER');
    q.apply();
    return ms.toString();
  }
  // with the registry the recovery lands on the minted slot and leaves the user's own alone
  check('renamed slot/minted head is the slot', compose(true), 'OUT(_own.window.self.box, RENDER)');
  // without it nothing is minted, so no token qualifies and the inner stays a phantom - never the
  // user's expression
  check('renamed slot/no registry leaves the user expression', compose(false), outerContent);
}
checkRenamedSlotRecovery();

// --- split pairs are members by their LOGICAL range, on both ends ---

// a split owns [start, end) as one logical rewrite while sitting in the queue as two physical
// halves. every membership question must see the pair: asking for the logical range reported it
// FREE (the index carries only the halves), so a later whole-span claimant never stood down, and
// the inner scan admitted a suffix whose prefix lay outside the range - half a needle against the
// whole pair's content
function checkSplitLogicalMembership() {
  const code = 'F(arr.flat(), 1);';
  const inner = code.indexOf('arr.flat()');
  const ms = new MagicString(code);
  const q = new TransformQueue(code, ms);
  q.addSplit(inner, inner + 'arr'.length, inner + 'arr.flat()'.length, '_flat(arr)', '.call(arr)', null, null);
  check('split membership/logical range is owned', q.hasRange(inner, inner + 'arr.flat()'.length), true);
  check('split membership/physical prefix half is owned', q.hasRange(inner, inner + 'arr'.length), true);
  check('split membership/unclaimed range is free', q.hasRange(0, code.length), false);
  q.apply();
  check('split membership/pair still applies', ms.toString(), 'F(_flat(arr).call(arr), 1);');
}
checkSplitLogicalMembership();

// --- re-transform stability of the guard renders (text emitter) ---

// the text emitter builds its renders from source SPANS, so a second pass over its own output sees
// a shape it never parsed before. every family this canon emits must be a fixed point in content -
// a re-render would double the guard or re-memoize, and a composition that no longer locates its
// needle would throw outright
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
// be probed AGAIN by the allocator it hands to - in the AST emitter that probe is a whole
// scope-chain lookup, so a duplicate is a real per-allocation cost. counted through
// `isNameTaken`, the single funnel every probe passes through
function checkSingleBareProbePerAllocation() {
  function countingInjector() {
    const inj = new ImportInjector({ mode: 'actual', pkg: 'x', ms: new MagicString('') });
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
  const inj = new ImportInjector({ mode: 'actual', pkg: 'x', ms: new MagicString('') });
  const prototypeMethod = Object.getPrototypeOf(inj).generateUnusedName
    ?? Object.getPrototypeOf(Object.getPrototypeOf(inj)).generateUnusedName;
  // the emitter's wrapper, spelled exactly as `withTrackedUnusedNames` does
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

// --- the emitter factories publish exactly what the driver consumes ---
// a returned key with no consumer reads as a supported entry point and survives every rename by
// accident. the check is mechanical rather than a hand-kept list: the driver's own destructuring
// block IS the expected set, so a key added on either side without the other fails here
async function checkEmitterSurfacesHaveConsumers() {
  const driver = await fs.readFile(
    path.resolve('../../packages/core-js-unplugin/internals/plugin.js'), 'utf8');
  function destructuredFrom(name) {
    const block = driver.match(new RegExp(`const \\{([^}]*)\\} = ${ name };`));
    return block[1].split(',').map(entry => entry.trim()).filter(Boolean).sort();
  }
  const { createPolyfillEmitter } = await import('../../packages/core-js-unplugin/internals/polyfill-emitter.js');
  const { createDestructureEmitter } = await import('../../packages/core-js-unplugin/internals/destructure-emitter.js');
  // the factories only capture their deps at construction time, so bare stubs are enough to read
  // the shape of what they publish
  function noop() {
    return undefined;
  }
  const deps = new Proxy({ code: '', source: '', transforms: {}, skippedNodes: new Set() }, {
    get: (target, key) => key in target ? target[key] : noop,
    has: () => true,
  });
  // the dep object the driver BUILDS, against the parameter list the factory destructures: a key
  // passed and never accepted reads as wiring that exists, and silently does nothing
  function passedTo(call) {
    const block = driver.match(new RegExp(`${ call }\\(\\{([^}]*)\\}`));
    return block[1].split(',').map(entry => entry.trim().split(':', 1)[0].trim()).filter(Boolean).sort();
  }
  // `withDefaultOnly: false` narrows to the params with NO default - the ones whose absence is a
  // TypeError rather than a documented opt-out
  function acceptedBy(source, factoryName, { withDefaultOnly = true } = {}) {
    const block = source.match(new RegExp(`export function ${ factoryName }\\(\\{([^}]*)\\}`));
    return block[1].split(',').map(entry => entry.trim())
      .filter(entry => entry && !entry.startsWith('//') && (withDefaultOnly || !entry.includes('=')))
      .map(entry => entry.split(/[:=]/, 1)[0].trim()).sort();
  }
  const sources = {
    'polyfill-emitter': await fs.readFile(
      path.resolve('../../packages/core-js-unplugin/internals/polyfill-emitter.js'), 'utf8'),
    'destructure-emitter': await fs.readFile(
      path.resolve('../../packages/core-js-unplugin/internals/destructure-emitter.js'), 'utf8'),
  };
  for (const [label, factory, local, factoryName] of [
    ['polyfill-emitter', createPolyfillEmitter, 'emitter', 'createPolyfillEmitter'],
    ['destructure-emitter', createDestructureEmitter, 'destructureEmitter', 'createDestructureEmitter'],
  ]) {
    const published = Object.keys(factory(deps)).sort();
    const consumed = destructuredFrom(local);
    check(`${ label }/no published key without a consumer`,
      published.filter(key => !consumed.includes(key)).join(',') || '(none)', '(none)');
    check(`${ label }/no consumed key the factory does not publish`,
      consumed.filter(key => !published.includes(key)).join(',') || '(none)', '(none)');
    const accepted = acceptedBy(sources[label], factoryName);
    check(`${ label }/no dep passed that the factory never accepts`,
      passedTo(factoryName).filter(key => !accepted.includes(key)).join(',') || '(none)', '(none)');
    // the symmetric half, and the one that makes an UNGUARDED call on a dep safe: a name the factory
    // destructures without a default and the driver never passes arrives as `undefined`, and the call
    // sites that dropped their defensive `?.` would throw instead of degrading
    const undefaulted = acceptedBy(sources[label], factoryName, { withDefaultOnly: false });
    check(`${ label }/every dep the factory requires is passed`,
      undefaulted.filter(key => !passedTo(factoryName).includes(key)).join(',') || '(none)', '(none)');
  }
}
await checkEmitterSurfacesHaveConsumers();

// `checkUnscopedParamPatterns` above proves the BEHAVIOR - every one of those hosts still injects,
// so the neutralisation covers them. What it cannot notice is a parameter-bearing node type that
// did not exist when the allowlist was written: `PARAM_PATTERN_SCOPE_OWNERS` names the three types
// that OWN a scope, and anything else has its parameter patterns blanked. A parser upgrade adding a
// fourth scope owner would silently lose that scope's bindings, and a new bodyless shape would
// crash a user build outright, because `runTransform` rethrows. So pin the SET itself
function checkParamPatternHostsAreEnumerated() {
  const SOURCES = [
    'function f(...a) {}',
    'const f = function (...a) {};',
    'const f = (...a) => a;',
    'class C { m(...a) {} get x() { return 1; } set x(v) {} }',
    'const o = { m(...a) {} };',
    'declare function f(...a: number[]): void;',
    'function g(...a: number[]): void;\nfunction g(...a: any[]): any {}',
    'interface I { (...a: number[]): void; new (...a: number[]): void; m(...a: number[]): void }',
    'declare class C { m(...a: number[]): void; }',
    'declare abstract class A { abstract m(...a: number[]): void; }',
    'declare const f: (...a: number[]) => void;',
    'declare const C2: new (...a: number[]) => void;',
    'class D { constructor(public m = 1) {} }',
  ];
  const EXPECTED = [
    'ArrowFunctionExpression', 'FunctionDeclaration', 'FunctionExpression', 'TSCallSignatureDeclaration',
    'TSConstructSignatureDeclaration', 'TSConstructorType', 'TSDeclareFunction', 'TSEmptyBodyFunctionExpression',
    'TSFunctionType', 'TSMethodSignature',
  ];
  const seen = new Set();
  (function collect(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const child of node) collect(child);
      return;
    }
    if (Array.isArray(node.params)) seen.add(node.type);
    for (const value of Object.values(node)) collect(value);
  // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
  })(SOURCES.map(code => parseSync('input.ts', code, { sourceType: 'module' }).program));
  check('parameter-bearing node types are the ones the allowlist was written against',
    [...seen].sort().join(','), EXPECTED.join(','));
  // the corpus has to actually exercise the crashing half, or the set above could be pinned on a
  // sample that never reaches a bodyless signature
  check('the corpus reaches bodyless signatures', seen.has('TSDeclareFunction') && seen.has('TSMethodSignature'), true);
}
checkParamPatternHostsAreEnumerated();

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

// --- engine option ---

function checkEngineOption() {
  function creationError(options) {
    try {
      createPlugin(options);
      return null;
    } catch (error) {
      return error.message;
    }
  }
  check('unknown engine is rejected',
    creationError({ method: 'usage-pure', engine: 'quantum' }),
    "[core-js] invalid `engine` option: 'quantum' - expected 'text' or 'ast'");
  check('non-string engine reports its type',
    creationError({ method: 'usage-pure', engine: 42 }),
    '[core-js] invalid `engine` option: number - expected \'text\' or \'ast\'');
  // usage-pure landed once its two gates (the fixture gate and the differential's AST leg)
  // went green - the acceptance is the lock, mirroring the entry-global/usage-global checks
  const astPure = createPlugin({ method: 'usage-pure', version: '4.0', targets: { ie: 11 }, engine: 'ast' })
    .transform('arr.at(0);\nuse(arr);', 'input.mjs');
  check("engine 'ast' transforms usage-pure",
    astPure !== null && astPure.code.includes('@core-js/pure/') && astPure.code.includes('.call(arr, 0)'), true);
  // the landed methods transform; the rest keep the guard above
  const entryOptions = { method: 'entry-global', version: '4.0', targets: { ie: 11 } };
  const astEntry = createPlugin({ ...entryOptions, engine: 'ast' }).transform("import 'core-js/actual/array/from';\nuse();", 'input.mjs');
  check("engine 'ast' transforms entry-global",
    astEntry !== null && astEntry.code.includes('import "core-js/modules/es.array.from";'), true);
  check('the ast entry output drops the entry statement', astEntry.code.includes('core-js/actual'), false);
  check('the ast engine abstains on entry-less files',
    createPlugin({ ...entryOptions, engine: 'ast' }).transform('use();', 'input.mjs'), null);
  // a module-import input re-expands to itself: babel reprints it, the text leg nulls out
  // only by byte-accident - the ast engine follows babel and re-emits the same statements
  check('a module-import re-transform re-emits the same imports (babel parity)',
    createPlugin({ ...entryOptions, engine: 'ast' }).transform(astEntry.code, 'input.mjs')?.code.includes('import "core-js/modules/es.array.from";'), true);
  check('the ast engine renders require-style entries',
    createPlugin({ ...entryOptions, engine: 'ast', importStyle: 'require' })
      .transform("require('core-js/actual/array/from');", 'input.mjs').code.startsWith('require("core-js/modules/'), true);
  // usage-global on the ast engine: injection, the user-import sweep, the one normalization
  const usageOptions = { method: 'usage-global', version: '4.0', targets: { ie: 11 } };
  const astUsage = createPlugin({ ...usageOptions, engine: 'ast' })
    .transform('import "core-js/modules/es.array.at";\narr.at(0);', 'input.mjs');
  check("engine 'ast' transforms usage-global", astUsage?.code.startsWith('import "core-js/modules/es.array.at";'), true);
  check('the swept user module import is not doubled', astUsage.code.match(/es\.array\.at/g).length, 1);
  check('the ast engine normalizes instantiation before optional call',
    createPlugin({ ...usageOptions, engine: 'ast' }).transform('const r = ((f)<string>)?.(1);\narr.at(0);', 'input.ts')
      .code.includes('f?.<string>(1)'), true);
  // phased passes landed with the pre/post snapshot (MIG-15) - the acceptance is the lock;
  // standalone post (no pre snapshot) transforms exactly like the text engine's post
  check('the ast engine transforms phased usage-global at the plugin layer',
    createPlugin({ ...usageOptions, engine: 'ast' }).transform('arr.at(0);', 'input.mjs', 'post')
      ?.code.includes('import "core-js/modules/es.array.at";'), true);
  const viaDefault = createPlugin({ method: 'usage-pure' }).transform('[1].at(0);', 'input.mjs')?.code;
  const viaText = createPlugin({ method: 'usage-pure', engine: 'text' }).transform('[1].at(0);', 'input.mjs')?.code;
  check("explicit engine 'text' is the default engine", viaText, viaDefault);
  check('explicit null falls back to the default engine',
    createPlugin({ method: 'usage-pure', engine: null }).transform('[1].at(0);', 'input.mjs')?.code, viaDefault);
}
checkEngineOption();

// --- ast-engine: walker mutation contract ---

// the AST emitters' port recipes lean on these traversal semantics; a dependency bump that
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
