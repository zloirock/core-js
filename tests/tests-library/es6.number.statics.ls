QUnit.module 'ES6 Number statics'

eq = strictEqual
isFunction = -> typeof! it is \Function

{create} = core.Object

test 'Number.EPSILON' !->
  {EPSILON} = core.Number
  ok \EPSILON of core.Number, 'EPSILON in Number'
  eq EPSILON, 2^-52, 'Is 2^-52'
  ok 1 isnt 1 + EPSILON, '1 isnt 1 + EPSILON'
  eq 1, 1 + EPSILON / 2, '1 is 1 + EPSILON / 2'
test 'Number.isFinite' !->
  {isFinite} = core.Number
  ok isFunction(isFinite), 'Is function'
  for [1 0.1 -1 2^16 2^16 - 1 2^31 2^31 - 1 2^32 2^32 - 1 -0]
    ok isFinite(..), "isFinite #{typeof ..} #{..}"
  for [NaN, Infinity, \NaN, \5, no, new Number(NaN), new Number(Infinity), new Number(5), new Number(0.1), void, null, {}, ->, create(null)]
    ok not isFinite(..), "not isFinite #{typeof ..} #{try String(..) catch e => 'Object.create(null)'}"
test 'Number.isInteger' !->
  {isInteger} = core.Number
  ok isFunction(isInteger), 'Is function'
  for [1 -1 2^16 2^16 - 1 2^31 2^31 - 1 2^32 2^32 - 1 -0]
    ok isInteger(..), "isInteger #{typeof ..} #{..}"
  for [NaN, 0.1, Infinity, \NaN, \5, no, new Number(NaN), new Number(Infinity), new Number(5), new Number(0.1), void, null, {}, ->, create(null)]
    ok not isInteger(..), "not isInteger #{typeof ..} #{try String(..) catch e => 'Object.create(null)'}"
test 'Number.isNaN' !->
  {isNaN} = core.Number
  ok isFunction(isNaN), 'Is function'
  ok isNaN(NaN), 'Number.isNaN NaN'
  for [1 0.1 -1 2^16 2^16 - 1 2^31 2^31 - 1 2^32 2^32 - 1 -0 Infinity, \NaN, \5, no, new Number(NaN), new Number(Infinity), new Number(5), new Number(0.1), void, null, {}, ->, create(null)]
    ok not isNaN(..), "not Number.isNaN #{typeof ..} #{try String(..) catch e => 'Object.create(null)'}"
test 'Number.isSafeInteger' !->
  {isSafeInteger} = core.Number
  ok isFunction(isSafeInteger), 'Is function'
  for [1 -1 2^16 2^16 - 1 2^31 2^31 - 1 2^32 2^32 - 1 -0 16~1fffffffffffff -16~1fffffffffffff]
    ok isSafeInteger(..), "isSafeInteger #{typeof ..} #{..}"
  for [16~20000000000000 -16~20000000000000 NaN, 0.1, Infinity, \NaN, \5, no, new Number(NaN), new Number(Infinity), new Number(5), new Number(0.1), void, null, {}, ->, create(null)]
    ok not isSafeInteger(..), "not isSafeInteger #{typeof ..} #{try String(..) catch e => 'Object.create(null)'}"
test 'Number.MAX_SAFE_INTEGER' !->
  eq core.Number.MAX_SAFE_INTEGER, 2^53 - 1, 'Is 2^53 - 1'
test 'Number.MIN_SAFE_INTEGER' !->
  eq core.Number.MIN_SAFE_INTEGER, -2^53 + 1, 'Is -2^53 + 1'
test 'Number.parseFloat' !->
  ok isFunction(core.Number.parseFloat), 'Is function'
test 'Number.parseInt' !->
  ok isFunction(core.Number.parseInt), 'Is function'