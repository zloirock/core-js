// delete expression — must NOT be transformed
QUnit.test('delete: should not transform delete expression', assert => {
  const obj = { includes: true, at: 1 };
  delete obj.includes;
  assert.false('includes' in obj);
});

// assignment target — must NOT be transformed
QUnit.test('assignment: should not transform assignment target', assert => {
  const obj = { includes: false };
  obj.includes = true;
  assert.true(obj.includes);
});

// update expression — must NOT be transformed
QUnit.test('update: should not transform update expression', assert => {
  const obj = { at: 0 };
  obj.at++;
  assert.same(obj.at, 1);
});

// logical AND short-circuit
QUnit.test('logical AND: polyfilled method in &&', assert => {
  const arr = [1, 2, 3];
  const result = arr && arr.includes(2);
  assert.true(result);
});

// polyfill in template literal
QUnit.test('template literal: interpolated polyfill call', assert => {
  const result = `has 2: ${ [1, 2, 3].includes(2) }`;
  assert.same(result, 'has 2: true');
});

// nested call: polyfill result as argument
QUnit.test('nested: polyfill result as argument to another polyfill', assert => {
  const keys = Object.keys({ a: 1, b: 2 });
  assert.true(keys.includes('a'));
  assert.same(keys.at(0), 'a');
});

// method on literal
QUnit.test('literal: method on string literal', assert => {
  assert.true('hello world'.includes('world'));
  assert.same('hello'.at(-1), 'o');
});

QUnit.test('literal: method on array literal', assert => {
  assert.true([1, 2, 3].includes(2));
  assert.same([10, 20, 30].at(-1), 30);
});

// IIFE pattern
QUnit.test('IIFE: polyfill in immediately invoked function', assert => {
  const result = (() => [1, 2, 3].includes(2))();
  assert.true(result);
});

// computed property access — plugin should NOT transform dynamic names
QUnit.test('computed: dynamic method name not transformed', assert => {
  const method = 'includes';
  assert.same(typeof [][method], 'function');
});

// ternary / conditional — unknown type at compile time
QUnit.test('ternary: array or string .includes', assert => {
  const target = Math.random() > -1 ? [1, 2, 3] : 'hello';
  assert.true(target.includes(1));
});

QUnit.test('function return type unknown', assert => {
  function getData() {
    return [1, 2, 3];
  }
  assert.true(getData().includes(2));
  assert.same(getData().at(-1), 3);
});

QUnit.test('?? nullish coalescing pattern', assert => {
  function getItems(input) {
    return input ?? [4, 5, 6];
  }
  assert.true(getItems(null).includes(5));
  assert.true(getItems([1, 2]).includes(1));
});

// variable reassignment
QUnit.test('variable reassignment then use', assert => {
  let arr = [0];
  assert.false(arr.includes(2));
  arr = [1, 2, 3];
  assert.true(arr.includes(2));
});

// method on parameter
QUnit.test('method on parameter', assert => {
  function process(items) {
    return items.filter(x => x > 0).map(x => x * 2);
  }
  assert.deepEqual(process([1, -2, 3, -4, 5]), [2, 6, 10]);
});

// method on loop variable
QUnit.test('method on loop variable', assert => {
  const arrays = [[1, 2], [3, 4], [5, 6]];
  const result = [];
  for (const arr of arrays) {
    result.push(arr.at(0));
  }
  assert.deepEqual(result, [1, 3, 5]);
});

// method in nested callback
QUnit.test('method in nested callback', assert => {
  const result = [[3, 1, 2], [6, 4, 5]].map(arr => arr.toSorted());
  assert.deepEqual(result, [[1, 2, 3], [4, 5, 6]]);
});

// nested: polyfill inside polyfill callback
QUnit.test('nested: polyfill inside filter callback', assert => {
  const data = [['a', 'b'], ['c', 'd'], ['e', 'f']];
  assert.deepEqual(data.filter(arr => arr.includes('c')), [['c', 'd']]);
});

QUnit.test('nested: chained polyfills in callback', assert => {
  const result = [[3, 1], [6, 4]].map(arr => arr.toSorted().at(0));
  assert.deepEqual(result, [1, 4]);
});

// try/catch
QUnit.test('try/catch: polyfill in try block', assert => {
  let result;
  try {
    result = [1, 2, 3].find(x => x > 2);
  } catch {
    result = -1;
  }
  assert.same(result, 3);
});

QUnit.test('try/catch: polyfill in catch block', assert => {
  let keys;
  try {
    throw new Error('fail');
  } catch (error) {
    keys = Object.keys({ message: error.message });
  }
  assert.deepEqual(keys, ['message']);
});

// promise handlers
QUnit.test('promise: polyfill in catch handler', assert => {
  const async = assert.async();
  Promise.reject(new Error('fail')).catch(error => {
    assert.true(error.message.includes('fail'));
    async();
  });
});

