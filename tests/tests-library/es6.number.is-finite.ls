QUnit.module \ES6

test 'Number.isFinite' !->
  {isFinite} = core.Number
  {create} = core.Object
  ok typeof! isFinite is \Function, 'Is function'
  for [1 0.1 -1 2^16 2^16 - 1 2^31 2^31 - 1 2^32 2^32 - 1 -0]
    ok isFinite(..), "isFinite #{typeof ..} #{..}"
  for [NaN, Infinity, \NaN, \5, no, new Number(NaN), new Number(Infinity), new Number(5), new Number(0.1), void, null, {}, ->, create(null)]
    ok not isFinite(..), "not isFinite #{typeof ..} #{try String(..) catch e => 'Object.create(null)'}"