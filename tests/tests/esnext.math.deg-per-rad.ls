{module, test} = QUnit
module \ESNext
test 'Math.DEG_PER_RAD' (assert)!->
  {DEG_PER_RAD} = Math
  assert.ok \DEG_PER_RAD of Math, 'DEG_PER_RAD in Math'
  assert.nonEnumerable Math, \DEG_PER_RAD
  assert.strictEqual DEG_PER_RAD, Math.PI / 180, 'Is Math.PI / 180'