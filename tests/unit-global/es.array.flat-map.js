/* eslint-disable unicorn/prefer-array-flat -- required for testing */
QUnit.test('Array#flatMap', assert => {
  const { flatMap } = Array.prototype;
  assert.isFunction(flatMap);
  assert.name(flatMap, 'flatMap');
  assert.arity(flatMap, 1);
  assert.looksNative(flatMap);
  assert.nonEnumerable(Array.prototype, 'flatMap');
  assert.deepEqual([].flatMap(it => it), []);
  assert.deepEqual([1, 2, 3].flatMap(it => it), [1, 2, 3]);
  assert.deepEqual([1, 2, 3].flatMap(it => [it, it]), [1, 1, 2, 2, 3, 3]);
  assert.deepEqual([1, 2, 3].flatMap(it => [[it], [it]]), [[1], [1], [2], [2], [3], [3]]);
  assert.deepEqual([1, [2, 3]].flatMap(() => 1), [1, 1]);
  const array = [1];
  const context = {};
  array.flatMap(function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
    return value;
  }, context);

  assert.throws(() => flatMap.call(null, it => it), TypeError);
  assert.throws(() => flatMap.call(undefined, it => it), TypeError);

  assert.notThrows(() => flatMap.call({ length: -1 }, () => {
    throw new Error();
  }).length === 0, 'uses ToLength');
  assert.true('flatMap' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
});
