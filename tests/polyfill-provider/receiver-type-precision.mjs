// Receiver proofs must retain their mutation, ownership and caller boundaries.
// Unknown computed keys retain explicit slots as a deliberate precision policy.
// Sources intentionally read absent members; runtime JS accepts these reads even where TS rejects them.
import { createChecker, expectError } from './harness.mjs';
import {
  CENSUS_KEY_NAMES,
  collectFileCensus,
  ESCAPED_CONTAINER_NAMES,
  pathOfNode,
  resolveCallArgument,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { escapedCtorReferencesReducer, mutationShapesReducer } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';
import { resolveKey } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { createMemberResolve } from '../../packages/core-js-polyfill-provider/resolve-node-type/member-resolve.js';
import ImportInjectorState from '../../packages/core-js-polyfill-provider/injector-base.js';
import { createPolyfillResolver } from '../../packages/core-js-polyfill-provider/resolver.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';

const { check, checkDeep, doesNotThrow, runBoth, finish } = createChecker('receiver-type-precision');

// what a generated row hands `expectError` for the line `tsc` rejects on purpose
const COMPUTED_KEY = 'a computed key tsc refuses is the shape under test';
const FUNCTION_WRITE = 'a write over a function declaration, which tsc forbids, is the shape under test';
const KEY_COLLISION = 'a key collision, which tsc refuses, is the shape under test';
const TUPLE_INDEX = 'a tuple index tsc refuses is the shape under test';
const cases = [
  ['inherited function', 'const result = ({}).toString;', 'Function'],
  ['inherited function alias', 'const box = {}; const result = box.hasOwnProperty;', 'Function'],
  ['own override', 'const result = ({ toString: [1] }).toString;', 'Array'],
  ['unknown later key', 'const result = ({ [key]: [1] }).toString;', null],
  ['spread may override', 'const result = ({ ...other }).toString;', null],
  ['null prototype', 'const result = ({ __proto__: null }).toString;', null],
  ['foreign prototype', 'const result = ({ __proto__: { toString: [1] } }).toString;', null],
  ['inherited member escapes', 'const box = {}; mutate(box); const result = box.toString;', null],
  ['inherited member write', 'const box = {}; box.toString = [1]; const result = box.toString;', null],
  ['installed prototype', 'const box = {}; Object.setPrototypeOf(box, { toString: [1] }); const result = box.toString;', null],
  ['unknown data key keeps the named array', 'const box = { rows: [1], [key]: "ab" }; const result = box.rows;', 'Array'],
  ['unknown method key keeps the named array', 'const box = { rows: [1], [key]() {} }; const result = box.rows;', 'Array'],
  ['unknown getter key keeps the named array', 'const box = { rows: [1], get [key]() { return "ab"; } }; const result = box.rows;', 'Array'],
  ['symbol key cannot replace an array', 'const key = Symbol(); const box = { rows: [1], [key]: "ab" }; const result = box.rows;', 'Array'],
  ['undefined symbol key keeps the named array', 'const key = cond ? Symbol() : void 0; const box = { undefined: [1], [key]: "ab" }; const result = box.undefined;', 'Array'],
  ['null symbol key keeps the named array', 'const key = cond ? Symbol() : null; const box = { null: [1], [key]: "ab" }; const result = box.null;', 'Array'],
  [
    'shadowed symbol call proves the overriding key',
    'function Symbol() { return "rows"; } const key = Symbol(); const box = { rows: [1], [key]: "ab" }; const result = box.rows;',
    'string',
  ],
  [
    'written symbol binding keeps the named array',
    'let key: any = Symbol(); key = "rows"; const box = { rows: [1], [key]: "ab" }; const result = box.rows;',
    'Array',
  ],
  [
    'changed enum key cannot prove a setter',
    'enum Keys { slot = "toString" } Object.defineProperty(Keys, "slot", { value: "other" }); const box = { set [Keys.slot](value) {} }; const result = box.toString;',
    null,
  ],
  [
    'changed enum key alias cannot prove a setter',
    'enum Keys { slot = "toString" } Object.defineProperty(Keys, "slot", { value: "other" }); '
      + 'const key = Keys.slot; const box = { set [key](value) {} }; const result = box.toString;',
    null,
  ],
  [
    'changed enum key cannot prove inherited presence',
    'enum Keys { slot = "other" } Object.defineProperty(Keys, "slot", { value: "toString" }); const box = { set [Keys.slot](value) {} }; const result = box.toString;',
    null,
  ],
  ['class getter prototype', 'class Box { static get C() { effect(); return Array; } } const result = Box.C.prototype;', 'Array'],
  ['class field prototype', 'class Box { static C = String; } const result = Box.C.prototype;', 'String'],
  ['class getter written', 'class Box { static get C() { return Array; } } Box.C = String; const result = Box.C.prototype;', null],
  ['class field written', 'class Box { static C = Array; } Box.C = String; const result = Box.C.prototype;', null],
  ['class getter escapes', 'class Box { static get C() { return Array; } } mutate(Box); const result = Box.C.prototype;', null],
  ['class getter opaque return', 'class Box { static get C() { return opaque; } } const result = Box.C.prototype;', null],
  ['enum string value', 'enum E { at = "at" } const result = E.at;', 'string'],
  ['enum numeric value', 'enum E { at = 1 } const result = E.at;', 'number'],
  ['namespaced enum value', 'namespace N { export enum E { at = "at" } } const result = N.E.at;', 'string'],
  ['namespaced enum shadow', 'namespace N { export enum E { at = "at" } } function f(N) { const result = N.E.at; }', null],
  ['namespaced enum reverse map', 'namespace N { export enum E { A } } const result = N.E[N.E.A];', 'string'],
  ['enum shadow', 'enum E { at = "at" } function f(E) { const result = E.at; }', null],
  ['enum member written', '// @ts-expect-error a write to an enum, which tsc forbids, is the shape under test\nenum E { at = "at" } E.at = other; const result = E.at;', null],
  ['locally caught value', 'const box = { data: [1] }; try { throw box; } catch (e) {} const result = box.data;', 'Array'],
  ['catch binding reads', 'const box = { data: [1] }; try { throw box; } catch (e) { void e.data; } const result = box.data;', 'Array'],
  ['anonymous catch receiver', 'let r; try { throw { data: [1], read() { const result = this.data; return result; } }; } catch (e) { r = e.read(); }', 'Array'],
  ['anonymous catch receiver written', 'let r; try { throw { data: [1], read() { const result = this.data; return result; } }; } catch (e) { e.data = "ab"; r = e.read(); }', null],
  ['anonymous catch carrier', 'let r; try { throw { box: { data: [1], read() { const result = this.data; return result; } } }; } catch (e) { r = e.box.read(); }', 'Array'],
  ['catch binding writes', 'const box = { data: [1] }; try { throw box; } catch (e) { e.data = "ab"; } const result = box.data;', null],
  ['catch binding escapes', 'const box = { data: [1] }; try { throw box; } catch (e) { mutate(e); } const result = box.data;', null],
  ['uncaught throw', 'const box = { data: [1] }; function f() { throw box; } const result = box.data;', null],
  ['catch rethrow', 'const box = { data: [1] }; try { throw box; } catch (e) { throw e; } const result = box.data;', null],
  ['finally throw', 'const box = { data: [1] }; try {} catch (e) {} finally { throw box; } const result = box.data;', null],
  ['deferred throw', 'const box = { data: [1] }; try { function f() { throw box; } use(f); } catch (e) {} const result = box.data;', null],
  ['catch without binding', 'const box = { data: [1] }; try { throw box; } catch {} const result = box.data;', 'Array'],
  ['catch destructured alias write', 'const box = { data: [1] }; try { throw { box }; } catch ({ box: e }) { e.data = "ab"; } const result = box.data;', null],
  ['outer catch handles rethrow', 'const box = { data: [1] }; try { try { throw box; } catch (e) { throw e; } } catch {} const result = box.data;', 'Array'],
  ['class instance initializer throws later', 'const box = { data: [1] }; try { class C { x = (() => { throw box; })(); } use(C); } catch {} const result = box.data;', null],
];
for (const [label, source, expected] of cases) runBoth(label, source, (adapter, program, name) => {
  const result = adapter.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result');
  const type = adapter.makeResolver().resolveNodeType(result.get('init'));
  check(name, type ? type.primitive ? type.type : type.constructor : null, expected);
});
for (const [label, source, expected] of [
  ['inherited default is dead', 'const { toString: { at } = [1] } = {};', 'Function'],
  ['closed parameter default', 'function f({ at } = [[1]][0]) { return at; } f();', 'Array'],
  ['undefined argument default', 'function f({ at } = [[1]][0]) { return at; } f(void 0);', 'Array'],
  ['overridden parameter default', 'function f({ at } = [[1]][0]) { return at; } f("ab");', 'string'],
  ['escaped parameter default', 'function f({ at } = [[1]][0]) { return at; } use(f);', null],
]) runBoth(label, source, (adapter, program, name) => {
  const property = adapter.pickPath(program, 'ObjectProperty', p => p.node.key?.name === 'at')
    ?? adapter.pickPath(program, 'Property', p => p.node.key?.name === 'at');
  const type = adapter.makeResolver().resolvePropertyObjectType(property);
  check(name, type ? type.primitive ? type.type : type.constructor : null, expected);
});

// A closed parameter reads every caller's actual receiver, including the call's scope.
// Cross-family callers keep their exact hint union; unknown callers retain the generic answer.
for (const [label, source, expected, hints] of [
  ['closed array', 'function read({ at }) {} read([1, [2]]);', [false, 'Array'], ['array']],
  ['closed string', 'function read({ at }) {} read("ab");', [true, 'string'], ['string']],
  ['closed array prototype', 'function read({ at }) {} read(Array.prototype);', [false, 'Array'], ['array']],
  ['direct array prototype', '(({ at }) => at)(Array.prototype);', [false, 'Array'], ['array']],
  ['direct string prototype', '(({ at }) => at)(String.prototype);', [false, 'String'], ['string']],
  ['direct constructor prototype', '(({ prototype: { at } }) => at)(String);', [false, 'String'], ['string']],
  ['named constructor prototype', 'function read({ prototype: { at } }) {} read(Array);', [false, 'Array'], ['array']],
  ['nested literal', 'function read({ row: { at } }) {} read({ row: "ab" });', [true, 'string'], ['string']],
  ['nested array', 'function read([[{ at }]]) {} read([["ab"]]);', [true, 'string'], ['string']],
  ['several arrays', 'function read({ at }) {} read([1]); read([2]);', [false, 'Array'], ['array']],
  ['tag strings array', 'function read({ at }) {} read`ab`;', [false, 'Array'], ['array']],
  ['mixed families', 'function read({ includes: at }) {} read([1]); read("ab");', null, ['array', 'string']],
  ['caller branch families', '(({ toString: at }) => at)(globalThis.window?.Object || {});', null, ['function', 'object']],
  ['conditional caller families', '(({ toString: at }) => at)(flag ? Object : {});', null, ['function', 'object']],
  ['default branch families', '(({ toString: at } = flag ? Object : {}) => at)();', null, ['function', 'object']],
  ['aliased caller families', 'const value = flag ? Object : {}; function read({ toString: at }) {} read(value);', null, ['function', 'object']],
  ['asserted branch families', '(({ toString: at }) => at)((flag ? Object : {}) as unknown as string);', null, ['function', 'object']],
  ['instance caller branch families', 'function read({ includes: at }) {} read(flag ? [1] : "ab");', null, ['array', 'string']],
  ['RegExp caller family', '(({ toString: at }) => at)(flag ? /x/ : {});', null, ['object', 'regexp']],
  ['unresolved caller keeps the RegExp default live', 'function read({ toString: at } = /x/) {} read(flag ? Object : undefined);', null, null],
  ['unknown caller branch', '(({ toString: at }) => at)(flag ? foreign : {});', null, null],
  ['unknown caller call branch', '(({ toString: at }) => at)(flag ? foreign() : {});', null, null],
  ['unsettled logical and', 'function read({ includes: at }) {} read("" && [1]);', null, ['array', 'string']],
  ['unsettled logical or', 'function read({ includes: at }) {} read("" || [1]);', null, ['array', 'string']],
  ['unknown logical left', 'function read({ includes: at }) {} read(foreign && [1]);', null, null],
  ['IIFE receiver assertion', '(({ includes: at }) => at)(foreign as string);', [true, 'string'], ['string']],
  ['named receiver assertion', 'function read({ includes: at }) {} read(foreign as string);', [true, 'string'], ['string']],
  ['default receiver assertion', 'function read({ includes: at } = foreign as string) {} read();', [true, 'string'], ['string']],
  ['inner default receiver assertion', 'function read({ row: { includes: at } = foreign as string }) {} read({});', [true, 'string'], ['string']],
  ['nested receiver assertions', '(({ includes: at }) => at)((foreign! as unknown) as string);', [true, 'string'], ['string']],
  ['open string default annotation',
    'declare const foreign: unknown; export function read({ includes: at } = foreign as string) {}',
    [true, 'string'], ['string']],
  ['open array default annotation',
    'declare const foreign: unknown; export function read({ includes: at } = foreign as number[]) {}',
    [false, 'Array'], ['array']],
  ['nested open default annotation',
    'declare const foreign: unknown; type Box = { row: string }; '
      + 'export function read({ row: { includes: at } } = foreign as Box) {}',
    [true, 'string'], ['string']],
  ['open union default remains unknown',
    'declare const foreign: unknown; export function read({ includes: at } = foreign as string | number[]) {}',
    null, null],
  ['open any default remains unknown',
    'declare const foreign: unknown; export function read({ includes: at } = foreign as any) {}',
    null, null],
  ['explicit pattern annotation wins',
    'declare const foreign: unknown; export function read({ includes: at }: string = foreign as any) {}',
    [true, 'string'], null],
  // `as any` deliberately admits a runtime value outside the inferred string parameter type.
  ['supplied Array overrides default source annotation',
    'declare const foreign: unknown; function read({ includes: at } = foreign as string) {} read([1] as any);',
    [false, 'Array'], ['array']],
  ['runtime default and supplied annotation remain distinct arms',
    'export function read({ includes: at } = [1] as unknown as string) {}',
    null, ['array', 'string']],
  // Deliberate double assertions do not erase a runtime union already proved by the value arms.
  ['runtime branch default and supplied annotation remain distinct arms',
    'export function read({ toString: at } = (flag ? Object : {}) as unknown as string) {}',
    null, ['function', 'object', 'string']],
  ['caller annotation resolves in caller scope',
    'declare const foreign: unknown; type Receiver = string; '
      + '(({ includes: at }) => { type Receiver = number[]; return at; })(foreign as Receiver);',
    [true, 'string'], ['string']],
  ['plain open runtime default stays unknown',
    'export function read({ includes: at } = [1]) {}',
    null, null],
  ['asserted array literal', '(({ includes: at }) => at)([1] as unknown as string);', [false, 'Array'], ['array']],
  ['asserted string literal', '(({ includes: at }) => at)("ab" as unknown as number[]);', [true, 'string'], ['string']],
  [
    'assertion preserves array binding annotation',
    'declare const foreign: any; const value: number[] = foreign; (({ includes: at }) => at)(value as unknown as string);',
    [false, 'Array'],
    ['array'],
  ],
  [
    'assertion preserves string binding annotation',
    'declare const foreign: any; const value: string = foreign; (({ includes: at }) => at)(value as unknown as number[]);',
    [true, 'string'],
    ['string'],
  ],
  ['assertion preserves ambient annotation', 'declare const value: number[]; (({ includes: at }) => at)(value as unknown as string);', [false, 'Array'], ['array']],
  ['unknown caller value', 'function read({ includes: at }) {} read([1]); read(foreign);', null, null],
  ['exported function', 'export function read({ at }) {} read([1]);', null, null],
  ['escaped function', 'function read({ at }) {} hand(read); read([1]);', null, null],
  ['unknown spread', 'function read({ at }) {} read(...foreign);', null, null],
  ['opaque apply list', 'function read({ at } = [1]) {} read.apply(null, foreign);', null, null],
  ['opaque Reflect.apply list', 'function read({ at } = [1]) {} Reflect.apply(read, null, foreign);', null, null],
  ['known empty apply list', 'function read({ at } = [1]) {} read.apply(null, []);', [false, 'Array'], ['array']],
  ['known string apply list', 'function read({ at } = [1]) {} read.apply(null, ["ab"]);', [true, 'string'], ['string']],
  ['omitted default', 'function read({ at } = [1]) {} read();', [false, 'Array'], ['array']],
  ['undefined default', 'function read({ at } = [1]) {} read(undefined);', [false, 'Array'], ['array']],
  ['supplied default override', 'function read({ at } = [1]) {} read("ab");', [true, 'string'], ['string']],
  ['supplied custom object', 'function read({ at } = [1]) {} read({ at() {} });', [false, 'Object'], ['object']],
  ['supplied null', 'function read({ at } = [1]) {} read(null);', [true, 'null'], null],
  ['default plus string', 'function read({ includes: at } = [1]) {} read(); read("ab");', null, ['array', 'string']],
  ['inner default', 'function read({ row: { at } = [1] }) {} read({});', [false, 'Array'], ['array']],
  ['inner default is dead', 'function read({ row: { at } = [1] }) {} read({ row: "ab" });', [true, 'string'], ['string']],
  ['outer default', 'function read({ box: { row: { at } } = { row: "ab" } }) {} read({});', [true, 'string'], ['string']],
  ['nested defaults', 'function read({ box: { row: { at } } = { row: "ab" } } = {}) {} read();', [true, 'string'], ['string']],
  ['inner mixed default', 'function read({ row: { at } = "ab" }) {} read({ row: [1] }); read({});', null, ['array', 'string']],
  ['caller scope', 'function read(String, { prototype: { at } }) {} read(other, String);', [false, 'String'], ['string']],
  ['undefined caller scope', '((undefined, { at } = [1]) => at)(5, undefined);', [false, 'Array'], ['array']],
  ['named expression', 'const read = function inner({ at }) {}; read("ab");', [true, 'string'], ['string']],
  ['recursive caller', 'function read({ at } = [1]) { read("ab"); } read();', null, ['array', 'string']],
  ['arguments object', 'function read({ at }) { return arguments[0]; } read([1]);', null, null],
  ['later argument replaces a binding', 'let value = [1]; function read({ at }) {} read(value, value = "ab");', [false, 'Array'], ['array']],
  ['later argument writes a slot', 'const box = { row: [1] }; function read({ row: { at } }) {} read(box, box.row = "ab");', null, null],
  ['pattern key writes a slot', 'const box = { row: [1] }; function read({ [(box.row = "ab", "row")]: { at } }) {} read(box);', null, null],
]) runBoth(`parameter receiver/${ label }`, source, (adapter, program, name) => {
  const property = adapter.pickPath(program, 'ObjectProperty', p => p.node.value?.name === 'at')
    ?? adapter.pickPath(program, 'Property', p => p.node.value?.name === 'at');
  const resolver = adapter.makeResolver();
  const type = resolver.resolvePropertyObjectType(property);
  check(`${ name } primitive`, type?.primitive ?? null, expected?.[0] ?? null);
  check(`${ name } family`, type ? type.primitive ? type.type : type.constructor : null, expected?.[1] ?? null);
  check(`${ name } hints`, resolver.resolvePropertyUnionHints(property)?.size
    ? [...resolver.resolvePropertyUnionHints(property)].sort().join(',') : null, hints?.join(',') ?? null);
});

// The same source facts reach the dependency decision. A constructor is a Function value,
// and the plain fallback does not authorize a RegExp patch; a real or unknown arm still does.
for (const [label, source, expected] of [
  ['Function/Object', '(({ toString }) => toString)(flag ? Object : {});', ['object/to-string']],
  ['RegExp/Object', '(({ toString }) => toString)(flag ? /x/ : {});', ['object/to-string', 'regexp/to-string']],
  ['live RegExp default', 'function read({ toString } = /x/) {} read(flag ? Object : undefined);', ['object/to-string', 'regexp/to-string']],
  ['unknown/Object', '(({ toString }) => toString)(flag ? foreign : {});', ['object/to-string', 'regexp/to-string']],
]) runBoth(`parameter union dependencies/${ label }`, source, (adapter, program, name) => {
  const property = adapter.pickPath(program, adapter.name === 'babel' ? 'ObjectProperty' : 'Property');
  const typeResolvers = adapter.makeResolver();
  const env = { typeResolvers,
    astPredicates: { isMemberLike: () => false, isCallee: () => false, isSpreadElement: () => false } };
  for (const method of ['usage-global', 'usage-pure']) {
    const { resolver } = createPolyfillResolver({ method, version: '4.0', targets: { ie: 11 } }, env);
    const meta = { kind: 'property', key: 'toString' };
    check(`${ name }/${ method } dependency entries`, resolver.resolveUsage(meta, property)?.sort().join(','), expected.join(','));
    check(`${ name }/${ method } preserves pure availability`, resolver.resolvePure(meta, property), null);
  }
});

runBoth('parameter union retains source hints after caller mirrors',
  '(({ toString }) => toString)(flag ? Object : {});', (adapter, program, name) => {
    const property = adapter.pickPath(program, adapter.name === 'babel' ? 'ObjectProperty' : 'Property');
    const call = adapter.pickPath(program, 'CallExpression');
    const resolver = adapter.makeResolver();
    check(`${ name } scalar is a union`, resolver.resolvePropertyObjectType(property), null);
    call.node.arguments[0] = { type: 'ObjectExpression', properties: [] };
    check(`${ name } source families`, [...resolver.resolvePropertyUnionHints(property) ?? []].sort().join(','), 'function,object');
  });

runBoth('parameter receivers retain source facts after caller mirrors',
  'function read([{ at }, { includes }]) {} read([[1], "ab"]);', (adapter, program, name) => {
    const propertyType = adapter.name === 'babel' ? 'ObjectProperty' : 'Property';
    const properties = adapter.collectPaths(program, propertyType, p => p.parentPath.node.type === 'ObjectPattern');
    const call = adapter.pickPath(program, 'CallExpression');
    const resolver = adapter.makeResolver();
    check(`${ name } first source receiver`, resolver.resolvePropertyObjectType(properties[0])?.constructor, 'Array');
    call.node.arguments[0] = { type: 'ArrayExpression', elements: [
      { type: 'ObjectExpression', properties: [] }, { type: 'ObjectExpression', properties: [] },
    ] };
    const second = resolver.resolvePropertyObjectType(properties[1]);
    check(`${ name } sibling source primitive`, second?.primitive, true);
    check(`${ name } sibling source family`, second?.type, 'string');
    check(`${ name } sibling source union`, [...resolver.resolvePropertyUnionHints(properties[1]) ?? []].join(','), 'string');
  });

runBoth('separate parameter receivers retain source facts after caller mirrors',
  'function read({ at }, { includes }) {} read([1], "ab");', (adapter, program, name) => {
    const propertyType = adapter.name === 'babel' ? 'ObjectProperty' : 'Property';
    const properties = adapter.collectPaths(program, propertyType, p => p.parentPath.node.type === 'ObjectPattern');
    const call = adapter.pickPath(program, 'CallExpression');
    const resolver = adapter.makeResolver();
    check(`${ name } first family`, [...resolver.resolvePropertyUnionHints(properties[0]) ?? []].join(','), 'array');
    call.node.arguments[1] = { type: 'ObjectExpression', properties: [] };
    const second = resolver.resolvePropertyObjectType(properties[1]);
    check(`${ name } sibling primitive`, second?.primitive, true);
    check(`${ name } sibling family`, second?.type, 'string');
  });

// Caller entry lookup adapts the path-based census to the injector's positional, lazy
// binding lookup. A user-named Reflect.apply alias serves its own binding, including
// after extraction, while a parameter shadow inside that span remains an unknown call.
for (const [label, invoke, expected] of [
  ['serving invoker', 'invoke(read, null, [[1]]);', 'Array'],
  ['shadowed invoker', 'function run(invoke) { invoke(read, null, [[1]]); } run(custom);', null],
]) runBoth(`parameter receiver entry callback/${ label }`,
  `const invoke = Reflect.apply; function read({ at }) {} ${ invoke }`, (adapter, program, name) => {
    const call = adapter.pickPath(program, 'CallExpression', path => path.node.callee?.name === 'invoke');
    const binding = program.scope.getBinding('invoke');
    const injector = new ImportInjectorState({ mode: 'actual', pkg: '@core-js/pure', importStyle: 'import' });
    injector.registerBodyExtractAlias('invoke', 'reflect/apply', binding);
    const property = adapter.pickPath(program, adapter.name === 'babel' ? 'ObjectProperty' : 'Property');
    const resolver = adapter.makeResolver({ getPolyfillBindingEntry(scope, key, useStart, useBinding) {
      return injector.getBindingInfo(key, useStart, useBinding)?.entry ?? null;
    } });
    let type;
    doesNotThrow(`${ name } callback accepts lazy binding`, () => { type = resolver.resolvePropertyObjectType(property); });
    check(`${ name } receiver primitive`, type?.primitive ?? null, expected ? false : null);
    check(`${ name } receiver family`, type?.constructor ?? null, expected);
    check(`${ name } invoker binding is caller scoped`, call.scope.getBinding('invoke')?.path.node === binding.path.node, expected !== null);
  });

for (const [label, source, object, key] of [
  ['mutated invoker', 'function read({ at }) {} read.call(null, [1]);', 'Function.prototype', 'call'],
  ['replaced constructor prototype', 'function read({ prototype: { at } }) {} read(Array);', 'globalThis', 'Array'],
  ['replaced prototype receiver', 'function read({ at }) {} read(Array.prototype);', 'globalThis', 'Array'],
]) runBoth(`parameter receiver/${ label }`, source, (adapter, program, name) => {
  const property = adapter.pickPath(program, 'ObjectProperty', p => p.node.value?.name === 'at')
    ?? adapter.pickPath(program, 'Property', p => p.node.value?.name === 'at');
  const resolver = adapter.makeResolver({ isMutatedStatic: (owner, member) => owner === object && member === key });
  check(`${ name } keeps the receiver unknown`, resolver.resolvePropertyObjectType(property), null);
  check(`${ name } keeps families open`, resolver.resolvePropertyUnionHints(property), null);
});
for (const [label, source, expected] of [
  ['unwritten local key', 'let key; use(Array[key]);', false],
  ['written local key', 'let key; key = unknown; use(Array[key]);', true],
  ['updated local key', 'let key; key++; use(Array[key]);', true],
  ['iteration key', 'for (let key in { from: 1 }) use(Array[key]);', true],
  ['unknown iterable key', 'for (let key of keys) use(Array[key]);', true],
  ['redeclared key', 'var key; { var key = "from"; } use(Array[key]);', false],
  ['parameter shadows empty key', 'let key; function f(key) { use(Array[key]); } use(f);', true],
  ['declared ambient key', 'declare let key: string; use(Array[key]);', true],
]) runBoth(label, source, (adapter, program, name) => {
  const { escapedCtorNames } = collectFileCensus(program.node, [escapedCtorReferencesReducer()]);
  check(name, escapedCtorNames.has('Array'), expected);
});
for (const [label, source, expected] of [
  ['enum own receiver', 'enum E { at = "at" } use(E.at);', 'Object'],
  ['enum own receiver written', '// @ts-expect-error a write to an enum, which tsc forbids, is the shape under test\nenum E { at = "at" } E.at = other; use(E.at);', 'Object'],
  ['enum implicit own receiver', 'enum E { at } use(E.at);', 'Object'],
  [
    'qualified enum own receiver written',
    '// @ts-expect-error a write to an enum, which tsc forbids, is the shape under test\n'
    + 'namespace N { export enum E { at = "at" } } N.E.at = other; use(N.E.at);',
    'Object',
  ],
  ['enum receiver reassigned', '// @ts-expect-error a write to an enum, which tsc forbids, is the shape under test\nenum E { at = "at" } E = other; use(E.at);', null],
  ['qualified enum receiver reassigned', 'namespace N { export enum E { at = "at" } } N.E = other; use(N.E.at);', null],
  ['enum own receiver escaped', 'enum E { at = "at" } mutate(E); use(E.at);', null],
  ['enum member deleted', '// @ts-expect-error a write to an enum, which tsc forbids, is the shape under test\nenum E { at = "at" } delete E.at; use(E.at);', null],
  ['enum unknown member deleted', 'enum E { at = "at" } delete E[key]; use(E.at);', null],
  [
    'enum alias member deleted',
    '// @ts-expect-error a write to an enum, which tsc forbids, is the shape under test\n'
    + 'enum E { at = "at" } const alias = E; delete alias.at; use(E.at);',
    null,
  ],
  ['enum member updated', '// @ts-expect-error a write to an enum, which tsc forbids, is the shape under test\nenum E { at = "at" } E.at++; use(E.at);', null],
]) runBoth(label, source, (adapter, program, name) => {
  collectFileCensus(program.node, [escapedCtorReferencesReducer()]);
  const member = adapter.collectPaths(program, 'MemberExpression', p => p.node.property?.name === 'at').at(-1);
  const type = adapter.makeResolver().resolvePropertyObjectType(member);
  check(name, type ? type.primitive ? type.type : type.constructor : null, expected);
});

runBoth('ordinary member reads skip scoped enum lookup',
  Array.from({ length: 64 }, (unused, index) => `function f${ index }(value) { return value.at; }`).join('\n'),
  (adapter, program, name) => {
    collectFileCensus(program.node, [escapedCtorReferencesReducer()]);
    let lookups = 0;
    const cluster = createMemberResolve({
      KNOWN_INSTANCE_METHOD_RETURN_TYPES: {},
      findAllEnumDeclarations() { lookups++; return []; },
      enumIsNearestValue() { lookups++; return false; },
      bindingDeclaratorPath() { lookups++; return null; },
    });
    for (const member of adapter.collectPaths(program, 'MemberExpression')) cluster.resolveEnumMemberAccess(member, true);
    check(name, lookups, 0);
  });

// An alias closure is complete only when every binding in it has an enumerable reference set.
// A missing set is unknown, not evidence that no write can retype the array's elements.
runBoth('an incomplete array alias reference set refuses element precision',
  'const rows = []; const alias = rows; rows[0];', (adapter, program, name) => {
    const rowsDecl = adapter.pickPath(program, 'VariableDeclarator', path => path.node.id?.name === 'rows');
    const aliasDecl = adapter.pickPath(program, 'VariableDeclarator', path => path.node.id?.name === 'alias');
    const member = adapter.pickPath(program, 'MemberExpression');
    for (const [label, incomplete, expected] of [
      ['incomplete', true, true],
      ['complete', false, false],
    ]) {
      const binding = { constantViolations: [] };
      const sourceBinding = { constantViolations: [] };
      let referenceReads = 0;
      const cluster = createMemberResolve({
        t: {
          isIdentifier: node => node?.type === 'Identifier',
          isArrayExpression: node => node?.type === 'ArrayExpression',
        },
        getScopeBinding: ({ name: bindingName }) => bindingName === 'source' ? sourceBinding : binding,
        collectBindingReferences() {
          referenceReads++;
          if (referenceReads === 1) return [aliasDecl.get('init')];
          return incomplete ? null : [];
        },
        objectBindingName: () => 'source',
        computeObjectAliasClosure: () => new Map([[binding, true]]),
        KNOWN_INSTANCE_METHOD_RETURN_TYPES: { Array: {} },
      });
      check(`${ name }/${ label }`, cluster.arrayElementsMayBeRetyped(member.get('object'), member, {
        elementWrites: [], literalPath: rowsDecl.get('init'),
      }), expected);
    }
  });

// Assert the key answer itself: constructor-escape precision alone can mask a lost key proof.
for (const [label, source, expected] of [
  ['empty key', 'let key; use(Array[key]);', 'undefined'],
  ['initialized key', 'let key = "from"; use(Array[key]);', 'from'],
  ['opaque initializer', 'let key = other; use(Array[key]);', null],
  ['written key', 'let key; change(() => { key = other; }); use(Array[key]);', null],
  ['iteration key', 'for (let key of keys) use(Array[key]);', null],
  ['pattern key', 'let { key } = other; use(Array[key]);', null],
  ['ambient key', 'declare let key: string; use(Array[key]);', null],
  ['shadowed key', 'let key; function f(key) { use(Array[key]); } use(f);', null],
]) runBoth(`fallback key ${ label }`, source, (adapter, program, name) => {
  const member = adapter.pickPath(program, 'MemberExpression', p => p.node.object?.name === 'Array');
  const bindingAdapter = adapter.name === 'babel' ? createBabelAdapter : createEstreeAdapter;
  for (const method of ['usage-global', 'usage-pure']) {
    const result = resolveKey({
      node: member.node.property, computed: true, scope: member.scope, path: member,
      adapter: bindingAdapter({ method }), seen: new Set(),
    });
    check(`${ name }/${ method }`, result, method === 'usage-pure' && expected === 'undefined' ? null : expected);
  }
});
for (const [label, source, expected] of [
  ['enum key value', 'enum E { A = "at" } use([1][E.A]);', 'at'],
  ['written enum key value', '// @ts-expect-error a write to an enum, which tsc forbids, is the shape under test\nenum E { A = "at" } E.A = other; use([1][E.A]);', null],
  ['deleted enum key value', '// @ts-expect-error a write to an enum, which tsc forbids, is the shape under test\nenum E { A = "at" } delete E.A; use([1][E.A]);', null],
  ['absent enum key value', '// @ts-expect-error the member read is the probe, and the right answer is a type without it\nenum E { A = "at" } use([1][E.missing]);', null],
]) runBoth(label, source, (adapter, program, name) => {
  collectFileCensus(program.node, [escapedCtorReferencesReducer()]);
  const member = adapter.collectPaths(program, 'MemberExpression', p => p.node.object?.name === 'E').at(-1);
  const keys = CENSUS_KEY_NAMES.get(program.node)(member.node);
  check(name, keys?.join(',') ?? null, expected);
});
runBoth('enum receiver escape without raw census', 'enum E { at = "at" } use(E.at);', (adapter, program, name) => {
  ESCAPED_CONTAINER_NAMES.set(program.node, new Set(['E']));
  const member = adapter.pickPath(program, 'MemberExpression', p => p.node.object?.name === 'E');
  const type = adapter.makeResolver().resolvePropertyObjectType(member);
  check(name, type ? type.primitive ? type.type : type.constructor : null, null);
});

// Callable-value and constructor-identity questions share a member but require separate cache modes.
runBoth('class field constructor after callable query',
  'class Box { static C = Array; } const call = Box.C(); const result = Box.C.prototype;',
  (adapter, program, name) => {
    const call = adapter.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'call');
    const result = adapter.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result');
    for (const reverse of [false, true]) {
      const resolver = adapter.makeResolver();
      if (!reverse) resolver.resolveNodeType(call.get('init'));
      const type = resolver.resolveNodeType(result.get('init'));
      if (reverse) resolver.resolveNodeType(call.get('init'));
      check(`${ name }/${ reverse ? 'constructor first' : 'callable first' }`, type?.constructor, 'Array');
    }
  });

