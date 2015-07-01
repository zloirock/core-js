QUnit.module \ES6

test 'Number.parseFloat' !->
  ok typeof! core.Number.parseFloat is \Function, 'Is function'