{module, test} = QUnit
module \ES
DESCRIPTORS and test '%TypedArrayPrototype%.some' (assert)!->
  # we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for <[Float32Array Float64Array Int8Array Int16Array Int32Array Uint8Array Uint16Array Uint32Array Uint8ClampedArray]>
    Typed = global[..]
    assert.isFunction Typed::some, "#{..}::some is function"
    assert.arity Typed::some, 1, "#{..}::some arity is 1"
    assert.name Typed::some, \some, "#{..}::some name is 'some'"
    assert.looksNative Typed::some, "#{..}::some looks native"
    (a = new Typed [1])some (val, key, that)->
      assert.same &length, 3, 'correct number of callback arguments'
      assert.same val, 1, 'correct value in callback'
      assert.same key, 0, 'correct index in callback'
      assert.same that, a, 'correct link to array in callback'
      assert.same @, ctx, 'correct callback context'
    , ctx = {}
    assert.ok new Typed([1 2 3])some -> typeof it is \number
    assert.ok new Typed([1 2 3])some (<3)
    assert.ok not new Typed([1 2 3])some (<0)
    assert.ok not new Typed([1 2 3])some -> typeof it is \string
    v = ''
    k = ''
    new Typed([1 2 3])some (a, b)!->
      v += a
      k += b
    assert.same v, \123
    assert.same k, \012
    assert.ok (arr = new Typed [1 2 3])some -> &2 is arr
    assert.throws (!-> Typed::some.call [0], -> on), "isn't generic"