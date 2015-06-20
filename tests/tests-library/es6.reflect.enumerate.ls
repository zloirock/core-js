QUnit.module 'ES6 Reflect.enumerate'

{defineProperty} = core.Object
{from} = core.Array

MODERN = (-> try 2 == defineProperty({}, \a, get: -> 2)a)!

eq = strictEqual
deq = deepEqual

test '*' !->
  {enumerate} = core.Reflect
  {iterator} = core.Symbol
  ok typeof! enumerate is \Function, 'Reflect.enumerate is function'
  eq enumerate.length, 1, 'arity is 1'
  if \name of enumerate => eq enumerate.name, \enumerate, 'name is "enumerate"'
  obj = {foo: 1, bar: 2}
  i = enumerate obj
  ok iterator of i, 'returns iterator'
  deq from(i), <[foo bar]>, 'bisic'
  obj = {q: 1, w: 2, e: 3}
  i = enumerate obj
  delete obj.w
  deq from(i), <[q e]>, 'ignore holes'
  obj = {q: 1, w: 2, e: 3} with {a: 4, s: 5, d: 6}
  deq from(enumerate obj).sort!, <[a d e q s w]>, 'works with prototype'
  throws (-> enumerate 42), TypeError, 'throws on primitive'