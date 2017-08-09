{module, test} = QUnit
module \ES

arrays = <[Float32Array Float64Array Int8Array Int16Array Int32Array Uint8Array Uint16Array Uint32Array Uint8ClampedArray]>

DESCRIPTORS and test '%TypedArrayPrototype%.keys' (assert)!->
  # we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for arrays
    Typed = global[..]
    assert.isFunction Typed::keys, "#{..}::keys is function"
    assert.arity Typed::keys, 0, "#{..}::keys arity is 0"
    assert.name Typed::keys, \keys, "#{..}::keys name is 'keys'"
    assert.looksNative Typed::keys, "#{..}::keys looks native"
    iter = new Typed([1 2 3])keys!
    assert.isIterator iter
    assert.isIterable iter
    assert.strictEqual iter[Symbol?toStringTag], 'Array Iterator'
    assert.deepEqual iter.next!, {value: 0, done: no}, 'step 1'
    assert.deepEqual iter.next!, {value: 1, done: no}, 'step 2'
    assert.deepEqual iter.next!, {value: 2, done: no}, 'step 3'
    assert.deepEqual iter.next!, {value: void, done: on}, 'done'
    NATIVE and assert.throws (!-> Typed::keys.call [1 2]), "isn't generic" # fails in V8 and edge

DESCRIPTORS and test '%TypedArrayPrototype%.values' (assert)!->
  # we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for arrays
    Typed = global[..]
    assert.isFunction Typed::values, "#{..}::values is function"
    assert.arity Typed::values, 0, "#{..}::values arity is 0"
    assert.name Typed::values, \values, "#{..}::values name is 'values'"
    assert.looksNative Typed::values, "#{..}::values looks native"
    iter = new Typed([1 2 3])values!
    assert.isIterator iter
    assert.isIterable iter
    assert.strictEqual iter[Symbol?toStringTag], 'Array Iterator'
    assert.deepEqual iter.next!, {value: 1, done: no}, 'step 1'
    assert.deepEqual iter.next!, {value: 2, done: no}, 'step 2'
    assert.deepEqual iter.next!, {value: 3, done: no}, 'step 3'
    assert.deepEqual iter.next!, {value: void, done: on}, 'done'
    NATIVE and assert.throws (!-> Typed::values.call [1 2]), "isn't generic" # fails in V8 and edge

DESCRIPTORS and test '%TypedArrayPrototype%.entries' (assert)!->
  # we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for arrays
    Typed = global[..]
    assert.isFunction Typed::entries, "#{..}::entries is function"
    assert.arity Typed::entries, 0, "#{..}::entries arity is 0"
    assert.name Typed::entries, \entries, "#{..}::entries name is 'entries'"
    assert.looksNative Typed::entries, "#{..}::entries looks native"
    iter = new Typed([1 2 3])entries!
    assert.isIterator iter
    assert.isIterable iter
    assert.strictEqual iter[Symbol?toStringTag], 'Array Iterator'
    assert.deepEqual iter.next!, {value: [0 1], done: no}, 'step 1'
    assert.deepEqual iter.next!, {value: [1 2], done: no}, 'step 2'
    assert.deepEqual iter.next!, {value: [2 3], done: no}, 'step 3'
    assert.deepEqual iter.next!, {value: void, done: on}, 'done'
    NATIVE and assert.throws (!-> Typed::entries.call [1 2]), "isn't generic" # fails in V8 and edge

DESCRIPTORS and test '%TypedArrayPrototype%.@@iterator' (assert)!->
  # we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for arrays
    Typed = global[..]
    assert.isIterable Typed::, "#{..} is itrable"
    assert.arity Typed::[Symbol?iterator], 0, "#{..}::@@iterator arity is 0"
    assert.name Typed::[Symbol?iterator], \values, "#{..}::@@iterator name is 'values'"
    assert.looksNative Typed::[Symbol?iterator], "#{..}::@@iterator looks native"
    assert.strictEqual Typed::[Symbol?iterator], Typed::values
    iter = new Typed([1 2 3])[Symbol?iterator]!
    assert.isIterator iter
    assert.isIterable iter
    assert.strictEqual iter[Symbol?toStringTag], 'Array Iterator'
    assert.deepEqual iter.next!, {value: 1, done: no}, 'step 1'
    assert.deepEqual iter.next!, {value: 2, done: no}, 'step 2'
    assert.deepEqual iter.next!, {value: 3, done: no}, 'step 3'
    assert.deepEqual iter.next!, {value: void, done: on}, 'done'
    NATIVE and assert.throws (!-> Typed::[Symbol?iterator]call [1 2]), "isn't generic" # fails in V8 and edge