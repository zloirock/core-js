{module, test} = QUnit
module \ES

test 'Object.getOwnPropertyDescriptor' (assert)!->
  {getOwnPropertyDescriptor} = Object
  assert.isFunction getOwnPropertyDescriptor
  assert.arity getOwnPropertyDescriptor, 2
  assert.name getOwnPropertyDescriptor, \getOwnPropertyDescriptor
  assert.looksNative getOwnPropertyDescriptor
  assert.nonEnumerable Object, \getOwnPropertyDescriptor
  assert.deepEqual getOwnPropertyDescriptor(q:42, \q), {+writable, +enumerable, +configurable, value: 42}
  assert.ok getOwnPropertyDescriptor({}, \toString) is void
  for value in [42 \foo no]
    assert.ok (try => getOwnPropertyDescriptor value; on), "accept #{typeof! value}"
  for value in [null void]
    assert.throws (!-> getOwnPropertyDescriptor value), TypeError, "throws on #value"