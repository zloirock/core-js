{module, test} = QUnit
module \ES

if DESCRIPTORS => test 'Object#__lookupSetter__' (assert)!->
  {__lookupSetter__, __defineSetter__} = core.Object
  {create} = core.Object
  assert.isFunction __lookupSetter__
  assert.same __lookupSetter__({}, \key), void, 'empty object'
  assert.same __lookupSetter__({key: 42}, \key), void, 'data descriptor'
  O = {}
  F = ->
  __defineSetter__ O, \key F
  assert.same __lookupSetter__(O, \key), F, 'own setter'
  assert.same __lookupSetter__((create O), \key), F, 'proto setter'
  assert.same __lookupSetter__((create O), \foo), void, 'empty proto'
  if STRICT => for [null void]
    assert.throws (!-> __lookupSetter__ .., 1), TypeError, "Throws on #{..} as `this`"