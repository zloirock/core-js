{module, test} = QUnit
module \ES
DESCRIPTORS and test '%TypedArrayPrototype%.join' (assert)!->
  # we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for <[Float32Array Float64Array Int8Array Int16Array Int32Array Uint8Array Uint16Array Uint32Array Uint8ClampedArray]>
    Typed = global[..]
    assert.isFunction Typed::join, "#{..}::join is function"
    assert.arity Typed::join, 1, "#{..}::join arity is 1"
    assert.name Typed::join, \join, "#{..}::join name is 'join'"
    assert.looksNative Typed::join, "#{..}::join looks native"
    assert.same new Typed([1 2 3])join('|'), '1|2|3', 'works #1'
    assert.same new Typed([1 2 3])join!, '1,2,3', 'works #2'
    assert.throws (!-> Typed::join.call [1 2 3]), "isn't generic"