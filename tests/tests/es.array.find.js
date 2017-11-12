import { DESCRIPTORS, STRICT, NATIVE } from '../helpers/constants';

QUnit.test('Array#find', function (assert) {
  var find = Array.prototype.find;
  assert.isFunction(find);
  assert.arity(find, 1);
  assert.name(find, 'find');
  assert.looksNative(find);
  assert.nonEnumerable(Array.prototype, 'find');
  var array = [1];
  var context = {};
  array.find(function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  assert.same([1, 3, NaN, 42, {}].find(function (it) {
    return it === 42;
  }), 42);
  assert.same([1, 3, NaN, 42, {}].find(function (it) {
    return it === 43;
  }), undefined);
  if (STRICT) {
    assert['throws'](function () {
      return find.call(null, 0);
    }, TypeError);
    assert['throws'](function () {
      return find.call(undefined, 0);
    }, TypeError);
  }
  if (NATIVE && DESCRIPTORS) {
    assert.ok(function () {
      try {
        return find.call({
          length: -1,
          0: 1
        }, function () {
          throw new Error();
        }) === undefined;
      } catch (e) { /* empty */ }
    }(), 'uses ToLength');
  }
  assert.ok('find' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
});
