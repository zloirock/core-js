{isFunction, isNative} = Function
{getOwnPropertyDescriptor, defineProperty} = Object
same = Object.is
epsilon = (a, b)-> Math.abs(a - b) <= Number.EPSILON
test 'Object.assign' !->
  {assign} = Object
  ok isFunction assign
  foo = q:1
  ok foo is assign foo, w:2
  ok foo.w is 2
  if isNative getOwnPropertyDescriptor
    foo = q:1
    foo2 = defineProperty {}, \w, get: -> @q + 1
    assign foo, foo2
    ok foo.w is void
test 'Object.is' !->
  ok isFunction same
  ok same 1 1
  ok same NaN, NaN
  ok not same 0 -0
  ok not same {} {}
if Object.setPrototypeOf
  test 'Object.setPrototypeOf' !->
    {setPrototypeOf} = Object
    ok isFunction setPrototypeOf
    ok \apply of setPrototypeOf {} Function::
    ok setPrototypeOf(a:2, {b: -> @a^2})b! is 4
    ok setPrototypeOf(tmp = {}, {a: 1}) is tmp
    ok !(\toString of setPrototypeOf {} null)
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
test 'Math.acosh' !->
  # Returns an implementation-dependent approximation to the inverse hyperbolic cosine of x.
  {acosh} = Math
  ok isFunction acosh
  ok same acosh(NaN), NaN
  ok same acosh(0.5), NaN
  ok same acosh(-1), NaN
  ok same acosh(1), 0
  ok same acosh(Infinity), Infinity
test 'Math.asinh' !->
  # Returns an implementation-dependent approximation to the inverse hyperbolic sine of x.
  {asinh} = Math
  ok isFunction asinh
  ok same asinh(NaN), NaN
  ok same asinh(0), 0
  ok same asinh(-0), -0
  ok same asinh(Infinity), Infinity
  ok same asinh(-Infinity), -Infinity
test 'Math.atanh' !->
  # Returns an implementation-dependent approximation to the inverse hyperbolic tangent of x.
  {atanh} = Math
  ok isFunction atanh
  ok same atanh(NaN), NaN
  ok same atanh(-2), NaN
  ok same atanh(-1.5), NaN
  ok same atanh(2), NaN
  ok same atanh(1.5), NaN
  ok same atanh(-1), -Infinity
  ok same atanh(1), Infinity
  ok same atanh(0), 0
  ok same atanh(-0), -0
test 'Math.cbrt' !->
  # Returns an implementation-dependent approximation to the cube root of x.
  {cbrt} = Math
  ok isFunction cbrt
  ok same cbrt(NaN), NaN
  ok same cbrt(0), 0
  ok same cbrt(-0), -0
  ok same cbrt(Infinity), Infinity
  ok same cbrt(-Infinity), -Infinity
test 'Math.clz32' !->
  {clz32} = Math
  ok isFunction clz32
  ok clz32(0) is 32
  ok clz32(1) is 31
  ok clz32(-1) is 0
  ok clz32(0.6) is 32
  ok clz32(2^32-1) is 0
  ok clz32(2^32) is 32
test 'Math.cosh' !->
  # Returns an implementation-dependent approximation to the hyperbolic cosine of x.
  {cosh} = Math
  ok isFunction cosh
  ok same cosh(NaN), NaN
  ok same cosh(0), 1
  ok same cosh(-0), 1
  ok same cosh(Infinity), Infinity
  ok same cosh(-Infinity), Infinity
test 'Math.expm1' !->
  # Returns an implementation-dependent approximation to subtracting 1 from the exponential function of x 
  {expm1} = Math
  ok isFunction expm1
  ok same expm1(NaN), NaN
  ok same expm1(0), 0
  ok same expm1(-0), -0
  ok same expm1(Infinity), Infinity
  ok same expm1(-Infinity), -1
