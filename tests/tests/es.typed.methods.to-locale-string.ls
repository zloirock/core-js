{module, test} = QUnit
module \ES
DESCRIPTORS and test '%TypedArrayPrototype%.toLocaleString' (assert)!->
  # we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for <[Float32Array Float64Array Int8Array Int16Array Int32Array Uint8Array Uint16Array Uint32Array Uint8ClampedArray]>
    Typed = global[..]
    assert.isFunction Typed::toLocaleString, "#{..}::toLocaleString is function"
    assert.arity Typed::toLocaleString, 0, "#{..}::toLocaleString arity is 0"
    assert.name Typed::toLocaleString, \toLocaleString, "#{..}::toLocaleString name is 'toLocaleString'"
    assert.looksNative Typed::toLocaleString, "#{..}::toLocaleString looks native"
    assert.same new Typed([1 2 3])toLocaleString!, [1 2 3]toLocaleString!, 'works'
    assert.throws (!-> Typed::toLocaleString.call [1 2 3]), "isn't generic"