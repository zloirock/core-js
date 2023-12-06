QUnit.test('Array#findLastIndex', assert => {
  const { findLastIndex } = Array.prototype;
  assert.isFunction(findLastIndex);
  assert.arity(findLastIndex, 1);
  assert.name(findLastIndex, 'findLastIndex');
  assert.looksNative(findLastIndex);
  assert.nonEnumerable(Array.prototype, 'findLastIndex');
  const array = [1];
  const context = {};
  array.findLastIndex(function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  assert.same([{}, 2, NaN, 42, 1].findLastIndex(it => !(it % 2)), 3);
  assert.same([{}, 2, NaN, 42, 1].findLastIndex(it => it > 42), -1);
  let values = '';
  let keys = '';
  [1, 2, 3].findLastIndex((value, key) => {
    values += value;
    keys += key;
  });
  assert.same(values, '321');
  assert.same(keys, '210');

  assert.throws(() => findLastIndex.call(null, 0), TypeError);
  assert.throws(() => findLastIndex.call(undefined, 0), TypeError);

  assert.notThrows(() => findLastIndex.call({
    length: -1,
    0: 1,
  }, () => {
    throw new Error();
  }) === -1, 'uses ToLength');
  assert.true('findLastIndex' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
});
