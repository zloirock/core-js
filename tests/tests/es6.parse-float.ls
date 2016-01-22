{module, test} = QUnit
module \ES6

test 'parseFloat' (assert)!->
  assert.isFunction parseFloat
  assert.name parseFloat, \parseFloat
  assert.arity parseFloat, 1
  assert.looksNative parseFloat
  assert.same parseFloat('0'), 0
  assert.same parseFloat(' 0'), 0
  assert.same parseFloat('+0'), 0
  assert.same parseFloat(' +0'), 0
  assert.same parseFloat('-0'), -0
  assert.same parseFloat(' -0'), -0