{module, test} = QUnit
module \ES

if DESCRIPTORS => test 'Object#__defineGetter__' (assert)!->
  {__defineGetter__, __defineSetter__} = core.Object
  assert.isFunction __defineGetter__
  O = {}
  assert.same __defineGetter__(O, \key, -> 42), void, \void
  assert.same O.key, 42, \works
  __defineSetter__ O, \key, !-> @foo = 43
  O.key = 44
  assert.ok (O.key is 42 and O.foo is 43), 'works with setter'
  if STRICT => for [null void]
    assert.throws (!-> __defineGetter__ .., 1 ->), TypeError, "Throws on #{..} as `this`"