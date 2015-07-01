QUnit.module \ES6

test 'Number.parseInt' !->
  ok typeof! Number.parseInt is \Function, 'Is function'
  ok /native code/.test(Number.parseInt), 'looks like native'