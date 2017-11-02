var test = QUnit.test;

test('Array#some', function (assert) {
  var some = core.Array.some;
  assert.isFunction(some);
  var array = [1];
  var context = {};
  some(array, function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  assert.ok(some([1, '2', 3], function (it) {
    return typeof it === 'number';
  }));
  assert.ok(some([1, 2, 3], function (it) {
    return it < 3;
  }));
  assert.ok(!some([1, 2, 3], function (it) {
    return it < 0;
  }));
  assert.ok(!some([1, 2, 3], function (it) {
    return typeof it === 'string';
  }));
  assert.ok(!some([1, 2, 3], function () {
    return +this !== 1;
  }, 1));
  var result = '';
  some([1, 2, 3], function (value, key) {
    result += key;
    return false;
  });
  assert.ok(result === '012');
  array = [1, 2, 3];
  assert.ok(!some(array, function (value, key, that) {
    return that !== array;
  }));
  if (STRICT) {
    assert['throws'](function () {
      some(null, function () { /* empty */ });
    }, TypeError);
    assert['throws'](function () {
      some(undefined, function () { /* empty */ });
    }, TypeError);
  }
});
