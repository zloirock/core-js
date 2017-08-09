{module, test} = QUnit
module \ES

test 'Reflect.has' (assert)!->
  {has} = core.Reflect
  assert.isFunction has
  assert.arity has, 2
  if \name of has
    assert.name has, \has
  O = qux: 987
  assert.strictEqual has(O, \qux), on
  assert.strictEqual has(O, \qwe), no
  assert.strictEqual has(O, \toString), on
  assert.throws (!-> has 42, \constructor), TypeError, 'throws on primitive'