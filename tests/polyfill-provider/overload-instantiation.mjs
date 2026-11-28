// Type instantiation precedes member projection. An overloaded call still uses its actual arguments.
import { createChecker } from './harness.mjs';

const { check, runBoth, finish } = createChecker('overload-instantiation');

function family(label, source, expected) {
  runBoth(label, `export {};\n${ source }`, (adapter, program, leg) => {
    const member = adapter.pickPath(program, 'MemberExpression', path => path.node.property?.name === 'at');
    const type = adapter.makeResolver().resolveNodeType(member.get('object'));
    check(leg, type?.primitive ? type.type : type?.constructor ?? null, expected);
  });
}

for (const [tag, expected] of [['name', 'string'], ['values', 'Array']]) {
  family(`intersection/${ tag }`, `
    type Api<K, R> = { pick(key: K): R };
    declare const api: Api<'name', string> & Api<'values', number[]>;
    api.pick('${ tag }').at(0);`, expected);
}

for (const [tag, second, expected] of [['distinct', 'number[]', null], ['same', 'string', 'string']]) {
  family(`union inside intersection/${ tag }`, `
    type Left = { pick(): string };
    type Right = { pick(): ${ second } };
    declare const api: (Left | Right) & { label: string };
    api.pick().at(0);`, expected);
}

family('a direct return selects the second argument of an explicit union', `
  function last<T>(a: T, b: T): T { return b; }
  last<string | number[]>([7], 'ab').at(0);`, 'string');
family('the same explicit union can forward an array', `
  function last<T>(a: T, b: T): T { return b; }
  last<string | number[]>('ab', [7]).at(0);`, 'Array');
family('both arms of an explicit union can reach the return', `
  declare const flag: boolean;
  function choose<T>(a: T, b: T): T { return flag ? a : b; }
  choose<string | number[]>([7], 'ab').at(0);`, null);
family('known spread positions', `
  function second<T, U>(a: T, b: U, ...rest: unknown[]): U { return b; }
  second(...[3, 'ab'] as const, [7]).at(0);`, 'string');
for (const [name, setup, expected] of [
  ['local', '', 'string'],
  ['written', 'xs[1] = [9];', null],
  ['exported', 'export { xs };', null],
  ['escaped', 'change(xs);', null],
]) {
  family(`stored spread/${ name }`, `
    declare function change(items: [string, string | number[]]): void;
    function second<T, U>(a: T, b: U, ...rest: unknown[]): U { return b; }
    const xs: [string, string | number[]] = ['ab', 'cd'];
    ${ setup }
    second(...xs, [7]).at(0);`, expected);
}

family('a projected generic return reads the stored spread in order', `
  function wrap<T, U>(a: T, b: U, ...rest: unknown[]): { value: U } { return { value: b }; }
  const xs = [2, 'ab'] as const;
  wrap(...xs, [7]).value.at(0);`, 'string');

const wrap = 'function wrap<T>(x: T): { v: T } { return { v: x }; }';
for (const [label, body, expected] of [
  ['plain object', '// @ts-expect-error at is absent from the declared type\nwrap({ a: 1 }).v.at(0);', 'Object'],
  ['array with the same property', 'wrap(Object.assign([7], { a: 1 })).v.at(0);', 'Array'],
  ['function value', '// @ts-expect-error at is absent from the declared type\nwrap(() => 1).v.at(0);', 'Function'],
  ['structural argument only', '// @ts-expect-error at is absent from the declared type\nexport function f(x: { a: number }) { return wrap(x).v.at(0); }', null],
  ['own override', 'wrap({ a: 1, at(_index: number) { return 9; } }).v.at(0);', 'Object'],
  ['stored result overwritten', "const box = wrap<any>({ a: 1 }); box.v = 'ab'; box.v.at(0);", null],
]) {
  family(`fresh parameter slot/${ label }`, `${ wrap }
${ body }`, expected);
}

family('a parameter may receive a different prototype before the return', `
  function wrap(x: any): { v: any } { Object.setPrototypeOf(x, Array.prototype); return { v: x }; }
  wrap({ 0: 11, length: 1 }).v.at(0);`, null);

family('a returned parameter keeps the same prototype guard after TypeScript erasure', `
  function wrap(x) { Object.setPrototypeOf(x, Array.prototype); return { v: x }; }
  wrap({ 0: 11, length: 1 }).v.at(0);`, null);
family('identity observations preserve the returned argument family', `
  function wrap(x) { void x; const seen = typeof x; x === null; return { v: x }; }
  wrap(Object.assign([9], { a: 1 })).v.at(0);`, 'Array');
