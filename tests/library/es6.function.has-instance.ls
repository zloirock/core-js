QUnit.module \ES6
test 'Function#@@hasInstance' !->
  ok core.Symbol.hasInstance of Function::
  ok Function[core.Symbol.hasInstance] ->
  ok !Function[core.Symbol.hasInstance] {}