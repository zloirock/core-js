{module, test} = QUnit
module \ESNext

if DESCRIPTORS => test 'Object#__defineSetter__' (assert)!->
  {__defineSetter__, __defineGetter__} = core.Object
  assert.isFunction __defineSetter__
  O = {}
  assert.same __defineSetter__(O, \key, !-> @foo = 43), void, \void
  O.key = 44
  assert.same O.foo, 43, \works
  O = {}
  __defineSetter__ O, \key, !-> @foo = 43
  __defineGetter__ O, \key, -> 42
  O.key = 44
  assert.ok (O.key is 42 and O.foo is 43), 'works with getter'
  if STRICT => for [null void]
    assert.throws (!-> __defineSetter__ .., 1 ->), TypeError, "Throws on #{..} as `this`"