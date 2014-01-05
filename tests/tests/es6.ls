{isFunction} = Object
test 'Object.assign' !->
  {assign, defineProperty} = Object
  ok isFunction assign
  foo = q:1
  ok foo is assign foo, w:2
  ok foo.w is 2
  if Function.isNative Object.getOwnPropertyDescriptor
    foo = q:1
    foo2 = defineProperty {}, \w, get: -> @q + 1
    assign foo, foo2
    ok foo.w is void
test 'Object.is' !->
  ok isFunction Object.is
  ok Object.is  1 1
  ok Object.is  NaN, NaN
  ok not Object.is 0 -0
  ok not Object.is {} {}
test 'Object.mixin' !->
  {mixin, defineProperty} = Object
  ok isFunction mixin
  foo = q:1
  ok foo is mixin foo, w:2
  ok foo.w is 2
  if Function.isNative Object.getOwnPropertyDescriptor
    foo = q:1
    foo2 = defineProperty {}, \w, get: -> @q + 1
    mixin foo, foo2
    ok foo.w is 2
/*
if \__proto__ of Object:: or Function.isNative Object.setPrototypeOf
  test 'Object.setPrototypeOf' !->
    {setPrototypeOf} = Object
    ok isFunction setPrototypeOf
    ok \apply of setPrototypeOf {} Function::
    ok setPrototypeOf(a:2, {b: -> @a^2})b! is 4
    ok setPrototypeOf(tmp = {}, {a: 1}) is tmp
    ok !(\toString of setPrototypeOf {} null)
*/
test 'Number.EPSILON' !->
  ok \EPSILON of Number
  ok Number.EPSILON is 2.220446049250313e-16
  ok 1 isnt 1 + Number.EPSILON
  ok 1 is 1 + Number.EPSILON / 2
test 'Number.isFinite' !->
  {isFinite} = Number
  ok isFunction isFinite
  ok isFinite 1
  ok isFinite 0.1
  ok isFinite -1
  ok isFinite 2^16
  ok isFinite 2^16 - 1
  ok isFinite 2^31
  ok isFinite 2^31 - 1
  ok isFinite 2^32
  ok isFinite 2^32 - 1
  ok isFinite -0
  ok not isFinite NaN
  ok not isFinite Infinity
  ok not isFinite 'NaN'
  ok not isFinite '5'
  ok not isFinite no
  ok not isFinite new Number NaN
  ok not isFinite new Number Infinity
  ok not isFinite new Number 5
  ok not isFinite new Number 0.1
  ok not isFinite void
  ok not isFinite null
  ok not isFinite {}
  ok not isFinite ->
test 'Number.isInteger' !->
  {isInteger} = Number
  ok isFunction isInteger
  ok isInteger 1
  ok isInteger -1
  ok isInteger 2^16
  ok isInteger 2^16 - 1
  ok isInteger 2^31
  ok isInteger 2^31 - 1
  ok isInteger 2^32
  ok isInteger 2^32 - 1
  ok not isInteger NaN
  ok not isInteger 0.1
  ok not isInteger Infinity
  ok not isInteger \NaN
  ok not isInteger \5
  ok not isInteger no
  ok not isInteger new Number NaN
  ok not isInteger new Number Infinity
  ok not isInteger new Number 5
  ok not isInteger new Number 0.1
  ok not isInteger void
  ok not isInteger null
  ok not isInteger {}
  ok not isInteger ->
  ok isInteger  -0
test 'Number.isNaN' !->
  {isNaN} = Number
  ok isFunction isNaN
  ok isNaN NaN
  ok not isNaN 1
  ok not isNaN 0.1
  ok not isNaN -1
  ok not isNaN 2^16
  ok not isNaN 2^16 - 1
  ok not isNaN 2^31
  ok not isNaN 2^31 - 1
  ok not isNaN 2^32
  ok not isNaN 2^32 - 1
  ok not isNaN Infinity
  ok not isNaN 'NaN'
  ok not isNaN '5'
  ok not isNaN no
  ok not isNaN new Number NaN
  ok not isNaN new Number Infinity
  ok not isNaN new Number 5
  ok not isNaN new Number 0.1
  ok not isNaN void
  ok not isNaN null
  ok not isNaN {}
  ok not isNaN ->
  ok not isNaN -0
