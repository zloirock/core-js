var test = QUnit.test;

if (DESCRIPTORS) test('%TypedArrayPrototype%.toLocaleString', function (assert) {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  var arrays = ['Float32Array', 'Float64Array', 'Int8Array', 'Int16Array', 'Int32Array', 'Uint8Array', 'Uint16Array', 'Uint32Array', 'Uint8ClampedArray'];
  for (var i = 0, length = arrays.length; i < length; ++i) {
    var name = arrays[i];
    var TypedArray = global[name];
    var toLocaleString = TypedArray.prototype.toLocaleString;
    assert.isFunction(toLocaleString, name + '::toLocaleString is function');
    assert.arity(toLocaleString, 0, name + '::toLocaleString arity is 0');
    assert.name(toLocaleString, 'toLocaleString', name + "::toLocaleString name is 'toLocaleString'");
    assert.looksNative(toLocaleString, name + '::toLocaleString looks native');
    assert.same(new TypedArray([1, 2, 3]).toLocaleString(), [1, 2, 3].toLocaleString(), 'works');
    assert['throws'](function () {
      toLocaleString.call([1, 2, 3]);
    }, "isn't generic");
  }
});
