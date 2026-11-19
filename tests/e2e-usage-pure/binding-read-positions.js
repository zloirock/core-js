/* eslint-disable block-scoped-var, es/no-nonstandard-object-properties, no-lone-blocks, no-shadow,
  no-unused-vars, no-useless-assignment, no-var -- Binding visibility and shadowing are the test subjects. */

QUnit.test('binding reads: nested var supplies an IIFE receiver', assert => {
  { var Arr = Array; }
  assert.deepEqual((({ from } = Object) => from([3, 4]))(Arr), [3, 4]);
});

QUnit.test('binding reads: nested var base is captured before reassignment', assert => {
  { var Base = Array; }
  class List extends Base {
    // The ES5 suite uses superIsCallableConstructor, which cannot subclass an aliased Array.
    // Allocate explicitly so instanceof still proves that the static call kept its receiver.
    // eslint-disable-next-line no-constructor-return -- Explicit allocation preserves identity under callable-super lowering.
    constructor() { return Object.create(List.prototype); }
    static read() { return super.from([5, 6]); }
    static other() { return this.of(7, 8); }
  }
  Base = String;
  const from = List.read();
  const of = List.other();
  assert.deepEqual([from[0], from[1]], [5, 6]);
  assert.same(from.length, 2);
  assert.deepEqual([of[0], of[1]], [7, 8]);
  assert.same(of.length, 2);
  assert.true(from instanceof List);
  assert.true(of instanceof List);
});

QUnit.test('binding reads: computed key stays in its declaration scope', assert => {
  let result;
  class Box {
    static {
      const key = 'items';
      const object = { [key]: [1, 2] };
      { const key = 'name'; result = object.items.at(-1); }
    }
  }
  assert.same(result, 2);
});

QUnit.test('binding reads: nested var exposes the captured container base', assert => {
  { var NS = { Base: Array }; }
  class List extends NS.Base {
    // eslint-disable-next-line no-constructor-return -- Explicit allocation preserves identity under callable-super lowering.
    constructor() { return Object.create(List.prototype); }
    static read() { return super.from([9]); }
  }
  const result = List.read();
  assert.same(result[0], 9);
  assert.same(result.length, 1);
  assert.true(result instanceof List);
});