// Only a proven intrinsic toString call has a known string return. Exercise both cache orders.
for (const key of ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf']) {
  runBoth(`inherited ${ key } read/call cache`,
    `const box = { run() { const read = this.${ key }; const call = this.${ key }(); return call; } }; box.run();`,
    (adapter, program, name) => {
      const read = adapter.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'read').get('init');
      const call = adapter.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'call').get('init');
      for (const reverse of [false, true]) {
        const resolver = adapter.makeResolver();
        const paths = reverse ? [call, read] : [read, call];
        for (const path of paths) {
          const type = resolver.resolveNodeType(path);
          check(`${ name }/${ reverse ? 'call first' : 'read first' }/${ path === read ? 'value' : 'result' }`,
            type ? type.primitive ? type.type : type.constructor : null, path === read ? 'Function' : key === 'toString' ? 'string' : null);
        }
      }
    });
}

for (const [label, source, expected] of [
  ['direct', 'const box = {}; const result = box.toString();', 'string'],
  ['anonymous', 'const result = ({}).toString();', 'string'],
  ['own method', 'const box = { toString() { return [1]; } }; const result = box.toString();', 'Array'],
  ['own function', 'const box = { toString: () => [1] }; const result = box.toString();', 'Array'],
  ['own setter', 'const box = { set toString(value) {} }; const result = box.toString();', null],
  ['unknown key', 'const box = { [key]: () => [1] }; const result = box.toString();', null],
  ['own write', 'const box = {}; box.toString = () => [1]; const result = box.toString();', null],
  ['missing callable write', 'const box = {}; box.fn = () => [1]; const result = box.fn();', 'Array'],
  ['escaped', 'const box = {}; mutate(box); const result = box.toString();', null],
  ['foreign prototype', 'const box = { __proto__: { toString() { return [1]; } } }; const result = box.toString();', null],
  ['delegating locale method', 'const box = { toString() { return [1]; } }; const result = box.toLocaleString();', null],
]) runBoth(`inherited call ${ label }`, source, (adapter, program, name) => {
  const path = adapter.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result').get('init');
  const type = adapter.makeResolver().resolveNodeType(path);
  check(name, type ? type.primitive ? type.type : type.constructor : null, expected);
});

