// Selection proofs follow the value a store yields, retain scope and absent-probe guards,
// and keep resolving statics above a constructor reached through that same selection.
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { resolveObjectName } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { handleMemberExpressionNode, planGuardedStaticNarrow } from '../../packages/core-js-polyfill-provider/detect-usage/members.js';
import { resolve } from '../../packages/core-js-polyfill-provider/index.js';
import ImportInjectorState from '../../packages/core-js-polyfill-provider/injector-base.js';
import { ownEmittedNavClaim, ownEmittedPatternClaim, ownOutputTests } from '../../packages/core-js-polyfill-provider/detect-usage/own-output.js';
import { wrapperLiteralEntries } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { adapters, createChecker } from './harness.mjs';

const { check, finish } = createChecker('selected-realm-receivers');

const rows = [
  ['stored consequent', 'flag ? (held = globalThis) : globalThis', 'Promise'],
  ['stored alternate', 'flag ? globalThis : (held = globalThis)', 'Promise'],
  ['stored navigation', 'flag ? (held = (count++, globalThis.self).window) : globalThis', 'Promise'],
  ['stored OR', '(held = (count++, globalThis.self).window) || globalThis', 'Promise'],
  ['stored nullish', '(held = (count++, globalThis.self).window) ?? globalThis', 'Promise'],
  ['stored AND right', 'globalThis && (held = (count++, globalThis.self).window)', 'Promise'],
  ['stored AND left', '(held = (count++, globalThis.self).window) && globalThis', 'Promise'],
  ['plain AND objects', 'globalThis && globalThis', 'Promise'],
  ['absent stored consequent', 'flag ? (held = globalThis.window) : globalThis', null],
  ['absent stored AND', '(held = globalThis.window) && globalThis', null],
  ['absent bare AND', 'window && globalThis', null],
  ['live optional store', 'flag ? (held = globalThis.window?.self) : globalThis', null],
  ['plain effect arm', 'flag ? (count++, globalThis.self) : globalThis', 'Promise'],
  ['effect arms on both sides', 'flag ? (count++, globalThis) : (count--, self)', 'Promise'],
  ['effect arm beside a foreign arm', 'flag ? (count++, globalThis) : other', null],
  ['foreign arm', 'flag ? globalThis : other', null],
  ['shadowed alternate', 'flag ? globalThis : self', null, 'function inspect(self) {', '}'],
  ['repeated stored realm alias', 'flag ? (held = realm) : (held = realm)', 'Promise', 'const realm = globalThis;'],
  ['repeated stored realm alias OR', '(held = realm) || (held = realm)', 'Promise', 'const realm = globalThis;'],
  ['self OR binding', 'items', null, 'var items = items || [1, 2, 3];'],
  ['self nullish binding', 'items', null, 'var items = items ?? [1, 2, 3];'],
  ['self conditional binding', 'items', null, 'var items = flag ? items : [1, 2, 3];'],
  ['mutual OR bindings', 'items', null, 'var items = other || [1, 2, 3]; var other = items;'],
  ['circular function binding', 'items', null, 'const items = getItems(); function getItems() { return items || []; }'],
  ['self guard shadows realm alias', 'realm', null,
    'const { globalThis: realm } = globalThis; function inspect(Legacy) { var realm = realm || Legacy;', '}'],
];
let checked = 0;
for (const parser of adapters) for (const method of ['usage-global', 'usage-pure']) {
  const adapter = parser.name === 'babel' ? createBabelAdapter({ method }) : createEstreeAdapter({ method });
  for (const [name, expression, expected, before = '', after = ''] of rows) {
    const program = parser.parseAndScope(`${ before } let held, count = 0; const result = (${ expression }).Promise.resolve; ${ after }`);
    const declaration = parser.pickPath(program, 'VariableDeclarator', path => path.node.id.name === 'result');
    const usage = declaration.get('init');
    check(`${ parser.name }: ${ method }: ${ name }`, resolveObjectName({
      objectNode: usage.node.object, scope: usage.scope, adapter, path: usage,
    }), expected);
    checked++;
  }
}
check('all rows were checked', checked, adapters.length * rows.length * 2);
check('the suite keeps its coverage floor', checked >= 92, true);

