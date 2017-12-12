import { STRICT } from '../helpers/constants';

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
    assert.same(value, 1);
    assert.same(key, 0);
    assert.same(that, array);
    assert.same(this, context);
    return value;
  }, context);
  if (STRICT) {
    assert.throws(() => flatMap.call(null, it => it), TypeError);
    assert.throws(() => flatMap.call(undefined, it => it), TypeError);
  }
  assert.notThrows(() => flatMap.call({ length: -1 }, () => {
    throw new Error();
  }).length === 0, 'uses ToLength');
  assert.ok('flatMap' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
});
