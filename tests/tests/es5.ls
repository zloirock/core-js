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

test 'Object.getPrototypeOf' (assert)->
  {create, getPrototypeOf} = Object
  assert.isFunction getPrototypeOf
  assert.ok getPrototypeOf({}) is Object::
  assert.ok getPrototypeOf([]) is Array::
  assert.ok getPrototypeOf(new class fn) is fn::
  assert.ok getPrototypeOf(create obj = q:1) is obj
  assert.ok getPrototypeOf(create null) is null
  assert.ok getPrototypeOf(getPrototypeOf {}) is null
  foo = ->
  foo::foo = \foo
  bar = ->
  bar:: = create foo::
  bar::constructor = bar
  assert.strictEqual getPrototypeOf(bar::).foo, \foo

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

test 'Object.create' (assert)->
  {create, getPrototypeOf, getOwnPropertyNames} = Object
  isObject = -> it is Object it
  isPrototype = (a, b)-> ({}).isPrototypeOf.call a, b
  getPropertyNames = (object)->
    result = getOwnPropertyNames object
    while object = getPrototypeOf(object)
      for getOwnPropertyNames(object)
        .. in result or result.push ..
    result
  assert.isFunction create
  assert.ok isPrototype obj = q:1, create(obj)
  assert.ok create(obj)q is 1
  fn = -> @a = 1
  assert.ok create(new fn) instanceof fn
  assert.ok fn:: is getPrototypeOf getPrototypeOf create new fn
  assert.ok create(new fn)a is 1
  assert.ok create({}, {a:value:42})a is 42
  assert.ok isObject obj = create null w: value:2
  assert.ok \toString not of obj
  assert.ok obj.w is 2
  assert.deepEqual getPropertyNames(create null), []

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

test 'Object.seal' (assert)->
  {seal} = Object
  assert.isFunction seal
  assert.strictEqual seal(a = {}), a

test 'Object.freeze' (assert)->
  {freeze} = Object
  assert.isFunction freeze
  assert.strictEqual freeze(a = {}), a

test 'Object.preventExtensions' (assert)->
  {preventExtensions} = Object
  assert.isFunction preventExtensions
  assert.strictEqual preventExtensions(a = {}), a

test 'Object.isSealed' (assert)->
  {isSealed} = Object
  assert.isFunction isSealed
  assert.strictEqual isSealed({}), no

test 'Object.isFrozen' (assert)->
  {isFrozen} = Object
  assert.isFunction isFrozen
  assert.strictEqual isFrozen({}), no

test 'Object.isExtensible' (assert)->
  {isExtensible} = Object
  assert.isFunction isExtensible
  assert.strictEqual isExtensible({}), on

test 'ES5 Array prototype methods are functions' (assert)->
  for <[indexOf reduce reduceRight]>
    assert.isFunction Array::[..], "Array::#{..} is function"

test 'Array#slice' (assert)->
  {slice} = Array::
  arr = <[1 2 3 4 5]>
  assert.deepEqual arr.slice!, arr
  assert.deepEqual arr.slice(1 3), <[2 3]>
  assert.deepEqual arr.slice(1 void), <[2 3 4 5]>
  assert.deepEqual arr.slice(1 -1), <[2 3 4]>
  assert.deepEqual arr.slice(-2 -1), <[4]>
  assert.deepEqual arr.slice(-2 -3), []
  str = \12345
  assert.deepEqual slice.call(str), arr
  assert.deepEqual slice.call(str, 1 3), <[2 3]>
  assert.deepEqual slice.call(str, 1 void), <[2 3 4 5]>
  assert.deepEqual slice.call(str, 1 -1), <[2 3 4]>
  assert.deepEqual slice.call(str, -2 -1), <[4]>
  assert.deepEqual slice.call(str, -2 -3), []
  if list = document?body?childNodes
    try assert.strictEqual typeof! slice.call(list), \Array
    catch => assert.ok no
  if NATIVE
    assert.deepEqual slice.call({length: -1, 0: 1}, 0, 1), [], 'uses ToLength'

test 'Array#indexOf' (assert)->
  assert.ok 0  is [1 1 1]indexOf 1
  assert.ok -1 is [1 2 3]indexOf 1 1
  assert.ok 1  is [1 2 3]indexOf 2 1
  assert.ok -1 is [1 2 3]indexOf 2 -1
  assert.ok 1  is [1 2 3]indexOf 2 -2
  assert.ok -1 is [NaN]indexOf NaN
  assert.ok 3  is Array(2)concat([1 2 3])indexOf 2
  assert.ok -1 is Array(1)indexOf void
  if NATIVE and DESCRIPTORS
    assert.ok (try -1 is Array::indexOf.call Object.defineProperty({length: -1}, 0, get: -> throw Error!), 1), 'uses ToLength'

test 'Array#reduce' (assert)->
  (a = [1])reduce (memo, val, key, that)->
    assert.same &length, 4, 'correct number of callback arguments'
    assert.same memo, accumulator, 'correct callback accumulator'
    assert.same val, 1, 'correct value in callback'
    assert.same key, 0, 'correct index in callback'
    assert.same that, a, 'correct link to array in callback'
  , accumulator = {}
  assert.same [1 2 3]reduce((+), 1), 7, 'works with initial accumulator'
  (a = [1 2])reduce (memo, val, key, that)->
    assert.same memo, 1, 'correct default accumulator'
    assert.same val, 2, 'correct start value without initial accumulator'
    assert.same key, 1, 'correct start index without initial accumulator'
  assert.same [1 2 3]reduce((+)), 6, 'works without initial accumulator'
  v = ''
  k = ''
  [1 2 3]reduce (memo, a, b)!->
    v += a
    k += b
  , 0
  assert.same v, \123,'correct order #1'
  assert.same k, \012,'correct order #2'
  assert.same Array::reduce.call({0: 1, 1: 2, length: 2}, (+)), 3, 'generic'
  if NATIVE
    assert.ok (try Array::reduce.call {length: -1, 0: 1}, (!-> throw 42), 1), 'uses ToLength'

test 'Array#reduceRight' (assert)->
  (a = [1])reduceRight (memo, val, key, that)->
    assert.same &length, 4, 'correct number of callback arguments'
    assert.same memo, accumulator, 'correct callback accumulator'
    assert.same val, 1, 'correct value in callback'
    assert.same key, 0, 'correct index in callback'
    assert.same that, a, 'correct link to array in callback'
  , accumulator = {}
  assert.same [1 2 3]reduceRight((+), 1), 7, 'works with initial accumulator'
  (a = [1 2])reduceRight (memo, val, key, that)->
    assert.same memo, 2, 'correct default accumulator'
    assert.same val, 1, 'correct start value without initial accumulator'
    assert.same key, 0, 'correct start index without initial accumulator'
  assert.same [1 2 3]reduceRight((+)), 6, 'works without initial accumulator'
  v = ''
  k = ''
  [1 2 3]reduceRight (memo, a, b)!->
    v += a
    k += b
  , 0
  assert.same v, \321,'correct order #1'
  assert.same k, \210,'correct order #2'
  assert.same Array::reduceRight.call({0: 1, 1: 2, length: 2}, (+)), 3, 'generic'
  if NATIVE
    assert.ok (try Array::reduceRight.call {length: -1, 2147483646: 0, 4294967294: 0}, (!-> throw 42), 1), 'uses ToLength'