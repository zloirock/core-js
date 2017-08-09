{module, test} = QUnit
module \ES

test 'Number.isInteger' (assert)!->
  {isInteger} = Number
  {create} = Object
  assert.isFunction isInteger
  assert.name isInteger, \isInteger
  assert.arity isInteger, 1
  assert.looksNative isInteger
  assert.nonEnumerable Number, \isInteger
  for [1 -1 2^16 2^16 - 1 2^31 2^31 - 1 2^32 2^32 - 1 -0]
    assert.ok isInteger(..), "isInteger #{typeof ..} #{..}"
  for [NaN, 0.1, Infinity, \NaN, \5, no, new Number(NaN), new Number(Infinity), new Number(5), new Number(0.1), void, null, {}, ->, create(null)]
    assert.ok not isInteger(..), "not isInteger #{typeof ..} #{try String(..) catch e => 'Object.create(null)'}"