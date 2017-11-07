var test = QUnit.test;

if (DESCRIPTORS) test('%TypedArrayPrototype%.lastIndexOf', function (assert) {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  var arrays = ['Float32Array', 'Float64Array', 'Int8Array', 'Int16Array', 'Int32Array', 'Uint8Array', 'Uint16Array', 'Uint32Array', 'Uint8ClampedArray'];
  for (var i = 0, length = arrays.length; i < length; ++i) {
    var name = arrays[i];
    var TypedArray = global[name];
    var lastIndexOf = TypedArray.prototype.lastIndexOf;
    assert.isFunction(lastIndexOf, name + '::lastIndexOf is function');
    assert.arity(lastIndexOf, 1, name + '::lastIndexOf arity is 1');
    assert.name(lastIndexOf, 'lastIndexOf', name + "::lastIndexOf name is 'lastIndexOf'");
    assert.looksNative(lastIndexOf, name + '::lastIndexOf looks native');
    assert.same(new TypedArray([1, 1, 1]).lastIndexOf(1), 2);
    assert.same(new TypedArray([1, 2, 3]).lastIndexOf(3, 1), -1);
    assert.same(new TypedArray([1, 2, 3]).lastIndexOf(2, 1), 1);
    assert.same(new TypedArray([1, 2, 3]).lastIndexOf(2, -3), -1);
    assert.same(new TypedArray([1, 2, 3]).lastIndexOf(2, -2), 1);
    assert['throws'](function () {
      lastIndexOf.call([1], 1);
    }, "isn't generic");
  }
});
