'use strict'

QUnit.module \ES6

eq = strictEqual
deq = deepEqual
sameEq = (a, b, c)-> ok Object.is(a, b), c

strict = typeof (-> @).call(void) is \undefined

isFunction = -> typeof! it is \Function
isIterator = ->
  return typeof it is \object  && typeof it.next is \function

{getOwnPropertyDescriptor, defineProperty, create} = Object
{iterator, toStringTag} = Symbol

epsilon = (a, b, E)-> Math.abs(a - b) <= if E? => E else 1e-11

descriptors = /\[native code\]\s*\}\s*$/.test defineProperty

test 'Object.assign' !->
  {assign} = Object
  ok isFunction(assign), 'Is function'
  foo = q: 1
  eq foo, assign(foo, bar: 2), 'assign return target'
  eq foo.bar, 2, 'assign define properties'
  if descriptors
    foo = baz: 1
    assign foo, defineProperty {}, \bar, get: -> @baz + 1
    ok foo.bar is void, "assign don't copy descriptors"
  deq assign({}, {q: 1}, {w: 2}), {q: 1, w: 2}
  deq assign({}, \qwe), {0: \q, 1: \w, 2: \e}
  throws (-> assign null {q: 1}), TypeError
  throws (-> assign void, {q: 1}), TypeError
  str = assign(\qwe, {q: 1})
  eq typeof str, \object
  eq String(str), \qwe
  eq str.q, 1
test 'Object.is' !->
  same = Object.is
  ok isFunction(same), 'Is function'
  ok same(1 1), '1 is 1'
  ok same(NaN, NaN), '1 is 1'
  ok not same(0 -0), '0 isnt -0'
  ok not same({} {}), '{} isnt {}'
if Object.setPrototypeOf
  test 'Object.setPrototypeOf' !->
    {setPrototypeOf} = Object
    ok isFunction(setPrototypeOf), 'Is function'
    ok \apply of setPrototypeOf({} Function::), 'Parent properties in target'
    eq setPrototypeOf(a:2, {b: -> @a^2})b!, 4, 'Child and parent properties in target'
    eq setPrototypeOf(tmp = {}, {a: 1}), tmp, 'setPrototypeOf return target'
    ok !(\toString of setPrototypeOf {} null), 'Can set null as prototype'
test 'Object#toString' !->
  {toString} = Object::
  eq toString.call(true), '[object Boolean]', 'classof bool is `Boolean`'
  eq toString.call('string'), '[object String]', 'classof string is `String`'
  eq toString.call(7), '[object Number]', 'classof number is `Number`'
  eq toString.call(Symbol!), '[object Symbol]', 'classof symbol is `Symbol`'
  eq toString.call(new Boolean no), '[object Boolean]', 'classof new Boolean is `Boolean`'
  eq toString.call(new String ''), '[object String]', 'classof new String is `String`'
  eq toString.call(new Number 7), '[object Number]', 'classof new Number is `Number`'
  eq '' + {}, '[object Object]', 'classof {} is `Object`'
  eq toString.call([]), '[object Array]', 'classof array is `Array`'
  eq toString.call(->), '[object Function]', 'classof function is `Function`'
  eq toString.call(/./), '[object RegExp]', 'classof regexp is `Undefined`'
  eq toString.call(TypeError!), '[object Error]', 'classof new TypeError is `RegExp`'
  eq toString.call((->&)!), '[object Arguments]', 'classof arguments list is `Arguments`'
  eq '' + new Set, '[object Set]', 'classof undefined is `Map`'
  eq '' + new Map, '[object Map]', 'classof map is `Undefined`'
  eq '' + new WeakSet, '[object WeakSet]', 'classof weakset is `WeakSet`'
  eq '' + new WeakMap, '[object WeakMap]', 'classof weakmap is `WeakMap`'
  eq '' + new Promise(->), '[object Promise]', 'classof promise is `Promise`'
  eq '' + ''[Symbol.iterator]!, '[object String Iterator]', 'classof String Iterator is `String Iterator`'
  eq '' + []entries!, '[object Array Iterator]', 'classof Array Iterator is `Array Iterator`'
  eq '' + new Set!entries!, '[object Set Iterator]', 'classof Set Iterator is `Set Iterator`'
  eq '' + new Map!entries!, '[object Map Iterator]', 'classof Map Iterator is `Map Iterator`'
  eq '' + Math, '[object Math]', 'classof Math is `Math`'
  if JSON?
    eq toString.call(JSON), '[object JSON]', 'classof JSON is `JSON`'
  class Class
    @::[Symbol.toStringTag] = \Class
  eq '' + new Class, '[object Class]', 'classof user class is [Symbol.toStringTag]'
  class BadClass
    @::[Symbol.toStringTag] = \Array
  eq '' + new BadClass, '[object ~Array]', 'safe [[Class]]'