// Unknown computed keys leave explicit slots intact, including deliberate runtime collisions.
// Resolved keys still decide precedence; the type model does not promise disjoint runtime keys.
for (const [label, properties, setup, expected, rejected] of [
  ['literal-returning function data', 'rows: [1], [key()]: "ab"', 'function key() { return "rows"; }', 'string'],
  ['literal-returning function getter', 'rows: [1], get [key()]() { return "ab"; }', 'function key() { return "rows"; }', 'string'],
  ['literal-returning function method', 'rows: [1], [key()]() {}', 'function key() { return "rows"; }', 'Function'],
  ['opaque call key', 'rows: [1], [key(value)]: "ab"', 'function key(value) { return value; }', 'Array'],
  ['effectful literal return', 'rows: [1], [key()]: "ab"', 'function key() { effect(); return "rows"; }', 'string'],
  ['branching call key', 'rows: [1], [key()]: "ab"', 'function key() { if (cond) return "rows"; return "other"; }', 'Array'],
  ['async call key', 'rows: [1], [key()]: "ab"', 'async function key() { return "rows"; }', 'Array', COMPUTED_KEY],
  ['generator call key', 'rows: [1], [key()]: "ab"', 'function * key() { return "rows"; }', 'Array', COMPUTED_KEY],
  ['written call key', 'rows: [1], [key()]: "ab"', 'function key() { return "rows"; } key = other;', 'Array', FUNCTION_WRITE],
  ['symbol-returning call key', 'rows: [1], [key()]: "ab"', 'function key() { return Symbol(); }', 'Array'],
  ['known later key', 'rows: [1], [key]: "ab"', 'const key = "rows";', 'string', KEY_COLLISION],
  ['known earlier key', '[key]: "ab", rows: [1]', 'const key = "rows";', 'Array', KEY_COLLISION],
  ['symbol key', 'rows: [1], [key]: "ab"', 'const key = Symbol();', 'Array'],
  ['nullable symbol key', 'undefined: [1], rows: [1], [key]: "ab"', 'const key = cond ? Symbol() : void 0;', 'Array'],
  ['computed getter pair', 'get [key]() { return [1]; }, set rows(value) {}', 'const key = "rows";', 'Array'],
  ['literal-returning function getter pair', 'get [key()]() { return [1]; }, set rows(value) {}', 'function key() { return "rows"; }', 'Array'],
]) runBoth(`indexed object key ${ label }`, `
  function pick<T extends { rows: unknown }>(o: T): T["rows"] { return o.rows; }
  ${ expectError(rejected) }${ setup } const result = pick({ ${ properties } });`, (adapter, program, name) => {
  const path = adapter.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result').get('init');
  const type = adapter.makeResolver().resolveNodeType(path);
  check(name, type ? type.primitive ? type.type : type.constructor : null, expected);
});

