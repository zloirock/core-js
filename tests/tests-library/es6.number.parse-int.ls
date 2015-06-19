QUnit.module 'ES6 Number.parseInt'

test '*' !->
  ok typeof! core.Number.parseInt is \Function, 'Is function'