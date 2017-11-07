var test = QUnit.test;

if (DESCRIPTORS) test('%TypedArrayPrototype%.forEach', function (assert) {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  var arrays = ['Float32Array', 'Float64Array', 'Int8Array', 'Int16Array', 'Int32Array', 'Uint8Array', 'Uint16Array', 'Uint32Array', 'Uint8ClampedArray'];
  for (var i = 0, length = arrays.length; i < length; ++i) {
    var name = arrays[i];
    var TypedArray = global[name];
    var forEach = TypedArray.prototype.forEach;
    assert.isFunction(forEach, name + '::forEach is function');
    assert.arity(forEach, 1, name + '::forEach arity is 1');
    assert.name(forEach, 'forEach', name + "::forEach name is 'forEach'");
    assert.looksNative(forEach, name + '::forEach looks native');
    var array = new TypedArray([1]);
    var context = {};
    array.forEach(function (value, key, that) {
      assert.same(arguments.length, 3, 'correct number of callback arguments');
      assert.same(value, 1, 'correct value in callback');
      assert.same(key, 0, 'correct index in callback');
      assert.same(that, array, 'correct link to array in callback');
      assert.same(this, context, 'correct callback context');
    }, context);
    assert.same(new TypedArray([1, 2, 3]).forEach(function (it) {
      return it % 2;
    }), undefined);
    var values = '';
    var keys = '';
    new TypedArray([1, 2, 3]).forEach(function (value, key) {
      values += value;
      keys += key;
    });
    assert.same(values, '123');
    assert.same(keys, '012');
    assert['throws'](function () {
      forEach.call([0], function () { /* empty */ });
    }, "isn't generic");
  }
});