// nested for-of
QUnit.test('nested: for-of inside for-of', assert => {
  const matrix = [[1, 2], [3, 4]];
  const flat = [];
  for (const row of matrix) {
    for (const val of row) flat.push(val);
  }
  assert.deepEqual(flat, [1, 2, 3, 4]);
});

// default parameter
QUnit.test('default param: polyfill in default value', assert => {
  function getFirst(arr, fallback = [0].at(0)) {
    return arr.at(0) ?? fallback;
  }
  assert.same(getFirst([5, 6]), 5);
});

// var self-reference shadow — var Map = Map resolves to global
QUnit.test('var self-ref: var Map = Map; Map.groupBy', assert => {
  // eslint-disable-next-line no-var -- testing var hoisting
  var Map = Map;
  assert.same(typeof Map.groupBy, 'function');
});

// computed template literal key
QUnit.test('computed template key: arr.includes(x) via computed', assert => {
  assert.true([1, 2, 3].includes(2));
});

// three chained polyfills
QUnit.test('three chained: Array.from(...).filter(...).findLast(...)', assert => {
  assert.same(Array.from([1, 2, 3, 4]).filter(x => x > 2).findLast(x => x < 4), 3);
});

// catch clause
QUnit.test('catch: instance method on caught error', assert => {
  try {
    throw new Error('test failure');
  } catch (err) {
    assert.true(err.message.includes('failure'));
    assert.same(err.message.at(0), 't');
  }
});

QUnit.test('catch: Object.keys on caught error', assert => {
  try {
    const err = new Error('fail');
    err.code = 42;
    throw err;
  } catch (err) {
    assert.true(Object.keys(err).includes('code'));
  }
});

// scope shadows
QUnit.test('scope: block-scoped shadow does not leak', assert => {
  {
    // eslint-disable-next-line no-unused-vars -- testing scope
    const Array = [1, 2, 3];
  }
  assert.deepEqual(Array.from([4, 5]), [4, 5]);
});

QUnit.test('scope: arrow param shadow', assert => {
  const fn = Array => Array.length;
  assert.same(fn([1, 2, 3]), 3);
  assert.deepEqual(Array.from('ab'), ['a', 'b']);
});

QUnit.test('scope: for-of variable shadow', assert => {
  for (const Map of [1, 2, 3]) {
    assert.same(typeof Map, 'number');
  }
  assert.same(typeof Map.groupBy, 'function');
});

// typeof guard — polyfill still injected
QUnit.test('typeof guard: typeof Map !== undefined', assert => {
  assert.same(typeof Map, 'function');
  assert.same(typeof Map.groupBy, 'function');
});

// spread into polyfilled constructor
QUnit.test('spread: new Map from entries', assert => {
  const entries = [['a', 1], ['b', 2]];
  const map = new Map(entries);
  assert.same(map.get('a'), 1);
  assert.same(map.size, 2);
});

// AggregateError
QUnit.test('AggregateError: constructor and errors', assert => {
  const err = new AggregateError([new Error('a'), new Error('b')], 'multi');
  assert.same(err.message, 'multi');
  assert.same(err.errors.length, 2);
});

// disable directive — WeakMap.of is not native anywhere, so without polyfill it throws
QUnit.test('disable: core-js-disable-next-line prevents polyfill', assert => {
  // core-js-disable-next-line
  assert.same(typeof WeakMap.of, 'undefined');
});

// new on polyfilled constructor result
QUnit.test('new: Map from polyfilled entries', assert => {
  const entries = Array.from(Object.entries({ a: 1, b: 2 }));
  const map = new Map(entries);
  assert.same(map.get('a'), 1);
});

// multiple polyfills in one line
QUnit.test('multi-polyfill: several in one expression', assert => {
  assert.true(Object.keys({ a: 1 }).includes('a'));
  assert.same([1, 2].at(-1), 2);
});

// polyfill in ternary branches
QUnit.test('ternary: polyfill in both branches', assert => {
  const useSet = true;
  const size = useSet ? new Set([1, 2]).size : new Map([['a', 1]]).size;
  assert.same(size, 2);
});

// chained assignment with polyfill
QUnit.test('assignment: polyfill result stored and used', assert => {
  const keys = Object.keys({ x: 1, y: 2 });
  const first = keys.at(0);
  const has = keys.includes('y');
  assert.same(first, 'x');
  assert.true(has);
});

// polyfill in object method shorthand
QUnit.test('object method: polyfill in method body', assert => {
  const obj = {
    getKeys(data) {
      return Object.keys(data).toSorted();
    },
  };
  assert.deepEqual(obj.getKeys({ b: 2, a: 1 }), ['a', 'b']);
});

// polyfill with comma operator
QUnit.test('comma operator: polyfill in sequence', assert => {
  const result = (0, Array.from)([1, 2, 3]);
  assert.deepEqual(result, [1, 2, 3]);
});
