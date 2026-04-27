import { parseSync } from 'oxc-parser';
import MagicString from 'magic-string';
import { shouldTransform } from '../../packages/core-js-unplugin/index.js';
import { createPolyfillContext } from '../../packages/core-js-polyfill-provider/index.js';
import { entryToGlobalHint, ORPHAN_REF_PATTERN } from '../../packages/core-js-polyfill-provider/injector-base.js';
import { patternToRegExp } from '../../packages/core-js-polyfill-provider/helpers/pattern-matching.js';
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

// --- SnapshotCache: Vite HMR `&t=<timestamp>` stripping ---
// Vite HMR re-fires modules with `?t=<ms>` cache-buster. each fire generates a different
// timestamp, but the logical module is the same. snapshot lookup keyed by normalized id
// (timestamp stripped) so pre→post lookup survives HMR. without the strip, post-pass
// missed pre's snapshot and emitted duplicate `var _ref;` / re-allocated UIDs
function checkSnapshotHMRTimestampStrip() {
  const entry = { code: 'foo', map: null, ast: null, source: 'foo' };
  // helper: store under one id, query by another, report whether the lookup hit
  const probeHit = (storeId, takeId) => {
    const cache = new SnapshotCache();
    cache.store(storeId, entry);
    return cache.take(takeId) !== null;
  };
  check('snapshot/HMR &t= different timestamp finds same entry',
    probeHit('/src/App.vue?vue&type=script&t=1733', '/src/App.vue?vue&type=script&t=9999'), true);
  check('snapshot/SFC sub-block query distinguishes',
    probeHit('/src/App.vue?vue&type=script&t=1733', '/src/App.vue?vue&type=template'), false);
  check('snapshot/non-SFC ?t= strip',
    probeHit('/src/util.js?t=100', '/src/util.js?t=200'), true);
  check('snapshot/bare ?t=N strips clean',
    probeHit('/src/x.js?t=1', '/src/x.js'), true);
}
checkSnapshotHMRTimestampStrip();

// --- SnapshotCache: Windows UNC path normalization ---
// `\\?\C:\src\App.vue` is Windows verbatim long-path prefix - same logical file as
// `C:/src/App.vue` after path-mangling stages. without UNC strip, snapshot lookups
// across pre→post (where mid-pipeline normalization may have run) miss
function checkSnapshotWindowsUNC() {
  const entry = { code: 'foo', map: null, ast: null, source: 'foo' };
  // helper: store under one id, query by another
  const probeHit = (storeId, takeId) => {
    const cache = new SnapshotCache();
    cache.store(storeId, entry);
    return cache.take(takeId) !== null;
  };
  // backslash UNC paired with forward-slash POSIX path (after normalize stage)
  check('snapshot/UNC backslash matches forward-slash same path',
    probeHit('\\\\?\\C:\\src\\App.vue', 'C:/src/App.vue'), true);
  // forward-slash UNC (Vite-normalized form) matches POSIX
  check('snapshot/UNC forward-slash matches POSIX',
    probeHit('//?/C:/src/App.vue', 'C:/src/App.vue'), true);
}
checkSnapshotWindowsUNC();

// --- SnapshotCache: per-file invalidation ---
// `watchChange` hook on Vite/Rollup fires per-file edit. cache.invalidate(id) drops only
// that file's entry (not the whole cache) so unrelated files keep their pre-snapshot state
function checkSnapshotInvalidate() {
  const cache = new SnapshotCache();
  const entry = { code: 'foo', map: null, ast: null, source: 'foo' };
  cache.store('/src/a.js', entry);
  cache.store('/src/b.js', entry);
  check('snapshot/invalidate returns true for existing entry', cache.invalidate('/src/a.js'), true);
  check('snapshot/invalidate returns false for missing entry', cache.invalidate('/src/missing.js'), false);
  check('snapshot/invalidate preserves siblings', cache.take('/src/b.js') !== null, true);
  // path normalization carries through invalidate
  cache.store('/src/c.js?vue&type=script&t=100', entry);
  cache.invalidate('/src/c.js?vue&type=script&t=999');
  check('snapshot/invalidate normalizes HMR timestamp',
    cache.take('/src/c.js?vue&type=script&t=1') !== null, false);
}
checkSnapshotInvalidate();

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
checkPolyfillContextRejects('createPolyfillContext/null package',
  { method: 'usage-pure', package: null });

const { passed, failed } = counts;
echo`\nPassed: ${ green(passed) }, Failed: ${ failed ? red(failed) : green(failed) }`;
if (failed) throw new Error('Some tests have failed');
