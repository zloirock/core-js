{module, test} = QUnit
module \ES5

isFunction = -> typeof! it is \Function

test 'Object.getOwnPropertyDescriptor' (assert)->
  {getOwnPropertyDescriptor} = Object
  assert.ok isFunction(getOwnPropertyDescriptor), 'is function'
  assert.deepEqual getOwnPropertyDescriptor(q:42, \q), {+writable, +enumerable, +configurable, value: 42}
  assert.ok getOwnPropertyDescriptor({}, \toString) is void

test 'Object.defineProperty' (assert)->
  {defineProperty} = Object
  assert.ok isFunction(defineProperty), 'is function'
  assert.ok (rez = defineProperty src = {}, \q, value: 42) is src
  assert.ok rez.q is 42

test 'Object.defineProperties' (assert)->
  {defineProperties} = Object
  assert.ok isFunction(defineProperties), 'is function'
  assert.ok (rez = defineProperties src = {}, q: {value: 42}, w: value: 33) is src
  assert.ok rez.q is 42 and rez.w is 33

test 'Object.getPrototypeOf' (assert)->
  {create, getPrototypeOf} = Object
  assert.ok isFunction(getPrototypeOf), 'is function'
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
  assert.ok isFunction(getOwnPropertyNames), 'is function'
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
  assert.ok isFunction(create), 'is function'
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
  assert.ok isFunction(keys), 'is function'
  fn1 = (@w = 2)->
  fn2 = (@toString = 2)->
  fn1::q = fn2::q = 1
  assert.deepEqual keys([1,2,3]), <[0 1 2]>
  assert.deepEqual keys(new fn1 1), <[w]>
  assert.deepEqual keys(new fn2 1), <[toString]>
  assert.ok \push not in keys Array::

test 'Object.seal' (assert)->
  {seal} = Object
  assert.ok isFunction(seal), 'is function'
  assert.strictEqual seal(a = {}), a

test 'Object.freeze' (assert)->
  {freeze} = Object
  assert.ok isFunction(freeze), 'is function'
  assert.strictEqual freeze(a = {}), a

test 'Object.preventExtensions' (assert)->
  {preventExtensions} = Object
  assert.ok isFunction(preventExtensions), 'is function'
  assert.strictEqual preventExtensions(a = {}), a

test 'Object.isSealed' (assert)->
  {isSealed} = Object
  assert.ok isFunction(isSealed), 'is function'
  assert.strictEqual isSealed({}), no

test 'Object.isFrozen' (assert)->
  {isFrozen} = Object
  assert.ok isFunction(isFrozen), 'is function'
  assert.strictEqual isFrozen({}), no

test 'Object.isExtensible' (assert)->
  {isExtensible} = Object
  assert.ok isFunction(isExtensible), 'is function'
  assert.strictEqual isExtensible({}), on

test 'Function#bind' (assert)->
  assert.ok isFunction(Function::bind), 'is function'
  obj = a: 42
  assert.ok 42 is (-> @a)bind(obj)!
  assert.ok void is new ((->)bind obj)!a
  fn = (@a, @b)->
  inst = new (fn.bind null, 1) 2
  assert.ok inst instanceof fn
  assert.strictEqual inst.a, 1
  assert.strictEqual inst.b, 2
  assert.ok 42 is (-> it)bind(null 42)!
  fn = RegExp::test.bind /a/
  assert.ok fn \a
  F = Date.bind null 2015
  date = new F 6
  assert.ok date instanceof Date
  assert.strictEqual date.getFullYear!, 2015
  assert.strictEqual date.getMonth!, 6

test 'Array.isArray' (assert)->
  {isArray} = Array
  assert.ok isFunction(isArray), 'is function'
  assert.ok not isArray {}
  assert.ok not isArray do -> &
  assert.ok isArray []

test 'ES5 Array prototype methods are functions' (assert)->
  for <[indexOf lastIndexOf every some forEach map filter reduce reduceRight]>
    assert.ok isFunction(Array::[..]), "Array::#{..} is function"

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

test 'Array#join' (assert)->
  assert.strictEqual Array::join.call(\123), '1,2,3'
  assert.strictEqual Array::join.call(\123 \|), '1|2|3'

test 'Array#indexOf' (assert)->
  assert.ok 0  is [1 1 1]indexOf 1
  assert.ok -1 is [1 2 3]indexOf 1 1
  assert.ok 1  is [1 2 3]indexOf 2 1
  assert.ok -1 is [NaN]indexOf NaN
  assert.ok 3  is Array(2)concat([1 2 3])indexOf 2
  assert.ok -1 is Array(1)indexOf void

test 'Array#lastIndexOf' (assert)->
  assert.strictEqual 2,  [1 1 1]lastIndexOf 1
  assert.strictEqual -1, [1 2 3]lastIndexOf 3 1
  assert.strictEqual 1,  [1 2 3]lastIndexOf 2 1
  assert.strictEqual -1, [NaN]lastIndexOf NaN
  assert.strictEqual 1,  [1 2 3]concat(Array 2)lastIndexOf 2

