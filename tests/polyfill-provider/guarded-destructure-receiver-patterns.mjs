// A pattern-valued constructor Get must be guarded before its child reads a static.
// Direct scalar bindings retain their old route, and iterable patterns stay separate.
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { buildDestructureLeafMeta, classifyDestructureLeafHost } from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import {
  planGuardedDestructureNarrow,
} from '../../packages/core-js-polyfill-provider/detect-usage/members.js';
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
finish();
