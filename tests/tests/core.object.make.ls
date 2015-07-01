QUnit.module \core-js
test 'Object.make' !->
  {make} = Object
  ok typeof! make is \Function, 'Is function'
  object = make foo = {q:1}, {w:2}
  ok Object.getPrototypeOf(object) is foo
  ok object.w is 2