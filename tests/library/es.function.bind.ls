{module, test} = QUnit
module \ES

test 'Function#bind' (assert)!->
  {bind} = core.Function
  assert.isFunction bind
  obj = a: 42
  assert.ok 42 is bind((-> @a), obj)!
  assert.ok void is new (bind((->), obj))!a
  fn = (@a, @b)->
  inst = new (bind fn, null, 1) 2
  assert.ok inst instanceof fn
  assert.strictEqual inst.a, 1
  assert.strictEqual inst.b, 2
  assert.ok 42 is bind((-> it), null 42)!
  fn = bind RegExp::test, /a/
  assert.ok fn \a
  F = bind Date, null 2015
  date = new F 6
  assert.ok date instanceof Date
  assert.strictEqual date.getFullYear!, 2015
  assert.strictEqual date.getMonth!, 6