import { STRICT } from '../helpers/constants';

QUnit.test('Array#forEach', function (assert) {
  var forEach = core.Array.forEach;
  assert.isFunction(forEach);
  var array = [1];
  var context = {};
  forEach(array, function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  var result = '';
  forEach([1, 2, 3], function (it) {
    result += it;
  });
  assert.ok(result === '123');
  result = '';
  forEach([1, 2, 3], function (value, key) {
    result += key;
  });
  assert.ok(result === '012');
  result = '';
  forEach([1, 2, 3], function (value, key, that) {
    result += that;
  });
  assert.ok(result === '1,2,31,2,31,2,3');
  result = '';
  forEach([1, 2, 3], function () {
    result += this;
  }, 1);
  assert.ok(result === '111');
  result = '';
  array = [];
  array[5] = '';
  forEach(array, function (value, key) {
    result += key;
  });
  assert.ok(result === '5');
  if (STRICT) {
    assert.throws(function () {
      forEach(null, function () { /* empty */ });
    }, TypeError);
    assert.throws(function () {
      forEach(undefined, function () { /* empty */ });
    }, TypeError);
  }
});
