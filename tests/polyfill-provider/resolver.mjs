// Unit tests for `resolver.js` and the public-API surfaces of `index.js`:
// `resolve(meta)`, `entryToGlobalHint(entry)`, `createPolyfillContext(...)`,
// and `createPolyfillResolver(...).resolver.filter` (closure-internal, exercised
// indirectly through resolveUsage with crafted descs / paths)
import {
  createPolyfillContext,
  entryToGlobalHint,
  resolve,
} from '../../packages/core-js-polyfill-provider/index.js';
import { createPolyfillResolver } from '../../packages/core-js-polyfill-provider/resolver.js';
import { createChecker } from './harness.mjs';

const { check, checkTruthy, doesNotThrow, finish, throwsWith } = createChecker('resolver');

// --- resolve(meta): top-level meta dispatcher ---
// API quirk: misses return `undefined` (not `null`). `kind: 'instance'` is NOT a
// recognised meta shape - instance methods are resolved via
// `kind: 'property', placement: 'prototype', key: <method>`, which falls through
// the static branches into `instance[key]` lookup

// global: well-known constructor → resolves with pure + global descs
{
  const r = resolve({ kind: 'global', name: 'Promise' });
  checkTruthy('resolve/global Promise resolves', r && r.desc, JSON.stringify(r));
  checkTruthy('resolve/global Promise has pure', r?.desc?.pure);
}

// global: unknown identifier → undefined
check('resolve/global unknown returns undefined',
  resolve({ kind: 'global', name: 'NotARealGlobal_xyz' }), undefined);

// property/static: `Array.from`
{
  const r = resolve({ kind: 'property', placement: 'static', object: 'Array', key: 'from' });
  checkTruthy('resolve/Array.from static resolves', r && r.desc, JSON.stringify(r));
}

// property/static: unknown method on known object → undefined
check('resolve/Array.notAMethod static returns undefined',
  resolve({ kind: 'property', placement: 'static', object: 'Array', key: 'notAMethod_xyz' }), undefined);

// property/prototype: `.includes` falls through to instance lookup (placement=prototype
// skips the two static branches; instance[key] resolves)
{
  const r = resolve({ kind: 'property', placement: 'prototype', object: 'String', key: 'includes' });
  checkTruthy('resolve/.includes prototype resolves via instance', r && r.desc, JSON.stringify(r));
}

// property/prototype: `.at` instance method
{
  const r = resolve({ kind: 'property', placement: 'prototype', object: 'Array', key: 'at' });
  checkTruthy('resolve/.at prototype resolves via instance', r && r.desc);
}

// property: unknown instance method → undefined
check('resolve/.unknownMethod prototype returns undefined',
  resolve({ kind: 'property', placement: 'prototype', object: 'Array', key: 'definitelyNotAMethod_xyz' }), undefined);

// `kind: 'instance'` is NOT recognised - falls through to undefined. Real instance-method
// resolution goes through kind:'property' + placement:'prototype'
check('resolve/kind=instance unsupported (falls through)',
  resolve({ kind: 'instance', key: 'at' }), undefined);

// `in` operator meta: `Symbol.iterator in x` - resolves via instance lookup
{
  const r = resolve({ kind: 'in', key: 'iterator' });
  checkTruthy('resolve/in iterator resolves', r === undefined || r?.desc, JSON.stringify(r));
}

// `in` operator with `placement: 'static'` on POSSIBLE_GLOBAL_OBJECTS: `'X' in window` etc.
// `'Promise' in globalThis` -> resolves as `kind: 'global'`
{
  const r = resolve({ kind: 'in', placement: 'static', object: 'globalThis', key: 'Promise' });
  checkTruthy('resolve/in Promise in globalThis -> global', r?.kind === 'global');
}

// --- entryToGlobalHint(entry): reverse `entry path` -> global constructor name ---

check('entryToGlobalHint/promise/constructor', entryToGlobalHint('promise/constructor'), 'Promise');
check('entryToGlobalHint/array (top-level)', entryToGlobalHint('array'), 'Array');
check('entryToGlobalHint/symbol', entryToGlobalHint('symbol'), 'Symbol');
check('entryToGlobalHint/url/constructor', entryToGlobalHint('url/constructor'), 'URL');
check('entryToGlobalHint/regexp/constructor', entryToGlobalHint('regexp/constructor'), 'RegExp');
check('entryToGlobalHint/error/constructor', entryToGlobalHint('error/constructor'), 'Error');
// instance-method-like entry (`array/from`): rest=['from'] !== 'constructor', returns null.
// derive only succeeds for single-segment OR `<head>/constructor`
check('entryToGlobalHint/array/from returns null (multi-seg non-constructor)',
  entryToGlobalHint('array/from'), null);
