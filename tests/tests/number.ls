{isFunction} = Object
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
test 'Number::div' !->
  ok isFunction Number::div
  ok (-7)div(3) is -2
  ok 7.div(3) is 2
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
test 'Number::odd' !->
  ok isFunction Number::odd
  ok 1.odd!
  ok 111.odd!
  ok (-1)odd!
  ok not NaN.odd!
  ok not Infinity.odd!
  ok not (-1.5)odd!
  ok not (1.5)odd!
  ok not 2.odd!
  ok not 222.odd!
test 'Number::even' !->
  ok isFunction Number::even
  ok 2.even!
  ok 222.even!
  ok (-2)even!
  ok not NaN.even!
  ok not Infinity.even!
  ok not (-1.5)even!
  ok not (1.5)even!
  ok not 1.even!
  ok not 111.even!
test 'Number::format' !->
  ok isFunction Number::format
  ok NaN.format! is \0
  ok 123.format! is \123
  ok (-123)format! is \-123
  ok 123.45.format! is \123
  ok (-123.45)format! is \-123
  ok NaN.format(3) is '0.000'
  ok 123.format(3) is '123.000'
  ok (-123)format(3) is '-123.000'
  ok 123.45678.format(3) is '123.457'
  ok (-123.45678)format(3) is '-123.457'
  ok NaN.format(7 ', ' '. ') is '0. 000, 000, 0'
  ok 1234.format(7 ', ' '. ') is '1, 234. 000, 000, 0'
  ok (-1234)format(7 ', ' '. ') is '-1, 234. 000, 000, 0'
  ok 1234.45678.format(7 ', ' '. ') is '1, 234. 456, 780, 0'
  ok (-1234.45678)format(7 ', ' '. ') is '-1, 234. 456, 780, 0'
  ok (-1234.45678)format(null ', ' '. ') is '-1, 234'
  ok (0.1 ^ 10)format(6 \. \,) is '0,000.000'
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