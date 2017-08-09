{module, test} = QUnit
module \ES

test 'Object.is' (assert)!->
  same = core.Object.is
  assert.isFunction same
  assert.ok same(1 1), '1 is 1'
  assert.ok same(NaN, NaN), '1 is 1'
  assert.ok not same(0 -0), '0 isnt -0'
  assert.ok not same({} {}), '{} isnt {}'