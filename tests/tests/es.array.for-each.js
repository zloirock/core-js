var test = QUnit.test;

test('Array#forEach', function (assert) {
  var forEach = Array.prototype.forEach;
  assert.isFunction(forEach);
  assert.arity(forEach, 1);
  assert.name(forEach, 'forEach');
  assert.looksNative(forEach);
  assert.nonEnumerable(Array.prototype, 'forEach');
  var array = [1];
  var context = {};
  array.forEach(function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  var result = '';
  [1, 2, 3].forEach(function (value) {
    result += value;
  });
  assert.ok(result === '123');
  result = '';
  [1, 2, 3].forEach(function (value, key) {
    result += key;
  });
  assert.ok(result === '012');
  result = '';
  [1, 2, 3].forEach(function (value, key, that) {
    result += that;
  });
  assert.ok(result === '1,2,31,2,31,2,3');
  result = '';
  [1, 2, 3].forEach(function () {
    result += this;
  }, 1);
  assert.ok(result === '111');
  result = '';
  array = [];
  array[5] = '';
  array.forEach(function (value, key) {
    result += key;
  });
  assert.ok(result === '5');
  if (STRICT) {
    assert['throws'](function () {
      forEach.call(null, function () { /* empty */ });
    }, TypeError);
    assert['throws'](function () {
      forEach.call(undefined, function () { /* empty */ });
    }, TypeError);
  }
  if (NATIVE) {
    assert.ok(function () {
      try {
        return forEach.call({
          length: -1,
          0: 1
        }, function () {
          throw new Error();
        }) === undefined;
      } catch (e) { /* empty */ }
    }(), 'uses ToLength');
  }
});
