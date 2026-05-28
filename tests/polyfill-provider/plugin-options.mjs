// Unit tests for `plugin-options/`: parser-agnostic pure-logic validators,
// configurable injectors, target resolvers, and the debug-output formatter. These
// modules are config-layer (no AST involved) so the tests don't go through `runBoth`
import {
  VALID_METHODS,
  VALID_MODES,
  validateOptions,
} from '../../packages/core-js-polyfill-provider/plugin-options/validate.js';
import {
  createModuleInjectors,
  polyfillOrderComparator,
  sortByPolyfillOrder,
} from '../../packages/core-js-polyfill-provider/plugin-options/inject.js';
import {
  buildShouldInjectPolyfill,
  formatTargets,
  getUnsupportedTargets,
  resolveTargets,
} from '../../packages/core-js-polyfill-provider/plugin-options/targets.js';
import { createDebugOutputFactory } from '../../packages/core-js-polyfill-provider/plugin-options/debug-output.js';
import { initPluginOptions } from '../../packages/core-js-polyfill-provider/plugin-options/init.js';
import { createChecker } from './harness.mjs';

const { check, checkTruthy, doesNotThrow, finish, throwsWith } = createChecker('plugin-options');

// minimal happy-path skeleton for validateOptions; tests override specific keys
const validBase = {
  method: 'usage-global',
  version: '4.0',
};

// --- VALID_METHODS / VALID_MODES ---

check('VALID_METHODS is a Set', VALID_METHODS instanceof Set, true);
checkTruthy('VALID_METHODS has entry-global', VALID_METHODS.has('entry-global'));
checkTruthy('VALID_METHODS has usage-global', VALID_METHODS.has('usage-global'));
checkTruthy('VALID_METHODS has usage-pure', VALID_METHODS.has('usage-pure'));
check('VALID_METHODS rejects unknown', VALID_METHODS.has('unknown-method'), false);

check('VALID_MODES is a Set', VALID_MODES instanceof Set, true);
checkTruthy('VALID_MODES has actual', VALID_MODES.has('actual'));
checkTruthy('VALID_MODES has stable + es + full', VALID_MODES.has('stable') && VALID_MODES.has('es') && VALID_MODES.has('full'));

// --- validateOptions: happy path ---

doesNotThrow('validateOptions/minimal happy path',
  () => validateOptions(validBase));

doesNotThrow('validateOptions/full happy path', () => validateOptions({
  ...validBase,
  mode: 'actual',
  importStyle: 'import',
  absoluteImports: true,
  debug: false,
  ignoreBrowserslistConfig: false,
  shippedProposals: true,
  configPath: '/path/to/config',
  browserslistEnv: 'production',
  package: 'core-js',
  additionalPackages: ['@my/fork'],
  targets: { ie: 11 },
  include: ['es.array.at'],
  exclude: ['web.url'],
}));

// --- validateOptions: method enum ---

throwsWith('validateOptions/method invalid value',
  () => validateOptions({ ...validBase, method: 'unknown' }),
  '`method` must be one of');
throwsWith('validateOptions/method missing',
  () => validateOptions({ ...validBase, method: undefined }),
  '`method`');

// --- validateOptions: mode enum (optional) ---

doesNotThrow('validateOptions/mode undefined OK',
  () => validateOptions({ ...validBase, mode: undefined }));
doesNotThrow('validateOptions/mode null OK (isEmpty-style)',
  () => validateOptions({ ...validBase, mode: null }));
throwsWith('validateOptions/mode invalid value',
  () => validateOptions({ ...validBase, mode: 'unknown' }),
  '`mode` must be one of');

// --- validateOptions: importStyle ---

doesNotThrow('validateOptions/importStyle import',
  () => validateOptions({ ...validBase, importStyle: 'import' }));
doesNotThrow('validateOptions/importStyle require',
  () => validateOptions({ ...validBase, importStyle: 'require' }));
throwsWith('validateOptions/importStyle invalid',
  () => validateOptions({ ...validBase, importStyle: 'foo' }),
  '`importStyle`');

// --- validateOptions: boolean options ---

