QUnit.module \ES6

eq = strictEqual

test 'String.raw' !->
  {raw} = String
  ok typeof! raw is \Function, 'Is function'
  eq raw.length, 1, 'arity is 1'
  ok /native code/.test(raw), 'looks like native'
  if \name of raw => eq raw.name, \raw, 'name is "raw"'
  eq raw({raw: ['Hi\\n', '!']} , \Bob), 'Hi\\nBob!', 'raw is array'
  eq raw({raw: \test}, 0, 1, 2), 't0e1s2t', 'raw is string'
  eq raw({raw: \test}, 0), 't0est', 'lacks substituting'
  throws (-> raw {}), TypeError
  throws (-> raw {raw: null}), TypeError