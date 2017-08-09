{module, test} = QUnit
module \ESNext

test 'Promise#finally' (assert)!->
  assert.isFunction Promise::finally
  assert.arity Promise::finally, 1
  assert.looksNative Promise::finally
  assert.nonEnumerable Promise::, \finally
  assert.ok Promise.resolve(42).finally(->) instanceof Promise, 'returns a promise'

test 'Promise#finally, resolved' (assert)!->
  assert.expect 3
  async = assert.async!
  called = 0
  arg = void
  Promise.resolve 42
    .finally !->
      called++
      arg := it
    .then !->
      assert.same it, 42 'resolved with a correct value'
      assert.same called, 1 'onFinally function called one time'
      assert.same arg, void 'onFinally function called with a correct argument'
      async!

test 'Promise#finally, rejected' (assert)!->
  assert.expect 2
  async = assert.async!
  called = 0
  arg = void
  Promise.reject 42
    .finally !->
      called++
      arg := it
    .catch !->
      assert.same called, 1 'onFinally function called one time'
      assert.same arg, void 'onFinally function called with a correct argument'
      async!