test 'Number.EPSILON' !->
  {EPSILON} = Number
  ok \EPSILON of Number, 'EPSILON in Number'
  ok EPSILON is 2^-52, 'Is 2^-52'
  ok 1 isnt 1 + EPSILON, '1 isnt 1 + EPSILON'
  ok 1 is 1 + EPSILON / 2, '1 is 1 + EPSILON / 2'
test 'Number.isFinite' !->
  {isFinite} = Number
  ok isFunction(isFinite), 'Is function'
  for [1 0.1 -1 2^16 2^16 - 1 2^31 2^31 - 1 2^32 2^32 - 1 -0]
    ok isFinite(..), "isFinite #{typeof ..} #{..}"
  for [NaN, Infinity, \NaN, \5, no, new Number(NaN), new Number(Infinity), new Number(5), new Number(0.1), void, null, {}, ->, create(null)]
    ok not isFinite(..), "not isFinite #{typeof ..} #{try String(..) catch e => 'Object.create(null)'}"
test 'Number.isInteger' !->
  {isInteger} = Number
  ok isFunction(isInteger), 'Is function'
  for [1 -1 2^16 2^16 - 1 2^31 2^31 - 1 2^32 2^32 - 1 -0]
    ok isInteger(..), "isInteger #{typeof ..} #{..}"
  for [NaN, 0.1, Infinity, \NaN, \5, no, new Number(NaN), new Number(Infinity), new Number(5), new Number(0.1), void, null, {}, ->, create(null)]
    ok not isInteger(..), "not isInteger #{typeof ..} #{try String(..) catch e => 'Object.create(null)'}"
test 'Number.isNaN' !->
  {isNaN} = Number
  ok isFunction(isNaN), 'Is function'
  ok isNaN(NaN), 'Number.isNaN NaN'
  for [1 0.1 -1 2^16 2^16 - 1 2^31 2^31 - 1 2^32 2^32 - 1 -0 Infinity, \NaN, \5, no, new Number(NaN), new Number(Infinity), new Number(5), new Number(0.1), void, null, {}, ->, create(null)]
    ok not isNaN(..), "not Number.isNaN #{typeof ..} #{try String(..) catch e => 'Object.create(null)'}"
test 'Number.isSafeInteger' !->
  {isSafeInteger} = Number
  ok isFunction(isSafeInteger), 'Is function'
  for [1 -1 2^16 2^16 - 1 2^31 2^31 - 1 2^32 2^32 - 1 -0 16~1fffffffffffff -16~1fffffffffffff]
    ok isSafeInteger(..), "isSafeInteger #{typeof ..} #{..}"
  for [16~20000000000000 -16~20000000000000 NaN, 0.1, Infinity, \NaN, \5, no, new Number(NaN), new Number(Infinity), new Number(5), new Number(0.1), void, null, {}, ->, create(null)]
    ok not isSafeInteger(..), "not isSafeInteger #{typeof ..} #{try String(..) catch e => 'Object.create(null)'}"
test 'Number.MAX_SAFE_INTEGER' !->
  eq Number.MAX_SAFE_INTEGER, 2^53 - 1, 'Is 2^53 - 1'
test 'Number.MIN_SAFE_INTEGER' !->
  eq Number.MIN_SAFE_INTEGER, -2^53 + 1, 'Is -2^53 + 1'
test 'Number.parseFloat' !->
  ok isFunction(Number.parseFloat), 'Is function'
test 'Number.parseInt' !->
  ok isFunction(Number.parseInt), 'Is function'
test 'Math.acosh' !->
  # Returns an implementation-dependent approximation to the inverse hyperbolic cosine of x.
  {acosh} = Math
  ok isFunction(acosh), 'Is function'
  sameEq acosh(NaN), NaN
  sameEq acosh(0.5), NaN
  sameEq acosh(-1), NaN
  sameEq acosh(-1e300), NaN
  sameEq acosh(1), 0
  eq acosh(Infinity), Infinity
  ok epsilon acosh(1234), 7.811163220849231
  ok epsilon acosh(8.88), 2.8737631531629235
test 'Math.asinh' !->
  # Returns an implementation-dependent approximation to the inverse hyperbolic sine of x.
  {asinh} = Math
  ok isFunction(asinh), 'Is function'
  sameEq asinh(NaN), NaN
  sameEq asinh(0), 0
  sameEq asinh(-0), -0
  eq asinh(Infinity), Infinity
  eq asinh(-Infinity), -Infinity
  ok epsilon asinh(1234), 7.811163549201245
  ok epsilon asinh(9.99), 2.997227420191335
  ok epsilon asinh(1e150), 346.0809111296668
  ok epsilon asinh(1e7), 16.811242831518268
  ok epsilon asinh(-1e7), -16.811242831518268
