import { STRICT } from '../helpers/constants';

import find from 'core-js-pure/features/array/find';

QUnit.test('Array#find', assert => {
  assert.isFunction(find);
  const array = [1];
  const context = {};
  find(array, function (value, key, that) {
    assert.strictEqual(this, context);
    assert.strictEqual(value, 1);
    assert.strictEqual(key, 0);
    assert.strictEqual(that, array);
  }, context);
  assert.strictEqual(find([1, 3, NaN, 42, {}], it => it === 42), 42);
  assert.strictEqual(find([1, 3, NaN, 42, {}], it => it === 43), undefined);
  if (STRICT) {
    assert.throws(() => find(null, 0), TypeError);
    assert.throws(() => find(undefined, 0), TypeError);
  }
});
