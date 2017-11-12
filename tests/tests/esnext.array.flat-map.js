import { DESCRIPTORS, STRICT, NATIVE } from '../helpers/constants';

QUnit.test('Array#flatMap', function (assert) {
  var flatMap = Array.prototype.flatMap;
  assert.isFunction(flatMap);
  assert.name(flatMap, 'flatMap');
  assert.arity(flatMap, 1);
  assert.looksNative(flatMap);
  assert.nonEnumerable(Array.prototype, 'flatMap');
  assert.deepEqual([].flatMap(function (it) {
    return it;
  }), []);
  assert.deepEqual([1, 2, 3].flatMap(function (it) {
    return it;
  }), [1, 2, 3]);
  assert.deepEqual([1, 2, 3].flatMap(function (it) {
    return [it, it];
  }), [1, 1, 2, 2, 3, 3]);
  assert.deepEqual([1, 2, 3].flatMap(function (it) {
    return [[it], [it]];
  }), [[1], [1], [2], [2], [3], [3]]);
  assert.deepEqual([1, [2, 3]].flatMap(function () {
    return 1;
  }), [1, 1]);
  var array = [1];
  var context = {};
  array.flatMap(function (value, key, that) {
    assert.same(value, 1);
    assert.same(key, 0);
    assert.same(that, array);
    assert.same(this, context);
    return value;
  }, context);
  if (STRICT) {
    assert['throws'](function () {
      flatMap.call(null, function (it) {
        return it;
      });
    }, TypeError);
    assert['throws'](function () {
      flatMap.call(undefined, function (it) {
        return it;
      });
    }, TypeError);
  }
  if (NATIVE && DESCRIPTORS) {
    assert.ok(function () {
      try {
        return flatMap.call(Object.defineProperty({
          length: -1
        }, 0, {
          get: function () {
            throw new Error();
          }
        }), function (it) {
          return it;
        }) === false;
      } catch (e) { /* empty */ }
    }(), 'uses ToLength');
  }
  assert.ok('flatMap' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
});
