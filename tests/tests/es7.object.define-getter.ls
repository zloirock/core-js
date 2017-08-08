{module, test} = QUnit
module 'ESNext'

if DESCRIPTORS => test 'Object#__defineGetter__' (assert)!->
  {__defineGetter__} = Object::
  assert.isFunction __defineGetter__
  assert.arity __defineGetter__, 2
  assert.name __defineGetter__, \__defineGetter__
  assert.looksNative __defineGetter__
  assert.nonEnumerable Object::, \__defineGetter__
  O = {}
  assert.same O.__defineGetter__(\key, -> 42), void, \void
  assert.same O.key, 42, \works
  O.__defineSetter__ \key, !-> @foo = 43
  O.key = 44
  assert.ok (O.key is 42 and O.foo is 43), 'works with setter'
  if STRICT => for [null void]
    assert.throws (!-> __defineGetter__.call .., 1 ->), TypeError, "Throws on #{..} as `this`"