// Refusing a whole-selection proof must not discard a realm candidate. The guard keeps
// the original selection, including stores and probes, and only substitutes that realm.
const guardedRows = [
  ['absent bare AND', 'window && globalThis', 'globalThis'],
  ['absent stored AND', '(held = globalThis.window) && globalThis', 'globalThis'],
  ['absent stored consequent', 'flag ? held = globalThis.window : globalThis', 'globalThis'],
  ['live optional store', 'flag ? held = globalThis.window?.self : globalThis', 'self'],
  ['plain effect arm', 'flag ? (count++, globalThis.self) : globalThis', null],
  ['effect arm beside a foreign arm', 'flag ? (count++, globalThis.self) : other', 'self'],
  ['foreign arm', 'flag ? held = globalThis : other', 'globalThis'],
  ['shadowed alternate', 'flag ? held = globalThis : self', 'globalThis', 'self'],
  ['shadowed realm', 'flag ? globalThis : other', null, 'globalThis'],
  ['unknown arms', 'flag ? other : self', null, 'self'],
  ['probe without backed arm', 'flag ? globalThis.window : other', null],
  ['excluded comparator', 'flag ? globalThis : other', null, '', 'globalThis'],
  ['excluded first comparator', 'flag ? (count++, globalThis.self) : other ? globalThis : other', 'globalThis', '', 'self'],
  ['excluded comparator over realm arms', 'flag ? (count++, globalThis.self) : globalThis', null, '', 'self'],
  ['computed key effect', 'flag ? globalThis : other', null, '', '', '(count++, "Map")'],
  ['wrapped selection', '(flag ? held = globalThis : other) as unknown', 'globalThis'],
  ['outer sequence', '(count++, flag ? held = globalThis : other)', 'globalThis'],
  ['nested selection', 'flag ? (other ? globalThis : other) : other', 'globalThis'],
];
let guardedChecked = 0;
for (const parser of adapters) for (const [name, expression, expected, parameter = '', excluded = '', computed = ''] of guardedRows) {
  const program = parser.parseAndScope(`function inspect(${ parameter }) {
    let held, count = 0;
    const result = (${ expression })${ computed ? `[${ computed }]` : '.Map' };
  }`);
  const declaration = parser.pickPath(program, 'VariableDeclarator', path => path.node.id.name === 'result');
  const usage = declaration.get('init');
  const adapter = parser.name === 'babel' ? createBabelAdapter({ method: 'usage-pure' }) : createEstreeAdapter({ method: 'usage-pure' });
  function resolvePure(meta) {
    return meta.kind === 'global' && meta.name === excluded ? null : resolve(meta);
  }
  const meta = handleMemberExpressionNode({
    node: usage.node, path: usage, scope: usage.scope, adapter, resolvePure,
    handledObjects: new WeakSet(), suppressProxyGlobals: new WeakSet(),
  });
  check(`${ parser.name }: ${ name }: candidate`, meta?.captureGuardReceiver ? meta.guardedAliasHint : null, expected);
  if (expected) {
    const plan = planGuardedStaticNarrow({ memberNode: usage.node, parent: usage.parentPath.node, meta, path: usage, adapter, resolvePure });
    check(`${ parser.name }: ${ name }: source retained`, plan.captureReceiver, usage.node.object);
    check(`${ parser.name }: ${ name }: one comparison`, plan.branches.length, 1);
    check(`${ parser.name }: ${ name }: backed comparator`, Boolean(plan.ctorPure), true);
  }
  guardedChecked++;
}
check('all guarded rows were checked', guardedChecked, adapters.length * guardedRows.length);
check('guarded selection coverage floor', guardedChecked >= 32, true);