test 'Number.isSafeInteger' !->
  {isSafeInteger} = Number
  ok isFunction isSafeInteger
  ok isSafeInteger 1
  ok isSafeInteger -1
  ok isSafeInteger 2^16
  ok isSafeInteger 2^16 - 1
  ok isSafeInteger 2^31
  ok isSafeInteger 2^31 - 1
  ok isSafeInteger 2^32
  ok isSafeInteger 2^32 - 1
  ok isSafeInteger 16~1fffffffffffff
  ok isSafeInteger -16~1fffffffffffff
  ok isSafeInteger -0
  ok not isSafeInteger NaN
  ok not isSafeInteger 0.1
  ok not isSafeInteger 16~20000000000000
  ok not isSafeInteger -16~20000000000000
  ok not isSafeInteger Infinity
  ok not isSafeInteger 'NaN'
  ok not isSafeInteger '5'
  ok not isSafeInteger no
  ok not isSafeInteger new Number NaN
  ok not isSafeInteger new Number Infinity
  ok not isSafeInteger new Number 5
  ok not isSafeInteger new Number 0.1
  ok not isSafeInteger void
  ok not isSafeInteger null
  ok not isSafeInteger {}
  ok not isSafeInteger ->
test 'Number.MAX_SAFE_INTEGER' !->
  ok Number.MAX_SAFE_INTEGER is 16~1fffffffffffff
test 'Number.MIN_SAFE_INTEGER' !->
  ok Number.MIN_SAFE_INTEGER is -16~1fffffffffffff
test 'Number.parseFloat' !->
  ok isFunction Number.parseFloat
test 'Number.parseInt' !->
  ok isFunction Number.parseInt
test 'Number::clz' !->
  ok isFunction Number::clz
  ok 0.clz! is 32
  ok 1.clz! is 31
  ok (-1)clz! is 0
  ok 0.6.clz! is 32
  ok (2^32-1)clz! is 0
  ok (2^32)clz! is 32
test 'Math.acosh' !->
  # Returns an implementation-dependent approximation to the inverse hyperbolic cosine of x.
  ok isFunction Math.acosh
test 'Math.asinh' !->
  # Returns an implementation-dependent approximation to the inverse hyperbolic sine of x.
  ok isFunction Math.asinh
test 'Math.atanh' !->
  # Returns an implementation-dependent approximation to the inverse hyperbolic tangent of x.
  ok isFunction Math.atanh
test 'Math.cbrt' !->
  # Returns an implementation-dependent approximation to the cube root of x.
  ok isFunction Math.cbrt
test 'Math.cosh' !->
  # Returns an implementation-dependent approximation to the hyperbolic cosine of x.
  ok isFunction Math.cosh
test 'Math.expm1' !->
  # Returns an implementation-dependent approximation to subtracting 1 from the exponential function of x 
  ok isFunction Math.expm1
test 'Math.hypot' !->
  # Math.hypot returns an implementation-dependent approximation of the square root of the sum of squares of its arguments.
  ok isFunction Math.hypot
test 'Math.imul' !->
  ok isFunction Math.imul
test 'Math.log1p' !->
  # Returns an implementation-dependent approximation to the natural logarithm of 1 + x.
  # The result is computed in a way that is accurate even when the value of x is close to zero.
  ok isFunction Math.log1p
test 'Math.log10' !->
  # Returns an implementation-dependent approximation to the base 10 logarithm of x.
  ok isFunction Math.log10
test 'Math.log2' !->
  # Returns an implementation-dependent approximation to the base 2 logarithm of x.
  ok isFunction Math.log2
test 'Math.sign' !->
  # Returns the sign of the x, indicating whether x is positive, negative or zero.
  {sign} = Math
  ok isFunction sign
  ok Object.is sign(NaN), NaN
  ok Object.is sign(-0), -0
  ok Object.is sign(0), 0
  ok sign(Infinity) is 1
  ok sign(-Infinity) is -1
  ok sign(16~2fffffffffffff) is 1
  ok sign(-16~2fffffffffffff) is -1
  ok sign(42.5) is 1
  ok sign(-42.5) is -1
test 'Math.sinh' !->
  # Returns an implementation-dependent approximation to the hyperbolic sine of x.
  ok isFunction Math.sinh
