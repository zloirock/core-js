{module, test} = QUnit
module \ES

{defineProperty} = Object

test 'Reflect.ownKeys' (assert)->
  {ownKeys} = Reflect
  sym = Symbol \c
  assert.isFunction ownKeys
  assert.arity ownKeys, 1
  assert.name ownKeys, \ownKeys
  assert.looksNative ownKeys
  assert.nonEnumerable Reflect, \ownKeys
  O1 = {a: 1}
  defineProperty O1, \b, value: 2
  O1[sym] = 3
  keys = ownKeys O1
  assert.strictEqual keys.length, 3, 'ownKeys return all own keys'
  assert.ok \a in keys, 'ownKeys return all own keys: simple'
  assert.ok \b in keys, 'ownKeys return all own keys: hidden'
  assert.strictEqual O1[keys.2], 3, 'ownKeys return all own keys: symbol'
  O2 = ^^O1
  keys = ownKeys O2
  assert.strictEqual keys.length, 0, 'ownKeys return only own keys'
  assert.throws (-> ownKeys 42), TypeError, 'throws on primitive'