// A reparse keeps the raw arm of the already rendered identity guard. A constructor
// imported for a different member, or a test against a different object, settles nothing.
for (const parser of adapters) for (const [name, test, fallback, expected] of [
  ['realm constructor', 'held === realm', 'held.Map', true],
  ['reversed identity', 'realm === held', 'held.Map', true],
  ['computed member', 'held === realm', 'held["Map"]', true],
  ['wrapped member', 'held === realm', '(held.Map as unknown)', true],
  ['different global', 'held === realm', 'held.Promise', false],
  ['different receiver', 'other === realm', 'held.Map', false],
  ['different comparison', 'held === poly', 'held.Map', false],
  ['nonidentity comparison', 'held == realm', 'held.Map', false],
]) {
  const program = parser.parseAndScope(`
    import realm from '@core-js/pure/actual/global-this';
    import poly from '@core-js/pure/actual/map';
    function read(held, other) { return ${ test } ? poly : ${ fallback }; }
  `);
  const path = parser.pickPath(program, 'MemberExpression');
  for (const ownPass of [false, true]) {
    check(`${ parser.name }: own guard: ${ name }: own pass ${ ownPass }`, ownEmittedNavClaim(path.node, path, {
      isPureImportSource: source => source.startsWith('@core-js/pure/'),
      isOwnPassBinding: () => ownPass,
    }), expected);
  }
}
// A pending pure binding admits this pass's guard even when the source verdict is cached
// negative: the guard is requeued before its import declaration necessarily exists.
for (const parser of adapters) {
  const program = parser.parseAndScope('const result = held === Array ? _Array$from : held["from"];');
  const path = parser.pickPath(program, 'MemberExpression');
  const pureImports = new Map();
  const tests = ownOutputTests({ pkg: '@core-js/pure', pureImports, isOwnPassPureBinding: name => pureImports.values().some(value => value === name) });
  check(`${ parser.name }: raw program has no own output`, ownEmittedNavClaim(path.node, path, tests), false);
  pureImports.set('actual/array/from', '_Array$from');
  check(`${ parser.name }: current pass guard keeps its raw arm`, ownEmittedNavClaim(path.node, path, tests), true);
}

// A pending import does not make unrelated receivers into prior output. Count subtree
// reads, with an actual prior import as the positive control for the full census.
for (const parser of adapters) for (const prior of [false, true]) {
  const prefix = prior ? "import old from '@core-js/pure/actual/map';" : '';
  const program = parser.parseAndScope(`${ prefix } const result = value.at;`);
  const path = parser.pickPath(program, 'MemberExpression');
  const receiver = path.node.object;
  let reads = 0;
  Object.defineProperty(path.node, 'object', {
    configurable: true,
    get() {
      reads++;
      return receiver;
    },
  });
  const tests = ownOutputTests({
    pkg: '@core-js/pure',
    pureImports: new Map([['actual/array/at', '_at']]),
    isOwnPassPureBinding: name => name === '_at',
  });
  check(`${ parser.name }: pending import/prior ${ prior }: live claim`, ownEmittedNavClaim(path.node, path, tests), false);
  check(`${ parser.name }: pending import/prior ${ prior }: receiver census`, reads > 0, prior);
}

// A member read keyed by a prior pass's `symbol/iterator` import is a lowered pattern key, so the
// nav census lets it through to the iterator handler; every other minted key - another well-known
// symbol, or the same key on a PATTERN prop - stays this plugin's own output
for (const parser of adapters) for (const [prefix, suffix] of [
  ['@core-js/pure/actual', ''],
  ['@core-js/pure', ''],
  ['core-js-pure', ''],
  ['@core-js/pure/full', '.js'],
  ['@core-js/pure/actual', '/index.js'],
  ['pony', ''],
  ['prior-alias/actual', ''],
]) for (const binder of ['default', 'named', 'require', 'import-equals']) for (const [name, source, funnel, pick, expected] of [
  ['iterator key on a read', 'symbol/iterator', 'nav', 'MemberExpression', false],
  ['async-iterator key on a read', 'symbol/async-iterator', 'nav', 'MemberExpression', true],
  ['iterator key on a pattern prop', 'symbol/iterator', 'pattern', 'Property', true],
]) {
  const specifier = `${ prefix }/${ source }${ suffix }`;
  const declaration = binder === 'default' ? `import key from '${ specifier }';`
    : binder === 'named' ? `import { default as key } from '${ specifier }';`
      : binder === 'require' ? `const key = require('${ specifier }');`
        : `import key = require('${ specifier }');`;
  const program = parser.parseAndScope(`
    ${ declaration }
    function read(o) { const { [key]: it } = o; return [it, o[key]]; }
  `);
  const path = parser.pickPath(program, pick === 'Property' ? 'ObjectProperty' : pick) ?? parser.pickPath(program, pick);
  const adapter = parser.name === 'babel'
    ? createBabelAdapter({ method: 'usage-pure', getPackages: () => ['pony'] })
    : createEstreeAdapter({ method: 'usage-pure', getPackages: () => ['pony'] });
  const tests = { isPureImportSource: s => s === specifier, isOwnPassBinding: () => false };
  check(`${ parser.name }: minted key census: ${ prefix }${ suffix }/${ binder }: ${ name }`,
    funnel === 'nav' ? ownEmittedNavClaim(path.node, path, tests, adapter) : ownEmittedPatternClaim(path, tests, adapter), expected);
}

