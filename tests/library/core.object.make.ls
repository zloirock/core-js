QUnit.module 'core-js'
test 'Object.make' !->
  {make} = core.Object
  ok typeof! make is \Function, 'Is function'
  object = make foo = {q:1}, {w:2}
  ok core.Object.getPrototypeOf(object) is foo
  ok object.w is 2