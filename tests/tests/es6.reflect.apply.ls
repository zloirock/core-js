{module, test} = QUnit
module \ES6

test 'Reflect.apply' (assert)->
  {apply} = Reflect
  assert.ok typeof! apply is \Function, 'is function'
  assert.strictEqual apply.length, 3, 'arity is 3'
  assert.ok /native code/.test(apply), 'looks like native'
  assert.strictEqual apply.name, \apply, 'name is "apply"'
  assert.strictEqual apply(Array::push, [1 2], [3 4 5]), 5
  C = (a, b, c)-> a + b + c
  C.apply = 42
  assert.strictEqual apply(C, null, <[foo bar baz]>), \foobarbaz, 'works with redefined apply'
  assert.throws (-> apply 42, null, []), TypeError, 'throws on primitive'