// The program source index does not grant ownership to a local shadow or a changed require.
// A default parameter cannot see a body declaration, so that read still denotes the import.
for (const parser of adapters) for (const [name, source, expected] of [
  ['outer binding', 'function read() { return [7][key]; }', true],
  ['local declaration', "function read() { const key = 'at'; return [7][key]; }", false],
  ['parameter', 'function read(key) { return [7][key]; }', false],
  ['block declaration', "{ const key = 'at'; [7][key]; }", false],
  ['catch binding', 'try {} catch (key) { [7][key]; }', false],
  ['parameter before body shadow', "function read(value = [7][key]) { const key = 'at'; return value; }", true],
  ['reassigned require', "key = 'at'; [7][key];", false],
]) {
  const program = parser.parseAndScope(`const key = require('@core-js/pure/actual/symbol/async-iterator'); ${ source }`);
  const path = parser.pickPath(program, 'MemberExpression');
  const tests = { isPureImportSource: s => s.startsWith('@core-js/pure/'), isOwnPassBinding: () => false };
  check(`${ parser.name }: prior key binding: ${ name }`, ownEmittedNavClaim(path.node, path, tests), expected);
}

// Lowering can hide an owned guard behind captures. Only unique values written before
// each capture preserve that verdict; a native receiver never gains ownership by its name.
for (const parser of adapters) for (const [name, source, expected] of [
  ['declaration captures', 'const held = null == probe ? void 0 : realm; const copied = held; copied.Object.keys;', true],
  ['assignment captures', 'var held, copied; try { (held = (effect(), null == probe ? void 0 : realm), copied = held, copied.Object.keys); } finally {}', true],
  ['captured outer scope', 'const held = null == probe ? void 0 : realm; function read(realm) { held.Object.keys; }', true],
  ['direct payload guard', '(null == probe ? void 0 : realm.payload).keys;', true],
  ['declaration payload guard', 'const held = null == probe ? void 0 : realm.payload; held.keys;', false],
  ['assignment payload guard', 'var held; try { (held = (effect(), null == probe ? void 0 : realm.payload), held.keys); } finally {}', false],
  ['payload after guard', 'const held = (null == probe ? void 0 : realm).payload; held.keys;', false],
  ['nonpure conditional guard', 'const held = flag ? (null == probe ? void 0 : realm) : other; held.keys;', false],
  ['discarded guard prefix', 'const held = (null == probe ? void 0 : realm, other); held.keys;', false],
  ['foreign terminal import', 'const held = null == probe ? void 0 : foreign; held.Object.keys;', false],
  ['shadowed terminal import', 'function read(realm) { const held = null == probe ? void 0 : realm; held.Object.keys; }', false],
  ['conditional write', 'var held; if (flag) held = null == probe ? void 0 : realm; held.Object.keys;', false],
  ['multiple writes', 'var held; held = null == probe ? void 0 : realm; held = other; held.Object.keys;', false],
  ['capture before write', 'var held; const copied = held; held = null == probe ? void 0 : realm; copied.Object.keys;', false],
  ['read before write', 'var held; held.Object.keys; held = null == probe ? void 0 : realm;', false],
  ['unguarded realm', 'const held = realm; held.Object.keys;', false],
  ['member producer', 'const source = null == probe ? void 0 : realm; const held = source.container; held.Object.keys;', false],
  ['conditional producer', 'const source = null == probe ? void 0 : realm; const held = flag ? source : other; held.Object.keys;', false],
  ['call producer', 'const source = null == probe ? void 0 : realm; const held = select(source); held.Object.keys;', false],
  ['cyclic captures', 'var held, copied; held = copied; copied = held; copied.Object.keys;', false],
]) {
  const program = parser.parseAndScope(`
    import realm from '@core-js/pure/actual/self';
    import foreign from './realm.mjs';
    ${ source }
  `);
  const path = parser.pickPath(program, 'MemberExpression', candidate => candidate.node.property?.name === 'keys');
  const adapter = parser.name === 'babel' ? createBabelAdapter({ method: 'usage-pure' }) : createEstreeAdapter({ method: 'usage-pure' });
  const tests = { isPureImportSource: s => s.startsWith('@core-js/pure/'), isOwnPassBinding: () => false };
  check(`${ parser.name }: captured guard: ${ name }`, ownEmittedNavClaim(path.node, path, tests, adapter), expected);
  if (expected) check(`${ parser.name }: captured guard: ${ name }: current import`, ownEmittedNavClaim(path.node, path,
    { ...tests, isOwnPassBinding: () => true }, adapter), false);
}

