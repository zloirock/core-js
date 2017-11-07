var test = QUnit.test;

if (DESCRIPTORS) test('%TypedArrayPrototype%.map', function (assert) {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  var arrays = ['Float32Array', 'Float64Array', 'Int8Array', 'Int16Array', 'Int32Array', 'Uint8Array', 'Uint16Array', 'Uint32Array', 'Uint8ClampedArray'];
  for (var i = 0, length = arrays.length; i < length; ++i) {
    var name = arrays[i];
    var TypedArray = global[name];
    var map = TypedArray.prototype.map;
    assert.isFunction(map, name + '::map is function');
    assert.arity(map, 1, name + '::map arity is 1');
    assert.name(map, 'map', name + "::map name is 'map'");
    assert.looksNative(map, name + '::map looks native');
    var array = new TypedArray([1]);
    var context = {};
    array.map(function (value, key, that) {
      assert.same(arguments.length, 3, 'correct number of callback arguments');
      assert.same(value, 1, 'correct value in callback');
      assert.same(key, 0, 'correct index in callback');
      assert.same(that, array, 'correct link to array in callback');
      assert.same(this, context, 'correct callback context');
    }, context);
    var instance = new TypedArray([1, 2, 3, 4, 5]).map(function (it) {
      return it * 2;
    });
    assert.ok(instance instanceof TypedArray, 'correct instance');
    assert.arrayEqual(instance, [2, 4, 6, 8, 10], 'works');
    var values = '';
    var keys = '';
    new TypedArray([1, 2, 3]).map(function (value, key) {
      values += value;
      keys += key;
    });
    assert.same(values, '123');
    assert.same(keys, '012');
    assert['throws'](function () {
      map.call([0], function () { /* empty */ });
    }, "isn't generic");
  }
});
