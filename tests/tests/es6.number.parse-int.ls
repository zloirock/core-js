QUnit.module 'ES6 Number.parseInt'

test '*' !->
  ok typeof! Number.parseInt is \Function, 'Is function'
  ok /native code/.test(Number.parseInt), 'looks like native'