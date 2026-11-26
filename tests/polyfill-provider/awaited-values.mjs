// Awaited<T>, runtime await, and iterator result values have different projection rules.
import { createChecker } from './harness.mjs';

const { check, finish, runBoth } = createChecker('awaited-values');

const cases = [
  ['generic callback', 'type Done<T> = (x: T) => void; interface Job<T> { then(cb: Done<T>): void } declare const v: Awaited<Job<number[]>>;', 'Array'],
  ['callback in declaration scope',
    'type Done = (x: string) => void; interface Job { then(cb: Done): void } function f(v: Awaited<Job>) { type Done = (x: number[]) => void; v.at(0); }', 'string'],
  ['nullable callback', 'interface Job { then(cb?: ((x: string) => void) | null): void } declare const v: Awaited<Job>;', 'string'],
  ['rest tuple', 'interface Job { then(cb: (...args: [first: string, second: number]) => void): void } declare const v: Awaited<Job>;', 'string'],
  ['getter', 'class Job { get then(): (cb: (x: number[]) => void) => void { return cb => cb([1]); } } declare const v: Awaited<Job>;', 'Array'],
  ['last overload', 'interface Job { then(cb: (x: string) => void): void; then(cb: (x: number[]) => void): void } declare const v: Awaited<Job>;', 'Array'],
  ['implementation',
    'class Job { then(cb: (x: string) => void): void; then(cb: (x: number[]) => void): void; then(cb: any) { cb([1]); } } declare const v: Awaited<Job>;', 'Array'],
  ['fulfilled field', 'interface Job { row: string; then(cb: (x: { row: number[] }) => void): void } declare const v: Awaited<Job>["row"];', 'Array'],
  ['optional then', 'interface Job extends Array<number> { then?(cb: (x: string) => void): void } declare const v: Awaited<Job>;', 'Array'],
  ['partial', 'type T = Awaited<Partial<PromiseLike<string>>> extends string ? string : number[]; declare const v: T;', 'Array'],
  ['omit then', "type T = Awaited<Omit<PromiseLike<string>, 'then'>> extends string ? string : number[]; declare const v: T;", 'Array'],
  ['pick then', "declare const v: Awaited<Pick<PromiseLike<string>, 'then'>>;", 'string'],
  ['required optional method', 'interface Job { then?(cb: (x: string) => void): void } declare const v: Awaited<Required<Job>>;', 'string'],
  ['partial structural method', 'interface Job extends Array<number> { then(cb: (x: string) => void): void } declare const v: Awaited<Partial<Job>>;', 'Array'],
  ['derived signature',
    'interface Base { then(cb:(x: string | number[]) => void): void } '
    + 'interface Child extends Base { then(cb: (s: string) => void): void } declare const v: Awaited<Child>;', 'string'],
  ['outer required', 'declare const v: Awaited<Required<Partial<PromiseLike<string>>>>;', 'string'],
  ['shadowed PromiseLike', 'type PromiseLike<T> = { row: number[] }; declare const v: Awaited<PromiseLike<string>>["row"];', 'Array'],
  ['async mapper', 'async function f() { const v = (await Array.fromAsync([1], async () => "xy"))[0]; v.at(0); }', 'string'],
  ['overloaded runtime await',
    'interface Task { then(cb: (s: string) => void): void; then(cb: (n: number[]) => void): void } async function f(t: Task) { const v = await t; v.at(0); }', null],
  ['inherited sync protocol', 'interface Source extends Iterable<Promise<string>> {} async function f(s: Source) { for await (const v of s) v.at(0); }', 'string'],
  ['plain async Promise', 'async function f(s: AsyncIterable<Promise<string>>) { for await (const v of s) v.at(0); }', 'string'],
  ['nested Promise field', 'async function f(s: AsyncIterable<Promise<Promise<{ v: number[] }>>>) { for await (const { v } of s) v.at(0); }', 'Array'],
  ['aliased Promise tuple', 'type Row<T> = Promise<[T]>; async function f(s: AsyncIterable<Row<string>>) { for await (const [v] of s) v.at(0); }', 'string'],
  ['aliased Promise in declaration scope',
    'type Row<T> = Promise<{ v: T }>; function outer() { type Promise<T> = { v: number[] }; '
    + 'async function f(s: AsyncIterable<Row<string>>) { for await (const { v } of s) v.at(0); } }', 'string'],
  ['explicit raw Promise field', 'type Row = Promise<{ v: number[] }> & { v: string }; '
    + 'async function f(s: AsyncIterable<Row>) { for await (const { v } of s) v.at(0); }', 'string'],
  ['fulfilled value ignores fields on the Promise', 'const task: Promise<{v: number[]}> & {v: string} = pending; '
    + 'async function f() {const {v} = await task; v.at(0);}', 'Array'],
  ['structural async value', 'async function f(s: AsyncIterable<PromiseLike<number[]>>) { for await (const v of s) v.at(0); }', null],
  ['async generator method', 'type Row = {v: number[]}; const rows: AsyncIterable<Row | Promise<Row>> = {async *[Symbol.asyncIterator]() {yield {v: [1]};}}; '
    + 'async function f() {for await (const {v} of rows) v.at(0);}', 'Array'],
  ['custom iterator from a local factory', 'const value = Object.assign(Promise.resolve({v: [1]}), {v: "xy"}); '
    + 'function rows(): AsyncIterable<Promise<{v: number[]}>> {return {[Symbol.asyncIterator]() {'
    + 'return Object.assign((async function* () {})(), {async next() {return {done: false as const, value};}});}};} '
    + 'async function f() {for await (const {v} of rows()) v.at(0);}', null],
  ['escaped parent of an async element field', 'async function f(s: AsyncIterable<Promise<{data: {v: number[]}}>>, touch) {'
    + 'for await (const row of s) {touch(row.data); row.data.v.at(0);}}', null],
  ['union of callable then properties', 'type F = (cb: (s: string) => void) => void; interface Job { then: F | F } declare const v: Awaited<Job>;', 'string'],
  ['potentially absent then', 'type F = (cb: (s: string) => void) => void; interface Job extends Array<number> { then: F | undefined } declare const v: Awaited<Job>;', 'Array'],
  ['runtime potentially absent then',
    'type F = ((cb: (s: string) => void) => void) | undefined; interface Job extends Array<number> { then: F } async function f(x: Job) { const v = await x; v.at(0); }', null],
  ['declared callback thenable',
    'interface Job extends Array<number> { then(cb: (s: string) => void): void } '
    + 'async function f(x: Job) { const v = await Promise.try<Job, []>((): Job => x); v.at(0); }', 'string'],
  ['declared mapper thenable',
    'interface Job extends Array<number> { then(cb: (s: string) => void): void } '
    + 'async function f(x: Job) { const v = (await Array.fromAsync([1], (): Job => x))[0]; v.at(0); }', 'string'],
  ['resolved argument thenable',
    'interface Job extends Array<number> { then(cb: (s: string) => void): void } async function f(x: Job) { const v = await Promise.resolve(x); v.at(0); }', 'string'],
  ['possible then on sync iterator element',
    'interface Job extends Array<number> { then?(cb:(s:string)=>void):void } async function f(xs: Iterable<Job>) { for await (const v of xs) v.at(0); }', null],
  ['optional then in iterator pattern',
    'interface Job { v: number[]; then?(cb:(s:{v:string})=>void):void } async function f(xs: Iterable<Job>) { for await (const {v} of xs) v.at(0); }', null],
  ['required callback result',
    'interface Job extends Array<number> { then?(cb:(s:string)=>void):void } '
    + 'async function f(x: Required<Job>) { const v = await Promise.try<Required<Job>, []>((): Required<Job> => x); v.at(0); }', 'string'],
  ['sync iterator preserving a thenable', 'async function f() { const x = Object.assign([1], { then(ok) { ok("xy"); } }); '
    + 'for await (const v of [x].values()) v.at(0); }', null],
  ['copy preserving a thenable', 'async function f() { const x = Object.assign([1], { then(ok) { ok("xy"); } }); '
    + 'for await (const v of [x].slice()) v.at(0); }', null],
  ['sync iterator preserving a plain array', 'async function f() { for await (const v of [[1]].slice().values()) v.at(0); }', 'Array'],
  ['sync entries creates an array', 'async function f() { for await (const v of ["a"].entries()) v.at(0); }', 'Array'],
  ['non-callable then on an iterated array', 'async function f() { const x = Object.assign([1], { then: 7 }); '
    + 'for await (const v of [x].values()) v.at(0); }', 'Array'],
  ['settled assigned method', 'async function f() { const v = await Object.assign([1], { then(cb) { cb("xy"); } }); v.at(0); }', null],
  ['settled plain assign', 'async function f() { const v = await Object.assign([1], { label: "xy" }); v.at(0); }', 'Array'],
  ['non-callable then', 'interface Job extends Array<number> { then: number } declare const v: Awaited<Job>;', 'Array'],
];
for (const [name, source, expected] of cases) {
  runBoth(name, `export {}; ${ source } ${ source.includes('v.at(0)') ? '' : 'v.at(0);' }`, (parser, program, label) => {
    const read = parser.pickPath(program, 'MemberExpression', path => path.node.property.name === 'at');
    const type = parser.makeResolver().resolveNodeType(read.get('object'));
    check(label, type?.primitive ? type.type : type?.constructor ?? null, expected);
  });
}
for (const [name, type, expected] of [
  ['declared payload', 'Promise<{ v: number[] }>', 'Array'],
  ['raw intersection', 'Promise<{ v: number[] }> & { v: string }', 'string'],
]) {
  runBoth(`async element member / ${ name }`, `async function read(xs: AsyncIterable<${ type }>) {
    for await (const row of xs) row.v.at(0);
  }`, (parser, program, label) => {
    const call = parser.pickPath(program, 'MemberExpression', path => path.node.property.name === 'at');
    for (const written of ['v', 'elsewhere']) {
      const resolver = parser.makeResolver({ getDecisionAdapter: () => ({
        hasObservedSlotWrite: (binding, keys) => binding === 'row' && keys[0] === written,
      }) });
      const receiver = resolver.resolveNodeType(call.get('object'));
      check(`${ label }/${ written }`, receiver?.primitive ? receiver.type : receiver?.constructor ?? null, written === 'v' ? null : expected);
    }
  });
}
runBoth('reparsed pure property read from an async row', `
  import getName from '@core-js/pure/actual/function/instance/name';
  async function read(rows: AsyncIterable<Promise<{ name: string }>>) {
    for await (const row of rows) return getName(row).at(0);
  }
`, (parser, program, label) => {
  const call = parser.pickPath(program, 'MemberExpression', path => path.node.property.name === 'at');
  for (const entry of [null, 'function/instance/name']) {
    const resolver = parser.makeResolver({ getPolyfillBindingEntry: (scope, name) => name === 'getName' ? entry : null });
    check(`${ label }/${ entry }`, resolver.resolveNodeType(call.get('object'))?.type ?? null, entry ? 'string' : null);
  }
});
runBoth('settlement respects a recorded then write', `
  interface Job extends Array<number> { then(cb: (s: string) => void): void }
  async function read(x: Job) { const v = await x; v.at(0); }
`, (parser, program, label) => {
  const read = parser.pickPath(program, 'MemberExpression', path => path.node.property.name === 'at');
  for (const key of ['then', 'other']) {
    const resolver = parser.makeResolver({ getDecisionAdapter: () => ({
      hasObservedSlotWrite: (name, keys) => name === 'x' && keys[0] === key,
    }) });
    check(`${ label }/${ key }`, resolver.resolveNodeType(read.get('object'))?.type ?? null, key === 'then' ? null : 'string');
  }
});
// The same generic property is stored on different object-type slots in Flow and TypeScript.
for (const [parameter, argument, expected] of [
  ['v: T', 'Array<string>', 'Array'], ['v: T', 'string', 'string'], ['...args: [T]', 'string', 'string'],
]) {
  const source = `type Job<T> = { then: (done: (${ parameter }) => void) => void };
    async function read(x: Job<${ argument }>) { (await x).at(0); }`;
  runBoth(`generic property settlement ${ parameter } / ${ argument }`, source, (parser, program, label) => {
    const read = parser.pickPath(program, 'MemberExpression', path => path.node.property.name === 'at');
    const type = parser.makeResolver().resolveNodeType(read.get('object'));
    check(label, type?.primitive ? type.type : type?.constructor ?? null, expected);
  }, ['flow']);
}
finish();