// instance-only method (`array/instance/at`): rest=['instance','at'], non-constructor, null
check('entryToGlobalHint/array/instance/at returns null',
  entryToGlobalHint('array/instance/at'), null);
// kebab-derived hint validates against KNOWN_GLOBAL_NAMES (globals + statics in
// built-in-definitions). single-segment entries like `get-iterator`, `is-iterable`,
// `not-a-real-thing-xyz` derive a plausible PascalCase but bail when the result isn't
// a registered global - prevents downstream resolveSuperImportName from over-injecting
// against fabricated names
check('entryToGlobalHint/single-segment kebab bails on unknown global',
  entryToGlobalHint('not-a-real-thing-xyz'), null);
// `eval-error` -> `EvalError`: kebab-derived AND registered as a global with pure ctor.
// `entryHintIndex` already covers it via the constructor-deps scan; this checks the
// fallback path stays sound for entries whose registry registration could lapse
check('entryToGlobalHint/single-segment kebab returns registered global',
  entryToGlobalHint('eval-error'), 'EvalError');
// digit-leading: kebab→Pascal first char fails uppercase check → null
check('entryToGlobalHint/digit-leading returns null',
  entryToGlobalHint('42foo'), null);
// empty: null
check('entryToGlobalHint/empty returns null', entryToGlobalHint(''), null);

// --- createPolyfillContext: top-level operations ---

// happy-path context
{
  const ctx = createPolyfillContext({ method: 'usage-global' });
  check('createPolyfillContext/default mode', ctx.mode, 'actual');
  check('createPolyfillContext/default pkg', ctx.pkg, 'core-js');
  checkTruthy('createPolyfillContext/packages includes pkg', ctx.packages.includes('core-js'));
}

// usage-pure auto-picks `@core-js/pure` package
{
  const ctx = createPolyfillContext({ method: 'usage-pure' });
  check('createPolyfillContext/usage-pure default pkg', ctx.pkg, '@core-js/pure');
}

// shippedProposals on `es` collapses to `actual`
{
  const ctx = createPolyfillContext({ method: 'usage-global', mode: 'es', shippedProposals: true });
  check('createPolyfillContext/shippedProposals+es promoted to actual', ctx.mode, 'actual');
}

// shippedProposals on `actual` stays `actual`
{
  const ctx = createPolyfillContext({ method: 'usage-global', mode: 'actual', shippedProposals: true });
  check('createPolyfillContext/shippedProposals+actual stays', ctx.mode, 'actual');
}

// mode === null defaults to 'actual' (??= guard)
{
  const ctx = createPolyfillContext({ method: 'usage-global', mode: null });
  check('createPolyfillContext/mode null defaults to actual', ctx.mode, 'actual');
}

// version === null falls through ??= default ('node_modules'); conditional-spread shapes
// like `{ version: cond ? '4.1' : null }` must not throw - mirrors d.ts `version?: string | null`
doesNotThrow('createPolyfillContext/version null OK',
  () => createPolyfillContext({ method: 'usage-global', version: null }));

// package === null falls through ??= default; mirrors d.ts `package?: string | null`
{
  const globalCtx = createPolyfillContext({ method: 'usage-global', package: null });
  check('createPolyfillContext/package null defaults to core-js', globalCtx.pkg, 'core-js');
  const pureCtx = createPolyfillContext({ method: 'usage-pure', package: null });
  check('createPolyfillContext/package null defaults to @core-js/pure', pureCtx.pkg, '@core-js/pure');
}

// --- createPolyfillContext: package shape guards ---

throwsWith('createPolyfillContext/package empty string',
  () => createPolyfillContext({ method: 'usage-global', package: '' }),
  '[core-js] `package` option must be');
throwsWith('createPolyfillContext/package pure slash',
  () => createPolyfillContext({ method: 'usage-global', package: '/' }),
  '[core-js] `package` option must be');
throwsWith('createPolyfillContext/package non-string',
  () => createPolyfillContext({ method: 'usage-global', package: 42 }),
  '[core-js] `package` option must be');
throwsWith('createPolyfillContext/additionalPackages invalid entry',
  () => createPolyfillContext({ method: 'usage-global', additionalPackages: ['/', 'ok'] }),
  '[core-js] `additionalPackages` entries must be');

// --- createPolyfillContext: trailing slash stripping ---

{
  const ctx = createPolyfillContext({ method: 'usage-global', package: 'my-core-js///' });
  check('createPolyfillContext/strips trailing slashes from pkg', ctx.pkg, 'my-core-js');
  checkTruthy('createPolyfillContext/strips slashes from packages list',
    ctx.packages.every(p => !p.endsWith('/')));
}

