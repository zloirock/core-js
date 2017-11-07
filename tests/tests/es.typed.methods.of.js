var test = QUnit.test;

if (DESCRIPTORS) test('%TypedArray%.of', function (assert) {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  var arrays = ['Float32Array', 'Float64Array', 'Int8Array', 'Int16Array', 'Int32Array', 'Uint8Array', 'Uint16Array', 'Uint32Array', 'Uint8ClampedArray'];
  for (var i = 0, length = arrays.length; i < length; ++i) {
    var name = arrays[i];
    var TypedArray = global[name];
    assert.isFunction(TypedArray.of, name + '.of is function');
    assert.arity(TypedArray.of, 0, name + '.of arity is 0');
    assert.name(TypedArray.of, 'of', name + ".of name is 'of'");
    assert.looksNative(TypedArray.of, name + '.of looks native');
    var instance = TypedArray.of();
    assert.ok(instance instanceof TypedArray, 'correct instance with 0 arguments');
    assert.arrayEqual(instance, [], 'correct elements with 0 arguments');
    instance = TypedArray.of(1);
    assert.ok(instance instanceof TypedArray, 'correct instance with 1 argument');
    assert.arrayEqual(instance, [1], 'correct elements with 1 argument');
    instance = TypedArray.of(1, 2, 3);
    assert.ok(instance instanceof TypedArray, 'correct instance with several arguments');
    assert.arrayEqual(instance, [1, 2, 3], 'correct elements with several arguments');
    assert['throws'](function () {
      TypedArray.of.call(undefined, 1);
    }, "isn't generic #1");
    NATIVE && assert['throws'](function () {
      TypedArray.of.call(Array, 1);
    }, "isn't generic #2");
  }
});
