var test = QUnit.test;

if (DESCRIPTORS) test('%TypedArrayPrototype%.reverse', function (assert) {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  var arrays = ['Float32Array', 'Float64Array', 'Int8Array', 'Int16Array', 'Int32Array', 'Uint8Array', 'Uint16Array', 'Uint32Array', 'Uint8ClampedArray'];
  for (var i = 0, length = arrays.length; i < length; ++i) {
    var name = arrays[i];
    var TypedArray = global[name];
    var reverse = TypedArray.prototype.reverse;
    assert.isFunction(reverse, name + '::reverse is function');
    assert.arity(reverse, 0, name + '::reverse arity is 0');
    assert.name(reverse, 'reverse', name + "::reverse name is 'reverse'");
    assert.looksNative(reverse, name + '::reverse looks native');
    var array = new TypedArray([1, 2]);
    assert.same(array.reverse(), array, 'return this');
    assert.arrayEqual(new TypedArray([1, 2, 3, 4]).reverse(), [4, 3, 2, 1], 'works #1');
    assert.arrayEqual(new TypedArray([1, 2, 3]).reverse(), [3, 2, 1], 'works #2');
    assert['throws'](function () {
      reverse.call([1, 2]);
    }, "isn't generic");
  }
});
