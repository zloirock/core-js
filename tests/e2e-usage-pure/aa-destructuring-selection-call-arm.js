// A destructure over a selection whose arm is a call leaves its read raw, so the constructor the call
// returns has to carry its statics. Snapshot the reads during module evaluation; earlier modules
// can already decorate the shared constructor, so isolated differential rows check its own imports.
function pick(fail) {
  try {
    if (fail) throw new Error('fail');
  } catch {
    return null;
  }
  return Map;
}

const { groupBy } = pick(false) || Set;
const declared = typeof groupBy;
function read(flag, { groupBy: method } = flag ? Set : pick(false)) { return typeof method; }
const defaulted = read(false);

QUnit.test('a pattern over a selection with a call arm reads the statics of what the call returns', assert => {
  assert.same(declared, 'function');
  assert.same(defaulted, 'function');
  assert.deepEqual(groupBy([1, 2, 3], value => value % 2).get(1), [1, 3]);
});
