import { STRICT } from '../helpers/constants';

import map from 'core-js-pure/fn/array/map';

QUnit.test('Array#map', assert => {
  assert.isFunction(map);
  const array = [1];
  const context = {};
  map(array, function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  assert.deepEqual([2, 3, 4], map([1, 2, 3], it => it + 1));
  assert.deepEqual([1, 3, 5], map([1, 2, 3], (value, key) => value + key));
  assert.deepEqual([2, 2, 2], map([1, 2, 3], function () {
    return +this;
  }, 2));
  if (STRICT) {
    assert.throws(() => map(null, () => { /* empty */ }), TypeError);
    assert.throws(() => map(undefined, () => { /* empty */ }), TypeError);
  }
});