// The same prior realm guard settles its native static read, while an arbitrary
// instance payload remains live. Both candidates have prototype placement; only
// the producer's native constructor hint names an existing own static definition.
// A const capture without that hint keeps ordinary dispatch and its one getter read.
for (const parser of adapters) for (const [name, source, key, hint, expected] of [
  ['native static alias', 'var held, copied; try { (held = (effect(), null == probe ? void 0 : realm), copied = held, copied.Object.keys); } finally {}', 'keys', 'Object', true],
  ['const without static proof', 'const held = null == probe ? void 0 : realm; held.Object.keys;', 'keys', undefined, false],
  ['initializer payload', 'const held = null == probe ? void 0 : realm.payload; held.flat;', 'flat', 'payload', false],
  ['payload after realm alias', 'const held = null == probe ? void 0 : realm; held.e2eSeqBox.arr.flat;', 'flat', undefined, false],
  ['direct payload', '(null == probe ? void 0 : realm.payload).flat;', 'flat', undefined, false],
  ['same key payload', 'const held = null == probe ? void 0 : realm; held.e2eSeqBox.arr.keys;', 'keys', undefined, false],
  ['direct same key payload', '(null == probe ? void 0 : realm.payload).keys;', 'keys', undefined, false],
]) {
  const program = parser.parseAndScope(`import realm from '@core-js/pure/actual/self'; ${ source }`);
  const path = parser.pickPath(program, 'MemberExpression', candidate => candidate.node.property?.name === key);
  const adapter = parser.name === 'babel' ? createBabelAdapter({ method: 'usage-pure' }) : createEstreeAdapter({ method: 'usage-pure' });
  const meta = handleMemberExpressionNode({
    node: path.node,
    path,
    scope: path.scope,
    adapter,
    resolvePure: resolve,
    handledObjects: new WeakSet(),
    suppressProxyGlobals: new WeakSet(),
  });
  const tests = { isPureImportSource: s => s.startsWith('@core-js/pure/'), isOwnPassBinding: () => false };
  check(`${ parser.name }: rendered guard domain: ${ name }: placement`, meta?.placement, 'prototype');
  check(`${ parser.name }: rendered guard domain: ${ name }: static hint`, meta?.guardedAliasHint, hint);
  check(`${ parser.name }: rendered guard domain: ${ name }: ownership`,
    ownEmittedNavClaim(path.node, path, tests, adapter, meta), expected);
}

// A real pre/post handoff retains the emission map while the post source census
// registers the old binding. Both source and name must match to preserve its verdict.
for (const parser of adapters) for (const [name, minted, priorSource, priorName, shadow, expected] of [
  ['current import', true, null, null, false, false],
  ['inherited source import', true, 'self', '_self', false, true],
  ['user source import', false, 'self', '_self', false, true],
  ['different alias', true, 'self', 'otherRealm', false, false],
  ['different source', true, 'global-this', '_self', false, false],
  ['shadowed source binding', true, 'self', '_self', true, false],
]) {
  const program = parser.parseAndScope(`
    import _self from '@core-js/pure/actual/self';
    function read(${ shadow ? '_self' : '' }) {
      var held, copied;
      try { (held = null == probe ? void 0 : _self, copied = held, copied.Object.keys); } finally {}
    }
  `);
  const path = parser.pickPath(program, 'MemberExpression', candidate => candidate.node.property?.name === 'keys');
  const adapter = parser.name === 'babel' ? createBabelAdapter({ method: 'usage-pure' }) : createEstreeAdapter({ method: 'usage-pure' });
  const injector = new ImportInjectorState({ pkg: '@core-js/pure', mode: 'actual' });
  if (minted) injector.pureImports.set('actual/self', '_self');
  if (priorSource) injector.registerUserPureImport(priorSource, priorName);
  check(`${ parser.name }: captured guard source ownership: ${ name }`,
    ownEmittedNavClaim(path.node, path, ownOutputTests(injector), adapter), expected);
}

