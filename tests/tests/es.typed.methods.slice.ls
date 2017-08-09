{module, test} = QUnit
module \ES
DESCRIPTORS and test '%TypedArrayPrototype%.slice' (assert)!->
  # we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for <[Float32Array Float64Array Int8Array Int16Array Int32Array Uint8Array Uint16Array Uint32Array Uint8ClampedArray]>
    Typed = global[..]
    assert.isFunction Typed::slice, "#{..}::slice is function"
    NATIVE and assert.arity Typed::slice, 2, "#{..}::slice arity is 2"
    assert.name Typed::slice, \slice, "#{..}::slice name is 'subarray'"
    assert.looksNative Typed::slice, "#{..}::slice looks native"
    arr = new Typed [1 2 3 4 5]
    assert.ok arr.slice! isnt arr, 'returns new array'
    assert.ok arr.slice! instanceof Typed, 'correct instance'
    assert.ok arr.slice!buffer isnt arr.buffer, 'with new buffer'
    assert.arrayEqual arr.slice!, arr
    assert.arrayEqual arr.slice(1 3), [2 3]
    assert.arrayEqual arr.slice(1 void), [2 3 4 5]
    assert.arrayEqual arr.slice(1 -1), [2 3 4]
    assert.arrayEqual arr.slice(-2 -1), [4]
    assert.arrayEqual arr.slice(-2 -3), []
    assert.throws (!-> Typed::slice.call [1 2 3], 1), "isn't generic"