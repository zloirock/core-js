// A pattern-valued constructor Get must be guarded before its child reads a static.
// Direct scalar bindings retain their old route, and iterable patterns stay separate.
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { buildDestructureLeafMeta, classifyDestructureLeafHost } from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import {
  planGuardedDestructureNarrow,
} from '../../packages/core-js-polyfill-provider/detect-usage/members.js';
import { ownEmittedNavClaim } from '../../packages/core-js-polyfill-provider/detect-usage/own-output.js';
import { adapters, createChecker } from './harness.mjs';

const { check, finish } = createChecker('guarded-destructure-receiver-patterns');

const rows = [
  ['nested value', 'const { Promise: { allSettled } } = realm;', 'direct', true],
  ['surrounding siblings', 'const { before, Promise: { allSettled }, after } = realm;', 'nested', true],
  ['assignment value', 'let allSettled; const result = ({ Promise: { allSettled } } = realm);', 'direct', true],
  ['direct scalar', 'const { Promise: value } = realm;', 'direct', false],
  ['iterable value', 'const { Promise: [value] } = realm;', 'bail', false],
];
function resolvePure(meta) {
  if (meta.kind === 'global' && meta.name === 'globalThis') return { kind: 'global', entry: 'global-this', hintName: 'globalThis' };
  if (meta.kind === 'property' && meta.object === 'globalThis' && meta.key === 'Promise') {
    return { kind: 'global', entry: 'promise', hintName: 'Promise' };
  }
  return null;
}
let checked = 0;
for (const parser of adapters) for (const [name, statement, expected, live] of rows) {
  const program = parser.parseAndScope(`if (flag) { var realm = globalThis; } ${ statement }`);
  const propertyType = parser.name === 'babel' ? 'ObjectProperty' : 'Property';
  const prop = parser.pickPath(program, propertyType, path => path.node.key.name === 'Promise');
  const pattern = prop.parentPath;
  const host = pattern.parentPath;
  const adapter = parser.name === 'babel' ? createBabelAdapter({ method: 'usage-pure' }) : createEstreeAdapter({ method: 'usage-pure' });
  const meta = buildDestructureLeafMeta({ descriptor: classifyDestructureLeafHost({ objectPattern: pattern }), key: 'Promise', adapter });
  const plan = planGuardedDestructureNarrow({
    propNode: prop.node, patternNode: pattern.node, hostNode: host.node, hostInStatement: false,
    meta, path: prop, resolvePure, adapter,
  });
  check(`${ parser.name }: ${ name }: route`, plan ? plan.nested ? 'nested' : 'direct' : 'bail', expected);
  check(`${ parser.name }: ${ name }: nested claims stay live`, !!plan?.keepPatternLive, live);
  checked += 2;
}
check('all receiver rows were checked', checked, 20);
for (const parser of adapters) for (const [statement, expected] of [
  ['const { Q: { of: method } } = source;', true],
  ['const { Q: { of: method }, other } = source;', true],
  ['const { first = change(), Q: { of: method }, other } = source;', true],
  ['const { Q: { of: method }, ...other } = source;', false],
  ['const { Q: { of: method, from } } = source;', true],
  ['export const { Q: { of: method } } = source;', true],
  ['let method; ({ Q: { of: method } } = source);', true],
  ['let method; const result = ({ Q: { of: method } } = source);', true],
]) {
  const program = parser.parseAndScope(statement);
  const propertyType = parser.name === 'babel' ? 'ObjectProperty' : 'Property';
  const path = parser.pickPath(program, propertyType, prop => prop.node.key.name === 'of');
  const plan = planGuardedDestructureNarrow({
    propNode: path.node, patternNode: path.parentPath.node, hostNode: path.parentPath.parentPath.node,
    hostInStatement: false, path,
    meta: { key: 'of', guardedAliasHint: 'Array', guardOnly: true },
    resolvePure: meta => meta.kind === 'property' && meta.object === 'Array' && ['of', 'from'].includes(meta.key)
      ? { kind: 'static', entry: `array/${ meta.key }`, hintName: meta.key } : null,
  });
  check(`${ parser.name }: capture: ${ statement }`, !!plan?.capture, expected);
  checked++;
}
check('all rows were checked', checked, 36);
for (const parser of adapters) for (const [keys, consumed, expected] of [
  ['name: nm, groupBy: method, at: other', ['name'], 'before'],
  ['at: other, groupBy: method, name: nm', ['name'], 'after'],
  ['name: nm, at: other, groupBy: method, last', ['name'], null],
  ['name: nm, groupBy: method, at: other', [], null],
  ['name: nm, groupBy: method, ...rest', ['name'], null],
]) {
  const program = parser.parseAndScope(`const { ${ keys } } = source;`);
  const prop = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property',
    path => path.node.key.name === 'groupBy');
  const input = {
    propNode: prop.node, patternNode: prop.parentPath.node, hostNode: prop.parentPath.parentPath.node,
    hostInStatement: false, path: prop, meta: { key: 'groupBy', guardedAliasHint: 'Map', guardOnly: true },
    resolvePure: meta => meta.kind === 'property' && meta.object === 'Map' && meta.key === 'groupBy'
      ? { kind: 'static', entry: 'map/group-by', hintName: 'groupBy' } : null,
  };
  const plan = planGuardedDestructureNarrow({ ...input, isConsumedProp: item => consumed.includes(item.key?.name) });
  check(`${ parser.name }: pending siblings: ${ keys }`, plan?.detach ?? null, expected);
  // A binding that already removed these exact properties must receive the same verdict.
  const remaining = { ...input.patternNode, properties: input.patternNode.properties.filter(item => !consumed.includes(item.key?.name)) };
  const removed = planGuardedDestructureNarrow({ ...input, patternNode: remaining });
  check(`${ parser.name }: pending and removed agree: ${ keys }`, plan?.detach ?? null, removed?.detach ?? null);
}
for (const parser of adapters) for (const [fields, expected] of [
  ['of: value = 1', true],
  ['from: first, of: value = 1', true],
  ['of: value = fallback(), from: first', true],
  ['[key]: value', true],
  ['from: first, [key]: value = 1', true],
  ['of: value = 1, extra', true],
  ['extra, of: value = 1', true],
  ['[unknown]: value', false],
  ['[(effect(), key)]: value', false],
  ['of: value = 1, ...rest', false],
]) {
  const program = parser.parseAndScope(`const key = 'of'; const { ${ fields } } = source;`);
  const path = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property',
    prop => (prop.node.value.left ?? prop.node.value).name === 'value');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const plan = planGuardedDestructureNarrow({
    propNode: path.node, patternNode: path.parentPath.node, hostNode: path.parentPath.parentPath.node,
    hostInStatement: false, path, adapter,
    meta: { key: 'of', guardedAliasHint: 'Array', guardOnly: true },
    resolvePure: meta => meta.kind === 'property' && meta.object === 'Array' && ['of', 'from'].includes(meta.key)
      ? { kind: 'static', entry: `array/${ meta.key }`, hintName: meta.key } : null,
  });
  check(`${ parser.name }: scalar leaf: ${ fields }`, !!plan, expected);
  if (expected && fields.includes('= ')) {
    check(`${ parser.name }: scalar default binding: ${ fields }`, plan.plan.destructureDefault?.name, 'value');
  }
}
for (const parser of adapters) for (const fields of ['of: value = 1, extra', 'extra, of: value = 1', 'of: source, from: tail', 'of: source']) {
  const program = parser.parseAndScope(`let value, extra, tail; let source; const result = ({ ${ fields } } = source);`);
  const path = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property',
    prop => prop.node.key.name === 'of');
  const plan = planGuardedDestructureNarrow({
    propNode: path.node, patternNode: path.parentPath.node, hostNode: path.parentPath.parentPath.node,
    hostInStatement: false, path, meta: { key: 'of', guardedAliasHint: 'Array', guardOnly: true },
    resolvePure: meta => meta.kind === 'property' && meta.object === 'Array' && ['of', 'from'].includes(meta.key)
      ? { kind: 'static', entry: `array/${ meta.key }`, hintName: meta.key } : null,
  });
  check(`${ parser.name }: value host captures original source: ${ fields }`, plan?.plan.captureReceiver,
    path.parentPath.parentPath.node.right);
  check(`${ parser.name }: value host preserves RHS: ${ fields }`, plan?.hostKind, 'assignment-value');
}

