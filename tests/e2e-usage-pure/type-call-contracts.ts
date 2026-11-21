// Array/string alternatives expose a foreign-family helper in the stripped runtime.
QUnit.test('type calls: constrained literal arguments', assert => {
  function read<T extends 'lines' | 'text'>(mode: T): T extends 'lines' ? number[] : string {
    return (mode === 'lines' ? [11, 23] : 'ab') as any;
  }
  const mode = 'lines';
  assert.same(read(mode).at(-1), 23);
  assert.same(read('text').at(-1), 'b');
  function numeric<T extends number>(value: T): T extends -1 ? number[] : string {
    return (value === -1 ? [31] : 'cd') as any;
  }
  assert.same(numeric(-1).at(0), 31);
  assert.same(numeric(1).at(0), 'c');
  function big<T extends bigint>(value: T): T extends -1n ? number[] : string {
    return (String(value) === '-1' ? [53] : 'ef') as any;
  }
  if (typeof BigInt === 'function') {
    assert.same(big(BigInt(-1) as -1n).at(0), 53);
    assert.same(big(BigInt(2) as 2n).at(0), 'e');
  }
});

QUnit.test('type calls: explicitly widened arguments', assert => {
  function read<T extends string>(value: T): T extends 'abc' ? number[] : string {
    return value as any;
  }
  const value: string = 'abc';
  assert.true(read(value).includes('bc'));
  assert.true(read('abc' as string).includes('bc'));
});

QUnit.test('type calls: boolean conditional aliases and members', assert => {
  type Result<T> = T extends true ? number[] : string;
  type Holder<T> = T extends true ? { rows: number[] } : { rows: string };
  function read(flag: boolean): Result<boolean> { return flag ? [17] : 'ab'; }
  function box(flag: boolean): Holder<boolean> { return flag ? { rows: [19] } : { rows: 'cd' }; }
  function last(flag: boolean) { return read(flag).at(-1); }
  function boxed(flag: boolean) { return box(flag).rows.at(-1); }
  assert.same(last(true), 17);
  assert.same(last(false), 'b');
  assert.same(boxed(true), 19);
  assert.same(boxed(false), 'd');
});

QUnit.test('type calls: constructor parameter properties', assert => {
  class Box<T = string> {
    constructor(public value: T) {}
    get(): T { return this.value; }
  }
  assert.same(new Box([29]).get().at(-1), 29);
  assert.same(new Box('ef').get().at(-1), 'f');
});

QUnit.test('type calls: virtual methods and callable getters', assert => {
  const log = [];
  class Field {
    value(): string | number[] { log.push('base'); return 'ab'; }
    get reader(): () => string | number[] { log.push('get-base'); return () => 'cd'; }
  }
  class Multi extends Field {
    value(): string | number[] { log.push('child'); return [37]; }
    get reader(): () => string | number[] { log.push('get-child'); return () => [41]; }
  }
  function last(field: Field) { return field.value().at(-1); }
  function getter(field: Field) { return field.reader().at(-1); }
  assert.same(last(new Field()), 'b');
  assert.same(last(new Multi()), 37);
  assert.same(getter(new Field()), 'd');
  assert.same(getter(new Multi()), 41);
  assert.deepEqual(log, ['base', 'child', 'get-base', 'get-child']);
});

QUnit.test('type calls: nullable and specialized overloads', assert => {
  function read(value: string): number[];
  function read(value: string | undefined): string;
  function read(value: string | undefined): any { return value === undefined ? 'ab' : [43]; }
  function last(value: string | undefined) { return read(value).at(-1); }
  assert.same(last(undefined), 'b');
  assert.same(last('present'), 43);
  function selected(value: string): string;
  function selected(value: string, mode?: 'rows'): number[];
  function selected(value: string, mode?: 'rows'): any { return [47]; }
  assert.same(selected('present').at(-1), 47);
});

QUnit.test('function results follow their actual slots and receiver', assert => {
  function read({ x = 'ab' }: { x?: string | number[] } = { x: [7] }) { return x; }
  function first(...[x]: [string]) { return x; }
  function receiver(this: any) { return this; }
  const owner = { Array: { from() { return this === owner.Array ? [9] : []; } } };
  assert.same(read({ x: undefined }).at(0), 'a');
  assert.same(read().at(0), 7);
  assert.same(first('abc').at(0), 'a');
  assert.deepEqual(receiver.call(owner).Array.from([1]), [9]);
  function shadow(value: number[]) {
    try { throw 'abc'; } catch (value: any) { return value; }
  }
  assert.same(shadow([7]).at(0), 'a');
});
