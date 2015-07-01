QUnit.module \ES6

test 'Number.parseFloat' !->
  ok typeof! Number.parseFloat is \Function, 'Is function'
  ok /native code/.test(Number.parseFloat), 'looks like native'