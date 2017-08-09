{module, test} = QUnit
module \ES

test 'Reflect.apply' (assert)!->
  {apply} = Reflect
  assert.isFunction apply
  assert.arity apply, 3
  assert.name apply, \apply
  assert.looksNative apply
  assert.nonEnumerable Reflect, \apply
  assert.strictEqual apply(Array::push, [1 2], [3 4 5]), 5
  C = (a, b, c)-> a + b + c
  C.apply = 42
  assert.strictEqual apply(C, null, <[foo bar baz]>), \foobarbaz, 'works with redefined apply'
  assert.throws (!-> apply 42, null, []), TypeError, 'throws on primitive as first argument'
  assert.throws (!-> apply (!->), null), TypeError, 'throws without third argument'
  assert.throws (!-> apply (!->), null, \123), TypeError, 'throws on primitive as third argument'