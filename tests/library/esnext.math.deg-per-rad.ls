{module, test} = QUnit
module \ESNext

test 'Math.DEG_PER_RAD' (assert)!->
  {DEG_PER_RAD} = core.Math
  assert.ok \DEG_PER_RAD of core.Math, 'DEG_PER_RAD in Math'
  assert.strictEqual DEG_PER_RAD, Math.PI / 180, 'Is Math.PI / 180'