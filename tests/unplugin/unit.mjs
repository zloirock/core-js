import { parseSync } from 'oxc-parser';
import MagicString from 'magic-string';
import { shouldTransform } from '../../packages/core-js-unplugin/index.js';
import { entryToGlobalHint, ORPHAN_REF_PATTERN } from '../../packages/core-js-polyfill-provider/import-state.js';
import TransformQueue, { deoptionalizeNeedle } from '../../packages/core-js-unplugin/internals/transform-queue.js';
import ImportInjector from '../../packages/core-js-unplugin/internals/import-injector.js';
import createPlugin from '../../packages/core-js-unplugin/internals/plugin.js';
import SnapshotCache from '../../packages/core-js-unplugin/internals/snapshot-cache.js';
import { collectAllBindingNames } from '../../packages/core-js-unplugin/internals/plugin-helpers.js';

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
  ['/src/App.vue?vue&type=style', false, 'Vue SFC style block (default-JS only matches script/module)'],
  // explicit non-JS lang= blocks the default-JS fallback
  ['/src/App.vue?vue&type=script&lang=scss', false, 'Vue SFC explicit lang=scss blocks default-JS fallback'],
  // unknown framework marker without lang= still bails (no JS extension, no SFC marker)
  ['/src/foo.unknown?type=script', false, 'unknown framework marker'],
  ['/src/App.vue?vue&type=script&setup=true&lang=ts', true, 'Vue SFC lang=ts'],
  ['/src/App.vue?vue&type=script&lang=mts', true, 'Vue SFC lang=mts'],
  ['/src/App.vue?vue&type=script&lang=cts', true, 'Vue SFC lang=cts'],
  ['/src/App.vue?vue&type=script&lang=jsx', true, 'Vue SFC lang=jsx'],
  ['/src/App.vue?lang=ts&type=script', true, 'lang= before type='],
  ['/src/App.vue?foo=bar&lang=ts&baz=qux', true, 'lang= sandwiched between query params'],
  ['/src/App.svelte?lang=jsx', true, 'Svelte SFC lang=jsx'],
  ['/src/Page.astro?astro&type=script&lang=tsx', true, 'Astro SFC lang=tsx'],
  // SFC non-JS sub-blocks / declaration / substring false-match / empty value
  ['/src/App.vue?vue&type=style&lang=scss', false, 'Vue SFC lang=scss'],
  ['/src/App.vue?vue&type=script&lang=d.ts', false, 'SFC declaration block (lang=d.ts)'],
  ['/src/App.vue?xlang=ts', false, 'xlang= substring guard'],
  ['/src/App.vue?lang=', false, 'empty lang='],
  // `.js`/`.ts` token appears only inside the query — strip query before extension-check
  ['/virtual:foo?output=main.js', false, '.js inside query only'],
  ['/virtual:foo?output=main.ts#bar', false, '.ts inside query only'],
  // SFC with a `.js`-like token in the query: `stripQueryHash` leaves `.vue`, SFC path wins
  ['/src/foo.vue?lang=ts&suffix=.js', true, 'SFC with .js token in query'],
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
];

for (const [id, want, label] of shouldTransformCases) check(`shouldTransform/${ label }`, shouldTransform(id), want);

// class entries (bare or `/constructor` tail) PascalCase the first segment; method
// entries return null so user imports of them don't masquerade as class aliases
check('entryToGlobalHint/single segment', entryToGlobalHint('promise'), 'Promise');
check('entryToGlobalHint/subpath constructor', entryToGlobalHint('promise/constructor'), 'Promise');
check('entryToGlobalHint/kebab single word', entryToGlobalHint('weak-map'), 'WeakMap');
check('entryToGlobalHint/non-class helper', entryToGlobalHint('is-iterable'), 'IsIterable');
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
  check('PIS-26/first-write-wins', inj.addPureImport('promise/try', 'Promise$try'), '_Def');
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
    echo`${ red('FAIL') } ${ cyan('SM-03/BOM sourcesContent') } :: missing sourcesContent`;
    return;
  }
  check('SM-03/BOM length', result.map.sourcesContent[0].length, source.length);
  check('SM-03/BOM prefix', result.map.sourcesContent[0].charCodeAt(0), 0xFEFF);
}
checkBomSourcesContent();

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

const { passed, failed } = counts;
echo`\nPassed: ${ green(passed) }, Failed: ${ failed ? red(failed) : green(failed) }`;
if (failed) throw new Error('Some tests have failed');
