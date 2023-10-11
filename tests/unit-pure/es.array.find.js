import { STRICT } from '../helpers/constants.js';

import find from '@core-js/pure/es/array/find';

QUnit.test('Array#find', assert => {
  assert.isFunction(find);
  const array = [1];
  const context = {};
  find(array, function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  assert.same(find([1, 3, NaN, 42, {}], it => it === 42), 42);
  assert.same(find([1, 3, NaN, 42, {}], it => it === 43), undefined);
  if (STRICT) {
    assert.throws(() => find(null, 0), TypeError);
    assert.throws(() => find(undefined, 0), TypeError);
  }
  assert.notThrows(() => find({ length: -1, 0: 1 }, () => {
    throw new Error();
  }), 'uses ToLength');
});
