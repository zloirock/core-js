import { STRICT } from '../helpers/constants.js';

QUnit.test('Array#indexOf', assert => {
  const { indexOf } = Array.prototype;
  assert.isFunction(indexOf);
  assert.arity(indexOf, 1);
  assert.name(indexOf, 'indexOf');
  assert.looksNative(indexOf);
  assert.nonEnumerable(Array.prototype, 'indexOf');
  assert.same([1, 1, 1].indexOf(1), 0);
  assert.same([1, 2, 3].indexOf(1, 1), -1);
  assert.same([1, 2, 3].indexOf(2, 1), 1);
  assert.same([1, 2, 3].indexOf(2, -1), -1);
  assert.same([1, 2, 3].indexOf(2, -2), 1);
  assert.same([NaN].indexOf(NaN), -1);
  assert.same(Array(2).concat([1, 2, 3]).indexOf(2), 3);
  assert.same(Array(1).indexOf(undefined), -1);
  assert.same([1].indexOf(1, -0), 0, "shouldn't return negative zero");
  if (STRICT) {
    assert.throws(() => indexOf.call(null, 0), TypeError);
    assert.throws(() => indexOf.call(undefined, 0), TypeError);
  }
});
