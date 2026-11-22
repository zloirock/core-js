// An erased declaration can choose a different polyfill without changing the printed JavaScript.
import { createChecker } from './harness.mjs';
import { createAwaited } from '../../packages/core-js-polyfill-provider/resolve-node-type/awaited.js';
import { createReturnType } from '../../packages/core-js-polyfill-provider/resolve-node-type/return-type.js';
import { createTypeSubst } from '../../packages/core-js-polyfill-provider/resolve-node-type/type-subst.js';
import { getTypeArgs } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';

const { check, finish, runBoth } = createChecker('type-declaration-scopes');
const { functionTypeParams } = createAwaited({});
const { applyAliasSubstDeep } = createTypeSubst({ functionTypeParams });
const { hasParamTypeRef } = createReturnType({
  babelNodeType: node => node.type,
  unwrapTypeAnnotation: node => node?.type === 'TSTypeAnnotation' ? node.typeAnnotation : node,
  functionTypeParams,
});

for (const signature of [
  'new (m: Map<T, string>) => string[]',
  '(m: Map<T, string>) => string[]',
  '{ method(m: Map<T, string>): string[] }',
]) runBoth(signature, `type Slot<T> = ${ signature }; declare function accept<T>(slot: ${ signature }): void;
  type Item = number;`, (parser, program, label) => {
  const aliases = parser.collectPaths(program, 'TSTypeAliasDeclaration');
  const slot = aliases[0].node.typeAnnotation;
  const item = aliases[1].node.typeAnnotation;
  const parameter = parser.pickPath(program, 'Identifier', path => path.node.name === 'slot');
  check(`${ label } captures T`, hasParamTypeRef(parameter.node, new Set(['T']), 0), true);
  check(`${ label } excludes U`, hasParamTypeRef(parameter.node, new Set(['U']), 0), false);
  const expanded = applyAliasSubstDeep(slot, new Map([['T', item]]));
  const args = functionTypeParams(expanded.members?.[0] ?? expanded);
  const [key, value] = getTypeArgs(args[0].typeAnnotation.typeAnnotation).params;
  check(`${ label } substituted Map key`, key, item);
  check(`${ label } preserved Map value`, value.type, 'TSStringKeyword');
});

for (const [label, subject, family] of [
  ['omitted this', 'OmitThisParameter<(this: string[], n: number) => string>', 'Function'],
  ['this slot', 'ThisParameterType<(this: string[], n: number) => string>', 'Array'],
  ['opaque', 'unknown', null],
]) runBoth(label, `declare const value: ${ subject }; const read = value;`, (parser, program, site) => {
  const value = parser.pickPath(program, 'VariableDeclarator', path => path.node.id.name === 'read').get('init');
  check(site, parser.makeResolver().resolveNodeType(value)?.constructor ?? null, family);
});
runBoth('exported namespace alias resolves its private target', `namespace Model {
  namespace Hidden { export type Row = number[] }
  export import Public = Hidden;
} declare const value: Model.Public.Row; const read = value;`, (parser, program, label) => {
  const value = parser.pickPath(program, 'VariableDeclarator', path => path.node.id.name === 'read').get('init');
  check(label, parser.makeResolver().resolveNodeType(value)?.constructor, 'Array');
});
for (const [label, declarations, read, family] of [
  ['export list hides other ambient members',
    'declare namespace Model { const row: string; export {}; } declare namespace Model { const row: number[]; }', 'Model.row', 'Array'],
  ['ambient renamed value', 'const hidden = 0; declare namespace Model { const hidden: string; export { hidden as row }; }', 'Model.row', 'string'],
]) runBoth(label, `${ declarations } const value = ${ read };`, (parser, program, site) => {
  const value = parser.pickPath(program, 'VariableDeclarator', path => path.node.id.name === 'value').get('init');
  const type = parser.makeResolver().resolveNodeType(value);
  check(site, type?.primitive ? type.type : type?.constructor, family);
});
finish();