// Import provenance follows a retained receiver default across body-entry capture. It is an
// ownership answer, not a type assertion about supplied callers. Shadows and writes stay live.
for (const parser of adapters) for (const [name, code, expected] of [
  ['parameter literal', 'export function read({ keys } = { keys: Keys }) {}', true],
  ['parameter sequence', 'export function read({ keys } = (probe(), { keys: Keys })) {}', true],
  ['body receiver default', 'export function read(receiver = { keys: Keys }) { const { keys } = receiver; }', true],
  ['body default sequence', 'export function read(receiver = (probe(), { keys: Keys })) { const { keys } = receiver; }', true],
  ['body var shadow', 'export function read(receiver = { keys: Keys }) { var Keys = other; const { keys } = receiver; }', true],
  ['parameter shadow', 'export function read(Keys, receiver = { keys: Keys }) { const { keys } = receiver; }', false],
  ['receiver rebound', 'export function read(receiver = { keys: Keys }) { receiver = other; const { keys } = receiver; }', false],
  ['arbitrary alias', 'export function read(receiver = { keys: Keys }) { const copied = receiver; const { keys } = copied; }', false],
  ['bare ref name', 'export function read(_ref) { const { keys } = _ref; }', false],
  ['spread', 'export function read({ keys } = { keys: Keys, ...other }) {}', false],
  ['unknown computed', 'export function read({ keys } = { keys: Keys, [key]: other }) {}', false],
  ['last custom value', 'export function read({ keys } = { keys: Keys, keys: other }) {}', false],
  ['last imported value', 'export function read({ keys } = { keys: other, keys: Keys }) {}', true],
]) for (const style of ['import', 'require']) for (const current of [false, true]) {
  const declaration = style === 'import' ? "import Keys from '@core-js/pure/actual/object/keys';"
    : "var Keys = require('@core-js/pure/actual/object/keys');";
  const program = parser.parseAndScope(`${ declaration } ${ code }`);
  const prop = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property', path => path.parentPath.node.type === 'ObjectPattern');
  const tests = { isPureImportSource: source => source.startsWith('@core-js/pure/'), isOwnPassBinding: () => current };
  check(`${ parser.name }: retained default ownership/${ name }/${ style }/current ${ current }`, ownEmittedPatternClaim(prop, tests), expected && !current);
}

