import { STRICT } from '../helpers/constants.js';

import find from '@core-js/pure/es/array/find';

QUnit.test('Array#find', assert => {
  assert.isFunction(find);
  const array = [1];
  const context = {};
  find(array, function (value, key, that) {
    assert.same(this, context);
    assert.same(value, 1);
    assert.same(key, 0);
    assert.same(that, array);
  }, context);
  assert.same(find([1, 3, NaN, 42, {}], it => it === 42), 42);
  assert.same(find([1, 3, NaN, 42, {}], it => it === 43), undefined);
  if (STRICT) {
    assert.throws(() => find(null, 0), TypeError);
    assert.throws(() => find(undefined, 0), TypeError);
  }
});
