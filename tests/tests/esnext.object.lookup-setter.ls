{module, test} = QUnit
module \ESNext

if DESCRIPTORS => test 'Object#__lookupSetter__' (assert)!->
  {__lookupSetter__} = Object::
  {create} = Object
  assert.isFunction __lookupSetter__
  assert.arity __lookupSetter__, 1
  assert.name __lookupSetter__, \__lookupSetter__
  assert.looksNative __lookupSetter__
  assert.nonEnumerable Object::, \__lookupSetter__
  assert.same {}.__lookupSetter__(\key), void, 'empty object'
  assert.same {key: 42}.__lookupSetter__(\key), void, 'data descriptor'
  O = {}
  F = ->
  O.__defineSetter__ \key F
  assert.same O.__lookupSetter__(\key), F, 'own setter'
  assert.same (create O)__lookupSetter__(\key), F, 'proto setter'
  assert.same (create O)__lookupSetter__(\foo), void, 'empty proto'
  if STRICT => for [null void]
    assert.throws (!-> __lookupSetter__.call .., 1), TypeError, "Throws on #{..} as `this`"