family('coercing the parameter can change its prototype', `
  function wrap(x) { +x; return { v: x }; }
  wrap({ 0: 9, length: 1, valueOf() { Object.setPrototypeOf(this, Array.prototype); return 1; } }).v.at(0);`, null);
family('a pure getter returns the same parameter after erasure', `
  function wrap(x) { return { other: x, get v() { return x; } }; }
  wrap([7]).v.at(0);`, 'Array');
family('the function in the field differs from the result of its call', `
  function wrap(x) { return { v: x }; }
  wrap(() => [11]).v().at(0);`, null);

const read = 'function read(): { v: number[] }; function read(): { v: any } { return { v: [3] }; }';
family('a return beyond the traversal limit can still supply a written holder', `
  const box: any = { v: [5] };
  box.v = 'xy';
  function read(): { v: number[] };
  function read(): any { ${ '{'.repeat(70) } return box; ${ '}'.repeat(70) } }
  read().v.at(0);`, null);
family('public overload supplies the returned member', `${ read } read().v.at(0);`, 'Array');
family('an unchanged result keeps the public member', `${ read } const box = read(); box.v.at(0);`, 'Array');
family('a named function expression has its own return', `${ read }
  const fn = function read(): { v: string } { return { v: 'abc' }; }; fn().v.at(0);`, 'string');
for (const [argument, expected] of [["'text'", 'string'], ["'list'", 'Array'], ['key', null]]) {
  family(`member of selected overload/${ argument }`, `
    function choose(k: 'text'): { v: string };
    function choose(k: 'list'): { v: number[] };
    function choose(k: string): { v: any } { return { v: k === 'text' ? 'ab' : [7] }; }
    declare const key: any;
    choose(${ argument }).v.at(0);`, expected);
}
family('the saved instantiation keeps its explicit argument', `
  function pick(x: number): { v: string };
  function pick<T>(x: T): { v: T[] };
  function pick(x: any): { v: any } { return { v: [x] }; }
  const read = pick<number>; read(7).v.at(0);`, 'Array');

family('returning a holder from an unused function keeps its data field local', `
  const box = { v: [5] }; function unused() { return box; } void unused; box.v.at(0);`, 'Array');
family('an opaque caller can replace a returned field', `
  const box = { v: [5] }; function read() { return box; }
  declare function edit(value: unknown): void; edit(read()); box.v.at(0);`, null);

for (const definition of ['function loan(loan?: unknown) { return box; }', 'function loan() { const loan = 3; void loan; return box; }']) {
  family(`the external use of a shadowed function remains visible/${ definition }`, `
    const box = { v: [5] }; ${ definition }
    declare function edit(fn: Function): void; edit(loan); box.v.at(0);`, null);
}

runBoth('writes through a returned holder are scoped to the analysis', `
  export {};
  const held: any = { v: [9] };
  function read(): { v: number[] };
  function read(): { v: any } { return held; }
  read().v.at(0);
  read().v.at(1);`, (adapter, program, leg) => {
  const reads = adapter.collectPaths(program, 'MemberExpression', path => path.node.property.name === 'at');
  let written = false;
  let checks = 0;
  const resolver = adapter.makeResolver({ isWrittenContainerSlot(name, keys) {
    if (name !== 'held' || keys[0] !== 'v') return false;
    checks++;
    return written;
  } });
  for (const readPath of reads) check(leg, resolver.resolveNodeType(readPath.get('object'))?.constructor, 'Array');
  check(leg, checks, 1);
  written = true;
  resolver.reset();
  for (const readPath of reads) check(leg, resolver.resolveNodeType(readPath.get('object')), null);
  check(leg, checks, 2);
});

family('constructor parameter property projected twice', `
  class Parent<T> { constructor(public item: T) {} }
  class Child<T> extends Parent<T[]> {}
  declare const value: ConstructorParameters<typeof Child<string>>[0][0]; value.at(0);`, 'string');
family('sequence argument selects the public literal overload', `
  declare const log: string[];
  declare const api: { get(k: 'a'): string } & { get(k: 'b'): number[] };
  api.get((log.push('key'), 'b')).at(0);`, 'Array');
family('declared overload parameters', `
  declare class Box { constructor(x: string); constructor(x: number[]); }
  declare const item: ConstructorParameters<typeof Box>[0]; item.at(0);`, 'Array');
family('explicit utility this parameter', `
  declare function f<T>(this: T, v: string): void;
  declare const item: ThisParameterType<typeof f<number[]>>; item.at(0);`, 'Array');
