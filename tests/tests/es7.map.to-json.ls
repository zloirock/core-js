QUnit.module 'ES7 Map#toJSON'

test '*' !->
  ok typeof! Map::toJSON is \Function, 'Is function'
  ok /native code/.test(Map::toJSON), 'looks like native'
  if JSON? => strictEqual JSON.stringify(new Map [[\a \b], [\c \d]] ), '[["a","b"],["c","d"]]', 'Works'