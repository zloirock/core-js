{module, test} = QUnit
module \ESNext

if DESCRIPTORS => test 'Object#__lookupGetter__' (assert)!->
  {__lookupGetter__} = Object::
  {create} = Object
  assert.isFunction __lookupGetter__
  assert.arity __lookupGetter__, 1
  assert.name __lookupGetter__, \__lookupGetter__
  assert.looksNative __lookupGetter__
  assert.nonEnumerable Object::, \__lookupGetter__
  assert.same {}.__lookupGetter__(\key), void, 'empty object'
  assert.same {key: 42}.__lookupGetter__(\key), void, 'data descriptor'
  O = {}
  F = ->
  O.__defineGetter__ \key F
  assert.same O.__lookupGetter__(\key), F, 'own getter'
  assert.same (create O)__lookupGetter__(\key), F, 'proto getter'
  assert.same (create O)__lookupGetter__(\foo), void, 'empty proto'
  if STRICT => for [null void]
    assert.throws (!-> __lookupGetter__.call .., 1), TypeError, "Throws on #{..} as `this`"