family('last eligible overload', `
  declare function f<T>(): string;
  declare function f<T, U = T>(): number[];
  declare function f(): string;
  declare const item: ReturnType<typeof f<string>>; item.at(0);`, 'Array');
family('implementation is invisible', `
  function f(x: string): { item: string };
  function f(x: number): { item: number[] };
  function f(x: string | number): any { return { item: x }; }
  declare const row: ReturnType<typeof f>['item']; row.at(0);`, 'Array');
for (const [key, expected] of [['local', 'string'], ['arg', 'Array']]) {
  family(`projected return/${ key }`, `
    type Value = number[];
    declare namespace Lib { type Value = string; function f<T>(): { local: Value; arg: T }; }
    declare const item: ReturnType<typeof Lib.f<Value>>['${ key }']; item.at(0);`, expected);
}

family('an opaque repeated argument can supply the object member', `
  function last<T>(a: T, b: T): { item: T } { return { item: b }; }
  declare const value: any; last('ab', value).item.at(0);`, null);
family('an inherited constructor binds the parent type argument', `
  class Parent<T> { constructor(x: T) {} }
  class Child<T> extends Parent<T[]> {}
  declare const item: ConstructorParameters<typeof Child<string>>[0]; item[0].at(0);`, 'string');
family('numeric index of an instantiated return', `
  type Item = number[];
  declare namespace Lib { type Item = string; function wrap<T>(): T[]; }
  declare const value: ReturnType<typeof Lib.wrap<Item>>[0]; value.at(0);`, 'Array');
family('an object refutes a primitive overload in a generic intersection', `
  type Pair<T> = { get(x: T): T };
  type Twice<T> = Pair<T> & Pair<T>;
  declare const value: Twice<string> & Twice<number[]>; value.get([3]).at(0);`, 'Array');
family('the instantiated class supplies its own field and index', `
  declare class Row<T> { [index: number]: T }
  type Constructor<T> = typeof Row<T>;
  declare const value: InstanceType<Constructor<string>>[0]; value.at(0);`, 'string');
family('a single direct yield uses the method parameter', `
  class Box<T> { *items<T>(x: T) { yield x; } }
  for (const x of new Box<number[]>().items<string>('abc')) x.at(0);`, 'string');
family('a later default can reassign the yielded parameter', `
  class Box { *items<T>(x: T, update = (x = JSON.parse('[37]'))) { yield x; } }
  for (const x of new Box().items('ab')) x.at(0);`, null);
for (const [label, arg, expected] of [
  ['supplied', '1', 'string'],
  ['null', 'null', 'string'],
  ['undefined', 'void 0', null],
  ['unknown', 'JSON.parse(input)', null],
]) {
  family(`yield after a later default/${ label }`, `
    class Box { *values<T>(x: T, update = (x = JSON.parse('[37]'))) { yield x; } }
    for (const v of new Box().values('ab', ${ arg })) v.at(0);`, expected);
}
family('a later default can read a stable yielded parameter', `
  class Box { *items<T>(x: T, seen = x) { yield x; } }
  for (const x of new Box().items('ab')) x.at(0);`, 'string');
family('a spread of unknown width can supply a repeated parameter', `
  function pick<T>(a: T, b: T = a, ...tail: unknown[]): T { return b; }
  function read(xs: any[]) { return pick('ab', ...xs, 'cd').at(0); }`, null);
family('a shifted slot keeps the family common to all arguments that can reach it', `
  function pick<T>(a: T, b: T = a, ...tail: unknown[]): { v: T } { return { v: b }; }
  function read(xs: string[]) { return pick('ab', ...xs, 'cd', [7]).v.at(0); }`, 'string');
family('a shifted object parameter can supply the same type variable', `
  function pick<T>(a: T, b: { v: T } = { v: a }, ...tail: unknown[]): { v: T } { return b; }
  function read(xs: any[]) { return pick('ab', ...xs, { v: 'cd' }).v.at(0); }`, null);
family('class inference respects shifted constructor arguments', `
  class Box<T> { constructor(a: T, public v: T = a, ...tail: unknown[]) {} }
  function read(xs: any[]) { return new Box('ab', ...xs, 'cd').v.at(0); }`, null);
family('a projected rest element keeps the family of a homogeneous spread', `
  function box<T>(...xs: T[]): { v: T } { return { v: xs[0] }; }
  function read(xs: string[]) { return box(...xs, 'cd').v.at(0); }`, 'string');
family('delegation yields elements instead of the container', `
  function *items<T>(xs: T[]) { yield* xs; }
  for (const x of items(['abc'])) x.at(0);`, null);
