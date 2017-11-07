var test = QUnit.test;

test('Array#includes', function (assert) {
  var includes = core.Array.includes;
  assert.isFunction(includes);
  var object = {};
  var array = [1, 2, 3, -0, object];
  assert.ok(includes(array, 1));
  assert.ok(includes(array, -0));
  assert.ok(includes(array, 0));
  assert.ok(includes(array, object));
  assert.ok(!includes(array, 4));
  assert.ok(!includes(array, -0.5));
  assert.ok(!includes(array, {}));
  assert.ok(includes(Array(1), undefined));
  assert.ok(includes([NaN], NaN));
  if (STRICT) {
    assert['throws'](function () {
      includes(null, 0);
    }, TypeError);
    assert['throws'](function () {
      includes(undefined, 0);
    }, TypeError);
  }
});
