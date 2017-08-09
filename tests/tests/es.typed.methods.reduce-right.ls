{module, test} = QUnit
module \ES
DESCRIPTORS and test '%TypedArrayPrototype%.reduceRight' (assert)!->
  # we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for <[Float32Array Float64Array Int8Array Int16Array Int32Array Uint8Array Uint16Array Uint32Array Uint8ClampedArray]>
    Typed = global[..]
    assert.isFunction Typed::reduceRight, "#{..}::reduceRight is function"
    assert.arity Typed::reduceRight, 1, "#{..}::reduceRight arity is 1"
    assert.name Typed::reduceRight, \reduceRight, "#{..}::reduceRight name is 'reduceRight'"
    assert.looksNative Typed::reduceRight, "#{..}::reduceRight looks native"
    (a = new Typed [1])reduceRight (memo, val, key, that)->
      assert.same &length, 4, 'correct number of callback arguments'
      assert.same memo, accumulator, 'correct callback accumulator'
      assert.same val, 1, 'correct value in callback'
      assert.same key, 0, 'correct index in callback'
      assert.same that, a, 'correct link to array in callback'
    , accumulator = {}
    assert.same new Typed([1 2 3])reduceRight((+), 1), 7, 'works with initial accumulator'
    (a = new Typed [1 2])reduceRight (memo, val, key, that)->
      assert.same memo, 2, 'correct default accumulator'
      assert.same val, 1, 'correct start value without initial accumulator'
      assert.same key, 0, 'correct start index without initial accumulator'
    assert.same new Typed([1 2 3])reduceRight((+)), 6, 'works without initial accumulator'
    v = ''
    k = ''
    new Typed([1 2 3])reduceRight (memo, a, b)!->
      v += a
      k += b
    , 0
    assert.same v, \321,'correct order #1'
    assert.same k, \210,'correct order #2'
    assert.throws (!-> Typed::reduceRight.call [0], -> on), "isn't generic"