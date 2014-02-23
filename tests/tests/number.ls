{isFunction} = Function
test 'Number.toInteger' !->
  {toInteger} = Number
  ok isFunction(toInteger), 'Is function'
  ok toInteger(null) is 0
  ok toInteger({}) is 0
  ok toInteger(NaN) is 0
  ok toInteger(-1) is -1
  ok Object.is -0, toInteger -0
  ok toInteger(-1.9) is -1
  ok toInteger(-Infinity) is -Infinity
  ok toInteger(-0x20000000000001) is -0x20000000000001
test 'Number::times' !->
  ok isFunction(Number::times), 'Is function'
  deepEqual 5.times(-> it), [0 1 2 3 4]
  deepEqual 5.times(-> it + &1), [0 2 4 6 8]
  deepEqual 5.times(-> it + &1 + &2), [5 7 9 11 13]
  deepEqual 5.times(-> (@ .|. 0) + it + &1 + &2), [5 7 9 11 13]
  deepEqual 5.times((->(@ .|. 0) + it + &1 + &2), 1), [6 8 10 12 14]
test 'Number::random' !->
  ok isFunction(Number::random), 'Is function'
  ok 100.times(-> 10.rand!)every -> 0 <= it <= 10
  ok 100.times(-> 10.rand 7)every -> 7 <= it <= 10
  ok 100.times(-> 7.rand 10)every -> 7 <= it <= 10
test 'Number::rand' !->
  ok isFunction(Number::rand), 'Is function'
  ok 100.times(-> 10.rand!)every (in [to 10])
  ok 100.times(-> 10.rand 7)every (in [7 to 10])
  ok 100.times(-> 7.rand 10)every (in [7 to 10])
test 'Number::{Math}' !->
  for <[round floor ceil abs sin asin cos acos tan atan exp sqrt max min pow atan2]>
    ok isFunction(Number::[..]), "Number::#{..} is function (ES3)"
  for <[acosh asinh atanh cbrt cosh expm1 hypot imul log1p log10 log2 sign sinh tanh trunc]>
    ok isFunction(Number::[..]), "Number::#{..} is function (ES6)"
  ok 3.max(2) is 3, 'context is argument of Number::{Math}'
  ok 3.min(2) is 2, 'Number::{Math} works with first argument'
  ok 1.max(2 3 4 5 6 7) is 7, 'Number::{Math} works with various arguments length'
  