test 'Math.atanh' !->
  # Returns an implementation-dependent approximation to the inverse hyperbolic tangent of x.
  {atanh} = Math
  ok isFunction(atanh), 'Is function'
  sameEq atanh(NaN), NaN
  sameEq atanh(-2), NaN
  sameEq atanh(-1.5), NaN
  sameEq atanh(2), NaN
  sameEq atanh(1.5), NaN
  eq atanh(-1), -Infinity
  eq atanh(1), Infinity
  sameEq atanh(0), 0
  sameEq atanh(-0), -0
  sameEq atanh(-1e300), NaN
  sameEq atanh(1e300), NaN
  ok epsilon atanh(0.5), 0.5493061443340549
  ok epsilon atanh(-0.5), -0.5493061443340549
  ok epsilon atanh(0.444), 0.47720201260109457
test 'Math.cbrt' !->
  # Returns an implementation-dependent approximation to the cube root of x.
  {cbrt} = Math
  ok isFunction(cbrt), 'Is function'
  sameEq cbrt(NaN), NaN
  sameEq cbrt(0), 0
  sameEq cbrt(-0), -0
  eq cbrt(Infinity), Infinity
  eq cbrt(-Infinity), -Infinity
  eq cbrt(-8), -2
  eq cbrt(8), 2
  ok epsilon cbrt(-1000), -10 # O_o
  ok epsilon cbrt(1000), 10   # O_o
test 'Math.clz32' !->
  {clz32} = Math
  ok isFunction(clz32), 'Is function'
  eq clz32(0), 32
  eq clz32(1), 31
  sameEq clz32(-1), 0
  eq clz32(0.6), 32
  sameEq clz32(2^32 - 1), 0
  eq clz32(2^32), 32
test 'Math.cosh' !->
  # Returns an implementation-dependent approximation to the hyperbolic cosine of x.
  {cosh} = Math
  ok isFunction(cosh), 'Is function'
  sameEq cosh(NaN), NaN
  eq cosh(0), 1
  eq cosh(-0), 1
  eq cosh(Infinity), Infinity
  eq cosh(-Infinity), Infinity # v8 bug!
  ok epsilon cosh(12), 81377.39571257407, 3e-11
  ok epsilon cosh(22), 1792456423.065795780980053377, 1e-5
  ok epsilon cosh(-10), 11013.23292010332313972137
  ok epsilon cosh(-23), 4872401723.1244513000, 1e-5
test 'Math.expm1' !->
  # Returns an implementation-dependent approximation to subtracting 1 from the exponential function of x 
  {expm1} = Math
  ok isFunction(expm1), 'Is function'
  sameEq expm1(NaN), NaN
  sameEq expm1(0), 0
  sameEq expm1(-0), -0
  eq expm1(Infinity), Infinity
  eq expm1(-Infinity), -1
  ok epsilon expm1(10), 22025.465794806718,
  ok epsilon expm1(-10), -0.9999546000702375
if Float32Array? => test 'Math.fround' !->
  # https://github.com/paulmillr/es6-shim/blob/master/test/math.js
  {fround} = Math
  ok isFunction(fround), 'Is function'
  sameEq fround(void), NaN
  sameEq fround(NaN), NaN
  sameEq fround(0), 0
  sameEq fround(-0), -0
  sameEq fround(Number.MIN_VALUE), 0
  sameEq fround(-Number.MIN_VALUE), -0
  eq fround(Infinity), Infinity
  eq fround(-Infinity), -Infinity
  eq fround(1.7976931348623157e+308), Infinity
  eq fround(-1.7976931348623157e+308), -Infinity
  eq fround(3.4028235677973366e+38), Infinity
  eq fround(3), 3
  eq fround(-3), -3
  maxFloat32 = 3.4028234663852886e+38
  minFloat32 = 1.401298464324817e-45
  eq fround(maxFloat32), maxFloat32
  eq fround(-maxFloat32), -maxFloat32
  eq fround(maxFloat32 + 2 ** (2 ** (8 - 1) - 1 - 23 - 2)), maxFloat32
  eq fround(minFloat32), minFloat32
  eq fround(-minFloat32), -minFloat32
  sameEq fround(minFloat32 / 2), 0
  sameEq fround(-minFloat32 / 2), -0
  eq fround(minFloat32 / 2 + 2 ** -202), minFloat32
  eq fround(-minFloat32 / 2 - 2 ** -202), -minFloat32
test 'Math.hypot' !->
  # Math.hypot returns an implementation-dependent approximation of the square root of the sum of squares of its arguments.
  {hypot, sqrt} = Math
  ok isFunction(hypot), 'Is function'
  sameEq hypot('', 0), 0
  sameEq hypot(0, ''), 0
  eq hypot(Infinity, 0), Infinity
  eq hypot(-Infinity, 0), Infinity
  eq hypot(0, Infinity), Infinity
  eq hypot(0, -Infinity), Infinity
  eq hypot(Infinity, NaN), Infinity
  eq hypot(NaN, -Infinity), Infinity
  sameEq hypot(NaN, 0), NaN
  sameEq hypot(0, NaN), NaN
  sameEq hypot(0, -0), 0
  sameEq hypot(0, 0), 0
  sameEq hypot(-0, -0), 0
  sameEq hypot(-0, 0), 0
  eq hypot(0, 1), 1
  eq hypot(0, -1), 1
  eq hypot(-0, 1), 1
  eq hypot(-0, -1), 1
  sameEq hypot(0), 0
  eq hypot(1), 1
  eq hypot(2), 2
  eq hypot(0 0 1), 1
  eq hypot(0 1 0), 1
  eq hypot(1 0 0), 1
  eq hypot(2 3 4), sqrt(2 * 2 + 3 * 3 + 4 * 4)
  eq hypot(2 3 4 5), sqrt(2 * 2 + 3 * 3 + 4 * 4 + 5 * 5)
  ok epsilon hypot(66 66), 93.33809511662427
  ok epsilon hypot(0.1 100), 100.0000499999875
  eq hypot(1e+300, 1e+300), 1.4142135623730952e+300
  eq hypot(1e-300, 1e-300), 1.4142135623730952e-300
  eq hypot(1e+300, 1e+300, 2, 3), 1.4142135623730952e+300
