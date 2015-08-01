QUnit.module \core-js
global = Function('return this')!
{from} = Array

test 'core.getIteratorMethod' !->
  {getIteratorMethod} = core
  ok typeof getIteratorMethod is \function, 'Is function'
  strictEqual getIteratorMethod({}), void
  iterFn = getIteratorMethod []
  ok typeof iterFn is \function
  iter = iterFn.call []
  ok \next of iter
  iter = getIteratorMethod (->&)!
  ok typeof iterFn is \function
  /*
  _Symbol = global.Symbol
  I = Math.random!
  O = {0: \a, 1: \b, 2: \c, length: 3}
  O[I] = Array::values
  strictEqual getIteratorMethod(O), void
  global.Symbol = {iterator: I}
  strictEqual getIteratorMethod(O), Array::values
  deepEqual from(getIteratorMethod(O).call O), <[a b c]>
  global.Symbol = _Symbol
  strictEqual getIteratorMethod(O), void
  */