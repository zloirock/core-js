QUnit.module 'ES6 Function#@@hasInstance'
test '*' !->
  ok core.Symbol.hasInstance of Function::
  ok Function[core.Symbol.hasInstance] ->
  ok !Function[core.Symbol.hasInstance] {}