test 'Array#every' (assert)->
  (a = [1])every (val, key, that)->
    assert.ok val  is 1
    assert.ok key  is 0
    assert.ok that is a
    assert.ok @    is ctx
  , ctx = {}
  assert.ok [1 2 3]every -> typeof! it is \Number
  assert.ok [1 2 3]every (<4)
  assert.ok not [1 2 3]every (<3)
  assert.ok not [1 2 3]every -> typeof! it is \String
  assert.ok [1 2 3]every (-> +@ is 1 ), 1
  rez = ''
  [1 2 3]every -> rez += &1
  assert.ok rez is \012
  assert.ok (arr = [1 2 3])every -> &2 is arr

test 'Array#some' (assert)->
  (a = [1])some (val, key, that)->
    assert.ok val  is 1
    assert.ok key  is 0
    assert.ok that is a
    assert.ok @    is ctx
  , ctx = {}
  assert.ok [1 \2 3]some -> typeof! it is \Number
  assert.ok [1 2 3]some (<3)
  assert.ok not [1 2 3]some (<0)
  assert.ok not [1 2 3]some -> typeof! it is \String
  assert.ok not [1 2 3]some (-> +@ isnt 1), 1
  rez = ''
  [1 2 3]some -> rez += &1; no
  assert.ok rez is \012
  assert.ok not (arr = [1 2 3])some -> &2 isnt arr

test 'Array#forEach' (assert)->
  (a = [1])forEach (val, key, that)!->
    assert.ok val  is 1
    assert.ok key  is 0
    assert.ok that is a
    assert.ok @    is ctx
  , ctx = {}
  rez = ''
  [1 2 3]forEach !-> rez += it
  assert.ok rez is \123
  rez = ''
  [1 2 3]forEach !-> rez += &1
  assert.ok rez is \012
  rez = ''
  [1 2 3]forEach !-> rez += &2
  assert.ok rez is '1,2,31,2,31,2,3'
  rez=''
  [1 2 3]forEach (!->rez+=@), 1
  assert.ok rez is \111
  rez = ''
  arr = []
  arr.5 = ''
  arr.forEach (, k)!-> rez += k
  assert.ok rez is \5

test 'Array#map' (assert)->
  (a = [1])map (val, key, that)->
    assert.ok val  is 1
    assert.ok key  is 0
    assert.ok that is a
    assert.ok @    is ctx
  , ctx = {}
  assert.deepEqual [2 3 4] [1 2 3]map (+ 1)
  assert.deepEqual [1 3 5] [1 2 3]map ( + )
  assert.deepEqual [2 2 2] [1 2 3]map (-> +@), 2 

test 'Array#filter' (assert)->
  (a = [1])filter (val, key, that)->
    assert.ok val is 1
    assert.ok key is 0
    assert.ok that is a
    assert.ok @ is ctx
  , ctx = {}
  assert.deepEqual [1 2 3 4 5] [1 2 3 \q {} 4 on 5]filter -> typeof! it is \Number

test 'Array#reduce' (assert)->
  assert.ok -5 is [5 4 3 2 1]reduce (-)
  (a = [1])reduce (memo, val, key, that)->
    assert.ok memo is 42
    assert.ok val  is 1
    assert.ok key  is 0
    assert.ok that is a
  , 42
  [42 43]reduce ->
    assert.ok it is 42

test 'Array#reduceRight' (assert)->
  assert.ok -5 is [1 2 3 4 5]reduceRight (-)
  (a = [1])reduceRight (memo, val, key, that)->
    assert.ok memo is 42
    assert.ok val  is 1
    assert.ok key  is 0
    assert.ok that is a
  , 42
  [42 43]reduceRight ->
    assert.ok it is 43

test 'Date.now' (assert)->
  {now} = Date
  assert.ok isFunction(now), 'is function'
  assert.ok +new Date - now! < 10, 'Date.now() ~ +new Date'

test 'Date#toISOString' (assert)->
  assert.ok isFunction(Date::toISOString), 'is function'
  assert.strictEqual new Date(0).toISOString(), '1970-01-01T00:00:00.000Z'
  assert.strictEqual new Date(1e12+1).toISOString(), '2001-09-09T01:46:40.001Z'
  assert.strictEqual new Date(-5e13-1).toISOString(), '0385-07-25T07:06:39.999Z'
  ft =  new Date(1e15+1).toISOString()
  assert.ok(ft is '+033658-09-27T01:46:40.001Z' or ft is '33658-09-27T01:46:40.001Z')
  bc =  new Date(-1e15+1).toISOString()
  assert.ok(bc is '-029719-04-05T22:13:20.001Z' or bc is '-29719-04-05T22:13:20.001Z')
  assert.throws (-> new Date(NaN).toISOString!), RangeError