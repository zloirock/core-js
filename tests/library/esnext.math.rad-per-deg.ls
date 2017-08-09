{module, test} = QUnit
module \ESNext

test 'Math.RAD_PER_DEG' (assert)!->
  {RAD_PER_DEG} = core.Math
  assert.ok \RAD_PER_DEG of core.Math, 'RAD_PER_DEG in Math'
  assert.strictEqual RAD_PER_DEG, 180 / Math.PI, 'Is 180 / Math.PI'