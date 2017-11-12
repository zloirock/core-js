import { DESCRIPTORS, STRICT, NATIVE } from '../helpers/constants';

QUnit.test('Array#flatMap', function (assert) {
  var flatMap = core.Array.flatMap;
  assert.isFunction(flatMap);
  assert.deepEqual(flatMap([], function (it) {
    return it;
  }), []);
  assert.deepEqual(flatMap([1, 2, 3], function (it) {
    return it;
  }), [1, 2, 3]);
  assert.deepEqual(flatMap([1, 2, 3], function (it) {
    return [it, it];
  }), [1, 1, 2, 2, 3, 3]);
  assert.deepEqual(flatMap([1, 2, 3], function (it) {
    return [[it], [it]];
  }), [[1], [1], [2], [2], [3], [3]]);
  assert.deepEqual(flatMap([1, [2, 3]], function () {
    return 1;
  }), [1, 1]);
  var array = [1];
  var context = {};
  flatMap(array, function (value, index, that) {
    assert.same(value, 1);
    assert.same(index, 0);
    assert.same(that, array);
    assert.same(this, context);
  }, context);
  if (STRICT) {
    assert.throws(function () {
      flatMap(null, function (it) {
        return it;
      });
    }, TypeError);
    assert.throws(function () {
      flatMap(undefined, function (it) {
        return it;
      });
    }, TypeError);
  }
  if (NATIVE && DESCRIPTORS) {
    assert.ok(function () {
      try {
        return false === flatMap(core.Object.defineProperty({ length: -1 }, 0, {
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