test 'Math.tanh' !->
  # Returns an implementation-dependent approximation to the hyperbolic tangent of x.
  ok isFunction Math.tanh
test 'Math.trunc' !->
  # Returns the integral part of the number x, removing any fractional digits. If x is already an integer, the result is x.
  {trunc} = Math
  ok isFunction trunc
  ok Object.is trunc(NaN), NaN
  ok Object.is trunc(-0), -0
  ok Object.is trunc(0), 0
  ok trunc(Infinity) is Infinity
  ok trunc(-Infinity) is -Infinity
  ok Object.is trunc(-0.3), -0
  ok Object.is trunc(0.3), 0
  ok trunc([]) is 0
  ok trunc(-42.42) is -42
  ok trunc(16~2fffffffffffff) is 16~2fffffffffffff
test 'String::codePointAt' !->
  ok isFunction String::codePointAt
test 'String::contains' !->
  ok isFunction String::contains
  ok not 'abc'contains!
  ok 'aundefinedb'contains!
  ok 'abcd'contains \b 1
  ok not 'abcd'contains \b 2
test 'String::endsWith' !->
  ok isFunction String::endsWith
  ok 'undefined'endsWith!
  ok not 'undefined'endsWith null
  ok 'abc'endsWith ''
  ok 'abc'endsWith 'c'
  ok 'abc'endsWith 'bc'
  ok not 'abc'endsWith 'ab'
  ok 'abc'endsWith '' NaN
  ok not 'abc'endsWith \c -1
  ok 'abc'endsWith \a 1
  ok 'abc'endsWith \c Infinity
  ok 'abc'endsWith \a on
  ok not 'abc'endsWith \c \x
  ok not 'abc'endsWith \a \x
test 'String::repeat' !->
  ok isFunction String::repeat
  ok 'qwe'repeat(3) is \qweqweqwe
  ok 'qwe'repeat(2.5) is \qweqwe
  try
    'qwe'repeat(-1)
    ok no
  catch
    ok on
test 'String::startsWith' !->
  ok isFunction String::startsWith
  ok 'undefined'startsWith!
  ok not 'undefined'startsWith null
  ok 'abc'startsWith ''
  ok 'abc'startsWith 'a'
  ok 'abc'startsWith 'ab'
  ok not 'abc'startsWith 'bc'
  ok 'abc'startsWith '' NaN
  ok 'abc'startsWith \a -1
  ok not 'abc'startsWith \a 1
  ok not 'abc'startsWith \a Infinity
  ok 'abc'startsWith \b on
  ok 'abc'startsWith \a \x
test 'Array.from' !->
  {from} = Array
  ok isFunction from
  deepEqual from(\123), <[1 2 3]>
  deepEqual from((-> &)(1 2 3)), [1 2 3]
  from al = (-> &)(1), (val, key, that)->
    ok @ is ctx
    ok val is 1
    ok key is 0
    ok that is al
  , ctx = {}
  deepEqual from((-> &)(1 2 3), (^2)), [1 4 9]
test 'Array.of' !->
  ok isFunction Array.of
  deepEqual Array.of(1), [1]
  deepEqual Array.of(1 2 3), [1 2 3]
test 'Array::fill' !->
  ok isFunction Array::fill
  deepEqual Array(5)fill(5), [5 5 5 5 5]
  deepEqual Array(5)fill(5 1), [void 5 5 5 5]
  deepEqual Array(5)fill(5 1 4), [void 5 5 5 void]
  deepEqual Array(5)fill(5 6 1), [void void void void void]
  deepEqual Array(5)fill(5 -3 4), [void void 5 5 void]
test 'Array::find' !->
  ok isFunction Array::find
  (arr = [1])find (val, key, that)->
    ok @ is ctx
    ok val is 1
    ok key is 0
    ok that is arr
  , ctx = {}
  ok [1 3 NaN, 42 {}]find((is 42)) is 42
  ok [1 3 NaN, 42 {}]find((is 43)) is void
test 'Array::findIndex' !->
  ok isFunction Array::findIndex
  (arr = [1])findIndex (val, key, that)->
    ok @ is ctx
    ok val is 1
    ok key is 0
    ok that is arr
  , ctx = {}
  ok [1 3 NaN, 42 {}]findIndex((is 42)) is 3