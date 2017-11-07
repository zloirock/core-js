var test = QUnit.test;

if (DESCRIPTORS) test('%TypedArrayPrototype%.subarray', function (assert) {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  var arrays = ['Float32Array', 'Float64Array', 'Int8Array', 'Int16Array', 'Int32Array', 'Uint8Array', 'Uint16Array', 'Uint32Array', 'Uint8ClampedArray'];
  for (var i = 0, length = arrays.length; i < length; ++i) {
    var name = arrays[i];
    var TypedArray = global[name];
    var subarray = TypedArray.prototype.subarray;
    assert.isFunction(subarray, name + '::subarray is function');
    if (NATIVE) assert.arity(subarray, 2, name + '::subarray arity is 2');
    assert.name(subarray, 'subarray', name + "::subarray name is 'subarray'");
    assert.looksNative(subarray, name + '::subarray looks native');
    var array1 = new TypedArray([1, 2, 3, 4, 5]);
    var array2 = array1.subarray(3);
    assert.ok(array1 !== array2, 'creates new array');
    assert.ok(array2 instanceof TypedArray, 'instance ' + name);
    assert.same(array1.buffer, array2.buffer, 'with the same buffer');
    assert.arrayEqual(array2, [4, 5]);
    assert.arrayEqual(array1.subarray(1, 3), [2, 3]);
    assert.arrayEqual(array1.subarray(-3), [3, 4, 5]);
    assert.arrayEqual(array1.subarray(-3, -1), [3, 4]);
    assert.arrayEqual(array1.subarray(3, 2), []);
    assert.arrayEqual(array1.subarray(-2, -3), []);
    assert.arrayEqual(array1.subarray(4, 1), []);
    assert.arrayEqual(array1.subarray(-1, -4), []);
    assert.arrayEqual(array1.subarray(1).subarray(1), [3, 4, 5]);
    assert.arrayEqual(array1.subarray(1, 4).subarray(1, 2), [3]);
    assert['throws'](function () {
      subarray.call([1, 2, 3], 1);
    }, "isn't generic");
  }
});