runBoth('inherited call cache resets prototype mutation facts', 'const box = {}; const result = box.toString();',
  (adapter, program, name) => {
    const path = adapter.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result').get('init');
    let mutated = false;
    const resolver = adapter.makeResolver({ isMutatedStatic: () => mutated });
    check(`${ name }/pristine`, resolver.resolveNodeType(path)?.type, 'string');
    mutated = true;
    resolver.reset();
    check(`${ name }/mutated`, resolver.resolveNodeType(path), null);
    mutated = false;
    resolver.reset();
    check(`${ name }/restored`, resolver.resolveNodeType(path)?.type, 'string');
  });

for (const [label, declaration, argument] of [
  ['declaration', 'function pick<T extends { rows: unknown }>(o: T): T["rows"] { return o.rows; }', 'box'],
  ['arrow', 'const pick = <T extends { rows: unknown }>(o: T): T["rows"] => o.rows;', 'box'],
  ['expression alias', 'const read = function <T extends { rows: unknown }>(o: T): T["rows"] { return o.rows; }; const pick = read;', 'box'],
  ['wrapped argument', 'function pick<T extends { rows: unknown }>(o: T): T["rows"] { return o.rows; }', 'box as typeof box'],
  ['optional call', 'function pick<T extends { rows: unknown }>(o: T): T["rows"] { return o.rows; }', 'box'],
  ['computed read', 'function pick<T extends { rows: unknown }>(o: T): T["rows"] { return o["rows"]; }', 'box'],
  ['optional read', 'function pick<T extends { rows: unknown }>(o: T): T["rows"] { return o?.rows; }', 'box'],
  ['this parameter', 'function pick<T extends { rows: unknown }>(this: void, o: T): T["rows"] { return o.rows; }', 'box'],
  ['directive', 'function pick<T extends { rows: unknown }>(o: T): T["rows"] { "use strict"; return o.rows; }', 'box'],
]) runBoth(`indexed local reader ${ label }`, `
  ${ declaration }
  const box = { rows: [8, 9] } as const;
  const result = pick${ label === 'optional call' ? '?.' : '' }(${ argument });`, (adapter, program, name) => {
  const path = adapter.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result').get('init');
  check(name, adapter.makeResolver().resolveNodeType(path)?.constructor ?? null, 'Array');
});

