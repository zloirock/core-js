{module, test} = QUnit
module \ES
DESCRIPTORS and test '%TypedArrayPrototype%.every' (assert)!->
  # we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for <[Float32Array Float64Array Int8Array Int16Array Int32Array Uint8Array Uint16Array Uint32Array Uint8ClampedArray]>
    Typed = global[..]
    assert.isFunction Typed::every, "#{..}::every is function"
    assert.arity Typed::every, 1, "#{..}::every arity is 1"
    assert.name Typed::every, \every, "#{..}::every name is 'every'"
    assert.looksNative Typed::every, "#{..}::every looks native"
    (a = new Typed [1])every (val, key, that)!->
      assert.same &length, 3, 'correct number of callback arguments'
      assert.same val, 1, 'correct value in callback'
      assert.same key, 0, 'correct index in callback'
      assert.same that, a, 'correct link to array in callback'
      assert.same @, ctx, 'correct callback context'
    , ctx = {}
    assert.ok new Typed([1 2 3])every -> typeof it is \number
    assert.ok new Typed([1 2 3])every (<4)
    assert.ok not new Typed([1 2 3])every (<3)
    assert.ok not new Typed([1 2 3])every -> typeof it is \string
    assert.ok new Typed([1 2 3])every (-> +@ is 1 ), 1
    v = ''
    k = ''
    new Typed([1 2 3])every (a, b)->
      v += a
      k += b
      on
    assert.same v, \123
    assert.same k, \012
    assert.ok (arr = new Typed [1 2 3])every -> &2 is arr
    assert.throws (!-> Typed::every.call [0], -> on), "isn't generic"