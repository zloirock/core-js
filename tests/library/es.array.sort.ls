{module, test} = QUnit
module \ES

test 'Array#sort' (assert)!->
  {sort} = core.Array
  assert.isFunction sort
  assert.ok !!(try sort [1 2 3], void), 'works with undefined'
  assert.throws (!-> sort [1 2 3], null), 'throws on null'
  assert.throws (!-> sort [1 2 3], {}), 'throws on {}'
  if STRICT
    assert.throws (!-> sort null), TypeError, 'ToObject(this)'
    assert.throws (!-> sort void), TypeError, 'ToObject(this)'