import { STRICT } from '../helpers/constants.js';

import findIndex from '@core-js/pure/es/array/find-index';

QUnit.test('Array#findIndex', assert => {
  assert.isFunction(findIndex);
  const array = [1];
  const context = {};
  findIndex(array, function (value, key, that) {
    assert.same(this, context);
    assert.same(value, 1);
    assert.same(key, 0);
    assert.same(that, array);
  }, context);
  assert.same(findIndex([1, 3, NaN, 42, {}], it => it === 42), 3);
  if (STRICT) {
    assert.throws(() => findIndex(null, 0), TypeError);
    assert.throws(() => findIndex(undefined, 0), TypeError);
  }
});