// A stable source needs no copy; writes anywhere in the original pattern retain its value.
for (const parser of adapters) for (const [label, extra, statement, captured, target = 'method'] of [
  ['stable default', '', 'const { from, of: method = 1 } = M;', false],
  ['known key', "const key = 'of';", 'const { from, [key]: method } = M;', false],
  ['earlier native default', '', 'const { before = (M = {}, 1), of: method = 1 } = M;', true],
  ['later default result', 'let first, method;', 'const result = ({ from: first, of: method = (M = {}, 1) } = M);', true],
  ['reachable writer', 'function change() { M = {}; } expose(change);', 'const { from, of: method = change() } = M;', true],
  ['source as target', 'let first;', 'const result = ({ from: first, of: M } = M);', true, 'M'],
]) {
  const program = parser.parseAndScope(`let M = pickConstructor(); if (!M) M = Array; ${ extra } ${ statement }`);
  const path = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property',
    prop => (prop.node.value.left ?? prop.node.value).name === target);
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const plan = planGuardedDestructureNarrow({
    propNode: path.node, patternNode: path.parentPath.node, hostNode: path.parentPath.parentPath.node,
    hostInStatement: false, path, adapter, meta: { key: 'of', guardedAliasHint: 'Array', guardOnly: true },
    resolvePure: meta => meta.kind === 'property' && meta.object === 'Array' && ['of', 'from'].includes(meta.key)
      ? { kind: 'static', entry: `array/${ meta.key }`, hintName: meta.key } : null,
  });
  check(`${ parser.name }: receiver reuse: ${ label }: admitted`, !!plan, true);
  check(`${ parser.name }: receiver reuse: ${ label }: capture`, !!plan?.plan.captureReceiver, captured);
}

