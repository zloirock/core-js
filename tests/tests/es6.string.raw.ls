QUnit.module 'ES6 String.raw'

eq = strictEqual

test '*' !->
  {raw} = String
  ok typeof! raw is \Function, 'Is function'
  eq raw({raw: ['Hi\\n', '!']} , \Bob), 'Hi\\nBob!', 'raw is array'
  eq raw({raw: \test}, 0, 1, 2), 't0e1s2t', 'raw is string'
  eq raw({raw: \test}, 0), 't0est', 'lacks substituting'
  throws (-> raw {}), TypeError
  throws (-> raw {raw: null}), TypeError