{module, test} = QUnit
module 'ESNext'

test 'Reflect.metadata' (assert)!->
  {metadata, hasOwnMetadata} = Reflect
  assert.isFunction metadata
  assert.arity metadata, 2
  assert.name metadata, \metadata
  assert.looksNative metadata
  assert.nonEnumerable Reflect, \metadata
  assert.isFunction metadata \key \value
  decorator = metadata \key \value
  assert.throws (!-> decorator void \name), TypeError
  assert.throws (!-> decorator {}, void), TypeError
  target = !->
  decorator target
  assert.same hasOwnMetadata(\key target, void), on
  target = {}
  decorator target, \name
  assert.same hasOwnMetadata(\key target, \name), on