for (const key of ['absoluteImports', 'debug', 'ignoreBrowserslistConfig', 'shippedProposals']) {
  doesNotThrow(`validateOptions/${ key } boolean OK`,
    () => validateOptions({ ...validBase, [key]: true }));
  doesNotThrow(`validateOptions/${ key } false OK`,
    () => validateOptions({ ...validBase, [key]: false }));
  // `isEmpty` treats null and undefined symmetrically so conditional-spread
  // (`{ debug: cond ? true : null }`) clears the option without crashing
  doesNotThrow(`validateOptions/${ key } null OK`,
    () => validateOptions({ ...validBase, [key]: null }));
  doesNotThrow(`validateOptions/${ key } undefined OK`,
    () => validateOptions({ ...validBase, [key]: undefined }));
  throwsWith(`validateOptions/${ key } non-boolean`,
    () => validateOptions({ ...validBase, [key]: 'yes' }),
    `\`${ key }\``);
  // error message reflects nullish acceptance (`null, or undefined`) - users see
  // the actual contract not a half-truth
  throwsWith(`validateOptions/${ key } error message mentions null`,
    () => validateOptions({ ...validBase, [key]: 42 }),
    'null, or undefined');
}

// --- validateOptions: string options ---

for (const key of ['configPath', 'browserslistEnv', 'version']) {
  doesNotThrow(`validateOptions/${ key } string OK`,
    () => validateOptions({ ...validBase, [key]: 'value' }));
  doesNotThrow(`validateOptions/${ key } null OK`,
    () => validateOptions({ ...validBase, [key]: null }));
  throwsWith(`validateOptions/${ key } non-string`,
    () => validateOptions({ ...validBase, [key]: 42 }),
    `\`${ key }\``);
}

// `configPath` / `browserslistEnv` intentionally accept `''` (build tools commonly
// pipe `process.env.VAR || ''`); `targets` rejects empty as suspicious. asymmetric
// by design - documented in validate.js. see `audit-config-path-empty-string` /
// `audit-browserslist-env-empty` for the integration-level contract
doesNotThrow('validateOptions/configPath empty string OK (env-var passthrough)',
  () => validateOptions({ ...validBase, configPath: '' }));
doesNotThrow('validateOptions/browserslistEnv empty string OK (env-var passthrough)',
  () => validateOptions({ ...validBase, browserslistEnv: '' }));

// --- validateOptions: shouldInjectPolyfill ---

doesNotThrow('validateOptions/shouldInjectPolyfill function',
  () => validateOptions({ ...validBase, shouldInjectPolyfill: () => true }));
throwsWith('validateOptions/shouldInjectPolyfill non-function',
  () => validateOptions({ ...validBase, shouldInjectPolyfill: 'no' }),
  '`shouldInjectPolyfill`');

// --- validateOptions: include/exclude vs shouldInjectPolyfill conflict ---

// empty arrays are intentionally NOT a conflict - users can use conditional spread
// to clear include/exclude without removing shouldInjectPolyfill
doesNotThrow('validateOptions/empty include + shouldInjectPolyfill OK',
  () => validateOptions({
    ...validBase,
    include: [],
    shouldInjectPolyfill: () => true,
  }));
throwsWith('validateOptions/non-empty include + shouldInjectPolyfill conflict',
  () => validateOptions({
    ...validBase,
    include: ['es.array.at'],
    shouldInjectPolyfill: () => true,
  }),
  '`include` and `exclude` are not supported when using `shouldInjectPolyfill`');
throwsWith('validateOptions/non-empty exclude + shouldInjectPolyfill conflict',
  () => validateOptions({
    ...validBase,
    exclude: ['web.url'],
    shouldInjectPolyfill: () => true,
  }),
  '`include` and `exclude`');

// --- validateOptions: package ---

doesNotThrow('validateOptions/package undefined OK',
  () => validateOptions({ ...validBase, package: undefined }));
// `null = same as absent` per index.d.ts (`package?: string | null`); conditional-spread
// shapes like `{ package: cond ? '@my/fork' : null }` must not throw at validate time
doesNotThrow('validateOptions/package null OK',
  () => validateOptions({ ...validBase, package: null }));
doesNotThrow('validateOptions/package valid string',
  () => validateOptions({ ...validBase, package: '@my/fork' }));
throwsWith('validateOptions/package non-string',
  () => validateOptions({ ...validBase, package: 42 }),
  '`package`');
throwsWith('validateOptions/package empty string',
  () => validateOptions({ ...validBase, package: '' }),
  '`package`');
throwsWith('validateOptions/package pure slash',
  () => validateOptions({ ...validBase, package: '/' }),
  '`package`');
throwsWith('validateOptions/package multi slash',
  () => validateOptions({ ...validBase, package: '///' }),
  '`package`');

// --- validateOptions: additionalPackages ---

doesNotThrow('validateOptions/additionalPackages undefined OK',
  () => validateOptions({ ...validBase, additionalPackages: undefined }));
doesNotThrow('validateOptions/additionalPackages null OK',
  () => validateOptions({ ...validBase, additionalPackages: null }));
