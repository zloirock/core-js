{module, test} = QUnit
module \ES6

test 'String.raw' (assert)->
  {raw} = String
  assert.ok typeof! raw is \Function, 'Is function'
  assert.strictEqual raw.length, 1, 'arity is 1'
  assert.ok /native code/.test(raw), 'looks like native'
  assert.strictEqual raw.name, \raw, 'name is "raw"'
  assert.strictEqual raw({raw: ['Hi\\n', '!']} , \Bob), 'Hi\\nBob!', 'raw is array'
  assert.strictEqual raw({raw: \test}, 0, 1, 2), 't0e1s2t', 'raw is string'
  assert.strictEqual raw({raw: \test}, 0), 't0est', 'lacks substituting'
  assert.throws (-> raw {}), TypeError
  assert.throws (-> raw {raw: null}), TypeError