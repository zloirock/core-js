QUnit.module \core-js
global = Function('return this')!
{from, values} = core.Array

test 'core.getIterator' !->
  {getIterator} = core
  ok typeof getIterator is \function, 'Is function'
  throws (!-> getIterator {}), TypeError
  iter = getIterator []
  ok \next of iter
  iter = getIterator (->&)!
  ok \next of iter
  /*
  _Symbol = global.Symbol
  I = Math.random!
  O = {0: \a, 1: \b, 2: \c, length: 3}
  O[I] = -> values @
  throws (!-> getIterator O), TypeError
  global.Symbol = {iterator: I}
  try
    getIterator O
    ok on
  catch => ok no
  deepEqual from(getIterator O), <[a b c]>
  global.Symbol = _Symbol
  throws (!-> getIterator O), TypeError
  */