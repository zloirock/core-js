import { STRICT, NATIVE } from '../helpers/constants';

QUnit.test('Array#every', function (assert) {
  var every = Array.prototype.every;
  assert.isFunction(every);
  assert.arity(every, 1);
  assert.name(every, 'every');
  assert.looksNative(every);
  assert.nonEnumerable(Array.prototype, 'every');
  var array = [1];
  var context = {};
  array.every(function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  assert.ok([1, 2, 3].every(function (it) {
    return typeof it === 'number';
  }));
  assert.ok([1, 2, 3].every(function (it) {
    return it < 4;
  }));
  assert.ok(![1, 2, 3].every(function (it) {
    return it < 3;
  }));
  assert.ok(![1, 2, 3].every(function (it) {
    return typeof it === 'string';
  }));
  assert.ok([1, 2, 3].every(function () {
    return +this === 1;
  }, 1));
  var result = '';
  [1, 2, 3].every(function () {
    return result += arguments[1];
  });
  assert.ok(result === '012');
  array = [1, 2, 3];
  assert.ok(array.every(function () {
    return arguments[2] === array;
  }));
  if (STRICT) {
    assert['throws'](function () {
      every.call(null, function () { /* empty */ });
    }, TypeError);
    assert['throws'](function () {
      every.call(undefined, function () { /* empty */ });
    }, TypeError);
  }
  if (NATIVE) {
    assert.ok(function () {
      try {
        return true === every.call({
          length: -1,
          0: 1
        }, function () {
          throw new Error();
        });
      } catch (e) { /* empty */ }
    }(), 'uses ToLength');
  }
});
