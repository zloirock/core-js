// Polyfills in async functions and generators

/* eslint-disable es/no-async-functions -- safe */

QUnit.test('async: Promise.all in async function', assert => {
  const async = assert.async();
  (async () => {
    const results = await Promise.all([
      Promise.resolve(1),
      Promise.resolve(2),
      Promise.resolve(3),
    ]);
    assert.deepEqual(results, [1, 2, 3]);
    async();
  })();
});

QUnit.test('async: Array.from in async function', assert => {
  const async = assert.async();
  (async () => {
    const arr = Array.from([1, 2, 3]);
    assert.deepEqual(arr.filter(x => x > 1), [2, 3]);
    async();
  })();
});

QUnit.test('async: await + chained polyfills', assert => {
  const async = assert.async();
  (async () => {
    const data = await Promise.resolve([3, 1, 2]);
    assert.deepEqual(data.toSorted(), [1, 2, 3]);
    assert.same(data.at(-1), 2);
    async();
  })();
});

QUnit.test('generator: yield polyfilled values', assert => {
  function * gen() {
    yield Array.from([1, 2]);
    yield Object.keys({ a: 1 });
  }
  const it = gen();
  assert.deepEqual(it.next().value, [1, 2]);
  assert.deepEqual(it.next().value, ['a']);
  assert.true(it.next().done);
});

QUnit.test('generator: polyfill on yielded result', assert => {
  function * range(n) {
    for (let i = 0; i < n; i++) yield i;
  }
  assert.deepEqual(Array.from(range(3)), [0, 1, 2]);
});

QUnit.test('generator: chained polyfills on yield', assert => {
  function * gen() {
    yield [3, 1, 2].toSorted();
    yield Object.keys({ a: 1, b: 2 }).at(-1);
  }
  const it = gen();
  assert.deepEqual(it.next().value, [1, 2, 3]);
  assert.same(it.next().value, 'b');
});

QUnit.test('async function: try / catch with polyfill in catch arm', assert => {
  const async = assert.async();
  (async () => {
    try {
      await Promise.reject(new Error('oops'));
    } catch (err) {
      assert.true(err.message.includes('oops'));
      assert.same(err.message.at(0), 'o');
    }
    async();
  })();
});

QUnit.test('async: nested await with destructured polyfill alias', assert => {
  const async = assert.async();
  (async () => {
    const { from } = Array;
    const inner = await Promise.resolve([3, 1, 2]);
    const sorted = from(inner).toSorted();
    assert.deepEqual(sorted, [1, 2, 3]);
    async();
  })();
});