test 'Math.hypot' !->
  # Math.hypot returns an implementation-dependent approximation of the square root of the sum of squares of its arguments.
  {hypot, sqrt} = Math
  ok isFunction hypot
  ok same hypot('', 0), 0
  ok same hypot(0, ''), 0
  ok same hypot(Infinity, 0), Infinity
  ok same hypot(-Infinity, 0), Infinity
  ok same hypot(0, Infinity), Infinity
  ok same hypot(0, -Infinity), Infinity
  ok same hypot(Infinity, NaN), Infinity
  ok same hypot(NaN, -Infinity), Infinity
  ok same hypot(NaN, 0), NaN
  ok same hypot(0, NaN), NaN
  ok same hypot(0, -0), 0
  ok same hypot(0, 0), 0
  ok same hypot(-0, -0), 0
  ok same hypot(-0, 0), 0
  ok same hypot(0, 1), 1
  ok same hypot(0, -1), 1
  ok same hypot(-0, 1), 1
  ok same hypot(-0, -1), 1
  ok same hypot(0), 0
  ok same hypot(1), 1
  ok same hypot(2), 2
  ok same hypot(0 0 1), 1
  ok same hypot(0 1 0), 1
  ok same hypot(1 0 0), 1
  ok same hypot(2 3 4), sqrt(2 * 2 + 3 * 3 + 4 * 4)
  ok same hypot(2 3 4 5), sqrt(2 * 2 + 3 * 3 + 4 * 4 + 5 * 5)
test 'Math.imul' !->
  {imul} = Math
  ok isFunction imul
  ok same imul(0, 0), 0
  ok imul(123, 456) is 56088
  ok imul(-123, 456) is -56088
  ok imul(123, -456) is -56088
  ok imul(16~01234567, 16~fedcba98) is 602016552
test 'Math.log1p' !->
  # Returns an implementation-dependent approximation to the natural logarithm of 1 + x.
  # The result is computed in a way that is accurate even when the value of x is close to zero.
  {log1p} = Math
  ok isFunction log1p
  ok same log1p(''), log1p 0
  ok same log1p(NaN), NaN
  ok same log1p(-2), NaN
  ok same log1p(-1), -Infinity
  ok same log1p(0), 0
  ok same log1p(-0), -0
  ok same log1p(Infinity), Infinity
test 'Math.log10' !->
  # Returns an implementation-dependent approximation to the base 10 logarithm of x.
  {log10} = Math
  ok isFunction log10
  ok same log10(''), log10 0
  ok same log10(NaN), NaN
  ok same log10(-1), NaN
  ok same log10(0), -Infinity
  ok same log10(-0), -Infinity
  ok same log10(1), 0
  ok same log10(Infinity), Infinity
  ok epsilon log10(0.1), -1 # !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  ok epsilon log10(0.5), -0.3010299956639812
  ok epsilon log10(1.5), 0.17609125905568124
test 'Math.log2' !->
  # Returns an implementation-dependent approximation to the base 2 logarithm of x.
  {log2} = Math
  ok isFunction log2
  ok same log2(''), log2 0
  ok same log2(NaN), NaN
  ok same log2(-1), NaN
  ok same log2(0), -Infinity
  ok same log2(-0), -Infinity
  ok same log2(1), 0
  ok same log2(Infinity), Infinity
  ok same log2(0.5), -1
test 'Math.sign' !->
  # Returns the sign of the x, indicating whether x is positive, negative or zero.
  {sign} = Math
  ok isFunction sign
  ok same sign(NaN), NaN
  ok same sign(-0), -0
  ok same sign(0), 0
  ok same sign(Infinity), 1
  ok same sign(-Infinity), -1
  ok sign(16~2fffffffffffff) is 1
  ok sign(-16~2fffffffffffff) is -1
  ok sign(42.5) is 1
  ok sign(-42.5) is -1
test 'Math.sinh' !->
  # Returns an implementation-dependent approximation to the hyperbolic sine of x.
  {sinh} = Math
  ok isFunction sinh
  ok same sinh(NaN), NaN
  ok same sinh(0), 0
  ok same sinh(-0), -0 
  ok same sinh(Infinity), Infinity
  ok same sinh(-Infinity), -Infinity
test 'Math.tanh' !->
  # Returns an implementation-dependent approximation to the hyperbolic tangent of x.
  {tanh} = Math
  ok isFunction tanh
  ok same tanh(NaN), NaN
  ok same tanh(0), 0
  ok same tanh(-0), -0
  ok same tanh(Infinity), 1
  ok same tanh(-Infinity), -1
test 'Math.trunc' !->
  # Returns the integral part of the number x, removing any fractional digits. If x is already an integer, the result is x.
  {trunc} = Math
  ok isFunction trunc
  ok same trunc(NaN), NaN
  ok same trunc(-0), -0
  ok same trunc(0), 0
  ok same trunc(Infinity), Infinity
  ok same trunc(-Infinity), -Infinity
  ok same trunc(-0.3), -0
  ok same trunc(0.3), 0
  ok trunc([]) is 0
  ok trunc(-42.42) is -42
  ok trunc(16~2fffffffffffff) is 16~2fffffffffffff
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