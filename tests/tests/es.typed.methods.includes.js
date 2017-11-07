var test = QUnit.test;

if (DESCRIPTORS) test('%TypedArrayPrototype%.includes', function (assert) {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  var arrays = ['Float32Array', 'Float64Array', 'Int8Array', 'Int16Array', 'Int32Array', 'Uint8Array', 'Uint16Array', 'Uint32Array', 'Uint8ClampedArray'];
  for (var i = 0, length = arrays.length; i < length; ++i) {
    var name = arrays[i];
    var TypedArray = global[name];
    var includes = TypedArray.prototype.includes;
    assert.isFunction(includes, name + '::includes is function');
    assert.arity(includes, 1, name + '::includes arity is 1');
    assert.name(includes, 'includes', name + "::includes name is 'includes'");
    assert.looksNative(includes, name + '::includes looks native');
    assert.same(new TypedArray([1, 1, 1]).includes(1), true);
    assert.same(new TypedArray([1, 2, 3]).includes(1, 1), false);
    assert.same(new TypedArray([1, 2, 3]).includes(2, 1), true);
    assert.same(new TypedArray([1, 2, 3]).includes(2, -1), false);
    assert.same(new TypedArray([1, 2, 3]).includes(2, -2), true);
    assert['throws'](function () {
      includes.call([1], 1);
    }, "isn't generic");
  }
});
