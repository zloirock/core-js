{module, test} = QUnit
module \ES6

test 'Number.parseFloat' (assert)!->
  {parseFloat} = core.Number
  assert.isFunction parseFloat
  assert.arity parseFloat, 1
  assert.same parseFloat('0'), 0
  assert.same parseFloat(' 0'), 0
  assert.same parseFloat('+0'), 0
  assert.same parseFloat(' +0'), 0
  assert.same parseFloat('-0'), -0
  assert.same parseFloat(' -0'), -0
  assert.same parseFloat(null), NaN
  assert.same parseFloat(void), NaN