// Object literals, coercion and declaration-destructure around polyfill injection. Every test is
// DISTINGUISHING via evaluation count or order: a getter / computed key / spread source / iterator
// protocol must run an exact number of times, a declaration destructure must extract the polyfill
// while evaluating its receiver effect once, and Array.from must pull a custom iterator once per
// element. A literal that merely stores a polyfill RESULT would pass regardless, so those are absent.

// --- Accessors: evaluated exactly once on access ---
/* eslint-disable es/no-accessor-properties -- accessor evaluation count is the construct under test */

QUnit.test('object: getter returning a polyfill runs once per read', assert => {
  let calls = 0;
  const obj = {
    get last() {
      calls += 1;
      return [1, 2, 3].at(-1);
    },
  };
  assert.same(obj.last, 3);
  assert.same(calls, 1);
  assert.same(obj.last, 3);
  assert.same(calls, 2);
});

QUnit.test('object: setter consuming a polyfill runs once per write', assert => {
  let received;
  let calls = 0;
  const obj = {
    set value(v) {
      calls += 1;
      received = Array.from(v);
    },
  };
  obj.value = 'ab';
  assert.deepEqual(received, ['a', 'b']);
  assert.same(calls, 1);
});

QUnit.test('object: getter building via a polyfill is not invoked until read', assert => {
  let calls = 0;
  const obj = {
    get pairs() {
      calls += 1;
      return Object.fromEntries([['a', 1]]);
    },
  };
  assert.same(calls, 0);
  assert.deepEqual(obj.pairs, { a: 1 });
  assert.same(calls, 1);
});
/* eslint-enable es/no-accessor-properties -- end accessor block */

// --- Computed keys: key expressions evaluate left to right, once each ---

QUnit.test('object: computed keys evaluate in source order around polyfill values', assert => {
  const order = [];
  const key = name => {
    order.push(name);
    return name;
  };
  const obj = {
    [key('a')]: Array.of(1).at(0),
    [key('b')]: Array.of(2).at(0),
  };
  assert.deepEqual(obj, { a: 1, b: 2 });
  assert.deepEqual(order, ['a', 'b']);
});

QUnit.test('object: computed key whose value is a polyfill is evaluated once', assert => {
  let calls = 0;
  const make = () => {
    calls += 1;
    return Array.from('xy');
  };
  const k = 'list';
  const obj = { [k]: make() };
  assert.deepEqual(obj[k], ['x', 'y']);
  assert.same(calls, 1);
});

// --- Spread: the spread source (and its polyfill) is evaluated once ---

QUnit.test('object: spread source feeding a polyfill is evaluated once', assert => {
  let calls = 0;
  const src = () => {
    calls += 1;
    return Object.fromEntries([['a', 1], ['b', 2]]);
  };
  const merged = { ...src(), c: 3 };
  assert.deepEqual(merged, { a: 1, b: 2, c: 3 });
  assert.same(calls, 1);
});

QUnit.test('object: spread precedence - later own key overrides a spread polyfill key', assert => {
  const merged = { ...Object.fromEntries([['x', 1], ['y', 2]]), y: 99 };
  assert.deepEqual(merged, { x: 1, y: 99 });
});

QUnit.test('object: rest after a polyfilled own key excludes it', assert => {
  const { a, ...rest } = { a: Array.of(1).at(0), b: 2, c: 3 };
  assert.same(a, 1);
  assert.deepEqual(rest, { b: 2, c: 3 });
});

// --- Symbol.iterator: core-js Array.from pulls a custom iterator once per element ---
// (object->primitive coercion via valueOf / Symbol.toPrimitive is NOT covered: that dispatch is
//  native ToNumber, which a pure polyfill cannot intercept - the polyfill only sees the result)

QUnit.test('object: Array.from pulls a custom Symbol.iterator once per element', assert => {
  let pulls = 0;
  const iterable = {
    [Symbol.iterator]() {
      let i = 0;
      return {
        next: () => i < 3
          ? { value: (pulls += 1, i++), done: false }
          : { value: undefined, done: true },
      };
    },
  };
  assert.deepEqual(Array.from(iterable), [0, 1, 2]);
  assert.same(pulls, 3);
});

