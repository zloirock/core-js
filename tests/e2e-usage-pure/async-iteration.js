/* eslint-disable es/no-async-functions, es/no-async-iteration -- Exercise the transpiled async syntax. */
QUnit.test('syntax: async generator and for-await carry polyfilled values', assert => {
  async function * items() {
    yield [1, 2].at(-1);
    yield 'abc'.at(-1);
  }
  async function collect() {
    return await Array.fromAsync(items());
  }
  return collect().then(seen => assert.deepEqual(seen, [2, 'c']));
});

QUnit.test('async iteration uses the raw async value and awaits a sync element', assert => {
  const value = ['raw'];
  // eslint-disable-next-line unicorn/no-thenable -- The iterator's raw value must itself be a thenable.
  Object.defineProperty(value, 'then', { value: done => done('settled') });
  const asyncSource = { [Symbol.asyncIterator]() {
    let done = false;
    return { next() {
      const result = { value, done };
      done = true;
      return Promise.resolve(result);
    } };
  } };
  async function first(source) {
    const values = [];
    for await (const item of source) values.push(item.at(0));
    return values;
  }
  return Promise.all([first(asyncSource), first([value])]).then(result => assert.deepEqual(result, [['raw'], ['s']]));
});

QUnit.test('async iteration settles the elements kept by values and slice', assert => {
  // eslint-disable-next-line unicorn/no-thenable -- Exercise async-from-sync assimilation.
  const item = Object.assign([17], { then(done) { done('xy'); } });
  async function collect() {
    const seen = [];
    for await (const value of [item].values()) seen.push(value.at(-1));
    for await (const value of [item].slice()) seen.push(value.at(-1));
    return seen;
  }
  return collect().then(seen => assert.deepEqual(seen, ['y', 'y']));
});

QUnit.test('fromAsync takes the mapped element type', assert => {
  return Promise.all([
    Array.fromAsync([[1]], () => 'text'),
    Array.fromAsync([[2]], async () => 'text'),
    Array.fromAsync([[3]]),
  ]).then(([sync, asyncResult, unmodified]) => {
    assert.same(sync[0].at(1), 'e');
    assert.same(asyncResult[0].at(1), 'e');
    assert.same(unmodified[0].at(0), 3);
  });
});
