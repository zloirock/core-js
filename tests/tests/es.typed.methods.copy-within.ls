{module, test} = QUnit
module \ES
DESCRIPTORS and test '%TypedArrayPrototype%.copyWithin' (assert)!->
  global = Function('return this')!
  # we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for <[Float32Array Float64Array Int8Array Int16Array Int32Array Uint8Array Uint16Array Uint32Array Uint8ClampedArray]>
    Typed = global[..]
    assert.isFunction Typed::copyWithin, "#{..}::copyWithin is function"
    assert.arity Typed::copyWithin, 2, "#{..}::copyWithin arity is 2"
    assert.name Typed::copyWithin, \copyWithin, "#{..}::copyWithin name is 'copyWithin'"
    assert.looksNative Typed::copyWithin, "#{..}::copyWithin looks native"
    assert.strictEqual (a = new Typed(5)copyWithin(0)), a, 'return this'
    assert.arrayEqual new Typed([1 2 3 4 5])copyWithin(0 3), [4 5 3 4 5]
    assert.arrayEqual new Typed([1 2 3 4 5])copyWithin(1 3), [1 4 5 4 5]
    assert.arrayEqual new Typed([1 2 3 4 5])copyWithin(1 2), [1 3 4 5 5]
    assert.arrayEqual new Typed([1 2 3 4 5])copyWithin(2 2), [1 2 3 4 5]
    assert.arrayEqual new Typed([1 2 3 4 5])copyWithin(0 3 4), [4 2 3 4 5]
    assert.arrayEqual new Typed([1 2 3 4 5])copyWithin(1 3 4), [1 4 3 4 5]
    assert.arrayEqual new Typed([1 2 3 4 5])copyWithin(1 2 4), [1 3 4 4 5]
    assert.arrayEqual new Typed([1 2 3 4 5])copyWithin(0 -2), [4 5 3 4 5]
    assert.arrayEqual new Typed([1 2 3 4 5])copyWithin(0 -2 -1), [4 2 3 4 5]
    assert.arrayEqual new Typed([1 2 3 4 5])copyWithin(-4 -3 -2), [1 3 3 4 5]
    assert.arrayEqual new Typed([1 2 3 4 5])copyWithin(-4 -3 -1), [1 3 4 4 5]
    assert.arrayEqual new Typed([1 2 3 4 5])copyWithin(-4 -3), [1 3 4 5 5]
    assert.throws (!-> Typed::fill.call [0], 1), "isn't generic"