test 'Math.imul' !->
  {imul} = Math
  ok isFunction(imul), 'Is function'
  sameEq imul(0, 0), 0
  eq imul(123, 456), 56088
  eq imul(-123, 456), -56088
  eq imul(123, -456), -56088
  eq imul(16~01234567, 16~fedcba98), 602016552
  sameEq imul(no 7), 0
  sameEq imul(7 no), 0
  sameEq imul(no no), 0
  eq imul(on 7), 7
  eq imul(7 on), 7
  eq imul(on on), 1
  sameEq imul(void 7), 0
  sameEq imul(7 void), 0
  sameEq imul(void void), 0
  sameEq imul(\str 7), 0
  sameEq imul(7 \str), 0
  sameEq imul({} 7), 0
  sameEq imul(7 {}), 0
  sameEq imul([] 7), 0
  sameEq imul(7 []), 0
  eq imul(0xffffffff, 5), -5
  eq imul(0xfffffffe, 5), -10
  eq imul(2 4), 8
  eq imul(-1 8), -8
  eq imul(-2 -2), 4
  sameEq imul(-0 7), 0
  sameEq imul(7 -0), 0
  sameEq imul(0.1 7), 0
  sameEq imul(7 0.1), 0
  sameEq imul(0.9 7), 0
  sameEq imul(7 0.9), 0
  eq imul(1.1 7), 7
  eq imul(7 1.1), 7
  eq imul(1.9 7), 7
  eq imul(7 1.9), 7
test 'Math.log1p' !->
  # Returns an implementation-dependent approximation to the natural logarithm of 1 + x.
  # The result is computed in a way that is accurate even when the value of x is close to zero.
  {log1p} = Math
  ok isFunction(log1p), 'Is function'
  sameEq log1p(''), log1p 0
  sameEq log1p(NaN), NaN
  sameEq log1p(-2), NaN
  sameEq log1p(-1), -Infinity
  sameEq log1p(0), 0
  sameEq log1p(-0), -0
  sameEq log1p(Infinity), Infinity
  ok epsilon log1p(5), 1.791759469228055
  ok epsilon log1p(50), 3.9318256327243257
test 'Math.log10' !->
  # Returns an implementation-dependent approximation to the base 10 logarithm of x.
  {log10} = Math
  ok isFunction(log10), 'Is function'
  sameEq log10(''), log10 0
  sameEq log10(NaN), NaN
  sameEq log10(-1), NaN
  sameEq log10(0), -Infinity
  sameEq log10(-0), -Infinity
  sameEq log10(1), 0
  sameEq log10(Infinity), Infinity
  ok epsilon log10(0.1), -1 # O_o
  ok epsilon log10(0.5), -0.3010299956639812
  ok epsilon log10(1.5), 0.17609125905568124
  ok epsilon log10(5), 0.6989700043360189
  ok epsilon log10(50), 1.6989700043360187
test 'Math.log2' !->
  # Returns an implementation-dependent approximation to the base 2 logarithm of x.
  {log2} = Math
  ok isFunction(log2), 'Is function'
  sameEq log2(''), log2 0
  sameEq log2(NaN), NaN
  sameEq log2(-1), NaN
  sameEq log2(0), -Infinity
  sameEq log2(-0), -Infinity
  sameEq log2(1), 0
  sameEq log2(Infinity), Infinity
  sameEq log2(0.5), -1
  sameEq log2(32), 5
  ok epsilon log2(5), 2.321928094887362
test 'Math.sign' !->
  # Returns the sign of the x, indicating whether x is positive, negative or zero.
  {sign} = Math
  ok isFunction(sign), 'Is function'
  sameEq sign(NaN), NaN
  sameEq sign!, NaN
  sameEq sign(-0), -0
  sameEq sign(0), 0
  eq sign(Infinity), 1
  eq sign(-Infinity), -1
  eq sign(16~2fffffffffffff), 1
  eq sign(-16~2fffffffffffff), -1
  eq sign(42.5), 1
  eq sign(-42.5), -1
