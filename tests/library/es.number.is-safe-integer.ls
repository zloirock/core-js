{module, test} = QUnit
module \ES

test 'Number.isSafeInteger' (assert)!->
  {isSafeInteger} = core.Number
  {create} = core.Object
  assert.isFunction isSafeInteger
  for [1 -1 2^16 2^16 - 1 2^31 2^31 - 1 2^32 2^32 - 1 -0 16~1fffffffffffff -16~1fffffffffffff]
    assert.ok isSafeInteger(..), "isSafeInteger #{typeof ..} #{..}"
  for [16~20000000000000 -16~20000000000000 NaN, 0.1, Infinity, \NaN, \5, no, new Number(NaN), new Number(Infinity), new Number(5), new Number(0.1), void, null, {}, ->, create(null)]
    assert.ok not isSafeInteger(..), "not isSafeInteger #{typeof ..} #{try String(..) catch e => 'Object.create(null)'}"