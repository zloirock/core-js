{module, test} = QUnit
module \ES
DESCRIPTORS and test '%TypedArrayPrototype%.fill' (assert)!->
  # we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for <[Float32Array Float64Array Int8Array Int16Array Int32Array Uint8Array Uint16Array Uint32Array Uint8ClampedArray]>
    Typed = global[..]
    assert.isFunction Typed::fill, "#{..}::fill is function"
    assert.arity Typed::fill, 1, "#{..}::fill arity is 1"
    assert.name Typed::fill, \fill, "#{..}::fill name is 'fill'"
    assert.looksNative Typed::fill, "#{..}::fill looks native"
    assert.strictEqual (a = new Typed(5)fill(5)), a, 'return this'
    assert.arrayEqual new Typed(5)fill(5), [5 5 5 5 5], 'basic'
    assert.arrayEqual new Typed(5)fill(5 1), [0 5 5 5 5], 'start index'
    assert.arrayEqual new Typed(5)fill(5 1 4), [0 5 5 5 0], 'end index'
    assert.arrayEqual new Typed(5)fill(5 6 1), [0 0 0 0 0], 'start > end'
    assert.arrayEqual new Typed(5)fill(5 -3 4), [0 0 5 5 0], 'negative start index'
    assert.throws (!-> Typed::fill.call [0], 1), "isn't generic"