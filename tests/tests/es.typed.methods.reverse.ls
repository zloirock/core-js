{module, test} = QUnit
module \ES
DESCRIPTORS and test '%TypedArrayPrototype%.reverse' (assert)!->
  # we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for <[Float32Array Float64Array Int8Array Int16Array Int32Array Uint8Array Uint16Array Uint32Array Uint8ClampedArray]>
    Typed = global[..]
    assert.isFunction Typed::reverse, "#{..}::reverse is function"
    assert.arity Typed::reverse, 0, "#{..}::reverse arity is 0"
    assert.name Typed::reverse, \reverse, "#{..}::reverse name is 'reverse'"
    assert.looksNative Typed::reverse, "#{..}::reverse looks native"
    assert.same (a = new Typed [1 2])reverse!, a, 'return this'
    assert.arrayEqual new Typed([1 2 3 4])reverse!, [4 3 2 1], 'works #1'
    assert.arrayEqual new Typed([1 2 3])reverse!, [3 2 1], 'works #2'
    assert.throws (!-> Typed::reverse.call [1 2]), "isn't generic"