QUnit.test('object: Array.from drives a generator-based iterable once per element', assert => {
  let pulls = 0;
  const iterable = {
    * [Symbol.iterator]() {
      for (let i = 0; i < 3; i += 1) {
        pulls += 1;
        yield i * 2;
      }
    },
  };
  assert.deepEqual(Array.from(iterable), [0, 2, 4]);
  assert.same(pulls, 3);
});

// --- Methods: shorthand and computed-name methods invoked the expected number of times ---

QUnit.test('object: shorthand method returning a polyfill runs once per call', assert => {
  let calls = 0;
  const api = {
    build() {
      calls += 1;
      return Array.of(1, 2, 3).toReversed();
    },
  };
  assert.deepEqual(api.build(), [3, 2, 1]);
  assert.same(calls, 1);
});

QUnit.test('object: computed-name method polyfills its body', assert => {
  const name = 'group';
  const api = {
    [name](items) {
      return Object.groupBy(items, x => x % 2 ? 'odd' : 'even');
    },
  };
  const grouped = api.group([1, 2, 3, 4]);
  assert.deepEqual(grouped.odd, [1, 3]);
  assert.deepEqual(grouped.even, [2, 4]);
});

QUnit.test('object: shorthand method returns a polyfilled combinator promise', assert => {
  const async = assert.async();
  const api = {
    all(values) {
      return Promise.all(values.map(v => Promise.resolve(v)));
    },
  };
  api.all([1, 2, 3]).then(r => {
    assert.deepEqual(r, [1, 2, 3]);
    async();
  });
});

// --- Declaration destructure (body-extract): receiver effect runs once, binding resolves ---

QUnit.test('object: declaration destructure receiver effect runs once', assert => {
  let calls = 0;
  const { of } = (calls += 1, Array);
  assert.deepEqual(of(1, 2), [1, 2]);
  assert.same(calls, 1);
});

QUnit.test('object: multi-declarator destructure resolves each polyfill once', assert => {
  let aCalls = 0;
  let bCalls = 0;
  const { from } = (aCalls += 1, Array);
  const { fromEntries } = (bCalls += 1, Object);
  assert.deepEqual(from('ab'), ['a', 'b']);
  assert.deepEqual(fromEntries([['k', 1]]), { k: 1 });
  assert.same(aCalls, 1);
  assert.same(bCalls, 1);
});

QUnit.test('object: nested destructure default builds via a polyfill only when absent', assert => {
  let calls = 0;
  const { a: { b = (calls += 1, Array.from('xyz')) } = {} } = { a: {} };
  assert.deepEqual(b, ['x', 'y', 'z']);
  assert.same(calls, 1);
  const { a: { b: b2 = (calls += 1, Array.from('xyz')) } = {} } = { a: { b: [0] } };
  assert.deepEqual(b2, [0]);
  assert.same(calls, 1);
});

// --- Computed member access feeding a polyfill: the key expression runs once ---

QUnit.test('object: computed member key feeding a chained polyfill runs once', assert => {
  let calls = 0;
  const store = { rows: [10, 20, 30] };
  const key = () => {
    calls += 1;
    return 'rows';
  };
  assert.same(store[key()].at(-1), 30);
  assert.same(calls, 1);
});

QUnit.test('object: accessor result chained into a polyfill keeps its receiver', assert => {
  const obj = {
    // eslint-disable-next-line es/no-accessor-properties -- getter feeding a chained polyfill
    get nums() {
      return [[1], [2], [3]];
    },
  };
  assert.same(obj.nums.flat().at(-1), 3);
});

QUnit.test('object: polyfill result stored then read back through the literal', assert => {
  // eslint-disable-next-line unicorn/no-duplicate-set-values -- testing
  const wrap = { data: Array.from(new Set([1, 1, 2, 3])) };
  assert.deepEqual(wrap.data, [1, 2, 3]);
  assert.same(wrap.data.at(-1), 3);
});
