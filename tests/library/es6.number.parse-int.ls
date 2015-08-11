QUnit.module \ES6

test 'Number.parseInt' !->
  ok typeof! core.Number.parseInt is \Function, 'Is function'