// Read the static during module evaluation, before siblings decorate the shared constructor.
let grouped;
let failure;
try {
  let sources = [Array];
  for (let i = 0; i < 1; i++) {
    sources = [Map];
    const [{ groupBy }] = sources;
    grouped = groupBy([1, 2, 3], value => value % 2);
  }
} catch (error) {
  failure = error;
}

QUnit.test('an array pattern reads a static from a reassigned source', assert => {
  assert.same(failure, undefined);
  assert.same(typeof grouped?.get, 'function');
  if (grouped) assert.deepEqual(grouped.get(1), [1, 3]);
});
