var test = QUnit.test;

if (DESCRIPTORS) test('%TypedArrayPrototype%.fill', function (assert) {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  var arrays = ['Float32Array', 'Float64Array', 'Int8Array', 'Int16Array', 'Int32Array', 'Uint8Array', 'Uint16Array', 'Uint32Array', 'Uint8ClampedArray'];
  for (var i = 0, length = arrays.length; i < length; ++i) {
    var name = arrays[i];
    var TypedArray = global[name];
    var fill = TypedArray.prototype.fill;
    assert.isFunction(fill, name + '::fill is function');
    assert.arity(fill, 1, name + '::fill arity is 1');
    assert.name(fill, 'fill', name + "::fill name is 'fill'");
    assert.looksNative(fill, name + '::fill looks native');
    var array = new TypedArray(5);
    assert.strictEqual(array.fill(5), array, 'return this');
    assert.arrayEqual(new TypedArray(5).fill(5), [5, 5, 5, 5, 5], 'basic');
    assert.arrayEqual(new TypedArray(5).fill(5, 1), [0, 5, 5, 5, 5], 'start index');
    assert.arrayEqual(new TypedArray(5).fill(5, 1, 4), [0, 5, 5, 5, 0], 'end index');
    assert.arrayEqual(new TypedArray(5).fill(5, 6, 1), [0, 0, 0, 0, 0], 'start > end');
    assert.arrayEqual(new TypedArray(5).fill(5, -3, 4), [0, 0, 5, 5, 0], 'negative start index');
    assert['throws'](function () {
      fill.call([0], 1);
    }, "isn't generic");
  }
});