test 'Math.sinh' !->
  # Returns an implementation-dependent approximation to the hyperbolic sine of x.
  {sinh} = Math
  ok isFunction(sinh), 'Is function'
  sameEq sinh(NaN), NaN
  sameEq sinh(0), 0
  sameEq sinh(-0), -0 
  eq sinh(Infinity), Infinity
  eq sinh(-Infinity), -Infinity
  ok epsilon sinh(-5), -74.20321057778875
  ok epsilon sinh(2), 3.6268604078470186
test 'Math.tanh' !->
  # Returns an implementation-dependent approximation to the hyperbolic tangent of x.
  {tanh} = Math
  ok isFunction(tanh), 'Is function'
  sameEq tanh(NaN), NaN
  sameEq tanh(0), 0
  sameEq tanh(-0), -0
  eq tanh(Infinity), 1
  eq tanh(90), 1
  ok epsilon tanh(10), 0.9999999958776927
test 'Math.trunc' !->
  # Returns the integral part of the number x, removing any fractional digits. If x is already an integer, the result is x.
  {trunc} = Math
  ok isFunction(trunc), 'Is function'
  sameEq trunc(NaN), NaN, 'NaN -> NaN'
  sameEq trunc(-0), -0, '-0 -> -0'
  sameEq trunc(0), 0, '0 -> 0'
  sameEq trunc(Infinity), Infinity, 'Infinity -> Infinity'
  sameEq trunc(-Infinity), -Infinity, '-Infinity -> -Infinity'
  sameEq trunc(null), 0, 'null -> 0'
  sameEq trunc({}), NaN, '{} -> NaN'
  eq trunc([]), 0, '[] -> 0'
  eq trunc(1.01), 1, '1.01 -> 0'
  eq trunc(1.99), 1, '1.99 -> 0'
  eq trunc(-1), -1, '-1 -> -1'
  eq trunc(-1.99), -1, '-1.99 -> -1'
  eq trunc(-555.555), -555, '-555.555 -> -555'
  eq trunc(0x20000000000001), 0x20000000000001, '0x20000000000001 -> 0x20000000000001'
  eq trunc(-0x20000000000001), -0x20000000000001, '-0x20000000000001 -> -0x20000000000001'
test 'String.fromCodePoint' !->
  {fromCodePoint} = String
  ok isFunction(fromCodePoint), 'Is function'
  # tests from https://github.com/mathiasbynens/String.fromCodePoint/blob/master/tests/tests.js
  eq fromCodePoint(''), '\0'
  eq fromCodePoint!, ''
  eq fromCodePoint(-0), '\0'
  eq fromCodePoint(0), '\0'
  eq fromCodePoint(0x1D306), '\uD834\uDF06'
  eq fromCodePoint(0x1D306, 0x61, 0x1D307), '\uD834\uDF06a\uD834\uDF07'
  eq fromCodePoint(0x61, 0x62, 0x1D307), 'ab\uD834\uDF07'
  eq fromCodePoint(false), '\0'
  eq fromCodePoint(null), '\0'
  throws (-> fromCodePoint \_), RangeError
  throws (-> fromCodePoint '+Infinity'), RangeError
  throws (-> fromCodePoint '-Infinity'), RangeError
  throws (-> fromCodePoint -1), RangeError
  throws (-> fromCodePoint 0x10FFFF + 1), RangeError
  throws (-> fromCodePoint 3.14), RangeError
  throws (-> fromCodePoint 3e-2), RangeError
  throws (-> fromCodePoint -Infinity), RangeError
  throws (-> fromCodePoint Infinity), RangeError
  throws (-> fromCodePoint NaN), RangeError
  throws (-> fromCodePoint void), RangeError
  throws (-> fromCodePoint {}), RangeError
  throws (-> fromCodePoint /./), RangeError
  
  tmp = 0x60;
  eq fromCodePoint({valueOf: -> ++tmp}), \a
  eq tmp, 0x61
  
  counter = (2 ** 15) * 3 / 2
  result = []
  while --counter >= 0 => result.push 0 # one code unit per symbol
  fromCodePoint.apply null result # must not throw

  counter = (2 ** 15) * 3 / 2
  result = []
  while --counter >= 0 => result.push 0xFFFF + 1 # two code units per symbol
  fromCodePoint.apply null result # must not throw

test 'String.raw' !->
  {raw} = String
  ok isFunction(raw), 'Is function'
  eq raw({raw: ['Hi\\n', '!']} , \Bob), 'Hi\\nBob!', 'raw is array'
  eq raw({raw: \test}, 0, 1, 2), 't0e1s2t', 'raw is string'
  eq raw({raw: \test}, 0), 't0est', 'lacks substituting'
  throws (-> raw {}), TypeError
  throws (-> raw {raw: null}), TypeError

