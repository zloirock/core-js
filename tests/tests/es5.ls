{module, test} = QUnit
module \ES5

test 'Object.getOwnPropertyDescriptor' (assert)->
  {getOwnPropertyDescriptor} = Object
  assert.isFunction getOwnPropertyDescriptor
  assert.deepEqual getOwnPropertyDescriptor(q:42, \q), {+writable, +enumerable, +configurable, value: 42}
  assert.ok getOwnPropertyDescriptor({}, \toString) is void

test 'Object.defineProperty' (assert)->
  {defineProperty} = Object
  assert.isFunction defineProperty
  assert.ok (rez = defineProperty src = {}, \q, value: 42) is src
  assert.ok rez.q is 42

test 'Object.defineProperties' (assert)->
  {defineProperties} = Object
  assert.isFunction defineProperties
  assert.ok (rez = defineProperties src = {}, q: {value: 42}, w: value: 33) is src
  assert.ok rez.q is 42 and rez.w is 33

test 'Object.getOwnPropertyNames' (assert)->
  {getOwnPropertyNames} = Object
  assert.isFunction getOwnPropertyNames
  fn1 = (@w = 2)->
  fn2 = (@toString = 2)->
  fn1::q = fn2::q = 1
  names = getOwnPropertyNames [1 2 3]
  assert.strictEqual names.length, 4
  assert.ok \0 in names
  assert.ok \1 in names
  assert.ok \2 in names
  assert.ok \length in names
  assert.deepEqual getOwnPropertyNames(new fn1 1), <[w]>
  assert.deepEqual getOwnPropertyNames(new fn2 1), <[toString]>
  assert.ok \toString in getOwnPropertyNames Array::
  assert.ok \toString in getOwnPropertyNames Object::
  assert.ok \constructor in getOwnPropertyNames Object::

test 'Object.keys' (assert)->
  {keys} = Object
  assert.isFunction keys
  fn1 = (@w = 2)->
  fn2 = (@toString = 2)->
  fn1::q = fn2::q = 1
  assert.deepEqual keys([1,2,3]), <[0 1 2]>
  assert.deepEqual keys(new fn1 1), <[w]>
  assert.deepEqual keys(new fn2 1), <[toString]>
  assert.ok \push not in keys Array::