doesNotThrow('validateOptions/additionalPackages empty array OK',
  () => validateOptions({ ...validBase, additionalPackages: [] }));
doesNotThrow('validateOptions/additionalPackages valid array',
  () => validateOptions({ ...validBase, additionalPackages: ['@my/fork', 'core-js-pure'] }));
throwsWith('validateOptions/additionalPackages non-array',
  () => validateOptions({ ...validBase, additionalPackages: 'foo' }),
  '`additionalPackages`');
// labels point to the failing index so users of long lists get a direct pointer
// to the bad entry instead of a generic `[*]` wildcard
throwsWith('validateOptions/additionalPackages contains non-string',
  () => validateOptions({ ...validBase, additionalPackages: ['ok', 42] }),
  '`additionalPackages[1]`');
throwsWith('validateOptions/additionalPackages contains undefined',
  () => validateOptions({ ...validBase, additionalPackages: ['ok', undefined] }),
  '`additionalPackages[1]`');
throwsWith('validateOptions/additionalPackages contains empty string',
  () => validateOptions({ ...validBase, additionalPackages: ['ok', ''] }),
  '`additionalPackages[1]`');
throwsWith('validateOptions/additionalPackages contains pure slash',
  () => validateOptions({ ...validBase, additionalPackages: ['ok', '/'] }),
  '`additionalPackages[1]`');
// first bad entry decides the index; later bad entries are silent until the first is fixed
throwsWith('validateOptions/additionalPackages first bad item wins index',
  () => validateOptions({ ...validBase, additionalPackages: [42, ''] }),
  '`additionalPackages[0]`');
// index reflects position past valid prefix entries, not the count of bad ones
throwsWith('validateOptions/additionalPackages index past long prefix',
  () => validateOptions({ ...validBase, additionalPackages: ['a', 'b', 'c', 'd', 42] }),
  '`additionalPackages[4]`');

// all-good long list (size > 1) - confirm validator iterates the whole array without bailing
doesNotThrow('validateOptions/additionalPackages all-good long list', () => validateOptions({
  ...validBase,
  additionalPackages: ['@scope/a', '@scope/b', '@scope/c', '@scope/d', '@scope/e'],
}));

// all-bad array - first-bad-wins behavior holds even when every entry is invalid
throwsWith('validateOptions/additionalPackages all bad - first wins',
  () => validateOptions({ ...validBase, additionalPackages: [42, '', '/', null] }),
  '`additionalPackages[0]`');

// single-element bad array - confirm `[0]` index format (no off-by-one)
throwsWith('validateOptions/additionalPackages single-element bad',
  () => validateOptions({ ...validBase, additionalPackages: [42] }),
  '`additionalPackages[0]`');
throwsWith('validateOptions/additionalPackages single-element empty string',
  () => validateOptions({ ...validBase, additionalPackages: [''] }),
  '`additionalPackages[0]`');
throwsWith('validateOptions/additionalPackages single-element pure slash',
  () => validateOptions({ ...validBase, additionalPackages: ['/'] }),
  '`additionalPackages[0]`');

