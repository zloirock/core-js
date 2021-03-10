import { STRICT } from '../helpers/constants';

import findLastIndex from 'core-js-pure/full/array/find-last-index';

QUnit.test('Array#findLastIndex', assert => {
  assert.isFunction(findLastIndex);
  const array = [1];
  const context = {};
  findLastIndex(array, function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  assert.same(findLastIndex([{}, 2, NaN, 42, 1], it => !(it % 2)), 3);
  assert.same(findLastIndex([{}, 2, NaN, 42, 1], it => it === 43), -1);
  let values = '';
  let keys = '';
  findLastIndex([1, 2, 3], (value, key) => {
    values += value;
    keys += key;
  });
  assert.same(values, '321');
  assert.same(keys, '210');
  if (STRICT) {
    assert.throws(() => findLastIndex(null, 0), TypeError);
    assert.throws(() => findLastIndex(undefined, 0), TypeError);
  }
  assert.notThrows(() => findLastIndex({
    length: -1,
    0: 1,
  }, () => {
    throw new Error();
  }) === -1, 'uses ToLength');
});
