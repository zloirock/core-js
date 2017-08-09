{module, test} = QUnit
module \ES
DESCRIPTORS and test '%TypedArrayPrototype%.reduce', (assert)!->
  # we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for <[Float32Array Float64Array Int8Array Int16Array Int32Array Uint8Array Uint16Array Uint32Array Uint8ClampedArray]>
    Typed = global[..]
    assert.isFunction Typed::reduce, "#{..}::reduce is function"
    assert.arity Typed::reduce, 1, "#{..}::reduce arity is 1"
    assert.name Typed::reduce, \reduce, "#{..}::reduce name is 'reduce'"
    assert.looksNative Typed::reduce, "#{..}::reduce looks native"
    (a = new Typed [1])reduce (memo, val, key, that)->
      assert.same &length, 4, 'correct number of callback arguments'
      assert.same memo, accumulator, 'correct callback accumulator'
      assert.same val, 1, 'correct value in callback'
      assert.same key, 0, 'correct index in callback'
      assert.same that, a, 'correct link to array in callback'
    , accumulator = {}
    assert.same new Typed([1 2 3])reduce((+), 1), 7, 'works with initial accumulator'
    (a = new Typed [1 2])reduce (memo, val, key, that)->
      assert.same memo, 1, 'correct default accumulator'
      assert.same val, 2, 'correct start value without initial accumulator'
      assert.same key, 1, 'correct start index without initial accumulator'
    assert.same new Typed([1 2 3])reduce((+)), 6, 'works without initial accumulator'
    v = ''
    k = ''
    new Typed([1 2 3])reduce (memo, a, b)!->
      v += a
      k += b
    , 0
    assert.same v, \123,'correct order #1'
    assert.same k, \012,'correct order #2'
    assert.throws (!-> Typed::reduce.call [0], -> on), "isn't generic"