// non-array shape (number) bails at the outer Array.isArray check, NOT the index-aware
// per-item loop - the label stays the bare `additionalPackages` without a `[i]` suffix
throwsWith('validateOptions/additionalPackages non-array number label has no index',
  () => {
    try { validateOptions({ ...validBase, additionalPackages: 42 }); } catch (error) {
      // re-throw if the label has a stray `[` (would mean the inner loop fired)
      if (/additionalPackages\[/.test(error.message)) throw new Error(`unexpected index label: ${ error.message }`);
      throw error;
    }
  },
  '`additionalPackages`');

// --- validateOptions: cross-section interactions ---

// each section validates independently; mixing valid + invalid across fields surfaces
// the first failing field in validation order. include is checked BEFORE additionalPackages,
// so a bad include element wins over a bad additionalPackages element
throwsWith('validateOptions/include-bad + additionalPackages-bad - include wins',
  () => validateOptions({
    ...validBase,
    include: [42],
    additionalPackages: [42],
  }),
  '`include[*]`');

// exclude is also checked before additionalPackages
throwsWith('validateOptions/exclude-bad + additionalPackages-bad - exclude wins',
  () => validateOptions({
    ...validBase,
    exclude: [{}],
    additionalPackages: [''],
  }),
  '`exclude[*]`');

// valid include + valid exclude + valid additionalPackages - no error (all-good integration)
doesNotThrow('validateOptions/all three list fields valid',
  () => validateOptions({
    ...validBase,
    include: ['es.array.at'],
    exclude: ['web.url'],
    additionalPackages: ['@scope/extra'],
  }));

// valid include + valid additionalPackages + invalid targets - targets is validated last,
// so it surfaces only when the earlier sections pass
throwsWith('validateOptions/lists ok + targets bad',
  () => validateOptions({
    ...validBase,
    include: ['es.array.at'],
    additionalPackages: ['@scope/extra'],
    targets: () => ({}),
  }),
  '`targets`');

// package bad + additionalPackages bad: package is checked first within the package
// pair so its label wins. confirms isolation of single-vs-array package validators
throwsWith('validateOptions/package-bad + additionalPackages-bad - package wins',
  () => validateOptions({
    ...validBase,
    package: 42,
    additionalPackages: [42],
  }),
  '`package`');

// --- validateOptions: targets ---

doesNotThrow('validateOptions/targets string',
  () => validateOptions({ ...validBase, targets: 'defaults' }));
doesNotThrow('validateOptions/targets object',
  () => validateOptions({ ...validBase, targets: { ie: 11 } }));
doesNotThrow('validateOptions/targets array',
  () => validateOptions({ ...validBase, targets: ['last 2 versions'] }));
throwsWith('validateOptions/targets function',
  () => validateOptions({ ...validBase, targets: () => ({}) }),
  '`targets`');
throwsWith('validateOptions/targets boolean',
  () => validateOptions({ ...validBase, targets: true }),
  '`targets`');
throwsWith('validateOptions/targets number',
  () => validateOptions({ ...validBase, targets: 42 }),
  '`targets`');
throwsWith('validateOptions/targets empty string',
  () => validateOptions({ ...validBase, targets: '' }),
  '`targets`');
throwsWith('validateOptions/targets empty array',
  () => validateOptions({ ...validBase, targets: [] }),
  '`targets`');

// --- validateOptions: adversarial input hardening ---

// `formatReceived` calls `isPlainObject` which reads `Object.getPrototypeOf(value)`.
// that operation fires the `getPrototypeOf` trap on Proxy; an adversarial trap
// that throws must not mask the primary option-type error with a secondary
// diagnostic. validator should still emit a clean `[core-js]`-prefixed TypeError
// for the option's actual type mismatch (here: `debug` expects boolean, got Proxy)
{
  const adversarialProxy = new Proxy({}, {
    getPrototypeOf() { throw new Error('adversarial trap'); },
  });
  throwsWith('validateOptions/Proxy with throwing getPrototypeOf as debug value',
    () => validateOptions({ ...validBase, debug: adversarialProxy }),
    '`debug`');
}

// `resolveTargets` wraps upstream errors with `[core-js] failed to resolve targets:`.
// when the thrown value's `.message` getter or `String(error)` throws (adversarial
// Proxy as the thrown payload), the wrapping must still emit a readable diagnostic
// - mirrors the same hardening in `buildShouldInjectPolyfill`
{
  // targetsParser walks own enumerable keys on the targets object - a Proxy with
  // a throwing `ownKeys` trap forces it to throw an adversarial error, hitting
  // resolveTargets's catch block. the catch's `.message` extraction itself runs
  // against an adversarial error payload (its own `message` getter throws)
  const adversarialError = new Proxy(new Error(), {
    get(target, prop) {
      if (prop === 'message') throw new Error('inner from message getter');
      return target[prop];
    },
  });
  const targetsThatThrows = new Proxy({}, {
    ownKeys() { throw adversarialError; },
  });
  throwsWith('resolveTargets/wraps adversarial-message error without crashing',
    () => resolveTargets({
      targets: targetsThatThrows,
      configPath: undefined,
      ignoreBrowserslistConfig: false,
      browserslistEnv: undefined,
      getBabelTargets: undefined,
    }),
    '[core-js] failed to resolve targets:');
}

// --- polyfillOrderComparator ---

// known modules sort in compat-data registry order (es.* before web.*); use specific
// well-known modules to avoid coupling to exact internal ordering changes
const orderKnownKnown = polyfillOrderComparator('es.array.at', 'web.url.constructor');
checkTruthy('polyfillOrderComparator/known < known (registry-driven)', orderKnownKnown < 0,
  `expected es.array.at < web.url.constructor, got ${ orderKnownKnown }`);

// unknown vs unknown: lex comparison fallback (both miss the registry)
check('polyfillOrderComparator/unknown < unknown lex', polyfillOrderComparator('aaa.unknown', 'zzz.unknown'), -1);
check('polyfillOrderComparator/unknown > unknown lex', polyfillOrderComparator('zzz.unknown', 'aaa.unknown'), 1);
check('polyfillOrderComparator/unknown === unknown', polyfillOrderComparator('aaa.unknown', 'aaa.unknown'), 0);

// known always precedes unknown regardless of lex order - the split is what keeps the
// comparator a strict weak order. prior version fell through to lex on any non-finite
// delta, which let mixed-group lex break transitivity
check('polyfillOrderComparator/known before lex-smaller unknown',
  polyfillOrderComparator('web.url.constructor', 'aaa.unknown') < 0, true);
check('polyfillOrderComparator/lex-smaller unknown after known',
  polyfillOrderComparator('aaa.unknown', 'web.url.constructor') > 0, true);

// transitivity: a < b, b < c => a < c across mixed known / unknown inputs.
// the failure mode the fix targets: known `web.url.constructor` < known `es.array.at` (by rank
// since es.* precedes web.* would actually flip - keep the example direction-agnostic by reading
// pairwise results). assert the transitive closure holds rather than fixing a literal triple
{
  const sample = ['es.array.at', 'web.url.constructor', 'aaa.unknown', 'zzz.unknown'];
  let transitive = true;
  let counterExample = null;
  for (const a of sample) for (const b of sample) for (const c of sample) {
    const ab = polyfillOrderComparator(a, b);
    const bc = polyfillOrderComparator(b, c);
    const ac = polyfillOrderComparator(a, c);
    if (ab < 0 && bc < 0 && !(ac < 0)) {
      transitive = false;
      counterExample = { a, b, c, ab, bc, ac };
    }
  }
  checkTruthy('polyfillOrderComparator/transitive on mixed inputs', transitive,
    `counter-example: ${ JSON.stringify(counterExample) }`);
}

// antisymmetry: cmp(a, b) and cmp(b, a) have opposite signs (or both zero)
{
  const sample = ['es.array.at', 'web.url.constructor', 'aaa.unknown', 'zzz.unknown', 'es.object.entries'];
  let antisymmetric = true;
  for (const a of sample) for (const b of sample) {
    const ab = polyfillOrderComparator(a, b);
    const ba = polyfillOrderComparator(b, a);
    if (Math.sign(ab) !== -Math.sign(ba)) antisymmetric = false;
  }
  checkTruthy('polyfillOrderComparator/antisymmetric on mixed inputs', antisymmetric);
}

// reflexivity: a known entry compared with itself yields 0 (same registry rank)
check('polyfillOrderComparator/known reflexive zero',
  polyfillOrderComparator('es.array.at', 'es.array.at'), 0);

// reflexivity for unknown names too - lex fallback's `a === b` branch
check('polyfillOrderComparator/unknown reflexive zero',
  polyfillOrderComparator('xyz.unknown', 'xyz.unknown'), 0);

// --- sortByPolyfillOrder ---

// happy path: known modules sorted by registry order
{
  const sorted = sortByPolyfillOrder(['web.url.constructor', 'es.array.at']);
  check('sortByPolyfillOrder/registry order', sorted[0], 'es.array.at');
}

// known modules cluster before unknown ones; within each group internal ordering holds
{
  const sorted = sortByPolyfillOrder(['zzz.unknown', 'es.array.at', 'aaa.unknown', 'web.url.constructor']);
  check('sortByPolyfillOrder/known cluster before unknown',
    sorted.indexOf('web.url.constructor') < sorted.indexOf('aaa.unknown'), true);
  check('sortByPolyfillOrder/unknown aaa before zzz',
    sorted.indexOf('aaa.unknown') < sorted.indexOf('zzz.unknown'), true);
}

// idempotent: re-sorting an already-sorted array returns the same order
{
  const once = sortByPolyfillOrder(['web.url.constructor', 'es.array.at', 'es.object.entries']);
  const twice = sortByPolyfillOrder(once);
  check('sortByPolyfillOrder/idempotent', JSON.stringify(once), JSON.stringify(twice));
}

// non-mutating: source array preserved
{
  const src = ['web.url.constructor', 'es.array.at'];
  sortByPolyfillOrder(src);
  check('sortByPolyfillOrder/non-mutating', JSON.stringify(src), '["web.url.constructor","es.array.at"]');
}

// empty input passes through unchanged (no-op edge case)
check('sortByPolyfillOrder/empty array', JSON.stringify(sortByPolyfillOrder([])), '[]');

// single element passes through (no comparator invocation at all)
check('sortByPolyfillOrder/single element known', JSON.stringify(sortByPolyfillOrder(['es.array.at'])), '["es.array.at"]');
check('sortByPolyfillOrder/single element unknown', JSON.stringify(sortByPolyfillOrder(['zzz.unknown'])), '["zzz.unknown"]');

// all-unknown input -> pure lexicographic order (every element falls through the
// known/unknown split into the lex branch)
{
  const sorted = sortByPolyfillOrder(['zzz.unknown', 'aaa.unknown', 'mmm.unknown']);
  check('sortByPolyfillOrder/all unknown pure lex',
    JSON.stringify(sorted), '["aaa.unknown","mmm.unknown","zzz.unknown"]');
}

// all-known input -> stable registry-rank order; integration check that idempotence
// holds across the full pipeline (not just two elements)
{
  const sorted = sortByPolyfillOrder([
    'web.url.constructor',
    'es.object.entries',
    'es.array.at',
    'es.array.from',
  ]);
  check('sortByPolyfillOrder/all known by registry rank',
    sorted.indexOf('es.object.entries') < sorted.indexOf('es.array.at'), true);
  check('sortByPolyfillOrder/all known web after es',
    sorted.indexOf('es.array.from') < sorted.indexOf('web.url.constructor'), true);
}

// large mixed input (>=5 entries spanning both groups + lex pairs) - exercises the
// full comparator decision tree under sort
{
  const sorted = sortByPolyfillOrder([
    'zzz.unknown',
    'web.url.constructor',
    'aaa.unknown',
    'es.array.at',
    'mmm.unknown',
    'es.object.entries',
  ]);
  // all known modules cluster before all unknown
  const lastKnownIdx = Math.max(
    sorted.indexOf('es.array.at'),
    sorted.indexOf('es.object.entries'),
    sorted.indexOf('web.url.constructor'),
  );
  const firstUnknownIdx = Math.min(
    sorted.indexOf('aaa.unknown'),
    sorted.indexOf('mmm.unknown'),
    sorted.indexOf('zzz.unknown'),
  );
  check('sortByPolyfillOrder/mixed known cluster before unknown',
    lastKnownIdx < firstUnknownIdx, true);
  // known-group order matches registry rank
  check('sortByPolyfillOrder/mixed known by rank (es.object.entries < es.array.at)',
    sorted.indexOf('es.object.entries') < sorted.indexOf('es.array.at'), true);
  // unknown-group order matches lex
  check('sortByPolyfillOrder/mixed unknown by lex',
    sorted.indexOf('aaa.unknown') < sorted.indexOf('mmm.unknown')
      && sorted.indexOf('mmm.unknown') < sorted.indexOf('zzz.unknown'),
    true);
}

// duplicates preserve count (sort is stable enough at the comparator level for
// equal-rank pairs to keep relative input order)
{
  const sorted = sortByPolyfillOrder(['es.array.at', 'es.array.at', 'zzz.unknown']);
  check('sortByPolyfillOrder/duplicates kept', sorted.length, 3);
  check('sortByPolyfillOrder/duplicates clustered', sorted[0] === sorted[1], true);
}

// --- createModuleInjectors ---

{
  const injected = [];
  const debugAdds = [];
  const injectors = createModuleInjectors({
    mode: 'actual',
    getModulesForEntry: entry => entry === 'actual/promise/constructor'
      ? ['es.object.to-string', 'es.promise.constructor']
      : entry === 'modules/es.array.at' ? ['es.array.at'] : [],
    getDebugOutput: () => ({ add: m => debugAdds.push(m) }),
    injectGlobal: m => injected.push(m),
  });

  injectors.injectModulesForModeEntry('promise/constructor');
  check('createModuleInjectors/forModeEntry injectGlobal[0]', injected[0], 'es.object.to-string');
  check('createModuleInjectors/forModeEntry injectGlobal[1]', injected[1], 'es.promise.constructor');
  check('createModuleInjectors/forModeEntry debug[0]', debugAdds[0], 'es.object.to-string');

  injectors.injectModulesForEntry('modules/es.array.at');
  check('createModuleInjectors/forEntry injectGlobal[2]', injected[2], 'es.array.at');
  check('createModuleInjectors/forEntry debug[2]', debugAdds[2], 'es.array.at');
}

// null debug output (debug:false) skips bookkeeping without crashing
{
  const injected = [];
  const injectors = createModuleInjectors({
    mode: 'actual',
    getModulesForEntry: entry => entry === 'actual/symbol/iterator' ? ['es.symbol.iterator'] : [],
    getDebugOutput: () => null,
    injectGlobal: m => injected.push(m),
  });
  doesNotThrow('createModuleInjectors/null debug-output safe',
    () => injectors.injectModulesForModeEntry('symbol/iterator'));
  check('createModuleInjectors/null debug-output still injects', injected[0], 'es.symbol.iterator');
}

// --- resolveTargets ---

{
  const parsed = resolveTargets({ targets: { ie: 11 } });
  checkTruthy('resolveTargets/explicit targets returns Map-like', parsed && typeof parsed.entries === 'function');
}

// getBabelTargets fallback when no explicit targets
{
  const parsed = resolveTargets({
    targets: undefined,
    getBabelTargets: () => ({ chrome: '50' }),
  });
  checkTruthy('resolveTargets/babel targets fallback', parsed && parsed.size > 0);
}

// resolveTargets wraps upstream errors with `[core-js]` prefix
throwsWith('resolveTargets/wraps error with prefix', () => resolveTargets({
  targets: 'not a valid browserslist query xyz',
}), '[core-js] failed to resolve targets');

// --- buildShouldInjectPolyfill ---

// no targets, no callback - everything polyfilled by default
{
  const should = buildShouldInjectPolyfill({});
  check('buildShouldInjectPolyfill/no constraints injects all', should('any.module'), true);
}

// include allows arbitrary modules
{
  const should = buildShouldInjectPolyfill({ include: ['es.array.at'] });
  check('buildShouldInjectPolyfill/include hits', should('es.array.at'), true);
}

// exclude wins over include
{
  const should = buildShouldInjectPolyfill({
    include: ['es.array.at'],
    exclude: ['es.array.at'],
  });
  check('buildShouldInjectPolyfill/exclude wins over include', should('es.array.at'), false);
}

// userCallback wraps default decision
{
  const calls = [];
  const should = buildShouldInjectPolyfill({
    userCallback: (mod, base) => {
      calls.push({ mod, base });
      return false;
    },
  });
  check('buildShouldInjectPolyfill/userCallback overrides', should('any.module'), false);
  check('buildShouldInjectPolyfill/userCallback called with (mod, base)', calls[0].mod, 'any.module');
  check('buildShouldInjectPolyfill/userCallback base=true', calls[0].base, true);
}

// userCallback errors get wrapped with `[core-js]` prefix + module name
throwsWith('buildShouldInjectPolyfill/userCallback error wrapped',
  () => {
    const should = buildShouldInjectPolyfill({
      userCallback: () => { throw new Error('inner-fail'); },
    });
    should('es.array.at');
  },
  '[core-js] shouldInjectPolyfill("es.array.at") threw: inner-fail');

// primitive throw inside userCallback (non-Error) also gets wrapped
throwsWith('buildShouldInjectPolyfill/userCallback primitive throw',
  () => {
    const should = buildShouldInjectPolyfill({
      userCallback: () => { throw 'primitive'; },
    });
    should('es.array.at');
  },
  '[core-js] shouldInjectPolyfill("es.array.at") threw: primitive');

// --- getUnsupportedTargets ---

// known module against too-old target reports that target as unsupported
{
  const parsed = resolveTargets({ targets: { ie: 11 } });
  const unsupported = getUnsupportedTargets('es.array.at', parsed);
  checkTruthy('getUnsupportedTargets/known module + old IE',
    Object.keys(unsupported).length > 0, `expected unsupported, got ${ JSON.stringify(unsupported) }`);
}

// unknown module against any parsedTargets returns all targets (no compat info -> all unsupported)
{
  const parsed = resolveTargets({ targets: { ie: 11 } });
  const unsupported = getUnsupportedTargets('unknown.module.xyz', parsed);
  checkTruthy('getUnsupportedTargets/unknown module returns all', unsupported.ie === '11');
}

// no parsedTargets returns empty object
check('getUnsupportedTargets/no targets returns empty',
  JSON.stringify(getUnsupportedTargets('es.array.at', null)), '{}');

// --- formatTargets ---

check('formatTargets/empty', formatTargets({}), '{}');
check('formatTargets/single', formatTargets({ ie: '11' }), '{ "ie":"11" }');
check('formatTargets/multi', formatTargets({ ie: '11', chrome: '60' }),
  '{ "ie":"11", "chrome":"60" }');

// --- createDebugOutputFactory ---

// factory returns per-file collectors with isolated state
{
  const parsed = resolveTargets({ targets: { ie: 11 } });
  const factory = createDebugOutputFactory({ method: 'usage-global', parsedTargets: parsed });
  const file1 = factory();
  const file2 = factory();
  file1.add('es.array.at');
  // file2's collector must not see file1's added modules
  checkTruthy('debugOutput/per-file isolation', !file2.format().includes('es.array.at'));
}

// empty modules + usage-global -> "did not add any polyfill"
{
  const factory = createDebugOutputFactory({ method: 'usage-global', parsedTargets: null });
  const out = factory().format();
  checkTruthy('debugOutput/empty usage-global', out.includes('did not add any polyfill'));
}

// entry-global without markEntryFound -> "entry point not found"
{
  const factory = createDebugOutputFactory({ method: 'entry-global', parsedTargets: null });
  const out = factory().format();
  checkTruthy('debugOutput/entry-global no entry found', out.includes('entry point for the core-js@4 polyfill has not been found'));
}

// warnings block appears after polyfill list
{
  const factory = createDebugOutputFactory({ method: 'usage-global', parsedTargets: null });
  const collector = factory();
  collector.add('es.array.at');
  collector.warn('test-warning-message');
  const out = collector.format();
  checkTruthy('debugOutput/warnings block', out.includes('Warnings:') && out.includes('test-warning-message'));
}

// --- initPluginOptions: integration ---

// orchestrator validates + resolves targets + builds shouldInjectPolyfill
{
  const resolved = initPluginOptions({
    method: 'usage-global',
    version: '4.0',
    mode: 'actual',
    targets: { ie: 11 },
  });
  checkTruthy('initPluginOptions/returns shouldInjectPolyfill', typeof resolved.shouldInjectPolyfill === 'function');
  checkTruthy('initPluginOptions/mode passes through', resolved.mode === 'actual');
  checkTruthy('initPluginOptions/version passes through', resolved.version === '4.0');
}

// unknown top-level key triggers Unknown plugin option error
throwsWith('initPluginOptions/unknown key', () => initPluginOptions({
  method: 'usage-global',
  version: '4.0',
  thisIsBogus: true,
}), 'Unknown plugin option');

// multiple unknown keys pluralised
throwsWith('initPluginOptions/multiple unknown keys', () => initPluginOptions({
  method: 'usage-global',
  version: '4.0',
  bogusA: 1,
  bogusB: 2,
}), 'Unknown plugin options');

// `validateOptions`'s `...unknown` rest is the single source of truth for known option
// names. data-driven coverage: for each known option, verify (a) the happy-path value
// type-checks, and (b) appending `X` to the name produces an `Unknown plugin option`
// error. if the destructure in `validateOptions` adds/drops a key, this loop catches it
const HAPPY_PATH_VALUES = {
  absoluteImports: false,
  additionalPackages: ['@my/fork'],
  browserslistEnv: 'production',
  configPath: '/some/path',
  debug: false,
  exclude: ['es.array.at'],
  ignoreBrowserslistConfig: false,
  importStyle: 'import',
  include: ['es.string.at'],
  method: 'usage-global',
  mode: 'actual',
  package: 'core-js',
  shippedProposals: false,
  shouldInjectPolyfill: undefined,
  targets: { ie: 11 },
  version: '4.0',
};

const KNOWN_OPTION_NAMES = Object.keys(HAPPY_PATH_VALUES);

// `KNOWN_OPTION_NAMES` doubles as a regression lock: if `validateOptions`'s destructure
// signature drops or renames any of these, one of the `unknown <name>X` probes below
// fires (the typo'd name now matches a destructure slot instead of `...unknown`)
for (const key of KNOWN_OPTION_NAMES) {
  // happy path - exclude the cross-section conflict (`shouldInjectPolyfill` + `include`)
  if (key === 'shouldInjectPolyfill') continue;
  doesNotThrow(`initPluginOptions/known key '${ key }' accepted`,
    () => initPluginOptions({ ...validBase, [key]: HAPPY_PATH_VALUES[key] }));
}

for (const key of KNOWN_OPTION_NAMES) {
  // typo (key + 'X') is NOT in the destructure -> caught by `...unknown`
  const typo = `${ key }X`;
  throwsWith(`initPluginOptions/typo '${ typo }' rejected`,
    () => initPluginOptions({ ...validBase, [typo]: HAPPY_PATH_VALUES[key] }),
    `Unknown plugin option: ${ typo }`);
}

// multiple unknown keys at once -> pluralised error
throwsWith('initPluginOptions/multiple unknown keys pluralised',
  () => initPluginOptions({ ...validBase, fooX: 1, barX: 2 }),
  'Unknown plugin options: fooX, barX');

// validateOptions with no args at all - default `= {}` engages, throws on missing `method`
throwsWith('validateOptions/no args throws on method missing',
  () => validateOptions(),
  '`method` must be one of');

finish();
