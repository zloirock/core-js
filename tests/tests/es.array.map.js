var test = QUnit.test;

test('Array#map', function (assert) {
  var map = Array.prototype.map;
  assert.isFunction(map);
  assert.arity(map, 1);
  assert.name(map, 'map');
  assert.looksNative(map);
  assert.nonEnumerable(Array.prototype, 'map');
  var array = [1];
  var context = {};
  array.map(function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  assert.deepEqual([2, 3, 4], [1, 2, 3].map(function (value) {
    return value + 1;
  }));
  assert.deepEqual([1, 3, 5], [1, 2, 3].map(function (value, key) {
    return value + key;
  }));
  assert.deepEqual([2, 2, 2], [1, 2, 3].map(function () {
    return +this;
  }, 2));
  if (STRICT) {
    assert['throws'](function () {
      map.call(null, function () { /* empty */ });
    }, TypeError);
    assert['throws'](function () {
      map.call(undefined, function () { /* empty */ });
    }, TypeError);
  }
  if (NATIVE) {
    assert.ok(function () {
      try {
        return map.call({
          length: -1,
          0: 1
        }, function () {
          throw new Error();
        });
      } catch (e) { /* empty */ }
    }(), 'uses ToLength');
  }
});
