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
