{module, test} = QUnit
module \ES
DESCRIPTORS and test '%TypedArrayPrototype%.forEach' (assert)!->
  # we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for <[Float32Array Float64Array Int8Array Int16Array Int32Array Uint8Array Uint16Array Uint32Array Uint8ClampedArray]>
    Typed = global[..]
    assert.isFunction Typed::forEach, "#{..}::forEach is function"
    assert.arity Typed::forEach, 1, "#{..}::forEach arity is 1"
    assert.name Typed::forEach, \forEach, "#{..}::forEach name is 'forEach'"
    assert.looksNative Typed::forEach, "#{..}::forEach looks native"
    assert.same new Typed([1])forEach(!->), void, 'void'
    (a = new Typed [1])forEach (val, key, that)!->
      assert.same &length, 3, 'correct number of callback arguments'
      assert.same val, 1, 'correct value in callback'
      assert.same key, 0, 'correct index in callback'
      assert.same that, a, 'correct link to array in callback'
      assert.same @, ctx, 'correct callback context'
    , ctx = {}
    v = ''
    k = ''
    new Typed([1 2 3])forEach (a, b)!->
      v += a
      k += b
    assert.same v, \123
    assert.same k, \012
    assert.throws (!-> Typed::forEach.call [0], -> on), "isn't generic"