test 'String#codePointAt' !->
  ok isFunction(String::codePointAt), 'Is function'
  # tests from https://github.com/mathiasbynens/String.prototype.codePointAt/blob/master/tests/tests.js
  eq 'abc\uD834\uDF06def'codePointAt(''), 0x61
  eq 'abc\uD834\uDF06def'codePointAt(\_), 0x61
  eq 'abc\uD834\uDF06def'codePointAt!, 0x61
  eq 'abc\uD834\uDF06def'codePointAt(-Infinity), void
  eq 'abc\uD834\uDF06def'codePointAt(-1), void
  eq 'abc\uD834\uDF06def'codePointAt(-0), 0x61
  eq 'abc\uD834\uDF06def'codePointAt(0), 0x61
  eq 'abc\uD834\uDF06def'codePointAt(3), 0x1D306
  eq 'abc\uD834\uDF06def'codePointAt(4), 0xDF06
  eq 'abc\uD834\uDF06def'codePointAt(5), 0x64
  eq 'abc\uD834\uDF06def'codePointAt(42), void
  eq 'abc\uD834\uDF06def'codePointAt(Infinity), void
  eq 'abc\uD834\uDF06def'codePointAt(Infinity), void
  eq 'abc\uD834\uDF06def'codePointAt(NaN), 0x61
  eq 'abc\uD834\uDF06def'codePointAt(no), 0x61
  eq 'abc\uD834\uDF06def'codePointAt(null), 0x61
  eq 'abc\uD834\uDF06def'codePointAt(void), 0x61
  eq '\uD834\uDF06def'codePointAt(''), 0x1D306
  eq '\uD834\uDF06def'codePointAt(\1), 0xDF06
  eq '\uD834\uDF06def'codePointAt(\_), 0x1D306
  eq '\uD834\uDF06def'codePointAt!, 0x1D306
  eq '\uD834\uDF06def'codePointAt(-1), void
  eq '\uD834\uDF06def'codePointAt(-0), 0x1D306
  eq '\uD834\uDF06def'codePointAt(0), 0x1D306
  eq '\uD834\uDF06def'codePointAt(1), 0xDF06
  eq '\uD834\uDF06def'codePointAt(42), void
  eq '\uD834\uDF06def'codePointAt(no), 0x1D306
  eq '\uD834\uDF06def'codePointAt(null), 0x1D306
  eq '\uD834\uDF06def'codePointAt(void), 0x1D306
  eq '\uD834abc'codePointAt(''), 0xD834
  eq '\uD834abc'codePointAt(\_), 0xD834
  eq '\uD834abc'codePointAt!, 0xD834
  eq '\uD834abc'codePointAt(-1), void
  eq '\uD834abc'codePointAt(-0), 0xD834
  eq '\uD834abc'codePointAt(0), 0xD834
  eq '\uD834abc'codePointAt(no), 0xD834
  eq '\uD834abc'codePointAt(NaN), 0xD834
  eq '\uD834abc'codePointAt(null), 0xD834
  eq '\uD834abc'codePointAt(void), 0xD834
  eq '\uDF06abc'codePointAt(''), 0xDF06
  eq '\uDF06abc'codePointAt(\_), 0xDF06
  eq '\uDF06abc'codePointAt!, 0xDF06
  eq '\uDF06abc'codePointAt(-1), void
  eq '\uDF06abc'codePointAt(-0), 0xDF06
  eq '\uDF06abc'codePointAt(0), 0xDF06
  eq '\uDF06abc'codePointAt(no), 0xDF06
  eq '\uDF06abc'codePointAt(NaN), 0xDF06
  eq '\uDF06abc'codePointAt(null), 0xDF06
  eq '\uDF06abc'codePointAt(void), 0xDF06
  if strict
    throws (-> String::codePointAt.call null, 0), TypeError
    throws (-> String::codePointAt.call void, 0), TypeError
test 'String#includes' !->
  ok isFunction(String::includes), 'Is function'
  ok not 'abc'includes!
  ok 'aundefinedb'includes!
  ok 'abcd'includes \b 1
  ok not 'abcd'includes \b 2
  if strict
    throws (-> String::includes.call null, '.'), TypeError
    throws (-> String::includes.call void, '.'), TypeError
  throws (-> 'foo[a-z]+(bar)?'includes /[a-z]+/), TypeError
test 'String#endsWith' !->
  ok isFunction(String::endsWith), 'Is function'
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
  if strict
    throws (-> String::endsWith.call null, '.'), TypeError
    throws (-> String::endsWith.call void, '.'), TypeError
  throws (-> 'qwe'endsWith /./), TypeError
test 'String#startsWith' !->
  ok isFunction(String::startsWith), 'Is function'
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
  if strict
    throws (-> String::startsWith.call null, '.'), TypeError
    throws (-> String::startsWith.call void, '.'), TypeError
  throws (-> 'qwe'startsWith /./), TypeError
test 'String#repeat' !->
  ok isFunction(String::repeat), 'Is function'
  eq 'qwe'repeat(3), \qweqweqwe
  eq 'qwe'repeat(2.5), \qweqwe
  throws (-> 'qwe'repeat -1), RangeError
  throws (-> 'qwe'repeat Infinity), RangeError
  if strict
    throws (-> String::repeat.call null, 1), TypeError
    throws (-> String::repeat.call void, 1), TypeError
