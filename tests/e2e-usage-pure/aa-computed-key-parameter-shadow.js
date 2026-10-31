// Capture the call before sibling namespace imports can decorate the shared ponyfill.
const key = 'name';
// eslint-disable-next-line no-shadow -- the parameter must hide the outer literal key
function read(key) {
  const alias = key;
  return Map[alias]([1, 2, 3], value => value % 2);
}
let observed;
let failure;
try {
  observed = read('groupBy');
} catch (error) {
  failure = error;
}

QUnit.test('a parameter key alias keeps statics despite an outer literal namesake', assert => {
  assert.same(key, 'name');
  assert.same(failure, undefined);
  assert.same(typeof observed?.get, 'function');
  if (observed) assert.deepEqual(observed.get(1), [1, 3]);
});
