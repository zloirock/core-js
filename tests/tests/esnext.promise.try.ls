{module, test} = QUnit
module \ESNext

test 'Promise.try' (assert)!->
  assert.isFunction Promise.try
  assert.arity Promise.try, 1
  assert.looksNative Promise.try
  assert.nonEnumerable Promise, \try
  assert.ok Promise.try(-> 42) instanceof Promise, 'returns a promise'

test 'Promise.try, resolved' (assert)!->
  assert.expect 1
  async = assert.async!
  Promise.try(-> 42).then !->
    assert.same it, 42 'resolved with a correct value'
    async!

test 'Promise.try, rejected' (assert)!->
  assert.expect 1
  async = assert.async!
  Promise.try(-> throw 42).catch !->
    assert.ok on 'rejected as expected'
    async!
