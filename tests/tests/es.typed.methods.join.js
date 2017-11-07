var test = QUnit.test;

DESCRIPTORS && test('%TypedArrayPrototype%.join', function (assert) {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  var arrays = ['Float32Array', 'Float64Array', 'Int8Array', 'Int16Array', 'Int32Array', 'Uint8Array', 'Uint16Array', 'Uint32Array', 'Uint8ClampedArray'];
  for (var i = 0, length = arrays.length; i < length; ++i) {
    var name = arrays[i];
    var TypedArray = global[name];
    var join = TypedArray.prototype.join;
    assert.isFunction(join, name + '::join is function');
    assert.arity(join, 1, name + '::join arity is 1');
    assert.name(join, 'join', name + "::join name is 'join'");
    assert.looksNative(join, name + '::join looks native');
    assert.same(new TypedArray([1, 2, 3]).join('|'), '1|2|3', 'works #1');
    assert.same(new TypedArray([1, 2, 3]).join(), '1,2,3', 'works #2');
    assert['throws'](function () {
      join.call([1, 2, 3]);
    }, "isn't generic");
  }
});
