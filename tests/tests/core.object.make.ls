QUnit.module 'core-js Object.make'
test '*' !->
  {make} = Object
  ok typeof! make is \Function, 'Is function'
  object = make foo = {q:1}, {w:2}
  ok Object.getPrototypeOf(object) is foo
  ok object.w is 2