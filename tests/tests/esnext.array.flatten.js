import { DESCRIPTORS, STRICT, NATIVE } from '../helpers/constants';

QUnit.test('Array#flatten', function (assert) {
  var flatten = Array.prototype.flatten;
  assert.isFunction(flatten);
  assert.name(flatten, 'flatten');
  assert.arity(flatten, 0);
  assert.looksNative(flatten);
  assert.nonEnumerable(Array.prototype, 'flatten');
  assert.deepEqual([].flatten(), []);
  var array = [1, [2, 3], [4, [5, 6]]];
  assert.deepEqual(array.flatten(0), array);
  assert.deepEqual(array.flatten(1), [1, 2, 3, 4, [5, 6]]);
  assert.deepEqual(array.flatten(), [1, 2, 3, 4, [5, 6]]);
  assert.deepEqual(array.flatten(2), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(array.flatten(3), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(array.flatten(-1), array);
  assert.deepEqual(array.flatten(Infinity), [1, 2, 3, 4, 5, 6]);
  if (STRICT) {
    assert.throws(function () {
      flatten.call(null, function (it) {
        return it;
      });
    }, TypeError);
    assert.throws(function () {
      flatten.call(undefined, function (it) {
        return it;
      });
    }, TypeError);
  }
  if (NATIVE && DESCRIPTORS) {
    assert.ok(function () {
      try {
        return false === flatten.call(Object.defineProperty({ length: -1 }, 0, {
          get: function () {
            throw new Error();
          }
        }), function (it) {
          return it;
        });
      } catch (e) { /* empty */ }
    }(), 'uses ToLength');
  }
  assert.ok('flatten' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
});
