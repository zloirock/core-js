{module, test} = QUnit
module \ES
DESCRIPTORS and test '%TypedArray%.from' (assert)!->
  # we can't implement %TypedArray% in all engines, so run all tests for each typed array constructor
  for <[Float32Array Float64Array Int8Array Int16Array Int32Array Uint8Array Uint16Array Uint32Array Uint8ClampedArray]>
    Typed = global[..]
    assert.isFunction Typed.from, "#{..}.from is function"
    assert.arity Typed.from, 1,  "#{..}.from arity is 1"
    assert.name Typed.from, \from,  "#{..}.from name is 'from'"
    assert.looksNative Typed.from,  "#{..}.from looks native"
    inst = Typed.from [1 2 3]
    assert.ok inst instanceof Typed, 'correct instance with array'
    assert.arrayEqual inst, [1 2 3], 'correct elements with array'
    inst = Typed.from {0:1, 1:2, 2:3, length:3}
    assert.ok inst instanceof Typed, 'correct instance with array-like'
    assert.arrayEqual inst, [1 2 3], 'correct elements with array-like'
    inst = Typed.from createIterable [1 2 3]
    assert.ok inst instanceof Typed, 'correct instance with iterable'
    assert.arrayEqual inst, [1 2 3], 'correct elements with iterable'
    assert.arrayEqual Typed.from([1 2 3], -> it * it), [1 4 9], 'accept callback'
    Typed.from [1], (a, b)->
      assert.same &length, 2, 'correct number of callback arguments'
      assert.same a, 1, 'correct value in callback'
      assert.same b, 0, 'correct index in callback'
      assert.same @, O, 'correct callback context'
    , O = {}
    assert.throws (!-> Typed.from.call void, []), "isn't generic #1"
    if NATIVE
      assert.throws (!-> Typed.from.call Array, []), "isn't generic #2" # fails in FF
      assert.ok (try Typed.from {length: -1, 0: 1}, !-> throw 42), 'uses ToLength'