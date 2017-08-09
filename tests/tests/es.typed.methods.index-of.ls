{module, test} = QUnit
module \ES
DESCRIPTORS and test '%TypedArrayPrototype%.indexOf' (assert)!->
  # we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for <[Float32Array Float64Array Int8Array Int16Array Int32Array Uint8Array Uint16Array Uint32Array Uint8ClampedArray]>
    Typed = global[..]
    assert.isFunction Typed::indexOf, "#{..}::indexOf is function"
    assert.arity Typed::indexOf, 1, "#{..}::indexOf arity is 1"
    assert.name Typed::indexOf, \indexOf, "#{..}::indexOf name is 'indexOf'"
    assert.looksNative Typed::indexOf, "#{..}::indexOf looks native"
    assert.same new Typed([1 1 1])indexOf(1), 0
    assert.same new Typed([1 2 3])indexOf(1 1), -1
    assert.same new Typed([1 2 3])indexOf(2 1), 1
    assert.same new Typed([1 2 3])indexOf(2 -1), -1
    assert.same new Typed([1 2 3])indexOf(2 -2), 1
    assert.throws (!-> Typed::indexOf.call [1 2], 1), "isn't generic"