QUnit.module 'ES6 String.raw'

eq = strictEqual

test '*' !->
  {raw} = core.String
  ok typeof! raw is \Function, 'Is function'
  eq raw.length, 1, 'arity is 1'
  if \name of raw => eq raw.name, \raw, 'name is "raw"'
  eq raw({raw: ['Hi\\n', '!']} , \Bob), 'Hi\\nBob!', 'raw is array'
  eq raw({raw: \test}, 0, 1, 2), 't0e1s2t', 'raw is string'
  eq raw({raw: \test}, 0), 't0est', 'lacks substituting'
  throws (-> raw {}), TypeError
  throws (-> raw {raw: null}), TypeError