// Nullable receiver mirrors keep the native coercion path and perform their member read lazily.
// A later pass adopts only that exact imported dispatcher, in the getter's actual scope.
for (const parser of adapters) for (const [name, code, expected] of [
  ['declaration', 'const { at: out } = (r => { return r == null ? r : { get at() { return At(r); } }; })(input);', true],
  ['direct argument', '(({ at: out }) => out)((r => { return r == null ? r : { get at() { return At(r); } }; })(input));', true],
  ['effect key', '(({ [(effect(), "at")]: out }) => out)((r => { return r == null ? r : { get at() { return At(r); } }; })(input));', true],
  ['preceding callee helper shadow', '((At, { at: out }) => out)(other, (r => { return r == null ? r : { get at() { return At(r); } }; })(input));', true],
  ['callee helper shadow', '(({ at: out }, At) => out)((r => { return r == null ? r : { get at() { return At(r); } }; })(input), other);', true],
  ['callee capture shadow', '(({ at: out }, r) => out)((r => { return r == null ? r : { get at() { return At(r); } }; })(input), other);', true],
  ['renamed capture', 'const { at: out } = (held => { return held == null ? held : { get at() { return At(held); } }; })(input);', true],
  ['caller helper shadow', 'function read(At) { (({ at: out }) => out)((r => { return r == null ? r : { get at() { return At(r); } }; })(input)); }', false],
  ['helper captured as parameter', 'const { at: out } = (At => { return At == null ? At : { get at() { return At(At); } }; })(input);', false],
  ['user getter', 'const { at: out } = { get at() { return At(input); } };', false],
  ['user method', 'const { at: out } = (r => { return r == null ? r : { at() { return At(r); } }; })(input);', false],
  ['async activation', 'const { at: out } = (async r => { return r == null ? r : { get at() { return At(r); } }; })(input);', false],
  ['activation default', 'const { at: out } = ((r = other) => { return r == null ? r : { get at() { return At(r); } }; })(input);', false],
  ['activation rest', 'const { at: out } = ((...r) => { return r == null ? r : { get at() { return At(r); } }; })(input);', false],
  ['multiple parameters', 'const { at: out } = ((r, extra) => { return r == null ? r : { get at() { return At(r); } }; })(input);', false],
  ['spread argument', 'const { at: out } = (r => { return r == null ? r : { get at() { return At(r); } }; })(...input);', false],
  ['ordinary function', 'const { at: out } = (function(r) { return r == null ? r : { get at() { return At(r); } }; })(input);', false],
  ['multiple returns', 'const { at: out } = (r => { if (flag) return r; return r == null ? r : { get at() { return At(r); } }; })(input);', false],
  ['activation effect', 'const { at: out } = (r => { effect(); return r == null ? r : { get at() { return At(r); } }; })(input);', false],
  ['getter effect', 'const { at: out } = (r => { return r == null ? r : { get at() { effect(); return At(r); } }; })(input);', false],
  ['getter return effect', 'const { at: out } = (r => { return r == null ? r : { get at() { return (effect(), At(r)); } }; })(input);', false],
  ['captured argument changed', 'const { at: out } = (r => { return r == null ? r : { get at() { return At(r = other); } }; })(input);', false],
  ['different argument', 'const { at: out } = (r => { return r == null ? r : { get at() { return At(other); } }; })(input);', false],
  ['different dispatcher', 'const { includes: out } = (r => { return r == null ? r : { get includes() { return At(r); } }; })(input);', false],
  ['different pure helper', 'const { at: out } = (r => { return r == null ? r : { get at() { return Keys(r); } }; })(input);', false],
  ['regex guard', 'const { at: out } = (r => { return r == /x/ ? r : { get at() { return At(r); } }; })(input);', false],
  ['non-null guard', 'const { at: out } = (r => { return r === null ? r : { get at() { return At(r); } }; })(input);', false],
  ['different retained value', 'const { at: out } = (r => { return r == null ? other : { get at() { return At(r); } }; })(input);', false],
  ['spread mirror', 'const { at: out } = (r => { return r == null ? r : { get at() { return At(r); }, ...other }; })(input);', false],
  ['unknown mirror key', 'const { at: out } = (r => { return r == null ? r : { get at() { return At(r); }, [key]: other }; })(input);', false],
  ['computed pattern key', 'const { [key]: out } = (r => { return r == null ? r : { get at() { return At(r); } }; })(input);', false],
  ['prototype getter is not own', 'const { at: out } = (r => { return r == null ? r : { __proto__: { get at() { return At(r); } } }; })(input);', false],
  ['data wins getter', 'const { at: out } = (r => { return r == null ? r : { get at() { return At(r); }, at: other }; })(input);', false],
  ['custom getter wins data', 'const { at: out } = (r => { return r == null ? r : { at: At, get at() { return other; } }; })(input);', false],
  ['setter beside getter', 'const { at: out } = (r => { return r == null ? r : { get at() { return At(r); }, set at(value) {} }; })(input);', false],
  ['last served getter', 'const { at: out } = (r => { return r == null ? r : { get at() { return other; }, get at() { return At(r); } }; })(input);', true],
  ['live raw conditional arm', 'const { at: out } = flag ? (r => { return r == null ? r : { get at() { return At(r); } }; })(input) : raw;', false],
  ['live raw fallback arm', 'const { at: out } = (r => { return r == null ? r : { get at() { return At(r); } }; })(input) || raw;', false],
  ['mutated caller', 'let wrap = r => { return r == null ? r : { get at() { return At(r); } }; }; wrap = other; const { at: out } = wrap(input);', false],
  ['rebound import', 'At = other; const { at: out } = (r => { return r == null ? r : { get at() { return At(r); } }; })(input);', false],
]) for (const style of ['import', 'require']) for (const current of [false, true]) {
  const declaration = style === 'import' ? "import At from '@core-js/pure/actual/instance/at';"
    : "var At = require('@core-js/pure/actual/instance/at');";
  const program = parser.parseAndScope(`${ declaration } import Keys from '@core-js/pure/actual/object/keys'; ${ code }`);
  const prop = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property', path => path.parentPath.node.type === 'ObjectPattern');
  const tests = { isPureImportSource: source => source.startsWith('@core-js/pure/'), isOwnPassBinding: () => current };
  check(`${ parser.name }: nullable getter ownership/${ name }/${ style }/current ${ current }`, ownEmittedPatternClaim(prop, tests), expected && !current);
}

