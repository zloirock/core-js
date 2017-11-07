var test = QUnit.test;

if (DESCRIPTORS) test('%TypedArrayPrototype%.toString', function (assert) {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  var arrays = ['Float32Array', 'Float64Array', 'Int8Array', 'Int16Array', 'Int32Array', 'Uint8Array', 'Uint16Array', 'Uint32Array', 'Uint8ClampedArray'];
  for (var i = 0, length = arrays.length; i < length; ++i) {
    var name = arrays[i];
    var TypedArray = global[name];
    var toString = TypedArray.prototype.toString;
    assert.isFunction(toString, name + '::toString is function');
    assert.arity(toString, 0, name + '::toString arity is 0');
    assert.name(toString, 'toString', name + "::toString name is 'toString'");
    assert.looksNative(toString, name + '::toString looks native');
    assert.same(new TypedArray([1, 2, 3]).toString(), '1,2,3', 'works');
    assert.same(toString.call([1, 2, 3]), '1,2,3', 'generic');
  }
});
