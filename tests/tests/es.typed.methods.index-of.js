var test = QUnit.test;

if (DESCRIPTORS) test('%TypedArrayPrototype%.indexOf', function (assert) {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  var arrays = ['Float32Array', 'Float64Array', 'Int8Array', 'Int16Array', 'Int32Array', 'Uint8Array', 'Uint16Array', 'Uint32Array', 'Uint8ClampedArray'];
  for (var i = 0, length = arrays.length; i < length; ++i) {
    var name = arrays[i];
    var TypedArray = global[name];
    var indexOf = TypedArray.prototype.indexOf;
    assert.isFunction(indexOf, name + '::indexOf is function');
    assert.arity(indexOf, 1, name + '::indexOf arity is 1');
    assert.name(indexOf, 'indexOf', name + "::indexOf name is 'indexOf'");
    assert.looksNative(indexOf, name + '::indexOf looks native');
    assert.same(new TypedArray([1, 1, 1]).indexOf(1), 0);
    assert.same(new TypedArray([1, 2, 3]).indexOf(1, 1), -1);
    assert.same(new TypedArray([1, 2, 3]).indexOf(2, 1), 1);
    assert.same(new TypedArray([1, 2, 3]).indexOf(2, -1), -1);
    assert.same(new TypedArray([1, 2, 3]).indexOf(2, -2), 1);
    assert['throws'](function () {
      indexOf.call([1], 1);
    }, "isn't generic");
  }
});
