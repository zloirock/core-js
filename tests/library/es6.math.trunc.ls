QUnit.module \ES6

eq = strictEqual
sameEq = (a, b, c)-> ok (if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b), c

isFunction = -> typeof! it is \Function

test 'Math.trunc' !->
  # Returns the integral part of the number x, removing any fractional digits. If x is already an integer, the result is x.
  {trunc} = core.Math
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