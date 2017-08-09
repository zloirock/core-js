{module, test} = QUnit
module \ES
DESCRIPTORS and test '%TypedArray%.of' (assert)!->
  # we can't implement %TypedArray% in all engines, so run all tests for each typed array constructor
  for <[Float32Array Float64Array Int8Array Int16Array Int32Array Uint8Array Uint16Array Uint32Array Uint8ClampedArray]>
    Typed = global[..]
    assert.isFunction Typed.of, "#{..}.of is function"
    assert.arity Typed.of, 0,  "#{..}.of arity is 0"
    assert.name Typed.of, \of,  "#{..}.of name is 'of'"
    assert.looksNative Typed.of,  "#{..}.of looks native"
    inst = Typed.of!
    assert.ok inst instanceof Typed, 'correct instance with 0 arguments'
    assert.arrayEqual inst, [], 'correct elements with 0 arguments'
    inst = Typed.of 1
    assert.ok inst instanceof Typed, 'correct instance with 1 argument'
    assert.arrayEqual inst, [1], 'correct elements with 1 argument'
    inst = Typed.of 1 2 3
    assert.ok inst instanceof Typed, 'correct instance with several arguments'
    assert.arrayEqual inst, [1 2 3], 'correct elements with several arguments'
    assert.throws (!-> Typed.of.call void, 1), "isn't generic #1"
    NATIVE and assert.throws (!-> Typed.of.call Array, 1), "isn't generic #2" # fails in V8 and FF