test 'String#@@iterator' !->
  ok typeof String::[iterator] is \function, 'Is function'
  iter = 'qwe'[iterator]!
  ok isIterator(iter), 'Return iterator'
  eq iter[toStringTag], 'String Iterator'
  deq iter.next!, {value: \q, done: no}
  deq iter.next!, {value: \w, done: no}
  deq iter.next!, {value: \e, done: no}
  deq iter.next!, {value: void, done: on}
  eq Array.from(\𠮷𠮷𠮷).length, 3
  iter = '𠮷𠮷𠮷'[iterator]!
  deq iter.next!, {value: \𠮷, done: no}
  deq iter.next!, {value: \𠮷, done: no}
  deq iter.next!, {value: \𠮷, done: no}
  deq iter.next!, {value: void, done: on}

test 'Array.from' !->
  {from} = Array
  ok isFunction(from), 'Is function'
  deq from(\123), <[1 2 3]>
  deq from({length: 3, 0: 1, 1: 2, 2: 3}), [1 2 3]
  from al = (-> &)(1), (val, key)->
    eq @, ctx
    eq val, 1
    eq key, 0
  , ctx = {}
  from [1], (val, key)->
    eq @, ctx
    eq val, 1
    eq key, 0
  , ctx = {}
  deq from({length: 3, 0: 1, 1: 2, 2: 3}, (^2)), [1 4 9]
  deq from(new Set [1 2 3 2 1]), [1 2 3], 'Works with iterators'
  throws (-> from null), TypeError
  throws (-> from void), TypeError
test 'Array.of' !->
  ok isFunction(Array.of), 'Is function'
  deq Array.of(1), [1]
  deq Array.of(1 2 3), [1 2 3]
test 'Array#copyWithin' !->
  ok isFunction(Array::copyWithin), 'Is function'
  eq (a = [1]copyWithin(0)), a
  deq [1 2 3 4 5]copyWithin(0 3), [4 5 3 4 5]
  deq [1 2 3 4 5]copyWithin(1 3), [1 4 5 4 5]
  deq [1 2 3 4 5]copyWithin(1 2), [1 3 4 5 5]
  deq [1 2 3 4 5]copyWithin(2 2), [1 2 3 4 5]
  deq [1 2 3 4 5]copyWithin(0 3 4), [4 2 3 4 5]
  deq [1 2 3 4 5]copyWithin(1 3 4), [1 4 3 4 5]
  deq [1 2 3 4 5]copyWithin(1 2 4), [1 3 4 4 5]
  deq [1 2 3 4 5]copyWithin(0 -2), [4 5 3 4 5]
  deq [1 2 3 4 5]copyWithin(0 -2 -1), [4 2 3 4 5]
  deq [1 2 3 4 5]copyWithin(-4 -3 -2), [1 3 3 4 5]
  deq [1 2 3 4 5]copyWithin(-4 -3 -1), [1 3 4 4 5]
  deq [1 2 3 4 5]copyWithin(-4 -3), [1 3 4 5 5]
  if strict
    throws (-> Array::copyWithin.call null, 0), TypeError
    throws (-> Array::copyWithin.call void, 0), TypeError
  ok \copyWithin of Array::[Symbol.unscopables], 'In Array#@@unscopables'
test 'Array#fill' !->
  ok isFunction(Array::fill), 'Is function'
  eq (a = Array(5)fill(5)), a
  deq Array(5)fill(5), [5 5 5 5 5]
  deq Array(5)fill(5 1), [void 5 5 5 5]
  deq Array(5)fill(5 1 4), [void 5 5 5 void]
  deq Array(5)fill(5 6 1), [void void void void void]
  deq Array(5)fill(5 -3 4), [void void 5 5 void]
  if strict
    throws (-> Array::fill.call null, 0), TypeError
    throws (-> Array::fill.call void, 0), TypeError
  ok \fill of Array::[Symbol.unscopables], 'In Array#@@unscopables'
test 'Array#find' !->
  ok isFunction(Array::find), 'Is function'
  (arr = [1])find (val, key, that)->
    eq @, ctx
    eq val, 1
    eq key, 0
    eq that, arr
  , ctx = {}
  eq [1 3 NaN, 42 {}]find((is 42)), 42
  eq [1 3 NaN, 42 {}]find((is 43)), void
  if strict
    throws (-> Array::find.call null, 0), TypeError
    throws (-> Array::find.call void, 0), TypeError
  ok \find of Array::[Symbol.unscopables], 'In Array#@@unscopables'
test 'Array#findIndex' !->
  ok isFunction(Array::findIndex), 'Is function'
  (arr = [1])findIndex (val, key, that)->
    eq @, ctx
    eq val, 1
    eq key, 0
    eq that, arr
  , ctx = {}
  eq [1 3 NaN, 42 {}]findIndex((is 42)), 3
  if strict
    throws (-> Array::findIndex.call null, 0), TypeError
    throws (-> Array::findIndex.call void, 0), TypeError
  ok \findIndex of Array::[Symbol.unscopables], 'In Array#@@unscopables'
