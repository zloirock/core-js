{module, test} = QUnit
module \ES6
# Math.hypot returns an implementation-dependent approximation of the square root of the sum of squares of its arguments.
test 'Math.hypot' (assert)->
  epsilon = (a, b, E)-> Math.abs(a - b) <= if E? => E else 1e-11
  {hypot, sqrt} = Math
  assert.ok typeof! hypot is \Function, 'is function'
  assert.strictEqual hypot.name, \hypot, 'name is "hypot"'
  assert.strictEqual hypot.length, 2, 'arity is 2'
  assert.ok /native code/.test(hypot), 'looks like native'
  assert.strictEqual hypot!, 0
  assert.strictEqual hypot(1), 1
  assert.same hypot('', 0), 0
  assert.same hypot(0, ''), 0
  assert.strictEqual hypot(Infinity, 0), Infinity
  assert.strictEqual hypot(-Infinity, 0), Infinity
  assert.strictEqual hypot(0, Infinity), Infinity
  assert.strictEqual hypot(0, -Infinity), Infinity
  assert.strictEqual hypot(Infinity, NaN), Infinity
  assert.strictEqual hypot(NaN, -Infinity), Infinity
  assert.same hypot(NaN, 0), NaN
  assert.same hypot(0, NaN), NaN
  assert.same hypot(0, -0), 0
  assert.same hypot(0, 0), 0
  assert.same hypot(-0, -0), 0
  assert.same hypot(-0, 0), 0
  assert.strictEqual hypot(0, 1), 1
  assert.strictEqual hypot(0, -1), 1
  assert.strictEqual hypot(-0, 1), 1
  assert.strictEqual hypot(-0, -1), 1
  assert.same hypot(0), 0
  assert.strictEqual hypot(1), 1
  assert.strictEqual hypot(2), 2
  assert.strictEqual hypot(0 0 1), 1
  assert.strictEqual hypot(0 1 0), 1
  assert.strictEqual hypot(1 0 0), 1
  assert.strictEqual hypot(2 3 4), sqrt(2 * 2 + 3 * 3 + 4 * 4)
  assert.strictEqual hypot(2 3 4 5), sqrt(2 * 2 + 3 * 3 + 4 * 4 + 5 * 5)
  assert.ok epsilon hypot(66 66), 93.33809511662427
  assert.ok epsilon hypot(0.1 100), 100.0000499999875
  assert.strictEqual hypot(1e+300, 1e+300), 1.4142135623730952e+300
  assert.strictEqual Math.floor(hypot(1e-300, 1e-300) * 1e308), 141421356
  assert.strictEqual hypot(1e+300, 1e+300, 2, 3), 1.4142135623730952e+300
  assert.strictEqual hypot(-3, 4), 5
  assert.strictEqual hypot(3, -4), 5