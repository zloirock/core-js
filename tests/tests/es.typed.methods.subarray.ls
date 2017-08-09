{module, test} = QUnit
module \ES
DESCRIPTORS and test '%TypedArrayPrototype%.subarray' (assert)!->
  # we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for <[Float32Array Float64Array Int8Array Int16Array Int32Array Uint8Array Uint16Array Uint32Array Uint8ClampedArray]>
    Typed = global[..]
    assert.isFunction Typed::subarray, "#{..}::subarray is function"
    NATIVE and assert.arity Typed::subarray, 2, "#{..}::subarray arity is 2" # Chromium 29- bug
    assert.name Typed::subarray, \subarray, "#{..}::subarray name is 'subarray'"
    assert.looksNative Typed::subarray, "#{..}::subarray looks native"
    a = new Typed [1 2 3 4 5]
    b = a.subarray(3)
    assert.ok a != b, 'creates new array'
    assert.ok b instanceof Typed, "instance #{..}"
    assert.same a.buffer, b.buffer, 'with the same buffer'
    assert.arrayEqual b, [4 5]
    assert.arrayEqual a.subarray(1 3), [2 3]
    assert.arrayEqual a.subarray(-3), [3 4 5]
    assert.arrayEqual a.subarray(-3 -1), [3 4]
    assert.arrayEqual a.subarray(3 2), []
    assert.arrayEqual a.subarray(-2 -3), []
    assert.arrayEqual a.subarray(4 1), []
    assert.arrayEqual a.subarray(-1 -4), []
    assert.arrayEqual a.subarray(1).subarray(1), [3 4 5]
    assert.arrayEqual a.subarray(1 4).subarray(1 2), [3]
    assert.throws (!-> Typed::subarray.call [1 2 3], 1), "isn't generic"