// A scalar default keeps the foreign raw read under its identity guard on later passes.
// Claims in the user's fallback stay live, and a different comparator proves nothing.
for (const parser of adapters) for (const [name, expression, pick, expected] of [
  ['raw scalar read', 'M === Array ? _Array$of : (held = M.of) === void 0 ? 9 : held', 'M', true],
  ['wrapped raw scalar read', 'M === Array ? _Array$of : ((held = (M.of as any)) === void 0 ? 9 : held)', 'M', true],
  ['foreign comparator', 'M === Object ? _Array$of : (held = M.of) === void 0 ? 9 : held', 'M', false],
  ['live fallback', 'M === Array ? _Array$of : (held = M.of) === void 0 ? other.of : held', 'other', false],
  ['different memo', 'M === Array ? _Array$of : (held = M.of) === void 0 ? 9 : other', 'M', false],
  ['different test', 'M === Array ? _Array$of : (held = M.of) == void 0 ? 9 : held', 'M', false],
]) {
  const program = parser.parseAndScope(`import _Array$of from '@core-js/pure/actual/array/of'; let held; ${ expression };`);
  const path = parser.pickPath(program, 'MemberExpression', item => item.node.object.name === pick);
  check(`${ parser.name }: own scalar guard: ${ name }`, ownEmittedNavClaim(path.node, path, {
    isPureImportSource: source => source.startsWith('@core-js/pure/'), isOwnPassBinding: () => false,
  }), expected);
}

finish();
