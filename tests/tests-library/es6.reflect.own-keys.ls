QUnit.module \ES6

{defineProperty} = core.Object

eq = strictEqual

test 'Reflect.ownKeys' !->
  {ownKeys} = core.Reflect
  sym = core.Symbol \c
  ok typeof! ownKeys is \Function, 'Reflect.ownKeys is function'
  eq ownKeys.length, 1, 'arity is 1'
  if \name of ownKeys => eq ownKeys.name, \ownKeys, 'name is "ownKeys"'
  O1 = {a: 1}
  defineProperty O1, \b, value: 2
  O1[sym] = 3
  keys = ownKeys O1
  eq keys.length, 3, 'ownKeys return all own keys'
  eq O1[keys.0], 1, 'ownKeys return all own keys: simple'
  eq O1[keys.1], 2, 'ownKeys return all own keys: hidden'
  eq O1[keys.2], 3, 'ownKeys return all own keys: symbol'
  O2 = ^^O1
  keys = ownKeys O2
  eq keys.length, 0, 'ownKeys return only own keys'
  throws (-> ownKeys 42), TypeError, 'throws on primitive'