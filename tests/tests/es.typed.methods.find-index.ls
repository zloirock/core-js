{module, test} = QUnit
module \ES
DESCRIPTORS and test '%TypedArrayPrototype%.findIndex' (assert)->
  # we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for <[Float32Array Float64Array Int8Array Int16Array Int32Array Uint8Array Uint16Array Uint32Array Uint8ClampedArray]>
    Typed = global[..]
    assert.isFunction Typed::findIndex, "#{..}::findIndex is function"
    assert.arity Typed::findIndex, 1, "#{..}::findIndex arity is 1"
    assert.name Typed::findIndex, \findIndex, "#{..}::findIndex name is 'findIndex'"
    assert.looksNative Typed::findIndex, "#{..}::findIndex looks native"
    (a = new Typed [1])findIndex (val, key, that)!->
      assert.same &length, 3, 'correct number of callback arguments'
      assert.same val, 1, 'correct value in callback'
      assert.same key, 0, 'correct index in callback'
      assert.same that, a, 'correct link to array in callback'
      assert.same @, ctx, 'correct callback context'
    , ctx = {}
    assert.same new Typed([1 2 3])findIndex(-> !(it % 2)), 1
    assert.same new Typed([1 2 3])findIndex((is 4)), -1
    v = ''
    k = ''
    new Typed([1 2 3])findIndex (a, b)!->
      v += a
      k += b
    assert.same v, \123
    assert.same k, \012
    assert.throws (!-> Typed::findIndex.call [0], -> on), "isn't generic"