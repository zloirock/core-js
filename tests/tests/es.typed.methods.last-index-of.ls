{module, test} = QUnit
module \ES
DESCRIPTORS and test '%TypedArrayPrototype%.lastIndexOf' (assert)!->
  # we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for <[Float32Array Float64Array Int8Array Int16Array Int32Array Uint8Array Uint16Array Uint32Array Uint8ClampedArray]>
    Typed = global[..]
    assert.isFunction Typed::lastIndexOf, "#{..}::lastIndexOf is function"
    assert.arity Typed::lastIndexOf, 1, "#{..}::lastIndexOf arity is 1"
    assert.name Typed::lastIndexOf, \lastIndexOf, "#{..}::lastIndexOf name is 'lastIndexOf'"
    assert.looksNative Typed::lastIndexOf, "#{..}::lastIndexOf looks native"
    assert.same new Typed([1 1 1])lastIndexOf(1), 2
    assert.same new Typed([1 2 3])lastIndexOf(3 1), -1
    assert.same new Typed([1 2 3])lastIndexOf(2 1), 1
    assert.same new Typed([1 2 3])lastIndexOf(2 -3), -1
    assert.same new Typed([1 2 3])lastIndexOf(2 -2), 1
    assert.throws (!-> Typed::lastIndexOf.call [1 2], 1), "isn't generic"