QUnit.module 'ES6 Number.parseFloat'

test '*' !->
  ok typeof! Number.parseFloat is \Function, 'Is function'
  ok /native code/.test(Number.parseFloat), 'looks like native'