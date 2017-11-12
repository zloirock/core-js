import { DESCRIPTORS, STRICT, NATIVE } from '../helpers/constants';

QUnit.test('Array#flatten', function (assert) {
  var flatten = core.Array.flatten;
  assert.isFunction(flatten);
  assert.deepEqual(flatten([]), []);
  var array = [1, [2, 3], [4, [5, 6]]];
  assert.deepEqual(flatten(array, 0), array);
  assert.deepEqual(flatten(array, 1), [1, 2, 3, 4, [5, 6]]);
  assert.deepEqual(flatten(array), [1, 2, 3, 4, [5, 6]]);
  assert.deepEqual(flatten(array, 2), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(flatten(array, 3), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(flatten(array, -1), array);
  assert.deepEqual(flatten(array, Infinity), [1, 2, 3, 4, 5, 6]);
  if (STRICT) {
    assert.throws(function () {
      flatten(null, function (it) {
        return it;
      });
    }, TypeError);
    assert.throws(function () {
      flatten(undefined, function (it) {
        return it;
      });
    }, TypeError);
  }
  if (NATIVE && DESCRIPTORS) {
    assert.ok(function () {
      try {
        return false === flatten(core.Object.defineProperty({ length: -1 }, 0, {
          get: function () {
            throw new Error();
          }
        }), function (it) {
          return it;
        });
      } catch (e) { /* empty */ }
    }(), 'uses ToLength');
  }
});