for (const [label, body, params] of [
  ['member write', 'o.rows = "ab"; return o.rows;', 'o: T'],
  ['member delete', 'delete o.rows; return o.rows;', 'o: T'],
  ['alias write', 'const alias = o; alias.rows = "ab"; return o.rows;', 'o: T'],
  ['handout', 'mutate(o); return o.rows;', 'o: T'],
  ['arguments write', 'arguments[0].rows = "ab"; return o.rows;', 'o: T'],
  ['parameter write', 'o = other; return o.rows;', 'o: T'],
  ['default handout', 'return o.rows;', 'o: T, second = mutate(o)'],
]) runBoth(`indexed unsafe reader ${ label }`, `
  declare const other: any; declare function mutate(value: unknown): unknown;
  function pick<T extends { rows?: unknown }>(${ params }): T["rows"] { ${ body } }
  const box = { rows: [8, 9] }; const result = pick(box);`, (adapter, program, name) => {
  const path = adapter.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result').get('init');
  check(name, adapter.makeResolver().resolveNodeType(path), null);
});

runBoth('local reader preserves later ordinary field reads', `
  function pick(o: { rows: unknown }) { return o.rows; }
  const box = { rows: [8, 9] }; void pick(box); const result = box.rows;`, (adapter, program, name) => {
  const path = adapter.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result').get('init');
  check(name, adapter.makeResolver().resolveNodeType(path)?.constructor ?? null, 'Array');
});

runBoth('prototype gate keeps discarded static value readers', `
  class Box { static rows = [8, 9]; data = 0; read() { return this.data; } }
  Object.values(Box); const result = Box.rows;`, (adapter, program, name) => {
  const path = adapter.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result').get('init');
  check(name, adapter.makeResolver().resolveNodeType(path)?.constructor ?? null, 'Array');
});

runBoth('local reader retains the class prototype handout gate', `
  function pick(o) { return o.prototype; }
  class Box { static rows = [8, 9]; data = 0; read() { return this.data; } }
  const held = pick(Box); const result = Box.rows;`, (adapter, program, name) => {
  const path = adapter.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result').get('init');
  check(name, adapter.makeResolver().resolveNodeType(path), null);
});

for (const key of ['prototype', '__proto__']) for (const [label, methods] of [
  ['no methods', ''],
  ['instance method', 'data = 0; read() { return this.data; }'],
  ['static method', 'static data = 0; static read() { return this.data; }'],
]) runBoth(`local class reader ${ key }/${ label }`, `
  function pick(o) { return o.${ key }; }
  ${ key === '__proto__' ? 'class Base { static rows = [8, 9]; }' : '' }
  class Box ${ key === '__proto__' ? 'extends Base' : '' } {
    ${ key === 'prototype' ? 'static rows = [8, 9];' : '' } ${ methods }
  }
  const held: any = pick(Box);
  held.${ key === 'prototype' ? 'constructor.' : '' }rows = "ab";
  const result = Box.rows;`, (adapter, program, name) => {
  const path = adapter.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result').get('init');
  check(name, adapter.makeResolver().resolveNodeType(path), null);
});

runBoth('local reader pairs each argument slot and invocation', `
  function pick<T extends { rows: unknown }>(unused: unknown, o: T): T["rows"] { return o.rows; }
  const array = { rows: [8, 9] }; const string = { rows: "ab" };
  const arrayResult = pick(0, array); const stringResult = pick(0, string);`, (adapter, program, name) => {
  const resolver = adapter.makeResolver();
  for (const [binding, expected] of [['arrayResult', 'Array'], ['stringResult', 'string']]) {
    const path = adapter.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === binding).get('init');
    const type = resolver.resolveNodeType(path);
    check(`${ name }/${ binding }`, type ? type.primitive ? type.type : type.constructor : null, expected);
  }
});

for (const [label, properties, tail] of [
  ['written data', 'rows: [1]', 'box.rows = "ab";'],
  ['written computed data', '[key]: [1]', 'box.rows = "ab";'],
  ['escaped data', 'rows: [1]', 'mutate(box);'],
  ['escaped computed data', '[key]: [1]', 'mutate(box);'],
  ['written intermediate', 'inner: { rows: [1] }', 'box.inner = { rows: "ab" };'],
]) for (const argument of ['box', 'box as typeof box', 'box!']) runBoth(`indexed argument flow ${ label }/${ argument }`, `
  function pick<T extends { rows: unknown }>(o: T): T["rows"] { return o.rows; }
  function deep<T extends { inner: { rows: unknown } }>(o: T): T["inner"]["rows"] { return o.inner.rows; }
  const key = "rows"; const box: any = { ${ properties } }; ${ tail }
  const result = ${ label === 'written intermediate' ? 'deep' : 'pick' }(${ argument });`, (adapter, program, name) => {
  const path = adapter.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result').get('init');
  check(name, adapter.makeResolver().resolveNodeType(path), null);
});

// Canonical tuple indexes retain their positional type.
// The non-canonical generic keys deliberately exercise inputs TypeScript rejects.
for (const [key, expected, rejected] of [['1', 'Array'], ['1.0', null, TUPLE_INDEX], ['01', null, TUPLE_INDEX], ['', null, TUPLE_INDEX]]) {
  runBoth(`indexed tuple constraint ${ key }`, `
    ${ expectError(rejected) }declare function pick<T extends [string, string[]]>(o: T): T["${ key }"];
    const box: [string, string[]] = ["a", ["b"]]; const result = pick(box);`, (adapter, program, name) => {
    const path = adapter.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result').get('init');
    check(name, adapter.makeResolver().resolveNodeType(path)?.constructor ?? null, expected);
  });
}

// Array argument prefixes retain the positional descent used before object writer checks.
runBoth('indexed array prefix', `
  function pick<T extends [{ rows: unknown }]>(o: T): T["0"]["rows"] { return o[0].rows; }
  const result = pick([{ rows: [8, 9] }]);`, (adapter, program, name) => {
  const path = adapter.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result').get('init');
  check(name, adapter.makeResolver().resolveNodeType(path)?.constructor, 'Array');
});

// Hints name injected imports and in-place generated references before their bindings exist.
// The unbound forms are intermediate plugin trees, which TypeScript intentionally rejects.
for (const [label, source, hint, entry, expected] of [
  ['imported call', 'import Ctor from "@core-js/pure/actual/symbol/constructor"; const result = Ctor();', 'Symbol', 'symbol/constructor', 'symbol'],
  ['generated call', 'const result = Ctor();', 'Symbol', 'symbol/constructor', 'symbol'],
  ['wrapped call', 'const result = (Ctor as any)();', 'Symbol', 'symbol/constructor', 'symbol'],
  ['imported construction', 'import Ctor from "@core-js/pure/actual/map/constructor"; const result = new Ctor();', 'Map', 'map/constructor', 'Map'],
  ['static helper', 'const result = Ctor({});', 'Object', 'object/keys', 'Array'],
  ['unknown entry', 'const result = Ctor();', 'Symbol', 'symbol/custom', null],
]) runBoth(`hinted constructor ${ label }`, source, (adapter, program, name) => {
  const path = adapter.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result').get('init');
  const type = adapter.makeResolver({
    getPolyfillBindingHint: (scope, key) => key === 'Ctor' ? hint : null,
    getPolyfillBindingEntry: (scope, key) => key === 'Ctor' ? entry : null,
  }).resolveNodeType(path);
  check(name, type ? type.primitive ? type.type : type.constructor : null, expected);
});

runBoth('inherited member cache resets mutation facts', 'const box = {}; const result = box.toString;',
  (adapter, program, name) => {
    const path = adapter.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result').get('init');
    let mutated = false;
    const resolver = adapter.makeResolver({ isMutatedStatic: () => mutated });
    check(`${ name }/pristine`, resolver.resolveNodeType(path)?.constructor, 'Function');
    mutated = true;
    resolver.reset();
    check(`${ name }/mutated`, resolver.resolveNodeType(path), null);
    mutated = false;
    resolver.reset();
    check(`${ name }/restored`, resolver.resolveNodeType(path)?.constructor, 'Function');
  });

for (const calls of [false, true]) runBoth(`inherited member proof scans once per mode/${ calls }`,
  `const box = { ${ Array.from({ length: 64 }, (unused, index) => `k${ index }: 0`).join(', ') } };
    ${ 'use(box.toString);'.repeat(64) } ${ calls ? 'use(box.toString());'.repeat(64) : '' }`,
  (adapter, program, name) => {
    const literal = adapter.pickPath(program, 'ObjectExpression').node;
    let scans = 0;
    // Count the parsed input's property scans without instrumenting the provider.
    const ordinaryEvery = literal.properties.every;
    literal.properties.every = function (...args) {
      scans++;
      return ordinaryEvery.apply(this, args);
    };
    const resolver = adapter.makeResolver();
    for (const member of adapter.collectPaths(program, 'MemberExpression')) resolver.resolveNodeType(member);
    if (calls) for (const call of adapter.collectPaths(program, 'CallExpression', p => p.node.callee?.type === 'MemberExpression')) {
      resolver.resolveNodeType(call);
    }
    check(name, scans, calls ? 2 : 1);
  });

