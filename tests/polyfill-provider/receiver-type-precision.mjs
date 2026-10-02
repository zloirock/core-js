// Receiver proofs must retain their mutation, ownership and caller boundaries.
// Unknown computed keys retain explicit slots as a deliberate precision policy.
// Sources intentionally read absent members; runtime JS accepts these reads even where TS rejects them.
import { createChecker } from './harness.mjs';
import { CENSUS_KEY_NAMES, collectFileCensus, ESCAPED_CONTAINER_NAMES } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { escapedCtorReferencesReducer } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';
import { resolveKey } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { createMemberResolve } from '../../packages/core-js-polyfill-provider/resolve-node-type/member-resolve.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';

const { check, runBoth, finish } = createChecker('receiver-type-precision');
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
  ['enum member written', 'enum E { at = "at" } E.at = other; const result = E.at;', null],
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
  ['overridden parameter default', 'function f({ at } = [[1]][0]) { return at; } f("ab");', null],
  ['escaped parameter default', 'function f({ at } = [[1]][0]) { return at; } use(f);', null],
]) runBoth(label, source, (adapter, program, name) => {
  const property = adapter.pickPath(program, 'ObjectProperty', p => p.node.key?.name === 'at')
    ?? adapter.pickPath(program, 'Property', p => p.node.key?.name === 'at');
  const type = adapter.makeResolver().resolvePropertyObjectType(property);
  check(name, type ? type.primitive ? type.type : type.constructor : null, expected);
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
  ['enum own receiver written', 'enum E { at = "at" } E.at = other; use(E.at);', 'Object'],
  ['enum implicit own receiver', 'enum E { at } use(E.at);', 'Object'],
  ['qualified enum own receiver written', 'namespace N { export enum E { at = "at" } } N.E.at = other; use(N.E.at);', 'Object'],
  ['enum receiver reassigned', 'enum E { at = "at" } E = other; use(E.at);', null],
  ['qualified enum receiver reassigned', 'namespace N { export enum E { at = "at" } } N.E = other; use(N.E.at);', null],
  ['enum own receiver escaped', 'enum E { at = "at" } mutate(E); use(E.at);', null],
  ['enum member deleted', 'enum E { at = "at" } delete E.at; use(E.at);', null],
  ['enum unknown member deleted', 'enum E { at = "at" } delete E[key]; use(E.at);', null],
  ['enum alias member deleted', 'enum E { at = "at" } const alias = E; delete alias.at; use(E.at);', null],
  ['enum member updated', 'enum E { at = "at" } E.at++; use(E.at);', null],
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
  ['written enum key value', 'enum E { A = "at" } E.A = other; use([1][E.A]);', null],
  ['deleted enum key value', 'enum E { A = "at" } delete E.A; use([1][E.A]);', null],
  ['absent enum key value', 'enum E { A = "at" } use([1][E.missing]);', null],
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
for (const [label, properties, setup, expected] of [
  ['literal-returning function data', 'rows: [1], [key()]: "ab"', 'function key() { return "rows"; }', 'string'],
  ['literal-returning function getter', 'rows: [1], get [key()]() { return "ab"; }', 'function key() { return "rows"; }', 'string'],
  ['literal-returning function method', 'rows: [1], [key()]() {}', 'function key() { return "rows"; }', 'Function'],
  ['opaque call key', 'rows: [1], [key(value)]: "ab"', 'function key(value) { return value; }', 'Array'],
  ['effectful literal return', 'rows: [1], [key()]: "ab"', 'function key() { effect(); return "rows"; }', 'string'],
  ['branching call key', 'rows: [1], [key()]: "ab"', 'function key() { if (cond) return "rows"; return "other"; }', 'Array'],
  ['async call key', 'rows: [1], [key()]: "ab"', 'async function key() { return "rows"; }', 'Array'],
  ['generator call key', 'rows: [1], [key()]: "ab"', 'function * key() { return "rows"; }', 'Array'],
  ['written call key', 'rows: [1], [key()]: "ab"', 'function key() { return "rows"; } key = other;', 'Array'],
  ['symbol-returning call key', 'rows: [1], [key()]: "ab"', 'function key() { return Symbol(); }', 'Array'],
  ['known later key', 'rows: [1], [key]: "ab"', 'const key = "rows";', 'string'],
  ['known earlier key', '[key]: "ab", rows: [1]', 'const key = "rows";', 'Array'],
  ['symbol key', 'rows: [1], [key]: "ab"', 'const key = Symbol();', 'Array'],
  ['nullable symbol key', 'undefined: [1], rows: [1], [key]: "ab"', 'const key = cond ? Symbol() : void 0;', 'Array'],
  ['computed getter pair', 'get [key]() { return [1]; }, set rows(value) {}', 'const key = "rows";', 'Array'],
  ['literal-returning function getter pair', 'get [key()]() { return [1]; }, set rows(value) {}', 'function key() { return "rows"; }', 'Array'],
]) runBoth(`indexed object key ${ label }`, `
  function pick<T extends { rows: unknown }>(o: T): T["rows"] { return o.rows; }
  ${ setup } const result = pick({ ${ properties } });`, (adapter, program, name) => {
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
for (const [key, expected] of [['1', 'Array'], ['1.0', null], ['01', null], ['', null]]) {
  runBoth(`indexed tuple constraint ${ key }`, `
    declare function pick<T extends [string, string[]]>(o: T): T["${ key }"];
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
finish();
