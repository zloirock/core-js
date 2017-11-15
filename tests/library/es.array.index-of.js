import { STRICT } from '../helpers/constants';

QUnit.test('Array#indexOf', assert => {
  const { indexOf } = core.Array;
  assert.isFunction(indexOf);
  assert.same(0, indexOf([1, 1, 1], 1));
  assert.same(-1, indexOf([1, 2, 3], 1, 1));
  assert.same(1, indexOf([1, 2, 3], 2, 1));
  assert.same(-1, indexOf([1, 2, 3], 2, -1));
  assert.same(1, indexOf([1, 2, 3], 2, -2));
  assert.same(-1, indexOf([NaN], NaN));
  assert.same(3, indexOf(Array(2).concat([1, 2, 3]), 2));
  assert.same(-1, indexOf(Array(1), undefined));
  assert.same(0, indexOf([1], 1, -0), "shouldn't return negative zero");
  if (STRICT) {
    assert.throws(() => {
      return indexOf(null, 0);
    }, TypeError);
    assert.throws(() => {
      return indexOf(undefined, 0);
    }, TypeError);
  }
});