// These are runtime JavaScript ownership forms; class field/accessor overrides intentionally
// need not satisfy TypeScript's declaration compatibility rules. Deletion invalidates the narrow.
for (const [label, source] of [
  ['direct', 'const effects = []; const box = { __proto__: { data: "pq" }, data: [8, 9] }; delete box.data; const result = box.data;'],
  ['alias', 'const effects = []; const box = { __proto__: { data: "pq" }, data: [8, 9] }; const alias = box; delete alias.data; const result = box.data;'],
  ['caught', 'const effects = []; const box = { __proto__: { data: "pq" }, data: [8, 9] }; try { throw box; } catch (e) { delete e.data; } const result = box.data;'],
  ['caught-destructure', `const effects = [];
    const box = { __proto__: { data: "pq" }, data: [8, 9] }; try { throw { box }; } catch ({ box: e }) { delete e.data; } const result = box.data;`],
  ['object-method', 'const effects = []; const box = { __proto__: { data: "pq" }, data: [8, 9], remove() { delete this.data; } }; box.remove(); const result = box.data;'],
  ['class-instance', `const effects = [];
    class Base { get data() { return "pq"; } } class Box extends Base { data = [8, 9]; remove() { delete this.data; } } const box = new Box(); box.remove(); const result = box.data;`],
  ['class-static', `const effects = [];
    class Base { static data = "pq"; } class Box extends Base { static data = [8, 9]; static remove() { delete this.data; } } Box.remove(); const result = Box.data;`],
  ['static-block', 'const effects = []; class Base { static data = "pq"; } class Box extends Base { static data = [8, 9]; static { delete this.data; } } const result = Box.data;'],
  ['arrow-root', `const effects = [];
    class Base { static data = "pq"; } class Box extends Base { static data = [8, 9]; static remove = () => delete this.data; } Box.remove(); const result = Box.data;`],
  ['computed-key', `const effects = [];
    const box = { __proto__: { data: "pq" }, data: [8, 9] }; const key = "data"; delete box[(effects.push("delete"), key)]; const result = box.data;`],
  ['opaque-key', `const effects = [];
    const box = { __proto__: { data: "pq" }, data: [8, 9] }; function key() { effects.push("delete"); return "data"; } delete box[key()]; const result = box.data;`],
]) runBoth(`deleted field ${ label }`, source, (adapter, program, name) => {
  const result = adapter.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result');
  const type = adapter.makeResolver().resolveNodeType(result.get('init'));
  check(name, type ? type.primitive ? type.type : type.constructor : null, null);
});
// Reading a getter invokes its installed body; writes and deletes of its slot invalidate that return proof.
// Runtime JS permits getter deletion even where TypeScript treats the slot as readonly.
for (const [label, source, expected] of [
  ['direct delete', 'const box = { get data() { return [8, 9]; } }; delete box.data; const result = box.data;', null],
  ['alias delete', 'const box = { get data() { return [8, 9]; } }; const alias = box; delete alias.data; const result = box.data;', null],
  ['caught delete', 'const box = { get data() { return [8, 9]; } }; try { throw box; } catch (e) { delete e.data; } const result = box.data;', null],
  ['caught pattern delete', 'const box = { get data() { return [8, 9]; } }; try { throw { box }; } catch ({ box: e }) { delete e.data; } const result = box.data;', null],
  ['this delete', 'const box = { get data() { return [8, 9]; }, remove() { delete this.data; } }; box.remove(); const result = box.data;', null],
  ['defined value', 'const box = { get data() { return [8, 9]; } }; Object.defineProperty(box, "data", { value: "pq" }); const result = box.data;', null],
  ['reflect value', 'const box = { get data() { return [8, 9]; } }; Reflect.defineProperty(box, "data", { value: "pq" }); const result = box.data;', null],
  ['read only', 'const box = { get data() { return [8, 9]; } }; const result = box.data;', 'Array'],
  ['captured result writer', `function read() {
    const inner = { value: [] }; for (box.inner.value.at of [0]) { const result = box.inner.value; return result; }
  } const inner = { get value() { return [3, 4]; } }; const box = { inner }; read();`, 'Array'],
]) runBoth(`getter ${ label }`, source, (adapter, program, name) => {
  const result = adapter.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result');
  const type = adapter.makeResolver().resolveNodeType(result.get('init'));
  check(name, type ? type.primitive ? type.type : type.constructor : null, expected);
});

// Getter reads are implicit calls: writes beyond them affect the returned value, not the owner.
// Mutation rows deliberately exercise runtime JS forms that TS rejects.
// Descriptor reset rows also use duplicate properties that TS rejects but runtime JS accepts.
// Named array element lookup is already opaque for methods and getters, even without a write.
for (const [carrier, setup, receiver, expected] of [
  ['named object', 'const inner = { get value() { return [3, 4]; } }; const box = { inner };', 'box.inner', 'Array'],
  ['inline object', 'const box = { inner: { get value() { return [3, 4]; } } };', 'box.inner', 'Array'],
  ['array', 'const inner = { get value() { return [3, 4]; } }; const box = [inner];', 'box[0]', null],
  ['nested object', 'const inner = { get value() { return [3, 4]; } }; const box = { wrap: { inner } };', 'box.wrap.inner', 'Array'],
]) {
  for (const [write, statement] of [
    ['read', ''],
    ['assignment', `${ receiver }.value.at = 0;`],
    ['delete', `delete ${ receiver }.value.at;`],
    ['for-of', `for (${ receiver }.value.at of [0]) {}`],
    ['pattern', `[${ receiver }.value.at] = [0];`],
  ]) runBoth(`getter result ${ carrier } ${ write }`, `${ setup } ${ statement } const result = ${ receiver }.value;`, (adapter, program, name) => {
    const result = adapter.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result');
    const type = adapter.makeResolver().resolveNodeType(result.get('init'));
    check(name, type ? type.primitive ? type.type : type.constructor : null, expected);
  });
}
for (const [label, member, write, expected] of [
  ['paired setter', 'get value() { return [3, 4]; }, set value(v) {}', 'box.inner.value.at = 0;', 'Array'],
  ['getter after spread', '...other, get value() { return [3, 4]; }', 'box.inner.value.at = 0;', 'Array'],
  ['getter after unknown key', '[key]: 0, get value() { return [3, 4]; }', 'box.inner.value.at = 0;', 'Array'],
  ['string result', 'get value() { return "pq"; }', 'delete box.inner.value.at;', 'string'],
  ['computed read', 'get value() { return [3, 4]; }', 'const key = "value"; box.inner[key].at = 0;', 'Array'],
  ['computed getter', 'get ["value"]() { return [3, 4]; }', 'box.inner.value.at = 0;', 'Array'],
  ['optional read', 'get value() { return [3, 4]; }', '(box.inner?.value).at = 0;', 'Array'],
  ['returned this', 'get value() { return this; }', 'delete box.inner.value.value;', null],
  ['returned owner binding', 'get value() { return inner; }', 'delete box.inner.value.value;', null],
  ['body deletes slot', 'get value() { delete this.value; return [3, 4]; }', 'box.inner.value.at = 0;', null],
  ['body exposes owner', 'get value() { mutate(this); return [3, 4]; }', 'box.inner.value.at = 0;', null],
  ['getter before data', 'get value() { return [3, 4]; }, value: [1]', 'box.inner.value.at = 0;', null],
  ['getter before data and setter', 'get value() { return [3, 4]; }, value: [1], set value(v) {}', 'box.inner.value.at = 0;', null],
  ['getter before spread', 'get value() { return [3, 4]; }, ...other', 'box.inner.value.at = 0;', null],
  ['getter before unknown key', 'get value() { return [3, 4]; }, [key]: [1]', 'box.inner.value.at = 0;', 'Array'],
  ['direct slot write', 'get value() { return [3, 4]; }', 'box.inner.value = "pq";', null],
  ['direct slot delete', 'get value() { return [3, 4]; }', 'delete box.inner.value;', null],
  ['descriptor replacement', 'get value() { return [3, 4]; }', 'Object.defineProperty(box.inner, "value", { value: "pq" });', null],
  ['unknown handout', 'get value() { return [3, 4]; }', 'mutate(box.inner);', null],
]) runBoth(`getter boundary ${ label }`, `const inner = { ${ member } }; const box = { inner }; ${ write } const result = box.inner.value;`, (adapter, program, name) => {
  const result = adapter.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result');
  const type = adapter.makeResolver().resolveNodeType(result.get('init'));
  check(name, type ? type.primitive ? type.type : type.constructor : null, expected);
});
for (const [label, source, expected] of [
  ['stored owner', `const inner = { rows: [], get value() { return this.child; } };
    inner.child = inner;
    const box = { inner };
    box.inner.value.rows = "pq";
    const result = inner.rows;`, null],
  ['ancestor returned by child getter', `const inner = { rows: [], child: { get value() { return inner; } } };
    const box = { inner };
    box.inner.child.value.rows = "pq";
    const result = inner.rows;`, null],
  ['replacement through an alias', `const inner = { get value() { return [3, 4]; } };
    const box = { wrap: { inner } };
    const alias = inner;
    Object.defineProperty(alias, "value", { value: "pq" });
    box.wrap.inner.value.extra = 0;
    const result = box.wrap.inner.value;`, null],
  ['shared returned array', `const rows = [3, 4];
    const inner = { get value() { return rows; } };
    const box = { inner };
    box.inner.value.at = 0;
    const result = box.inner.value;`, 'Array'],
  ['indexed return still reads getter', `const inner = { get value() { return { rows: [3, 4] }; } };
    function pick<T extends { value: { rows: number[] } }>(o: T): T["value"]["rows"] { return o.value.rows; }
    const result = pick(inner);`, 'Array'],
  ['indexed intermediate literal-returning key', `function key() { return "inner"; }
    function pick<T extends { inner: { rows: unknown } }>(o: T): T["inner"]["rows"] { return o.inner.rows; }
    const result = pick({ inner: { rows: [3, 4] }, [key()]: { rows: "pq" } });`, 'string'],
  ['computed data cursor keeps last definition', `const key = "a";
    const inner = { rows: [3, 4], a: { value: {} }, [key]: { get value() { return []; } } };
    const box = { inner };
    box.inner.a.value.extra = 0;
    const result = inner.rows;`, 'Array'],
  ['computed data cursor rejects overwritten getter', `const key = "a";
    const inner = { rows: [3, 4], a: { get value() { return []; } }, [key]: { value: {} } };
    const box = { inner };
    box.inner.a.value.extra = 0;
    const result = inner.rows;`, null],
  ['data sibling keeps its write boundary', `const inner = { get value() { return [3, 4]; } };
    const box = { wrap: { inner, other: { value: { extra: 0 } } } };
    box.wrap.inner.value.extra = 0;
    box.wrap.other.value.extra = 0;
    const result = box.wrap.inner.value;`, null],
  ['data cursor keeps last definition', `const inner = {
    rows: [3, 4], c: { get value() { return []; } }, a: { value: {} }, a: { get value() { return []; } },
  };
    const box = { inner };
    box.inner.c.value.extra = 0;
    box.inner.a.value.extra = 0;
    box.inner.c.value.extra = 0;
    const result = inner.rows;`, 'Array'],
  ['data cursor rejects overwritten getter', `const inner = {
    rows: [3, 4], c: { get value() { return []; } }, a: { get value() { return []; } }, a: { value: {} },
  };
    const box = { inner };
    box.inner.a.value.extra = 0;
    box.inner.c.value.extra = 0;
    box.inner.a.value.extra = 0;
    const result = inner.rows;`, null],
  ['data cursor separates literal owners', `const inner = {
    rows: [3, 4], a: { left: { get value() { return []; } } }, c: { left: { value: {} } },
  };
    const box = { inner };
    box.inner.a.left.value.extra = 0;
    box.inner.c.left.value.extra = 0;
    const result = inner.rows;`, null],
]) runBoth(`getter result alias ${ label }`, source, (adapter, program, name) => {
  const result = adapter.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result');
  const type = adapter.makeResolver().resolveNodeType(result.get('init'));
  check(name, type ? type.primitive ? type.type : type.constructor : null, expected);
});

