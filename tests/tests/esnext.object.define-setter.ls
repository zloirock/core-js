{module, test} = QUnit
module \ESNext

if DESCRIPTORS => test 'Object#__defineSetter__' (assert)!->
  {__defineSetter__} = Object::
  assert.isFunction __defineSetter__
  assert.arity __defineSetter__, 2
  assert.name __defineSetter__, \__defineSetter__
  assert.looksNative __defineSetter__
  assert.nonEnumerable Object::, \__defineSetter__
  O = {}
  assert.same O.__defineSetter__(\key, !-> @foo = 43), void, \void
  O.key = 44
  assert.same O.foo, 43, \works
  O = {}
  O.__defineSetter__ \key, !-> @foo = 43
  O.__defineGetter__ \key, -> 42
  O.key = 44
  assert.ok (O.key is 42 and O.foo is 43), 'works with getter'
  if STRICT => for [null void]
    assert.throws (!-> __defineSetter__.call .., 1 ->), TypeError, "Throws on #{..} as `this`"