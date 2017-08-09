{module, test} = QUnit
module \ES

test 'Number.isNaN' (assert)!->
  {isNaN} = core.Number
  {create} = core.Object
  assert.isFunction isNaN
  assert.ok isNaN(NaN), 'Number.isNaN NaN'
  for [1 0.1 -1 2^16 2^16 - 1 2^31 2^31 - 1 2^32 2^32 - 1 -0 Infinity, \NaN, \5, no, new Number(NaN), new Number(Infinity), new Number(5), new Number(0.1), void, null, {}, ->, create(null)]
    assert.ok not isNaN(..), "not Number.isNaN #{typeof ..} #{try String(..) catch e => 'Object.create(null)'}"