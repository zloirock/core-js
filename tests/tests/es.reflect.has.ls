{module, test} = QUnit
module \ES

test 'Reflect.has' (assert)->
  {has} = Reflect
  assert.isFunction has
  assert.arity has, 2
  assert.name has, \has
  assert.looksNative has
  assert.nonEnumerable Reflect, \has
  O = {qux: 987}
  assert.strictEqual has(O, \qux), on
  assert.strictEqual has(O, \qwe), no
  assert.strictEqual has(O, \toString), on
  assert.throws (-> has 42, \constructor), TypeError, 'throws on primitive'