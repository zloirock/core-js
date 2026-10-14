// A destructure over a selection whose arm is a call leaves its read raw, so the constructor the call
// returns has to carry its statics. Every module of the bundle shares one ponyfill constructor, which a
// sibling's import of the whole entry decorates, so the reads are taken while this module evaluates:
// the `aa-` prefix keeps it first in the generated index, ahead of every such import.
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
