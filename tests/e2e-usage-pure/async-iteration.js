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
