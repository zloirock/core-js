var test = QUnit.test;

if (DESCRIPTORS) test('%TypedArrayPrototype%.filter', function (assert) {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  var arrays = ['Float32Array', 'Float64Array', 'Int8Array', 'Int16Array', 'Int32Array', 'Uint8Array', 'Uint16Array', 'Uint32Array', 'Uint8ClampedArray'];
  for (var i = 0, length = arrays.length; i < length; ++i) {
    var name = arrays[i];
    var TypedArray = global[name];
    var filter = TypedArray.prototype.filter;
    assert.isFunction(filter, name + '::filter is function');
    assert.arity(filter, 1, name + '::filter arity is 1');
    assert.name(filter, 'filter', name + "::filter name is 'filter'");
    assert.looksNative(filter, name + '::filter looks native');
    var array = new TypedArray([1]);
    var context = {};
    array.filter(function (value, key, that) {
      assert.same(arguments.length, 3, 'correct number of callback arguments');
      assert.same(value, 1, 'correct value in callback');
      assert.same(key, 0, 'correct index in callback');
      assert.same(that, array, 'correct link to array in callback');
      assert.same(this, context, 'correct callback context');
    }, context);
    var instance = new TypedArray([1, 2, 3, 4, 5, 6, 7, 8, 9]).filter(function (it) {
      return it % 2;
    });
    assert.ok(instance instanceof TypedArray, 'correct instance');
    assert.arrayEqual(instance, [1, 3, 5, 7, 9], 'works');
    var values = '';
    var keys = '';
    new TypedArray([1, 2, 3]).filter(function (value, key) {
      values += value;
      keys += key;
    });
    assert.same(values, '123');
    assert.same(keys, '012');
    assert['throws'](function () {
      filter.call([0], function () { /* empty */ });
    }, "isn't generic");
  }
});
