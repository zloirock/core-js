QUnit.module 'core-js Number'
isFunction = -> typeof! it is \Function

test '#random' !->
  ok isFunction(Number::random), 'Is function'
  ok [10.random! for til 100]every -> 0 <= it <= 10
  ok [10.random 7 for til 100]every -> 7 <= it <= 10
  ok [7.random 10 for til 100]every -> 7 <= it <= 10

test '#{...Math}' !->
  for <[round floor ceil abs sin asin cos acos tan atan exp sqrt max min pow atan2
        acosh asinh atanh cbrt clz32 cosh expm1 hypot imul log1p log10 log2 sign
        sinh tanh trunc]>
    ok isFunction(Number::[..]), "Number::#{..} is function"
  ok 1.min! is 1, 'context is argument of Number::#{..}'
  ok 3.max(2) is 3, 'context is argument of Number::#{..}'
  ok 3.min(2) is 2, 'Number::#{..} works with first argument'
  ok 1.max(2 3 4 5 6 7) is 7, 'Number::#{..} works with various arguments length'