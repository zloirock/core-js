{module, test} = QUnit
module \ES6

test 'Number.isSafeInteger' (assert)->
  {isSafeInteger} = Number
  {create} = Object
  assert.ok typeof! isSafeInteger is \Function, 'is function'
  assert.strictEqual isSafeInteger.name, \isSafeInteger, 'name is "isSafeInteger"'
  assert.strictEqual isSafeInteger.length, 1, 'arity is 1'
  assert.ok /native code/.test(isSafeInteger), 'looks like native'
  for [1 -1 2^16 2^16 - 1 2^31 2^31 - 1 2^32 2^32 - 1 -0 16~1fffffffffffff -16~1fffffffffffff]
    assert.ok isSafeInteger(..), "isSafeInteger #{typeof ..} #{..}"
  for [16~20000000000000 -16~20000000000000 NaN, 0.1, Infinity, \NaN, \5, no, new Number(NaN), new Number(Infinity), new Number(5), new Number(0.1), void, null, {}, ->, create(null)]
    assert.ok not isSafeInteger(..), "not isSafeInteger #{typeof ..} #{try String(..) catch e => 'Object.create(null)'}"