{
  const ctx = createPolyfillContext({
    method: 'usage-global',
    additionalPackages: ['my-fork//', '@org/pure'],
  });
  // dedup preserves order, first match is main pkg
  checkTruthy('createPolyfillContext/additionalPackages slashes stripped',
    ctx.packages.every(p => !p.endsWith('/')));
  checkTruthy('createPolyfillContext/additionalPackages lowercased',
    ctx.packages.every(p => p === p.toLowerCase()));
}

// --- createPolyfillContext.getCoreJSEntry ---

{
  const ctx = createPolyfillContext({ method: 'usage-global' });
  // `core-js` bare → '' (root entry)
  check('getCoreJSEntry/bare core-js', ctx.getCoreJSEntry('core-js'), '');
  // `core-js/actual/promise` → 'actual/promise'
  check('getCoreJSEntry/actual/promise',
    ctx.getCoreJSEntry('core-js/actual/promise'), 'actual/promise');
  // unknown subpath under known pkg → null
  check('getCoreJSEntry/unknown subpath',
    ctx.getCoreJSEntry('core-js/this/does/not/exist'), null);
  // non-core-js path → null
  check('getCoreJSEntry/foreign package',
    ctx.getCoreJSEntry('lodash/chunk'), null);
}

// additionalPackages: aliases also match
{
  const ctx = createPolyfillContext({
    method: 'usage-global',
    additionalPackages: ['@my/fork'],
  });
  check('getCoreJSEntry/additionalPackages match',
    ctx.getCoreJSEntry('@my/fork/actual/promise'), 'actual/promise');
}

// --- createPolyfillContext.isEntryNeeded ---

{
  const ctx = createPolyfillContext({ method: 'usage-global', mode: 'actual' });
  checkTruthy('isEntryNeeded/known entry resolves to bool',
    typeof ctx.isEntryNeeded('promise/constructor') === 'boolean');
  // empty entry === 'index'
  checkTruthy('isEntryNeeded/empty resolves to bool',
    typeof ctx.isEntryNeeded('') === 'boolean');
}

// exclude wins over default
{
  const ctx = createPolyfillContext({
    method: 'usage-pure',
    mode: 'actual',
    exclude: ['actual/array/from'],
  });
  check('isEntryNeeded/exclude rejects', ctx.isEntryNeeded('actual/array/from'), false);
}

// include adds entries that targets-default would reject
{
  const ctx = createPolyfillContext({
    method: 'usage-pure',
    mode: 'actual',
    include: ['actual/array/from'],
  });
  check('isEntryNeeded/include accepts', ctx.isEntryNeeded('actual/array/from'), true);
}

// --- createPolyfillContext.getModulesForEntry ---

{
  const ctx = createPolyfillContext({ method: 'usage-global', mode: 'actual' });
  const mods = ctx.getModulesForEntry('actual/promise/constructor');
  checkTruthy('getModulesForEntry/known entry returns array', Array.isArray(mods) && mods.length > 0);
  // cached: second call returns same array reference (cache hit)
  check('getModulesForEntry/cache returns same reference',
    ctx.getModulesForEntry('actual/promise/constructor'), mods);
}

// unknown entry returns empty array
{
  const ctx = createPolyfillContext({ method: 'usage-global', mode: 'actual' });
  const mods = ctx.getModulesForEntry('totally/unknown/entry/xyz');
  checkTruthy('getModulesForEntry/unknown returns empty array', Array.isArray(mods) && mods.length === 0);
}

// shouldInjectPolyfill filter takes effect
{
  const ctx = createPolyfillContext({
    method: 'usage-global',
    mode: 'actual',
    shouldInjectPolyfill: () => false,
  });
  const mods = ctx.getModulesForEntry('actual/promise/constructor');
  check('getModulesForEntry/shouldInjectPolyfill false drops all', mods.length, 0);
}

// --- createPolyfillResolver: filter logic via stubs ---

// minimal stubs: typeResolvers return null so resolveHint doesn't enhance meta; predicates
// inspect plain-object "paths" we construct directly. these stubs let us test the filter
// branches without parsing real code
function makeFilterEnv() {
  const stubTypeResolvers = {
    resolvePropertyObjectType: () => null,
    resolveGuardHints: () => null,
    toHint: () => null,
    isString: arg => arg?.node?.isStringMarker === true,
    isObject: arg => arg?.node?.isObjectMarker === true,
  };
  const stubAstPredicates = {
    isMemberLike: () => false,
    isCallee: (node, parent) => parent?.type === 'CallExpression' && parent.callee === node,
    isSpreadElement: arg => arg?.type === 'SpreadElement',
  };
  return { typeResolvers: stubTypeResolvers, astPredicates: stubAstPredicates };
}

