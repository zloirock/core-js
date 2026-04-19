// for-of, spread, destructuring - Symbol.iterator injection

// built-in iterables
QUnit.test('for-of: array', assert => {
  const result = [];
  for (const x of [1, 2, 3]) result.push(x);
  assert.deepEqual(result, [1, 2, 3]);
});

QUnit.test('for-of: string', assert => {
  const result = [];
  for (const ch of 'abc') result.push(ch);
  assert.deepEqual(result, ['a', 'b', 'c']);
});

QUnit.test('for-of: Set', assert => {
  const result = [];
  for (const x of new Set([10, 20, 30])) result.push(x);
  assert.deepEqual(result, [10, 20, 30]);
});

QUnit.test('for-of: Map', assert => {
  const result = [];
  for (const [k, v] of new Map([['a', 1], ['b', 2]])) result.push(`${ k }=${ v }`);
  assert.deepEqual(result, ['a=1', 'b=2']);
});

QUnit.test('spread: array into array', assert => {
  const arr = [1, 2, 3];
  assert.deepEqual([0, ...arr, 4], [0, 1, 2, 3, 4]);
});

QUnit.test('spread: Set into array', assert => {
  assert.deepEqual([...new Set([1, 2, 3])], [1, 2, 3]);
});

QUnit.test('spread: into function call', assert => {
  function sum(a, b, c) { return a + b + c; }
  const args = [1, 2, 3];
  assert.same(sum(...args), 6);
});

QUnit.test('array destructuring', assert => {
  const [a, b, ...rest] = [1, 2, 3, 4];
  assert.same(a, 1);
  assert.same(b, 2);
  assert.deepEqual(rest, [3, 4]);
});

QUnit.test('Array.from iterable (Set)', assert => {
  assert.deepEqual(Array.from(new Set([10, 20, 30])), [10, 20, 30]);
});

// custom iterables
QUnit.test('for-of: custom iterable object', assert => {
  const iterable = {
    [Symbol.iterator]() {
      let i = 0;
      return {
        next() {
          return i < 3 ? { value: i++, done: false } : { done: true };
        },
      };
    },
  };
  const result = [];
  for (const x of iterable) result.push(x);
  assert.deepEqual(result, [0, 1, 2]);
});

QUnit.test('Array.from: custom iterable', assert => {
  const iterable = {
    [Symbol.iterator]() {
      let i = 10;
      return {
        next() {
          return i <= 12 ? { value: i++, done: false } : { done: true };
        },
      };
    },
  };
  assert.deepEqual(Array.from(iterable), [10, 11, 12]);
});

QUnit.test('spread: custom iterable into array', assert => {
  const iterable = {
    [Symbol.iterator]() {
      const vals = ['a', 'b', 'c'];
      let i = 0;
      return { next() { return i < vals.length ? { value: vals[i++], done: false } : { done: true }; } };
    },
  };
  assert.deepEqual([...iterable], ['a', 'b', 'c']);
});

QUnit.test('destructuring: custom iterable', assert => {
  const iterable = {
    [Symbol.iterator]() {
      let i = 100;
      return { next() { return { value: i++, done: false }; } };
    },
  };
  const [a, b, c] = iterable;
  assert.same(a, 100);
  assert.same(b, 101);
  assert.same(c, 102);
});

// class with generator [Symbol.iterator] yielding polyfill-built data
QUnit.test('class: [Symbol.iterator] generator yielding from Set', assert => {
  class UniqueWords {
    constructor(text) {
      this.words = new Set(text.split(/\s+/).filter(Boolean));
    }
    * [Symbol.iterator]() {
      yield * Array.from(this.words).toSorted();
    }
  }
  const u = new UniqueWords('the quick brown fox jumps over the lazy dog');
  assert.deepEqual([...u], ['brown', 'dog', 'fox', 'jumps', 'lazy', 'over', 'quick', 'the']);
});

// generator [Symbol.iterator] as object literal shorthand, yields array fragments
QUnit.test('for-of: custom iterable yielding array fragments spread on each step', assert => {
  const chunked = {
    * [Symbol.iterator]() {
      for (let i = 0; i < 6; i += 2) yield [i, i + 1];
    },
  };
  const flat = [];
  for (const pair of chunked) flat.push(...pair);
  assert.deepEqual(flat, [0, 1, 2, 3, 4, 5]);
  assert.deepEqual(Array.from(chunked).flat(), [0, 1, 2, 3, 4, 5]);
});
