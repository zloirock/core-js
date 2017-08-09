{module, test} = QUnit
module \ESNext
test 'Math.RAD_PER_DEG' (assert)!->
  {RAD_PER_DEG} = Math
  assert.ok \RAD_PER_DEG of Math, 'RAD_PER_DEG in Math'
  assert.nonEnumerable Math, \RAD_PER_DEG
  assert.strictEqual RAD_PER_DEG, 180 / Math.PI, 'Is 180 / Math.PI'