test 'Array#keys' !->
  ok typeof Array::keys is \function, 'Is function'
  iter = <[q w e]>keys!
  ok isIterator(iter), 'Return iterator'
  eq iter[toStringTag], 'Array Iterator'
  deq iter.next!, {value: 0, done: no}
  deq iter.next!, {value: 1, done: no}
  deq iter.next!, {value: 2, done: no}
  deq iter.next!, {value: void, done: on}
  ok \keys of Array::[Symbol.unscopables], 'In Array#@@unscopables'
test 'Array#values' !->
  ok typeof Array::values is \function, 'Is function'
  iter = <[q w e]>values!
  ok isIterator(iter), 'Return iterator'
  eq iter[toStringTag], 'Array Iterator'
  deq iter.next!, {value: \q, done: no}
  deq iter.next!, {value: \w, done: no}
  deq iter.next!, {value: \e, done: no}
  deq iter.next!, {value: void, done: on}
  ok \values of Array::[Symbol.unscopables], 'In Array#@@unscopables'
test 'Array#entries' !->
  ok typeof Array::entries is \function, 'Is function'
  iter = <[q w e]>entries!
  ok isIterator(iter), 'Return iterator'
  eq iter[toStringTag], 'Array Iterator'
  deq iter.next!, {value: [0 \q], done: no}
  deq iter.next!, {value: [1 \w], done: no}
  deq iter.next!, {value: [2 \e], done: no}
  deq iter.next!, {value: void, done: on}
  ok \entries of Array::[Symbol.unscopables], 'In Array#@@unscopables'
test 'Array#@@iterator' !->
  ok typeof Array::[iterator] is \function, 'Is function'
  eq Array::[iterator], Array::values
  iter = <[q w e]>[iterator]!
  ok isIterator(iter), 'Return iterator'
  eq iter[toStringTag], 'Array Iterator'
  deq iter.next!, {value: \q, done: no}
  deq iter.next!, {value: \w, done: no}
  deq iter.next!, {value: \e, done: no}
  deq iter.next!, {value: void, done: on}
test 'Array#@@unscopables' !->
  eq typeof! Array::[Symbol.unscopables], \Object

if descriptors => test 'Function instance "name" property' !->
  ok \name of Function::
  eq (function foo => it).name, \foo
  eq (->).name, ''

test 'Object static methods accept primitives' !->
  for method in <[freeze seal preventExtensions getOwnPropertyDescriptor getPrototypeOf isExtensible isSealed isFrozen keys getOwnPropertyNames]>
    for value in [42 \foo no]
      result = try
        Object[method] value
        on
      catch => no
      ok result, "Object.#method accept #{typeof! value}"
  for method in <[freeze seal preventExtensions]>
    for value in [42 \foo no null void, {}]
      eq Object[method](value), value, "Object.#method returns target on #{typeof! value}"
  for method in <[isSealed isFrozen]>
    for value in [42 \foo no null void]
      eq Object[method](value), on, "Object.#method returns true on #{typeof! value}"
  for value in [42 \foo no null void]
    eq Object.isExtensible(value), no, "Object.isExtensible returns false on #{typeof! value}"
  for method in <[getOwnPropertyDescriptor getPrototypeOf keys getOwnPropertyNames]>
    for value in [null void]
      throws (-> Object[method] value), TypeError, "Object.#method throws on #value"
  eq Object.getPrototypeOf(\foo), String::

if descriptors => test 'RegExp#flags' !->
  eq /./g.flags, \g, '/./g.flags is "g"'
  eq /./.flags, '', '/./.flags is ""'
  eq RegExp('.', \gim).flags, \gim, 'RegExp(".", "gim").flags is "gim"'
  eq RegExp('.').flags, '', 'RegExp(".").flags is ""'
  eq /./gim.flags, \gim, '/./gim.flags is "gim"'
  eq /./gmi.flags, \gim, '/./gmi.flags is "gim"'
  eq /./mig.flags, \gim, '/./mig.flags is "gim"'
  eq /./mgi.flags, \gim, '/./mgi.flags is "gim"'

if descriptors => test 'RegExp allows a regex with flags as the pattern' !->
  a = /a/g
  b = new RegExp a
  ok a isnt b, 'a != b'
  eq String(b), '/a/g', 'b is /a/g'
  eq String(new RegExp(/a/g, 'mi')), '/a/im', 'Allows a regex with flags'
  ok new RegExp(/a/g, 'im') instanceof RegExp, 'Works with instanceof'
  eq new RegExp(/a/g, 'im').constructor, RegExp, 'Has the right constructor'
  /(b)(c)(d)(e)(f)(g)(h)(i)(j)(k)(l)(m)(n)(o)(p)/.exec \abcdefghijklmnopq
  for val, index in \bcdefghij
    eq RegExp"$#{index + 1}", val, "Updates RegExp globals $#{index + 1}"