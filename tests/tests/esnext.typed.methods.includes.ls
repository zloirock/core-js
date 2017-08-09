{module, test} = QUnit
module \ESNext
DESCRIPTORS and test '%TypedArrayPrototype%.includes', !(assert)~>
  # we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for <[Float32Array Float64Array Int8Array Int16Array Int32Array Uint8Array Uint16Array Uint32Array Uint8ClampedArray]>
    Typed = global[..]
    assert.isFunction Typed::includes, "#{..}::includes is function"
    assert.arity Typed::includes, 1, "#{..}::includes arity is 1"
    assert.name Typed::includes, \includes, "#{..}::includes name is 'includes'"
    assert.looksNative Typed::includes, "#{..}::includes looks native"
    assert.same new Typed([1 1 1])includes(1), on
    assert.same new Typed([1 1 1])includes(2), no
    assert.same new Typed([1 2 3])includes(1 1), no
    assert.same new Typed([1 2 3])includes(2 1), on
    assert.same new Typed([1 2 3])includes(2 -1), no
    assert.same new Typed([1 2 3])includes(2 -2), on
    assert.throws (!-> Typed::includes.call [1 2], 1), "isn't generic"