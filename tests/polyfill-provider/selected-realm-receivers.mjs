// Selection proofs follow the value a store yields, retain scope and absent-probe guards,
// and keep resolving statics above a constructor reached through that same selection.
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { resolveObjectName } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { handleMemberExpressionNode, planGuardedStaticNarrow } from '../../packages/core-js-polyfill-provider/detect-usage/members.js';
import { resolve } from '../../packages/core-js-polyfill-provider/index.js';
import { ownEmittedNavClaim, ownEmittedPatternClaim } from '../../packages/core-js-polyfill-provider/detect-usage/own-output.js';
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
  ['plain effect arm', 'flag ? (count++, globalThis.self) : globalThis', null],
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
  ['plain effect arm', 'flag ? (count++, globalThis.self) : globalThis', 'self'],
  ['foreign arm', 'flag ? held = globalThis : other', 'globalThis'],
  ['shadowed alternate', 'flag ? held = globalThis : self', 'globalThis', 'self'],
  ['shadowed realm', 'flag ? globalThis : other', null, 'globalThis'],
  ['unknown arms', 'flag ? other : self', null, 'self'],
  ['probe without backed arm', 'flag ? globalThis.window : other', null],
  ['excluded comparator', 'flag ? globalThis : other', null, '', 'globalThis'],
  ['excluded first comparator', 'flag ? (count++, globalThis.self) : globalThis', 'globalThis', '', 'self'],
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
// A member read keyed by a prior pass's `symbol/iterator` import is a lowered pattern key, so the
// nav census lets it through to the iterator handler; every other minted key - another well-known
// symbol, or the same key on a PATTERN prop - stays this plugin's own output
for (const parser of adapters) for (const [name, source, funnel, pick, expected] of [
  ['iterator key on a read', 'symbol/iterator', 'nav', 'MemberExpression', false],
  ['async-iterator key on a read', 'symbol/async-iterator', 'nav', 'MemberExpression', true],
  ['iterator key on a pattern prop', 'symbol/iterator', 'pattern', 'Property', true],
]) {
  const program = parser.parseAndScope(`
    import key from '@core-js/pure/actual/${ source }';
    function read(o) { const { [key]: it } = o; return [it, o[key]]; }
  `);
  const path = parser.pickPath(program, pick === 'Property' ? 'ObjectProperty' : pick) ?? parser.pickPath(program, pick);
  const tests = { isPureImportSource: s => s.startsWith('@core-js/pure/'), isOwnPassBinding: () => false };
  check(`${ parser.name }: minted key census: ${ name }`,
    funnel === 'nav' ? ownEmittedNavClaim(path.node, path, tests) : ownEmittedPatternClaim(path, tests), expected);
}
finish();
