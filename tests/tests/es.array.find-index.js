import { DESCRIPTORS, STRICT, NATIVE } from '../helpers/constants';

QUnit.test('Array#findIndex', function (assert) {
  var findIndex = Array.prototype.findIndex;
  assert.isFunction(findIndex);
  assert.arity(findIndex, 1);
  assert.name(findIndex, 'findIndex');
  assert.looksNative(findIndex);
  assert.nonEnumerable(Array.prototype, 'findIndex');
  var array = [1];
  var context = {};
  array.findIndex(function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  assert.same([1, 3, NaN, 42, {}].findIndex(function (it) {
    return it === 42;
  }), 3);
  assert.same([1, 3, NaN, 42, {}].findIndex(function (it) {
    return it === 43;
  }), -1);
  if (STRICT) {
    assert.throws(function () {
      return findIndex.call(null, 0);
    }, TypeError);
    assert.throws(function () {
      return findIndex.call(undefined, 0);
    }, TypeError);
  }
  if (NATIVE && DESCRIPTORS) {
    assert.ok(function () {
      try {
        return findIndex.call({
          length: -1,
          0: 1
        }, function () {
          throw new Error();
        }) === -1;
      } catch (e) { /* empty */ }
    }(), 'uses ToLength');
  }
  assert.ok('findIndex' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
});
