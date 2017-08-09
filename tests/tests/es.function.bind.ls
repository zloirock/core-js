{module, test} = QUnit
module \ES

test 'Function#bind' (assert)!->
  assert.isFunction Function::bind
  assert.arity Function::bind, 1
  assert.name Function::bind, \bind
  assert.looksNative Function::bind
  assert.nonEnumerable Function::, \bind
  obj = a: 42
  assert.ok 42 is (-> @a)bind(obj)!
  assert.ok void is new ((->)bind obj)!a
  fn = (@a, @b)->
  inst = new (fn.bind null, 1) 2
  assert.ok inst instanceof fn
  assert.strictEqual inst.a, 1
  assert.strictEqual inst.b, 2
  assert.ok 42 is (-> it)bind(null 42)!
  fn = RegExp::test.bind /a/
  assert.ok fn \a
  F = Date.bind null 2015
  date = new F 6
  assert.ok date instanceof Date
  assert.strictEqual date.getFullYear!, 2015
  assert.strictEqual date.getMonth!, 6