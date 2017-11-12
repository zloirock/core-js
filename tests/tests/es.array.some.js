import { STRICT, NATIVE } from '../helpers/constants';

QUnit.test('Array#some', function (assert) {
  var some = Array.prototype.some;
  assert.isFunction(some);
  assert.arity(some, 1);
  assert.name(some, 'some');
  assert.looksNative(some);
  assert.nonEnumerable(Array.prototype, 'some');
  var array = [1];
  var context = {};
  array.some(function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  assert.ok([1, '2', 3].some(function (value) {
    return typeof value === 'number';
  }));
  assert.ok([1, 2, 3].some(function (value) {
    return value < 3;
  }));
  assert.ok(![1, 2, 3].some(function (value) {
    return value < 0;
  }));
  assert.ok(![1, 2, 3].some(function (value) {
    return typeof value === 'string';
  }));
  assert.ok(![1, 2, 3].some(function () {
    return +this !== 1;
  }, 1));
  var result = '';
  [1, 2, 3].some(function (value, key) {
    result += key;
    return false;
  });
  assert.ok(result === '012');
  array = [1, 2, 3];
  assert.ok(!array.some(function (value, key, that) {
    return that !== array;
  }));
  if (STRICT) {
    assert.throws(function () {
      some.call(null, function () { /* empty */ });
    }, TypeError);
    assert.throws(function () {
      some.call(undefined, function () { /* empty */ });
    }, TypeError);
  }
  if (NATIVE) {
    assert.ok(function () {
      try {
        return some.call({
          length: -1,
          0: 1
        }, function () {
          throw new Error();
        }) === false;
      } catch (e) { /* empty */ }
    }(), 'uses ToLength');
  }
});
