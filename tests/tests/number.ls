{isFunction} = Function
test 'Number.toInteger' !->
  {toInteger} = Number
  ok isFunction toInteger
  ok toInteger(null) is 0
  ok toInteger({}) is 0
  ok toInteger(NaN) is 0
  ok toInteger(-1) is -1
  ok Object.is -0, toInteger -0
  ok toInteger(-1.9) is -1
  ok toInteger(-Infinity) is -Infinity
  ok toInteger(-0x20000000000001) is -0x20000000000001
test 'Number::times' !->
  ok isFunction Number::times
  deepEqual 5.times(-> it), [0 1 2 3 4]
  deepEqual 5.times(-> it + &1), [0 2 4 6 8]
  deepEqual 5.times(-> it + &1 + &2), [5 7 9 11 13]
  deepEqual 5.times(-> (@ .|. 0) + it + &1 + &2), [5 7 9 11 13]
  deepEqual 5.times((->(@ .|. 0) + it + &1 + &2), 1), [6 8 10 12 14]
test 'Number::random' !->
  ok isFunction Number::random
  ok 100.times(-> 10.rand!)every -> 0 <= it <= 10
  ok 100.times(-> 10.rand 7)every -> 7 <= it <= 10
  ok 100.times(-> 7.rand 10)every -> 7 <= it <= 10
test 'Number::rand' !->
  ok isFunction Number::rand
  ok 100.times(-> 10.rand!)every (in [to 10])
  ok 100.times(-> 10.rand 7)every (in [7 to 10])
  ok 100.times(-> 7.rand 10)every (in [7 to 10])
/*
test 'Number::isOdd' !->
  ok isFunction Number::isOdd
  ok 1.isOdd!
  ok 111.isOdd!
  ok (-1)isOdd!
  ok not NaN.isOdd!
  ok not Infinity.isOdd!
  ok not (-1.5)isOdd!
  ok not (1.5)isOdd!
  ok not 2.isOdd!
  ok not 222.isOdd!
test 'Number::isEven' !->
  ok isFunction Number::isEven
  ok 2.isEven!
  ok 222.isEven!
  ok (-2)isEven!
  ok not NaN.isEven!
  ok not Infinity.isEven!
  ok not (-1.5)isEven!
  ok not (1.5)isEven!
  ok not 1.isEven!
  ok not 111.isEven!
test 'Number::format' !->
  ok isFunction Number::format
  ok NaN.format! is \NaN
  ok (-Infinity)format! is \-Infinity
  ok 123.format! is \123
  ok (-123)format! is \-123
  ok 123.45.format! is \123
  ok (-123.45)format! is \-123
  ok NaN.format(3) is \NaN
  ok (-Infinity)format(3) is \-Infinity
  ok NaN.format(7 ', ' '. ') is \NaN
  ok (-Infinity)format(7 ', ' '. ') is \-Infinity
  ok 123.format(3) is '123.000'
  ok (-123)format(3) is '-123.000'
  ok 123.45678.format(3) is '123.457'
  ok (-123.45678)format(3) is '-123.457'
  ok 1234.format(7 ', ' '. ') is '1, 234. 000, 000, 0'
  ok (-1234)format(7 ', ' '. ') is '-1, 234. 000, 000, 0'
  ok 1234.45678.format(7 ', ' '. ') is '1, 234. 456, 780, 0'
  ok (-1234.45678)format(7 ', ' '. ') is '-1, 234. 456, 780, 0'
  ok (-1234.45678)format(null ', ' '. ') is '-1, 234'
  ok (0.1 ^ 10)format(6 \. \,) is '0,000.000'
*/
test 'Number:: <<< Math' !->
  # TODO
  ok isFunction Number::round
  ok isFunction Number::floor
  ok isFunction Number::ceil
  ok isFunction Number::abs
  ok isFunction Number::sin
  ok isFunction Number::asin
  ok isFunction Number::cos
  ok isFunction Number::acos
  ok isFunction Number::tan
  ok isFunction Number::atan
  ok isFunction Number::exp
  ok isFunction Number::pow
  ok isFunction Number::sqrt
  ok isFunction Number::max
  ok isFunction Number::min
  ok isFunction Number::pow
  ok isFunction Number::atan2
  ok isFunction Number::acosh
  ok isFunction Number::asinh
  ok isFunction Number::atanh
  ok isFunction Number::cbrt
  ok isFunction Number::cosh
  ok isFunction Number::expm1
  ok isFunction Number::hypot
  ok isFunction Number::imul
  ok isFunction Number::log1p
  ok isFunction Number::log10
  ok isFunction Number::log2
  ok isFunction Number::sign
  ok isFunction Number::sinh
  ok isFunction Number::tanh
  ok isFunction Number::trunc