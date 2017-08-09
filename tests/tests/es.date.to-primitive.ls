{module, test} = QUnit
module \ES

test 'Date#@@toPrimitive' (assert)!->
  TO_PRIMITIVE = Symbol.toPrimitive
  toPrimitive = Date::[TO_PRIMITIVE]
  assert.isFunction toPrimitive
  assert.arity toPrimitive, 1
  assert.nonEnumerable Object::, TO_PRIMITIVE
  date = new Date
  assert.same date[TO_PRIMITIVE](\string), date.toString!, 'generic, hint "string"'
  assert.same date[TO_PRIMITIVE](\number), +date, 'generic, hint "number"'
  assert.same date[TO_PRIMITIVE](\default), date.toString!, 'generic, hint "default"'
  assert.same toPrimitive.call(Object(2), \string), \2, 'generic, hint "string"'
  assert.same toPrimitive.call(Object(2), \number), 2, 'generic, hint "number"'
  assert.same toPrimitive.call(Object(2), \default), \2, 'generic, hint "default"'
  for [void '' \foo {toString: -> \string}]
    assert.throws (!-> new Date![TO_PRIMITIVE] ..), TypeError, "throws on #{..} as a hint"
  if STRICT => for [1 no \string null void]
    assert.throws (!-> toPrimitive.call .., \string), TypeError, "throws on #{..} as `this`"