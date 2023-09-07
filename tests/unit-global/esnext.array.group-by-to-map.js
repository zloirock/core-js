import { STRICT } from '../helpers/constants.js';

const { from } = Array;

QUnit.test('Array#groupByToMap', assert => {
  const { groupByToMap } = Array.prototype;
  assert.isFunction(groupByToMap);
  assert.arity(groupByToMap, 1);
  assert.looksNative(groupByToMap);
  assert.nonEnumerable(Array.prototype, 'groupByToMap');
  let array = [1];
  const context = {};
  array.groupByToMap(function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  assert.true([].groupByToMap(it => it) instanceof Map, 'returns Map');
  assert.deepEqual(from([1, 2, 3].groupByToMap(it => it % 2)), [[1, [1, 3]], [0, [2]]], '#1');
  assert.deepEqual(
    from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].groupByToMap(it => `i${ it % 5 }`)),
    [['i1', [1, 6, 11]], ['i2', [2, 7, 12]], ['i3', [3, 8]], ['i4', [4, 9]], ['i0', [5, 10]]],
    '#2',
  );
  assert.deepEqual(from(Array(3).groupByToMap(it => it)), [[undefined, [undefined, undefined, undefined]]], '#3');
  if (STRICT) {
    assert.throws(() => groupByToMap.call(null, () => { /* empty */ }), TypeError, 'null this -> TypeError');
    assert.throws(() => groupByToMap.call(undefined, () => { /* empty */ }), TypeError, 'undefined this -> TypeError');
  }
  array = [1];
  // eslint-disable-next-line object-shorthand -- constructor
  array.constructor = { [Symbol.species]: function () {
    return { foo: 1 };
  } };
  assert.same(array.groupByToMap(Boolean).get(true).foo, undefined, 'no @@species');
});
