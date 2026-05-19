// Unit tests for `plugin-options/`: parser-agnostic pure-logic validators,
// configurable injectors, target resolvers, and the debug-output formatter. These
// modules are config-layer (no AST involved) so the tests don't go through `runBoth`
import {
  KNOWN_REST_KEYS,
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

// --- VALID_METHODS / VALID_MODES / KNOWN_REST_KEYS ---

check('VALID_METHODS is a Set', VALID_METHODS instanceof Set, true);
checkTruthy('VALID_METHODS has entry-global', VALID_METHODS.has('entry-global'));
checkTruthy('VALID_METHODS has usage-global', VALID_METHODS.has('usage-global'));
checkTruthy('VALID_METHODS has usage-pure', VALID_METHODS.has('usage-pure'));
check('VALID_METHODS rejects unknown', VALID_METHODS.has('unknown-method'), false);

check('VALID_MODES is a Set', VALID_MODES instanceof Set, true);
checkTruthy('VALID_MODES has actual', VALID_MODES.has('actual'));
checkTruthy('VALID_MODES has stable + es + full', VALID_MODES.has('stable') && VALID_MODES.has('es') && VALID_MODES.has('full'));

check('KNOWN_REST_KEYS is a Set', KNOWN_REST_KEYS instanceof Set, true);
for (const key of ['additionalPackages', 'method', 'mode', 'package', 'version']) {
  checkTruthy(`KNOWN_REST_KEYS has ${ key }`, KNOWN_REST_KEYS.has(key));
}

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
throwsWith('validateOptions/additionalPackages contains non-string',
  () => validateOptions({ ...validBase, additionalPackages: ['ok', 42] }),
  '`additionalPackages[*]`');
throwsWith('validateOptions/additionalPackages contains undefined',
  () => validateOptions({ ...validBase, additionalPackages: ['ok', undefined] }),
  '`additionalPackages[*]`');
throwsWith('validateOptions/additionalPackages contains empty string',
  () => validateOptions({ ...validBase, additionalPackages: ['ok', ''] }),
  '`additionalPackages[*]`');
throwsWith('validateOptions/additionalPackages contains pure slash',
  () => validateOptions({ ...validBase, additionalPackages: ['ok', '/'] }),
  '`additionalPackages[*]`');

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

// unknown vs unknown: lex comparison fallback (both have Infinity order)
check('polyfillOrderComparator/unknown < unknown lex', polyfillOrderComparator('aaa.unknown', 'zzz.unknown'), -1);
check('polyfillOrderComparator/unknown > unknown lex', polyfillOrderComparator('zzz.unknown', 'aaa.unknown'), 1);
check('polyfillOrderComparator/unknown === unknown', polyfillOrderComparator('aaa.unknown', 'aaa.unknown'), 0);

// --- sortByPolyfillOrder ---

// happy path: known modules sorted by registry order
{
  const sorted = sortByPolyfillOrder(['web.url.constructor', 'es.array.at']);
  check('sortByPolyfillOrder/registry order', sorted[0], 'es.array.at');
}

// unknown modules: comparator falls through to lex sort vs everything (NaN guard on
// known-vs-unknown). within unknowns alone, lex order applies; known-vs-unknown can
// interleave based on lex - documented in `polyfillOrderComparator` comment
{
  const sorted = sortByPolyfillOrder(['zzz.unknown', 'es.array.at', 'aaa.unknown']);
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

finish();
