isFunction = -> typeof! it is \Function
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
  ok 100.times(-> 10.random!)every -> 0 <= it <= 10
  ok 100.times(-> 10.random 7)every -> 7 <= it <= 10
  ok 100.times(-> 7.random 10)every -> 7 <= it <= 10
test 'Math.randomInt' !->
  {randomInt} = Math
  ok isFunction(randomInt), 'Is function'
  ok 100.times(-> randomInt!)every (is 0)
  ok 100.times(-> randomInt 10)every (in [to 10])
  ok 100.times(-> randomInt 10 7)every (in [7 to 10])
  ok 100.times(-> randomInt 7 10)every (in [7 to 10])
test 'Number::{Math}' !->
  for <[round floor ceil abs sin asin cos acos tan atan exp sqrt max min pow atan2
        acosh asinh atanh cbrt clz32 cosh expm1 hypot imul log1p log10 log2 sign
        sinh tanh trunc randomInt]>
    ok isFunction(Number::[..]), "Number::#{..} is function"
  ok 1.min! is 1, 'context is argument of Number::{Math}'
  ok 3.max(2) is 3, 'context is argument of Number::{Math}'
  ok 3.min(2) is 2, 'Number::{Math} works with first argument'
  ok 1.max(2 3 4 5 6 7) is 7, 'Number::{Math} works with various arguments length'