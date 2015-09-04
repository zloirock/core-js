QUnit.module \ES6

eq = strictEqual
sameEq = (a, b, c)-> ok (if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b), c

isFunction = -> typeof! it is \Function
epsilon = (a, b, E)-> Math.abs(a - b) <= if E? => E else 1e-11

test 'Math.hypot' !->
  # Math.hypot returns an implementation-dependent approximation of the square root of the sum of squares of its arguments.
  {sqrt} = Math
  {hypot} = core.Math
  ok isFunction(hypot), 'Is function'
  eq hypot!, 0
  eq hypot(1), 1
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
  eq Math.floor(hypot(1e-300, 1e-300) * 1e308), 141421356
  eq hypot(1e+300, 1e+300, 2, 3), 1.4142135623730952e+300
  eq hypot(-3, 4), 5
  eq hypot(3, -4), 5