// Descriptor projection shares the literal-entry key owner and leaves ordinary value callers intact.
for (const parser of adapters) {
  const program = parser.parseAndScope('const literal = { at: first, get at() { return last; }, [key]: value, ...spread }; const list = [first, , ...spread];');
  const literal = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'literal').node.init;
  const list = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'list').node.init;
  const values = wrapperLiteralEntries(literal);
  const descriptors = wrapperLiteralEntries(literal, { propertyNodes: true });
  check(`${ parser.name }: entry projection/key pairing`, JSON.stringify(descriptors.map(([key]) => key)), JSON.stringify(values.map(([key]) => key)));
  check(`${ parser.name }: entry projection/property identity`, descriptors.every(([, prop], index) => prop === literal.properties[index]), true);
  check(`${ parser.name }: entry projection/default values`, values.every(([, value], index) => value === literal.properties[index].value), true);
  check(`${ parser.name }: entry projection/array values`, JSON.stringify(wrapperLiteralEntries(list, { propertyNodes: true })), JSON.stringify(wrapperLiteralEntries(list)));
}

// A prior mirror owns the argument's slot only when that argument actually reaches the pattern.
for (const [name, argument, changed] of [
  ['spread', '...[mirror]', false],
  ['known prefix', 'mirror, ...[]', true],
  ['direct', 'mirror', true],
]) for (const parser of adapters) {
  const receiver = argument.replace('mirror', '(r => { return r == null ? r : { get at() { return At(r); } }; })([1])');
  const input = `import At from '@core-js/pure/actual/array/instance/at'; (({ at }) => at)(${ receiver });`;
  const program = parser.parseAndScope(input);
  const prop = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property', p => p.parentPath.node.type === 'ObjectPattern');
  const tests = { isPureImportSource: source => source.startsWith('@core-js/pure/'), isOwnPassBinding: () => false };
  check(`${ parser.name }/${ name }/pristine`, ownEmittedPatternClaim(prop, tests), true);
  check(`${ parser.name }/${ name }/changed iterator`, ownEmittedPatternClaim(prop, tests, { isMutatedStaticSlot: () => true }), changed);
}

// A data-slot mirror retains the same imported instance dispatch as its lazy getter twin.
// It is prior output only; the helper's actual scope, entry and one receiver argument must match.
for (const parser of adapters) for (const [name, code, expected] of [
  ['data slot', 'const { at: out } = { at: At(input) };', true],
  ['nested parameter', 'export function read({ row: { at: out } } = flag ? { row: { at: At(input) } } : raw) {}', true],
  ['body helper shadow', 'export function read({ row: { at: out } } = { row: { at: At(input) } }) { var At = other; }', true],
  ['parameter helper shadow', 'export function read(At, { at: out } = { at: At(input) }) {}', false],
  ['different dispatcher', 'const { includes: out } = { includes: At(input) };', false],
  ['extra argument', 'const { at: out } = { at: At(input, effect()) };', false],
  ['optional call', 'const { at: out } = { at: At?.(input) };', false],
  ['spread argument', 'const { at: out } = { at: At(...input) };', false],
]) for (const current of [false, true]) {
  const program = parser.parseAndScope(`import At from '@core-js/pure/actual/instance/at'; ${ code }`);
  const prop = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property',
    path => path.parentPath.node.type === 'ObjectPattern' && path.node.value?.name === 'out');
  const tests = { isPureImportSource: source => source.startsWith('@core-js/pure/'), isOwnPassBinding: () => current };
  check(`${ parser.name }: data-slot dispatch ownership/${ name }/current ${ current }`,
    ownEmittedPatternClaim(prop, tests), expected && !current);
}

finish();