family('a union unrelated to this method preserves overload order', `
  type Tag = { a: boolean } | { b: boolean };
  declare const value: Tag & { get(x: unknown): number[]; get(x: string): string };
  value.get('ab').at(0);`, 'Array');
family('declared this in a different scope', `
  type Item = number[];
  declare namespace Lib { type Item = string; function f<T>(this: Item, v: T): void; }
  declare const value: ThisParameterType<typeof Lib.f<Item>>; value.at(0);`, 'string');

for (const [utility, expected] of [
  ['ReturnType<F<string>>', 'string'],
  ['Parameters<F<number[]>>[0]', 'Array'],
  ['ThisParameterType<F<string>>', 'string'],
  ["ReturnType<G<number[]>>['item']", 'Array'],
]) {
  family(utility, `
    declare function first<T>(this: T, v: T): T;
    declare function wrap<T>(v: T): { item: T };
    type F<T> = typeof first<T>;
    type G<T> = typeof wrap<T>;
    declare const value: ${ utility }; value.at(0);`, expected);
}

// Inspect the source slots. Positional and rest inference should each walk a literal spread once.
for (const size of [16, 64]) {
  const values = Array.from({ length: size }, (_, i) => `'v${ i }'`).join(', ');
  const params = Array.from({ length: size }, (_, i) => `p${ i }: T`).join(', ');
  for (const [kind, signature, use] of [
    ['positional', `(${ params }): T { return p0; }`, ''],
    ['rest', '(...xs: T[]): T { return xs[0]; }', ''],
    ['member', `(${ params }): { v: T } { return { v: p0 }; }`, '.v'],
  ]) {
    const source = `export {}; function f<T>${ signature } f(...[${ values }] as const)${ use }.at(0);`;
    runBoth(`literal spread/${ kind }/${ size }`, source, (adapter, program, label) => {
      const array = adapter.pickPath(program, 'ArrayExpression', path => path.node.elements.length === size).node;
      const at = adapter.pickPath(program, 'MemberExpression', path => path.node.property?.name === 'at');
      let reads = 0;
      array.elements = new Proxy(array.elements, {
        get(target, key, receiver) {
          if (typeof key === 'string' && /^\d+$/.test(key)) reads++;
          return Reflect.get(target, key, receiver);
        },
      });
      check(`${ label }/family`, adapter.makeResolver().resolveNodeType(at.get('object'))?.type, 'string');
      check(`${ label }/slot reads (${ reads })`, reads > 0 && reads <= 8 * size, true);
    });
  }
}

// Repeated aliases share the same instantiation. Count reads of the original type,
// including the ordinary type resolver that runs before the overload is selected.
for (const size of [3, 6, 9]) {
  const levels = ['type A0<T> = { get(): T };'];
  for (let i = 1; i <= size; i++) levels.push(`type A${ i }<T> = A${ i - 1 }<T> & A${ i - 1 }<T>;`);
  const source = `${ levels.join('\n') }\nexport function read(x: A${ size }<string>) { return x.get().at(0); }`;
  runBoth(`generic intersection diamond/${ size }`, source, (adapter, program, label) => {
    const at = adapter.pickPath(program, 'MemberExpression', path => path.node.property?.name === 'at');
    let reads = 0;
    for (const { node } of adapter.collectPaths(program, 'TSIntersectionType')) {
      const { types } = node;
      Object.defineProperty(node, 'types', { configurable: true, enumerable: true, get() {
        reads++;
        return types;
      } });
    }
    check(`${ label }/type`, adapter.makeResolver().resolveNodeType(at.get('object'))?.type, 'string');
    check(`${ label }/visits (${ reads })`, reads > 0 && reads <= 8 * size, true);
  });
}

for (const reverse of [false, true]) {
  const uses = ["twice('ab').at(0);", 'twice([7]).includes(7);'];
  if (reverse) uses.reverse();
  runBoth(`independent calls/${ reverse }`, `
    export {};
    function twice<T = string>(x: T | null): T { return x!; }
    ${ uses.join('\n') }`, (adapter, program, label) => {
    const { resolveNodeType } = adapter.makeResolver();
    for (const [name, expected] of [['at', 'string'], ['includes', 'Array']]) {
      const member = adapter.pickPath(program, 'MemberExpression', path => path.node.property?.name === name);
      const type = resolveNodeType(member.get('object'));
      check(`${ label }/${ name }`, type?.primitive ? type.type : type?.constructor ?? null, expected);
    }
  });
}

finish();
