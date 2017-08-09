{module, test} = QUnit
module \ES
DESCRIPTORS and test '%TypedArrayPrototype%.find' (assert)!->
  # we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for <[Float32Array Float64Array Int8Array Int16Array Int32Array Uint8Array Uint16Array Uint32Array Uint8ClampedArray]>
    Typed = global[..]
    assert.isFunction Typed::find, "#{..}::find is function"
    assert.arity Typed::find, 1, "#{..}::find arity is 1"
    assert.name Typed::find, \find, "#{..}::find name is 'find'"
    assert.looksNative Typed::find, "#{..}::find looks native"
    (a = new Typed [1])find (val, key, that)!->
      assert.same &length, 3, 'correct number of callback arguments'
      assert.same val, 1, 'correct value in callback'
      assert.same key, 0, 'correct index in callback'
      assert.same that, a, 'correct link to array in callback'
      assert.same @, ctx, 'correct callback context'
    , ctx = {}
    assert.same new Typed([1 2 3])find(-> !(it % 2)), 2
    assert.same new Typed([1 2 3])find((is 4)), void
    v = ''
    k = ''
    new Typed([1 2 3])find (a, b)!->
      v += a
      k += b
    assert.same v, \123
    assert.same k, \012
    assert.throws (!-> Typed::find.call [0], -> on), "isn't generic"