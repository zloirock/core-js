QUnit.module \ES6
test 'Function#@@hasInstance' !->
  ok Symbol.hasInstance of Function::
  ok Function[Symbol.hasInstance] ->
  ok !Function[Symbol.hasInstance] {}