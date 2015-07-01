QUnit.module \ES6

test 'Object.is' !->
  same = Object.is
  ok typeof! same is \Function, 'Is function'
  ok /native code/.test(same), 'looks like native'
  ok same(1 1), '1 is 1'
  ok same(NaN, NaN), '1 is 1'
  ok not same(0 -0), '0 isnt -0'
  ok not same({} {}), '{} isnt {}'