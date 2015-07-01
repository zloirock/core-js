QUnit.module \ES7

test 'Set#toJSON' !->
  ok typeof! Set::toJSON is \Function, 'Is function'
  ok /native code/.test(Set::toJSON), 'looks like native'
  if JSON? => strictEqual JSON.stringify(new Set [1 2 3 2 1] ), '[1,2,3]', 'Works'