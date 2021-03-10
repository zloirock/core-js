import { STRICT } from '../helpers/constants';

import findLast from 'core-js-pure/full/array/find-last';

QUnit.test('Array#findLast', assert => {
  assert.isFunction(findLast);
  const array = [1];
  const context = {};
  findLast(array, function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  assert.same(findLast([{}, 2, NaN, 42, 1], it => !(it % 2)), 42);
  assert.same(findLast([{}, 2, NaN, 42, 1], it => it === 43), undefined);
  let values = '';
  let keys = '';
  findLast([1, 2, 3], (value, key) => {
    values += value;
    keys += key;
  });
  assert.same(values, '321');
  assert.same(keys, '210');
  if (STRICT) {
    assert.throws(() => findLast(null, 0), TypeError);
    assert.throws(() => findLast(undefined, 0), TypeError);
  }
  assert.notThrows(() => findLast({
    length: -1,
    0: 1,
  }, () => {
    throw new Error();
  }) === undefined, 'uses ToLength');
});
