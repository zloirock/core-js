{module, test} = QUnit
module \ES6

{defineProperty} = core.Object
{from} = core.Array

test 'Reflect.enumerate' (assert)!->
  {enumerate} = core.Reflect
  {iterator} = core.Symbol
  assert.isFunction enumerate
  assert.arity enumerate, 1
  if \name of enumerate
    assert.name enumerate, \enumerate
  obj = {foo: 1, bar: 2}
  i = enumerate obj
  assert.isIterable i
  assert.deepEqual from(i), <[foo bar]>, 'bisic'
  obj = {q: 1, w: 2, e: 3}
  i = enumerate obj
  delete obj.w
  assert.deepEqual from(i), <[q e]>, 'ignore holes'
  obj = {q: 1, w: 2, e: 3} with {a: 4, s: 5, d: 6}
  assert.deepEqual from(enumerate obj).sort!, <[a d e q s w]>, 'works with prototype'
  assert.throws (!-> enumerate 42), TypeError, 'throws on primitive'