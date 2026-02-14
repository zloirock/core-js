import { STRICT } from '../helpers/constants.js';

QUnit.test('Array#findLast', assert => {
  const { findLast } = Array.prototype;
  assert.isFunction(findLast);
  assert.arity(findLast, 1);
  assert.name(findLast, 'findLast');
  assert.looksNative(findLast);
  assert.nonEnumerable(Array.prototype, 'findLast');
  const array = [1];
  const context = {};
  array.findLast(function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  assert.same([{}, 2, NaN, 42, 1].findLast(it => !(it % 2)), 42);
  assert.same([{}, 2, NaN, 42, 1].findLast(it => it === 43), undefined);
  let values = '';
  let keys = '';
  [1, 2, 3].findLast((value, key) => {
    values += value;
    keys += key;
  });
  assert.same(values, '321');
  assert.same(keys, '210');
  if (STRICT) {
    assert.throws(() => findLast.call(null, 0), TypeError);
    assert.throws(() => findLast.call(undefined, 0), TypeError);
  }
  assert.notThrows(() => findLast.call({
    length: -1,
    0: 1,
  }, () => {
    throw new Error();
  }) === undefined, 'uses ToLength');
  assert.true('findLast' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
});
