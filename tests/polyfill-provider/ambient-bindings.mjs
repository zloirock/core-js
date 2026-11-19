// An erased declaration and a runtime declaration may share one tracker binding.
import { adapters, babelAdapter, createChecker } from './harness.mjs';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { isAmbientBinding, isAmbientTypeDeclaration, violationDeclarationOf } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';

const { check, checkTruthy, finish } = createChecker('ambient-bindings', {
  tsc: 'These parser-level probes deliberately merge ambient declarations and values, including duplicate and external declarations.',
});

const rows = [
  ['ambient variable', 'declare var Map: any;', false],
  ['ambient class', 'declare class Map {}', false],
  ['ambient function', 'declare function Map(): void;', false],
  ['type alias', 'type Map = number;', false],
  ['class implementation', 'declare class Map {} function Map() {}', true],
  ['function implementation', 'function Map(): void; function Map() {}', true],
  ['type-only import and const', 'import type { default as Map } from "@core-js/pure/actual/map"; const Map = class {};', true],
  ['inline import and function', 'import { type default as Map } from "@core-js/pure/actual/map"; function Map() {}', true],
  ['import and pattern', 'import type { default as Map } from "@core-js/pure/actual/map"; const { value: Map } = { value: class {} };', true],
  ['import and var', 'import type { default as Map } from "@core-js/pure/actual/map"; var Map;', true],
  ['import and ambient', 'import type { default as Map } from "@core-js/pure/actual/map"; declare var Map: any;', false],
  ['import and namespace twin', 'import type { default as Map } from "@core-js/pure/actual/map"; namespace N { const Map = class {}; }', false],
  ['import and static-block twin', 'import type { default as Map } from "@core-js/pure/actual/map"; class C { static { var Map; } }', false],
  ['import and nested function twin', 'import type { default as Map } from "@core-js/pure/actual/map"; function f() { const Map = class {}; }', false],
  ['external assignment', 'declare var Map: any; Map = replacement;', false],
  ['type-only import', 'import type Map from "@core-js/pure/actual/map";', false],
  ['runtime class', 'class Map {}', true],
];
const flowRows = [
  ...['declare var Map: any;', 'type Map = number;', 'opaque type Map = number;', 'interface Map {}',
    'declare type Map = number;', 'declare opaque type Map: number;', 'declare interface Map {}',
    'declare module "m" { declare var Map: any; }', 'declare export var Map: any;',
  ].map(source => [source, source, false]),
  ['Flow function implementation', 'declare function Map(v: string): void; declare function Map(v: number): void; function Map(v) {}', true],
  ['Flow variable implementation', 'declare var Map: any; var Map = function () {};', true],
  ['Flow module and runtime const', 'declare module "m" { declare type Map = number; } const Map = function () {};', true],
];

for (const parser of adapters) for (const [title, source, runtime] of [...rows, ...parser === babelAdapter ? flowRows : []]) {
  const flow = flowRows.some(row => row[0] === title);
  const program = parser.parseAndScope(`${ source } use(Map);`, 'module', flow ? ['flow'] : []);
  const use = parser.pickPath(program, 'CallExpression', p => p.node.callee.name === 'use');
  const adapter = (parser === babelAdapter ? createBabelAdapter : createEstreeAdapter)();
  const context = { scope: use.scope, name: 'Map', path: use };
  const label = `${ parser.name }/${ title }`;
  check(`${ label }/runtime shadow`, adapter.hasBinding(context), runtime);
  for (const binding of [use.scope.getBinding('Map'), adapter.getBinding(context)]) {
    // Some type declarations are absent from a tracker's binding table altogether.
    if (binding) check(`${ label }/whole binding`, isAmbientBinding(binding), !runtime);
  }
}

for (const type of ['DeclareVariable', 'TypeAlias', 'OpaqueType', 'InterfaceDeclaration', 'DeclareTypeAlias', 'DeclareOpaqueType', 'DeclareInterface']) {
  check(`${ type }/erased`, isAmbientTypeDeclaration({ type }), true);
}
check('absent binding', isAmbientBinding(null), false);
const ambient = { path: { node: { type: 'DeclareVariable' } }, constantViolations: [{ node: null }] };
check('removed write does not declare a value', isAmbientBinding(ambient), true);
ambient.constantViolations = [{ node: { type: 'AssignmentExpression' } }];
check('an external write does not declare a value', isAmbientBinding(ambient), true);
const runtime = { path: { node: { type: 'VariableDeclarator' } }, get constantViolations() { throw new Error('ordinary binding scanned'); } };
check('ordinary binding does not scan writes', isAmbientBinding(runtime), false);

for (const parser of adapters) {
  const program = parser.parseAndScope('const { value: local } = source; function fn() { local = other; }');
  const declarator = parser.pickPath(program, 'VariableDeclarator');
  const id = parser.pickPath(program, 'Identifier', p => p.node.name === 'local');
  const write = parser.pickPath(program, 'AssignmentExpression');
  checkTruthy(`${ parser.name }/declaration violation`, violationDeclarationOf(declarator) === declarator);
  checkTruthy(`${ parser.name }/pattern identifier violation`, violationDeclarationOf(id)?.node === declarator.node);
  check(`${ parser.name }/assignment is not a declaration`, violationDeclarationOf(write), null);
  check(`${ parser.name }/write identifier is not a declaration`, violationDeclarationOf(write.get('left')), null);
}
finish();
