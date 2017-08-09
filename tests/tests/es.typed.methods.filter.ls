{module, test} = QUnit
module \ES
DESCRIPTORS and test '%TypedArrayPrototype%.filter' (assert)!->
  # we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for <[Float32Array Float64Array Int8Array Int16Array Int32Array Uint8Array Uint16Array Uint32Array Uint8ClampedArray]>
    Typed = global[..]
    assert.isFunction Typed::filter, "#{..}::filter is function"
    assert.arity Typed::filter, 1, "#{..}::filter arity is 1"
    assert.name Typed::filter, \filter, "#{..}::filter name is 'filter'"
    assert.looksNative Typed::filter, "#{..}::filter looks native"
    (a = new Typed [1])filter (val, key, that)!->
      assert.same &length, 3, 'correct number of callback arguments'
      assert.same val, 1, 'correct value in callback'
      assert.same key, 0, 'correct index in callback'
      assert.same that, a, 'correct link to array in callback'
      assert.same @, ctx, 'correct callback context'
    , ctx = {}
    instance = new Typed([1 2 3 4 5 6 7 8 9])filter((% 2))
    assert.ok instance instanceof Typed, 'correct instance'
    assert.arrayEqual instance, [1 3 5 7 9], 'works'
    v = ''
    k = ''
    new Typed([1 2 3])filter (a, b)!->
      v += a
      k += b
    assert.same v, \123
    assert.same k, \012
    assert.throws (!-> Typed::filter.call [0], -> on), "isn't generic"