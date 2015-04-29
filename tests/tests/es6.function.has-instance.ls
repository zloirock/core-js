QUnit.module 'ES6 Function#@@hasInstance'
test '*' !->
  ok Symbol.hasInstance of Function::
  ok Function[Symbol.hasInstance] ->
  ok !Function[Symbol.hasInstance] {}