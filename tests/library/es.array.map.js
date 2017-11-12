import { STRICT } from '../helpers/constants';

QUnit.test('Array#map', function (assert) {
  var map = core.Array.map;
  assert.isFunction(map);
  var array = [1];
  var context = {};
  map(array, function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  assert.deepEqual([2, 3, 4], map([1, 2, 3], function (it) {
    return it + 1;
  }));
  assert.deepEqual([1, 3, 5], map([1, 2, 3], function (value, key) {
    return value + key;
  }));
  assert.deepEqual([2, 2, 2], map([1, 2, 3], function () {
    return +this;
  }, 2));
  if (STRICT) {
    assert['throws'](function () {
      map(null, function () { /* empty */ });
    }, TypeError);
    assert['throws'](function () {
      map(undefined, function () { /* empty */ });
    }, TypeError);
  }
});
