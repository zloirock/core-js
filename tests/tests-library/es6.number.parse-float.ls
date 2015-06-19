QUnit.module 'ES6 Number.parseFloat'

test '*' !->
  ok typeof! core.Number.parseFloat is \Function, 'Is function'