// A setter-only own slot reads undefined and shadows the prototype. Runtime JS permits the
// duplicate member forms that reset an earlier data/getter slot, even where TS rejects them.
for (const key of ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf']) {
  for (const [label, properties, expected] of [
    ['setter only', `set ${ key }(value) {}`, 'undefined'],
    ['data then setter', `${ key }: [8, 9], set ${ key }(value) {}`, 'undefined'],
    ['getter data setter', `get ${ key }() { return [8, 9]; }, ${ key }: [1], set ${ key }(value) {}`, 'undefined'],
    ['computed setter', 'set [key](value) {}', 'undefined'],
    ['getter setter pair', `get ${ key }() { return [8, 9]; }, set ${ key }(value) {}`, 'Array'],
    ['getter repeated setters', `get ${ key }() { return [8, 9]; }, set ${ key }(value) {}, set ${ key }(value) {}`, 'Array'],
  ]) runBoth(`own ${ key } ${ label }`, `const key = "${ key }"; const box = { ${ properties } }; const result = box.${ key };`,
    (adapter, program, name) => {
      const result = adapter.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result');
      const type = adapter.makeResolver().resolveNodeType(result.get('init'));
      check(name, type ? type.primitive ? type.type : type.constructor : null, expected);
    });
}

// Defaults react to undefined, not null. Duplicate accessor/data definitions below are
// runtime JS descriptor cases, including forms TypeScript rejects as duplicate members.
for (const [label, properties, tail, expected] of [
  ['setter only', 'set toString(value) {}', '', 'Array'],
  ['data reset', 'toString: [1], set toString(value) {}', '', 'Array'],
  ['getter data reset', 'get toString() { return [1]; }, toString: [2], set toString(value) {}', '', 'Array'],
  ['computed setter', 'set [key](value) {}', '', 'Array'],
  ['quoted setter', 'set ["toString"](value) {}', '', 'Array'],
  ['setter getter pair', 'set toString(value) {}, get toString() { return "ab"; }', '', null],
  ['getter setter pair', 'get toString() { return "ab"; }, set toString(value) {}', '', null],
  ['getter repeated setters', 'get toString() { return "ab"; }, set toString(value) {}, set toString(value) {}', '', null],
  ['getter returns undefined', 'get toString() { return void 0; }', '', 'Array'],
  ['getter returns null', 'get toString() { return null; }', '', null],
  ['replaced descriptor', 'set toString(value) {}', 'Object.defineProperty(box, "toString", { value: "ab" });', null],
  ['deleted setter', 'set toString(value) {}', 'delete box.toString;', null],
  ['escaped owner', 'set toString(value) {}', 'mutate(box);', null],
  ['unknown key after setter', 'set toString(value) {}, [unknown]: "ab"', '', 'Array'],
  ['unknown getter before setter', 'get [unknown]() { return "ab"; }, set toString(value) {}', '', 'Array'],
  ['spread before setter', '...other, set toString(value) {}', '', null],
  ['spread after setter', 'set toString(value) {}, ...other', '', null],
]) runBoth(`setter receiver default ${ label }`, `const key = "toString"; const box = { ${ properties } };
  ${ tail } const { toString: { includes } = [8, 9] } = box;`, (adapter, program, name) => {
  const property = adapter.pickPath(program, 'ObjectProperty', p => p.node.key?.name === 'includes')
    ?? adapter.pickPath(program, 'Property', p => p.node.key?.name === 'includes');
  const type = adapter.makeResolver().resolvePropertyObjectType(property);
  check(name, type ? type.primitive ? type.type : type.constructor : null, expected);
});

for (const [label, source, expected] of [
  ['flat binding', 'const { data: value = [] } = { set data(value) {} }; const result = value;', 'Array'],
  ['setter call result', 'const box = { set data(value) {} }; const result = box.data();', null],
  ['loop computed paired getter prefix', `const key = "wrap";
    for (const { wrap: { data: { includes } = [8, 9] } } of [{
      get [key]() { return { set data(value) {} }; }, set wrap(value) {},
    }]) {}`, 'Array'],
  ['loop setter', 'for (const { data: { includes } = [] } of [{ set data(value) {} }]) {}', 'Array'],
  ['loop missing', 'for (const { data: { includes } = [] } of [{}]) {}', 'Array'],
  ['loop unknown key', 'for (const { data: { includes } = [] } of [{ [unknown]: "ab" }]) {}', null],
  ['loop spread', 'for (const { data: { includes } = [] } of [{ ...other }]) {}', null],
]) runBoth(`setter default host ${ label }`, source, (adapter, program, name) => {
  const resolver = adapter.makeResolver();
  const result = adapter.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result');
  const property = result ? null : adapter.pickPath(program, 'ObjectProperty', p => p.node.key?.name === 'includes')
    ?? adapter.pickPath(program, 'Property', p => p.node.key?.name === 'includes');
  if (!result && !property) throw new Error('Expected a binding or receiver query');
  const type = result ? resolver.resolveNodeType(result.get('init')) : resolver.resolvePropertyObjectType(property);
  check(name, type ? type.primitive ? type.type : type.constructor : null, expected);
});

// Transparent wrappers at a carrier's intermediate step retain the named source's writers.
for (const [wrapper, argument] of [
  ['cast', 'box as typeof box'],
  ['non-null', 'box!'],
  ['satisfies', 'box satisfies { rows: any }'],
]) for (const [carrier, pattern] of [
  ['array element', `const [{ rows }] = [(${ argument })];`],
  ['object value', `const { slot: { rows } } = { slot: (${ argument }) };`],
]) for (const written of [false, true]) {
  runBoth(`wrapped carrier ${ carrier }/${ wrapper }/${ written ? 'written' : 'pristine' }`, `
    const box: any = { rows: [8, 9] };
    ${ written ? 'box.rows = "ab";' : '' }
    ${ pattern }
    const result = rows;`, (adapter, program, name) => {
    const path = adapter.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result').get('init');
    const type = adapter.makeResolver().resolveNodeType(path);
    check(name, type ? type.primitive ? type.type : type.constructor : null, written ? null : 'Array');
  });
}
// A sibling binding does not receive the tracked owner. Match the literal's own slot,
// rather than treating every target at the same pattern depth as an alias. Opaque names
// stand for external inputs. These JS rows deliberately keep the extra method that TS's
// contextual destructuring rejects; for-of also needs tuple context there. Independent
// tsc checks with the complete carrier shape verify the same number[] receiver type.
const inlineHolder = '{ rows: [1, 2], read() { const result = this.rows; return result; } }';
for (const [label, shape, expected, mutatedIterator = false] of [
  ['first positional sibling', 'const [{ rows }, tail] = [HOLDER, 7]; sink(tail);', 'Array'],
  ['later positional sibling', 'const [head, { rows }] = [7, HOLDER]; sink(head);', 'Array'],
  ['positional hole', 'const [, { rows }, tail] = [, HOLDER, 7]; sink(tail);', 'Array'],
  ['nested positional sibling', 'const [[{ rows }, inner], tail] = [[HOLDER, 7], 9]; sink(inner, tail);', 'Array'],
  ['keyed positional sibling', 'const [{ box: { rows } }, tail] = [{ box: HOLDER }, 7]; sink(tail);', 'Array'],
  ['keyed sibling', 'const { box: { rows }, tail } = { box: HOLDER, tail: 7 }; sink(tail);', 'Array'],
  ['assignment sibling', 'let rows, tail; ([{ rows }, tail] = [HOLDER, 7]); sink(tail);', 'Array'],
  ['for-of sibling', 'for (const [{ rows }, tail] of [[HOLDER, 7]]) sink(tail);', 'Array'],
  ['for-of assignment sibling', 'let rows, tail; for ([{ rows }, tail] of [[HOLDER, 7]]) sink(tail);', 'Array'],
  ['catch sibling', 'try { throw [HOLDER, 7]; } catch ([{ rows }, tail]) { sink(tail); }', 'Array'],
  ['parameter default sibling', 'function f([{ rows }, tail] = [HOLDER, 7]) { sink(tail); } f();', 'Array'],
  ['property default sibling', 'const { missing: [{ rows }, tail] = [HOLDER, 7] } = {}; sink(tail);', 'Array'],
  ['other owner method', 'const [{ rows }, { read }] = [HOLDER, { read() {} }]; sink(read);', 'Array'],
  ['matching positional alias', 'const [held, tail] = [HOLDER, 7]; sink(held);', null],
  ['matching keyed alias', 'const { box: held, tail } = { box: HOLDER, tail: 7 }; sink(held);', null],
  ['matching method', 'const [{ read }, tail] = [HOLDER, 7]; sink(read);', null],
  ['rest carrier', 'const [...held] = [HOLDER, 7]; sink(held);', null],
  ['unknown key', 'const { [key]: held, tail } = { box: HOLDER, tail: 7 }; sink(held);', null],
  ['spread source', 'const [{ rows }, tail] = [...unknown, HOLDER, 7]; sink(tail);', null],
  ['named array stays wildcard', 'const source = [HOLDER, 7]; const [{ rows }, tail] = source; sink(tail);', null],
  ['reordered array stays wildcard', 'const source = [HOLDER, 7]; source.reverse(); const [{ rows }, tail] = source; sink(tail);', null],
  ['stored expression stays wildcard', 'let source; const [{ rows }, tail] = source = [HOLDER, 7]; sink(tail);', null],
  ['member target stays conservative', 'let rows; const target = { set tail(value) {} }; ([{ rows }, target.tail] = [HOLDER, 7]);', null],
  ['repeated assignment target', 'let held; ([held, held] = [7, HOLDER]); sink(held);', null],
  ['modified iterator stays wildcard', 'const [{ rows }, tail] = [HOLDER, 7]; sink(tail);', null, true],
]) runBoth(`anonymous owner ${ label }`, shape.replace('HOLDER', inlineHolder), (adapter, program, name) => {
  const result = adapter.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result');
  const type = adapter.makeResolver({
    isMutatedStatic: (owner, key) => mutatedIterator && owner === 'Array.prototype' && key === 'Symbol.iterator',
  }).resolveNodeType(result.get('init'));
  check(name, type ? type.primitive ? type.type : type.constructor : null, expected);
});

