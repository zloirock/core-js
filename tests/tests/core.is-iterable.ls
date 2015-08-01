QUnit.module \core-js
global = Function('return this')!

test 'core.isIterable' !->
  {isIterable} = core
  ok typeof isIterable is \function, 'Is function'
  ok !isIterable {}
  ok isIterable []
  ok isIterable (->&)!
  /*
  _Symbol = global.Symbol
  I = Math.random!
  o = {0: \a, 1: \b, 2: \c, length: 3}
  o[I] = Array::values
  ok !isIterable o
  global.Symbol = {iterator: I}
  ok isIterable o
  global.Symbol = _Symbol
  ok !isIterable o
  */