import { STRICT } from '../helpers/constants';

QUnit.test('Array#find', function (assert) {
  var find = core.Array.find;
  assert.isFunction(find);
  var array = [1];
  var context = {};
  find(array, function (value, key, that) {
    assert.strictEqual(this, context);
    assert.strictEqual(value, 1);
    assert.strictEqual(key, 0);
    assert.strictEqual(that, array);
  }, context);
  assert.strictEqual(find([1, 3, NaN, 42, {}], function (it) {
    return it === 42;
  }), 42);
  assert.strictEqual(find([1, 3, NaN, 42, {}], function (it) {
    return it === 43;
  }), undefined);
  if (STRICT) {
    assert['throws'](function () {
      find(null, 0);
    }, TypeError);
    assert['throws'](function () {
      find(undefined, 0);
    }, TypeError);
  }
});
