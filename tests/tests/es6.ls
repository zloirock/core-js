{isFunction, isNative} = Function
{getOwnPropertyDescriptor, defineProperty} = Object
same = Object.is
epsilon = (a, b)-> Math.abs(a - b) <= Number.EPSILON
test 'Object.assign' !->
  {assign} = Object
  ok isFunction(assign), 'Object.assign is function'
  foo = q:1
  ok foo is assign(foo, bar: 2), 'assign return target'
  ok foo.bar is 2, 'assign define properties'
  if isNative getOwnPropertyDescriptor
    foo = baz: 1
    assign foo, defineProperty {}, \bar, get: -> @baz + 1
    ok foo.bar is void, "assign don't copy descriptors"
test 'Object.is' !->
  ok isFunction(same), 'Object.is is function'
  ok same(1 1), '1 is 1'
  ok same(NaN, NaN), '1 is 1'
  ok not same(0 -0), '0 isnt -0'
  ok not same({} {}), '{} isnt {}'
if Object.setPrototypeOf
  test 'Object.setPrototypeOf' !->
    {setPrototypeOf} = Object
    ok isFunction(setPrototypeOf), 'Object.setPrototypeOf is function'
    ok \apply of setPrototypeOf({} Function::), 'Parent properties in target'
    ok setPrototypeOf(a:2, {b: -> @a^2})b! is 4, 'Child and parent properties in target'
    ok setPrototypeOf(tmp = {}, {a: 1}) is tmp, 'setPrototypeOf return target'
    ok !(\toString of setPrototypeOf {} null), 'Can set null as prototype'
test 'Number.EPSILON' !->
  {EPSILON} = Number
  ok \EPSILON of Number, 'EPSILON in Number'
  ok EPSILON is 2^-52, 'Number.EPSILON is 2^-52'
  ok 1 isnt 1 + EPSILON, '1 isnt 1 + EPSILON'
  ok 1 is 1 + EPSILON / 2, '1 is 1 + EPSILON / 2'
test 'Number.isFinite' !->
  {isFinite} = Number
  ok isFunction(isFinite), 'Number.isFinite is function'
  for [1 0.1 -1 2^16 2^16 - 1 2^31 2^31 - 1 2^32 2^32 - 1 -0]
    ok isFinite(..), "isFinite #{typeof ..} #{..}"
  for [NaN, Infinity, \NaN, \5, no, new Number(NaN), new Number(Infinity), new Number(5), new Number(0.1), void, null, {}, ->]
    ok not isFinite(..), "not isFinite #{typeof ..} #{..}"
test 'Number.isInteger' !->
  {isInteger} = Number
  ok isFunction(isInteger), 'Number.isInteger is function'
  for [1 -1 2^16 2^16 - 1 2^31 2^31 - 1 2^32 2^32 - 1 -0]
    ok isInteger(..), "isInteger #{typeof ..} #{..}"
  for [NaN, 0.1, Infinity, \NaN, \5, no, new Number(NaN), new Number(Infinity), new Number(5), new Number(0.1), void, null, {}, ->]
    ok not isInteger(..), "not isInteger #{typeof ..} #{..}"
test 'Number.isNaN' !->
  {isNaN} = Number
  ok isFunction(isNaN), 'Number.isNaN is function'
  ok isNaN(NaN), 'Number.isNaN NaN'
  for [1 0.1 -1 2^16 2^16 - 1 2^31 2^31 - 1 2^32 2^32 - 1 -0 Infinity, \NaN, \5, no, new Number(NaN), new Number(Infinity), new Number(5), new Number(0.1), void, null, {}, ->]
    ok not isNaN(..), "not Number.isNaN #{typeof ..} #{..}"
test 'Number.isSafeInteger' !->
  {isSafeInteger} = Number
  ok isFunction(isSafeInteger), 'Number.isSafeInteger is function'
  for [1 -1 2^16 2^16 - 1 2^31 2^31 - 1 2^32 2^32 - 1 -0 16~1fffffffffffff -16~1fffffffffffff]
    ok isSafeInteger(..), "isSafeInteger #{typeof ..} #{..}"
  for [16~20000000000000 -16~20000000000000 NaN, 0.1, Infinity, \NaN, \5, no, new Number(NaN), new Number(Infinity), new Number(5), new Number(0.1), void, null, {}, ->]
    ok not isSafeInteger(..), "not isSafeInteger #{typeof ..} #{..}"
test 'Number.MAX_SAFE_INTEGER' !->
  ok Number.MAX_SAFE_INTEGER is 2^53 - 1, 'Number.MAX_SAFE_INTEGER is 2^53 - 1'
test 'Number.MIN_SAFE_INTEGER' !->
  ok Number.MIN_SAFE_INTEGER is -2^53 + 1, 'Number.MIN_SAFE_INTEGER is -2^53 + 1'
test 'Number.parseFloat' !->
  ok isFunction(Number.parseFloat), 'Number.parseFloat is function'
test 'Number.parseInt' !->
  ok isFunction(Number.parseInt), 'Number.parseInt is function'
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