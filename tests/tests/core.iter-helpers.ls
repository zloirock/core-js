QUnit.module 'core-js iter helpers'
{from} = Array
test 'core.isIterable' !->
  {isIterable} = core
  ok typeof isIterable is \function, 'Is function'
  ok !isIterable {}
  ok isIterable []
  ok isIterable (->&)!
  
  _Symbol = Symbol
  I = Math.random!
  o = {0: \a, 1: \b, 2: \c, length: 3}
  o[I] = Array::values
  ok !isIterable o
  global.Symbol = {iterator: I}
  ok isIterable o
  global.Symbol = _Symbol
  ok !isIterable o
  
test 'core.getIterator' !->
  {getIterator} = core
  ok typeof getIterator is \function, 'Is function'
  throws (!-> getIterator {}), TypeError
  iter = getIterator []
  ok \next of iter
  iter = getIterator (->&)!
  ok \next of iter
  
  _Symbol = Symbol
  I = Math.random!
  O = {0: \a, 1: \b, 2: \c, length: 3}
  O[I] = Array::values
  throws (!-> getIterator O), TypeError
  global.Symbol = {iterator: I}
  try
    getIterator O
    ok on
  catch => ok no
  deepEqual from(O), <[a b c]>
  global.Symbol = _Symbol
  throws (!-> getIterator O), TypeError