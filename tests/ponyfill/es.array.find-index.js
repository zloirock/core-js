import { STRICT } from '../helpers/constants';

QUnit.test('Array#findIndex', assert => {
  const { findIndex } = core.Array;
  assert.isFunction(findIndex);
  const array = [1];
  const context = {};
  findIndex(array, function (value, key, that) {
    assert.strictEqual(this, context);
    assert.strictEqual(value, 1);
    assert.strictEqual(key, 0);
    assert.strictEqual(that, array);
  }, context);
  assert.strictEqual(findIndex([1, 3, NaN, 42, {}], it => it === 42), 3);
  if (STRICT) {
    assert.throws(() => findIndex(null, 0), TypeError);
    assert.throws(() => findIndex(undefined, 0), TypeError);
  }
});
