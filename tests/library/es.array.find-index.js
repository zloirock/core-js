var test = QUnit.test;

test('Array#findIndex', function (assert) {
  var findIndex = core.Array.findIndex;
  assert.isFunction(findIndex);
  var array = [1];
  var context = {};
  findIndex(array, function (value, key, that) {
    assert.strictEqual(this, context);
    assert.strictEqual(value, 1);
    assert.strictEqual(key, 0);
    assert.strictEqual(that, array);
  }, context);
  assert.strictEqual(findIndex([1, 3, NaN, 42, {}], function (it) {
    return it === 42;
  }), 3);
  if (STRICT) {
    assert['throws'](function () {
      findIndex(null, 0);
    }, TypeError);
    assert['throws'](function () {
      findIndex(undefined, 0);
    }, TypeError);
  }
});
