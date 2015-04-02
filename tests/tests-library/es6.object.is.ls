QUnit.module 'ES6 Object.is'

test '*' !->
  same = core.Object.is
  ok typeof! same is \Function, 'Is function'
  ok same(1 1), '1 is 1'
  ok same(NaN, NaN), '1 is 1'
  ok not same(0 -0), '0 isnt -0'
  ok not same({} {}), '{} isnt {}'