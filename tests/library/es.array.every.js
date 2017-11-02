var test = QUnit.test;

test('Array#every', function (assert) {
  var every = core.Array.every;
  assert.isFunction(every);
  var array = [1];
  var context = {};
  every(array, function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  assert.ok(every([1, 2, 3], function (it) {
    return typeof it === 'number';
  }));
  assert.ok(every([1, 2, 3], function (it) {
    return it < 4;
  }));
  assert.ok(!every([1, 2, 3], function (it) {
    return it < 3;
  }));
  assert.ok(!every([1, 2, 3], function (it) {
    return typeof it === 'string';
  }));
  assert.ok(every([1, 2, 3], function () {
    return +this === 1;
  }, 1));
  var rez = '';
  every([1, 2, 3], function (value, key) {
    return rez += key;
  });
  assert.ok(rez === '012');
  var arr = [1, 2, 3];
  assert.ok(every(arr, function (value, key, that) {
    return that === arr;
  }));
  if (STRICT) {
    assert['throws'](function () {
      every(null, function () { /* empty */ });
    }, TypeError);
    assert['throws'](function () {
      every(undefined, function () { /* empty */ });
    }, TypeError);
  }
});
