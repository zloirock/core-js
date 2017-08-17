{module, test} = QUnit
module \ES

if DESCRIPTORS => test 'Object#__lookupGetter__' (assert)!->
  {__lookupGetter__, __defineGetter__} = core.Object
  {create} = core.Object
  assert.isFunction __lookupGetter__
  assert.same __lookupGetter__({}, \key), void, 'empty object'
  assert.same __lookupGetter__({key: 42}, \key), void, 'data descriptor'
  O = {}
  F = ->
  __defineGetter__ O, \key F
  assert.same __lookupGetter__(O, \key), F, 'own getter'
  assert.same __lookupGetter__((create O), \key), F, 'proto getter'
  assert.same __lookupGetter__((create O), \foo), void, 'empty proto'
  if STRICT => for [null void]
    assert.throws (!-> __lookupGetter__ .., 1), TypeError, "Throws on #{..} as `this`"