// The same closure pairs a constructor's proxy slot before resolving its prototype methods.
for (const [label, source] of [
  ['declaration', 'const [{ w: [{ prototype: { at, flat } }] }, tail] = [{ w: [Array] }, 7]; use(at, flat, tail);'],
  ['assignment', 'let at, flat, tail; ([{ w: [{ prototype: { at, flat } }] }, tail] = [{ w: [Array] }, 7]); use(at, flat, tail);'],
]) runBoth(`constructor carrier sibling ${ label }`, source, (adapter, program, name) => {
  const properties = adapter.collectPaths(program, adapter.name === 'babel' ? 'ObjectProperty' : 'Property',
    p => p.parentPath.node.type === 'ObjectPattern' && ['at', 'flat'].includes(p.node.key?.name));
  const resolver = adapter.makeResolver();
  for (const property of properties) {
    const type = resolver.resolvePropertyObjectType(property);
    check(`${ name }/${ property.node.key.name }`, type ? type.primitive ? type.type : type.constructor : null, 'Array');
  }
});

// A closed parameter keeps the caller's TypeScript slot type after a legal same-slot write.
// A neighboring write leaves the same proof intact; an unknown annotation invents no family.
for (const [label, source, expected] of [
  [
    'typed same-slot write',
    'let box: { row: string } = { row: "xy" }; box.row = "ab"; function read({ row: { at } }) {} read(box);',
    'string',
  ],
  [
    'typed neighboring write',
    'let box: { row: string, other: number } = { row: "xy", other: 0 }; box.other = 1; function read({ row: { at } }) {} read(box);',
    'string',
  ],
  [
    'unknown same-slot write',
    '// @ts-expect-error the caller hands over a slot its annotation leaves unknown, on purpose\n'
    + 'let box: { row: unknown } = { row: [1] }; box.row = "ab"; function read({ row: { at } }) {} read(box);',
    null,
  ],
  [
    'typed string slot write with inner default',
    'let box: { row: string } = { row: "xy" }; box.row = "ab"; function read({ row: { at } = "cd" }) {} read(box);',
    'string',
  ],
  [
    'typed array slot write with inner default',
    'let box: { row: number[] } = { row: [1] }; box.row = [2]; function read({ row: { at } = [3] }) {} read(box);',
    'Array',
  ],
  [
    'unannotated slot write with inner default',
    'let box = { row: "xy" }; box.row = "ab"; function read({ row: { at } = "cd" }) {} read(box);',
    null,
  ],
  [
    'undefined literal slot written before inner default',
    'const box = { row: undefined }; box.row = "ab"; function read({ row: { at } = [1] }) {} read(box);',
    null,
  ],
  [
    'direct undefined slot fires inner default',
    'function read({ row: { at } = [1] }) {} read({ row: undefined });',
    'Array',
  ],
  [
    'direct defined slot skips inner default',
    'function read({ row: { at } = [1] }) {} read({ row: "ab" });',
    'string',
  ],
]) runBoth(`parameter caller annotation ${ label }`, source, (adapter, program, name) => {
  const census = collectFileCensus(program.node, [escapedCtorReferencesReducer(), mutationShapesReducer()]);
  const reader = (adapter.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    getWrittenContainerSlots: () => census.writtenContainerSlots,
    getContainerSlotIndex: () => census.containerSlotIndex,
  });
  const property = adapter.pickPath(program, adapter.name === 'babel' ? 'ObjectProperty' : 'Property',
    path => path.node.value?.name === 'at');
  const type = adapter.makeResolver({
    isWrittenContainerSlot: (...args) => reader.isWrittenContainerSlot(...args),
  }).resolvePropertyObjectType(property);
  check(name, type ? type.primitive ? type.type : type.constructor : null, expected);
});

// A supplied argument minted by a sibling AST plugin has no source spans. `pathOfNode` cannot
// anchor it, so only the caller pairing's argument identity distinguishes it from an omitted slot.
// Keep that receiver unknown instead of projecting `null` and pretending the parameter default ran.
for (const [label, argumentSource, mintedFamily, expected] of [
  ['source-spanned String', '"xy"', null, 'string'],
  ['source-spanned Array', '[]', null, 'Array'],
  ['spanless String', '[]', 'String', null],
  ['spanless Array', '[]', 'Array', null],
]) runBoth(`parameter caller argument anchor/${ label }`,
  `function read({ at } = []) {} read(${ argumentSource });`, (adapter, program, name) => {
    const parameter = adapter.pickPath(program, 'AssignmentPattern', path => path.parentPath?.node?.params?.includes(path.node));
    const property = adapter.pickPath(program, adapter.name === 'babel' ? 'ObjectProperty' : 'Property',
      path => path.parentPath?.node?.type === 'ObjectPattern' && path.node.key?.name === 'at');
    const callPath = adapter.pickPath(program, 'CallExpression', path => path.node.callee?.name === 'read');
    if (mintedFamily) callPath.node.arguments[0] = adapter.name === 'babel'
      ? mintedFamily === 'String' ? { type: 'StringLiteral', value: 'xy' } : { type: 'ArrayExpression', elements: [] }
      : mintedFamily === 'String' ? { type: 'Literal', value: 'xy', raw: '"xy"' } : { type: 'ArrayExpression', elements: [] };
    const resolver = adapter.makeResolver();
    const sites = resolver.parameterCallSites(parameter);
    const argument = resolveCallArgument(sites[0].pairing.args ?? [], sites[0].argIndex);
    check(`${ name }/caller identity`, argument, callPath.node.arguments[0]);
    check(`${ name }/source anchor`, Boolean(pathOfNode(sites[0].callPath, argument)?.node), !mintedFamily);
    const type = resolver.resolvePropertyObjectType(property);
    check(`${ name }/receiver`, type ? type.primitive ? type.type : type.constructor : null, expected);
  });

// A nested parameter reads its written container annotation in that declaration's scope.
// Supplied arguments and runtime defaults remain separate arms, including explicit any casts.
for (const [label, source, expected, expectedHints] of [
  [
    'open string',
    'export function read({row:{at}}:{row:string}){return at}',
    'string',
    ['string'],
  ],
  [
    'open array',
    'export function read({row:{includes}}:{row:number[]}){return includes}',
    'Array',
    ['array'],
  ],
  [
    'local alias scope',
    'type Fields={row:number[]};export function owner(){type Fields={row:string};return function read({row:{at}}:Fields){return at}}',
    'string',
    ['string'],
  ],
  [
    'supplied skips default',
    'function read({row:{at}}:{row:string}={row:[1]} as any){return at}read({row:"ab"});',
    'string',
    ['string'],
  ],
  [
    'omitted selects default',
    'function read({row:{at}}:{row:string}={row:[1]} as any){return at}read();',
    'Array',
    ['array'],
  ],
  [
    'open default source arm',
    'export function read({row:{at}}:{row:string}={row:[1]} as any){return at}',
    null,
    ['array', 'string'],
  ],
  [
    'inner default source arm',
    'export function read({row:{at}=[1] as any}:{row:string|undefined}){return at}',
    null,
    ['array', 'string'],
  ],
  [
    'unknown field keeps supplied open',
    'export function read({row:{at}="ab"}:{row:any}={row:"ab"}){return at}',
    null,
    null,
  ],
  [
    'unknown root keeps supplied open',
    'export function read({row:{at}}:any={row:"ab"}){return at}',
    null,
    null,
  ],
  [
    'closed caller sibling',
    'let box:{row:string}={row:"ab"};box.row="cd";function read({row:{at}}){return at}read(box);',
    'string',
    ['string'],
  ],
  [
    'arguments does not erase declaration type',
    'export function read({row:{at}}:{row:string}){return[at,arguments.length]}',
    'string',
    ['string'],
  ],
  [
    'untyped arguments remain open',
    'function read({row:{at}}){return[at,arguments.length]}read({row:"ab"});',
    null,
    null,
  ],
  [
    'open union default',
    'export function read({row:{at}}:{row:string|number[]}={row:[1]}){return at}',
    null,
    ['array', 'string'],
  ],
  [
    'existing annotated default source',
    'declare const value:{row:string};export function read({row:{at}}=value){return at}',
    'string',
    ['string'],
  ],
  [
    'existing unknown default source',
    'declare const value:any;export function read({row:{at}}=value){return at}',
    null,
    null,
  ],
]) runBoth(`nested parameter annotation/${ label }`, source, (adapter, program, name) => {
  const property = adapter.pickPath(program, adapter.name === 'babel' ? 'ObjectProperty' : 'Property',
    path => path.parentPath.node.type === 'ObjectPattern' && ['at', 'includes'].includes(path.node.value?.name));
  const resolver = adapter.makeResolver();
  const type = resolver.resolvePropertyObjectType(property);
  const hints = resolver.resolvePropertyUnionHints(property);
  checkDeep(name, [type ? type.primitive ? type.type : type.constructor : null, hints ? [...hints].sort() : null],
    [expected, expectedHints]);
});

finish();
