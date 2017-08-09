{module, test} = QUnit
module \ES
DESCRIPTORS and test '%TypedArrayPrototype%.toString' (assert)!->
  # we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for <[Float32Array Float64Array Int8Array Int16Array Int32Array Uint8Array Uint16Array Uint32Array Uint8ClampedArray]>
    Typed = global[..]
    assert.isFunction Typed::toString, "#{..}::toString is function"
    assert.arity Typed::toString, 0 "#{..}::toString arity is 0"
    assert.name Typed::toString, \toString, "#{..}::toString name is 'toString'"
    assert.looksNative Typed::toString, "#{..}::toString looks native"
    assert.same new Typed([1 2 3])toString!, '1,2,3', 'works'
    assert.same Typed::toString.call([1 2 3]), '1,2,3', "generic"