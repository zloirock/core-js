{module, test} = QUnit
module \ES
DESCRIPTORS and test '%TypedArrayPrototype%.set' (assert)!->
  # we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for <[Float32Array Float64Array Int8Array Int16Array Int32Array Uint8Array Uint16Array Uint32Array Uint8ClampedArray]>
    Typed = global[..]
    assert.isFunction Typed::set, "#{..}::set is function"
    NATIVE and assert.arity Typed::set, 1, "#{..}::set arity is 1" # 2 in most engines
    assert.name Typed::set, \set, "#{..}::set name is 'subarray'"
    assert.looksNative Typed::set, "#{..}::set looks native"
    assert.same new Typed(1).set([1]), void, 'void'
    a = new Typed [1 2 3 4 5]
    b = new Typed 5
    b.set a
    assert.arrayEqual b, [1 2 3 4 5]
    assert.throws !-> b.set a, 1
    assert.throws !-> b.set a, -1
    b.set new Typed([99, 98]), 2
    assert.arrayEqual b, [1 2 99 98 5]
    b.set new Typed([99 98 97]), 2
    assert.arrayEqual b, [1 2 99 98 97]
    assert.throws !-> b.set new Typed([99 98 97 96]), 2
    assert.throws !-> b.set [101, 102, 103, 104], 4
    assert.arrayEqual (new Typed(2)
      ..set length: 2, 0: 1, 1: 2
    ), [1 2]
    assert.throws (!-> Typed::set.call [1 2 3], [1]), "isn't generic"