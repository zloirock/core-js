import { STRICT } from '../helpers/constants.js';

import findIndex from 'core-js-pure/es/array/find-index';

QUnit.test('Array#findIndex', assert => {
  assert.isFunction(findIndex);
  const array = [1];
  const context = {};
  findIndex(array, function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  assert.same(findIndex([1, 3, NaN, 42, {}], it => it === 42), 3);
  assert.same(findIndex([1, 3, NaN, 42, {}], it => it === 43), -1);
  if (STRICT) {
    assert.throws(() => findIndex(null, 0), TypeError);
    assert.throws(() => findIndex(undefined, 0), TypeError);
  }
  assert.notThrows(() => findIndex({ length: -1, 0: 1 }, () => {
    throw new Error();
  }), 'uses ToLength');
});