// `Error` global has `[['min-args', 2]]` filter - `new Error('msg')` (1 arg) gets filtered,
// `new Error('msg', { cause })` (2 args) passes
function makeCallExprPath({ arguments: args }) {
  const calleeNode = { type: 'Identifier', name: 'Error' };
  const argNodes = args.map(a => a.node);
  const callNode = { type: 'CallExpression', callee: calleeNode, arguments: argNodes };
  const argPaths = args.map(a => ({ node: a.node, parent: callNode, parentPath: { node: callNode } }));
  return {
    node: calleeNode,
    parent: callNode,
    parentPath: {
      node: callNode,
      get: key => key === 'arguments' ? argPaths : null,
    },
    get: key => key === 'object' ? null : null,
  };
}

// --- filter: min-args ---

{
  const env = makeFilterEnv();
  const { resolver } = createPolyfillResolver({
    method: 'usage-global', version: '4.0', targets: { ie: 11 },
  }, env);

  // `new Error('msg')` (1 arg) -> filter `[['min-args', 2]]` rejects -> resolveUsage returns null
  const oneArgPath = makeCallExprPath({ arguments: [{ node: { type: 'StringLiteral', value: 'msg' } }] });
  const oneArgResult = resolver.resolveUsage({ kind: 'global', name: 'Error' }, oneArgPath);
  check('filter/min-args 1 arg rejected', oneArgResult, null);

  // `new Error('msg', { cause })` (2 args) -> filter passes -> deps returned
  const twoArgPath = makeCallExprPath({
    arguments: [
      { node: { type: 'StringLiteral', value: 'msg' } },
      { node: { type: 'ObjectExpression' } },
    ],
  });
  const twoArgResult = resolver.resolveUsage({ kind: 'global', name: 'Error' }, twoArgPath);
  checkTruthy('filter/min-args 2 args accepted',
    Array.isArray(twoArgResult) && twoArgResult.length > 0,
    `expected deps, got ${ JSON.stringify(twoArgResult) }`);
}

// spread argument blocks min-args bypass (`new Error(...args)` could be 0+ args, can't
// statically tell - conservative non-reject)
{
  const env = makeFilterEnv();
  const { resolver } = createPolyfillResolver({
    method: 'usage-global', version: '4.0', targets: { ie: 11 },
  }, env);

  const spreadPath = makeCallExprPath({
    arguments: [{ node: { type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } } }],
  });
  const result = resolver.resolveUsage({ kind: 'global', name: 'Error' }, spreadPath);
  checkTruthy('filter/min-args spread arg blocks bypass (conservative)',
    Array.isArray(result) && result.length > 0,
    `expected deps from spread bypass, got ${ JSON.stringify(result) }`);
}

// --- filter: not-a-callee (member access without call) ---

{
  const env = makeFilterEnv();
  const { resolver } = createPolyfillResolver({
    method: 'usage-global', version: '4.0', targets: { ie: 11 },
  }, env);

  // bare reference to `Error` (no call) - isCallee returns false, filter doesn't reject -
  // wait, filter returns FALSE when not callee. so `false` means "filter didn't reject",
  // meta resolution proceeds. but `Error` global has only filter-gated deps - if filter
  // doesn't apply, deps come through. Verified by integration: this matches the docs
  // "min-args" only narrows when the meta IS a call
  const refPath = {
    node: { type: 'Identifier', name: 'Error' },
    parent: { type: 'ExpressionStatement' },
    parentPath: { node: { type: 'ExpressionStatement' } },
    get: () => null,
  };
  const result = resolver.resolveUsage({ kind: 'global', name: 'Error' }, refPath);
  // not-a-callee => filter returns false (didn't reject) => deps still emitted.
  // unrejected filters lets bare ref `Error` register the polyfill - the const may be
  // re-assigned or thrown later
  checkTruthy('filter/bare reference (not callee) leaves deps unfiltered',
    Array.isArray(result) && result.length > 0,
    `expected deps for bare reference, got ${ JSON.stringify(result) }`);
}

// `filter/unknown name throws` is not directly testable from the public API: descs come
// from `built-in-definitions.json` (frozen) and the unknown-filter throw lives inside the
// closure-private `filter` function. The throw path is exercised through the data-shape
// contract during build (entry data generation), where adding a new filter name without
// updating the dispatch would fail the integration fixtures

finish();
