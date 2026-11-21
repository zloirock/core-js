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

QUnit.test('binding reads: default assignment reaches outside a body-local var', assert => {
  let C = Array;
  const effects = [];
  function install(value = C = {
    from() {
      effects.push(7);
      return 19;
    },
  }) { var C; }
  install();
  assert.same(C.from([8]), 19);
  assert.deepEqual(effects, [7]);
});

QUnit.test('binding reads: a returned key uses its own scope', assert => {
  const key = 'from';
  function select() { return key; }
  function read() {
    const key = 'of';
    return Array[select()]('ab');
  }
  assert.deepEqual(read(), ['a', 'b']);
});

QUnit.test('binding reads: an own apply can skip the container write', assert => {
  function read(override) {
    function fill(target) { target.C = Map; }
    if (override) fill.apply = () => null;
    const box = { C: Object };
    fill.apply(null, [box]);
    const { C: { groupBy } } = box;
    return groupBy([7], Boolean);
  }
  assert.deepEqual(read(true).true, [7]);
  assert.deepEqual(read(false).get(true), [7]);
});

QUnit.test('binding reads: iteration exposes the element and its mutable contents', assert => {
  const rows = [[[7]], [[8]]];
  const events = [];
  for (const el of rows) {
    el[0] = 'ab';
    if (el === rows[0]) Object.defineProperty(el, 'at', {
      get() {
        events.push('get');
        return function (index) {
          events.push(this === el, index);
          return 17;
        };
      },
    });
  }
  assert.same(rows[0].at(-1), 17);
  assert.deepEqual(events, ['get', true, -1]);
  assert.same(rows[1].at(0), 'ab');
  assert.same(rows[1][0].at(-1), 'b');
});

QUnit.test('binding reads: extracting an array method preserves its call receiver', assert => {
  const rows = [[7]];
  const hasValue = rows.includes;
  assert.true(hasValue.call([3], 3));
  assert.same(rows[0].at(-1), 7);

  const changed = [[9]];
  let reads = 0;
  Object.defineProperty(changed, 'includes', {
    get() {
      reads++;
      this[0] = 'abc';
      return hasValue;
    },
  });
  const saved = changed.includes;
  assert.true(saved.call([5], 5));
  assert.same(changed[0].at(-1), 'c');
  assert.same(reads, 1);
});
