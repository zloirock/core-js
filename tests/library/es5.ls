{module, test} = QUnit
module \ES5

isFunction = -> typeof! it is \Function

test 'Object.getOwnPropertyDescriptor' (assert)->
  {getOwnPropertyDescriptor} = core.Object
  assert.ok isFunction(getOwnPropertyDescriptor), 'Is function'
  assert.deepEqual getOwnPropertyDescriptor(q:42, \q), {+writable, +enumerable, +configurable, value: 42}
  assert.ok getOwnPropertyDescriptor({}, \toString) is void

test 'Object.defineProperty' (assert)->
  {defineProperty} = core.Object
  assert.ok isFunction(defineProperty), 'Is function'
  assert.ok (rez = defineProperty src = {}, \q, value: 42) is src
  assert.ok rez.q is 42

test 'Object.defineProperties' (assert)->
  {defineProperties} = core.Object
  assert.ok isFunction(defineProperties), 'Is function'
  assert.ok (rez = defineProperties src = {}, q: {value: 42}, w: value: 33) is src
  assert.ok rez.q is 42 and rez.w is 33

test 'Object.getPrototypeOf' (assert)->
  {create, getPrototypeOf} = core.Object
  assert.ok isFunction(getPrototypeOf), 'Is function'
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
  {getOwnPropertyNames} = core.Object
  assert.ok isFunction(getOwnPropertyNames), 'Is function'
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
  {create, getPrototypeOf, getOwnPropertyNames} = core.Object
  isObject = -> it is Object it
  isPrototype = (a, b)-> ({}).isPrototypeOf.call a, b
  getPropertyNames = (object)->
    result = getOwnPropertyNames object
    while object = getPrototypeOf(object)
      for getOwnPropertyNames(object)
        .. in result or result.push ..
    result
  assert.ok isFunction(create), 'Is function'
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
  {keys} = core.Object
  assert.ok isFunction(keys), 'Is function'
  fn1 = (@w = 2)->
  fn2 = (@toString = 2)->
  fn1::q = fn2::q = 1
  assert.deepEqual keys([1,2,3]), <[0 1 2]>
  assert.deepEqual keys(new fn1 1), <[w]>
  assert.deepEqual keys(new fn2 1), <[toString]>
  assert.ok \push not in keys Array::

test 'Object.seal' (assert)->
  {seal} = core.Object
  assert.ok isFunction(seal), 'Is function'
  assert.strictEqual seal(a = {}), a

test 'Object.freeze' (assert)->
  {freeze} = core.Object
  assert.ok isFunction(freeze), 'Is function'
  assert.strictEqual freeze(a = {}), a

test 'Object.preventExtensions' (assert)->
  {preventExtensions} = core.Object
  assert.ok isFunction(preventExtensions), 'Is function'
  assert.strictEqual preventExtensions(a = {}), a

test 'Object.isSealed' (assert)->
  {isSealed} = core.Object
  assert.ok isFunction(isSealed), 'Is function'
  assert.strictEqual isSealed({}), no

test 'Object.isFrozen' (assert)->
  {isFrozen} = core.Object
  assert.ok isFunction(isFrozen), 'Is function'
  assert.strictEqual isFrozen({}), no

test 'Object.isExtensible' (assert)->
  {isExtensible} = core.Object
  assert.ok isFunction(isExtensible), 'Is function'
  assert.strictEqual isExtensible({}), on

test 'Function#bind' (assert)->
  {bind} = core.Function
  assert.ok isFunction(bind), 'Is function'
  obj = a: 42
  assert.ok 42 is bind((-> @a), obj)!
  assert.ok void is new (bind((->), obj))!a
  fn = (@a, @b)->
  inst = new (bind fn, null, 1) 2
  assert.ok inst instanceof fn
  assert.strictEqual inst.a, 1
  assert.strictEqual inst.b, 2
  assert.ok 42 is bind((-> it), null 42)!
  fn = bind RegExp::test, /a/
  assert.ok fn \a
  F = bind Date, null 2015
  date = new F 6
  assert.ok date instanceof Date
  assert.strictEqual date.getFullYear!, 2015
  assert.strictEqual date.getMonth!, 6

test 'Array.isArray' (assert)->
  {isArray} = core.Array
  assert.ok isFunction(isArray), 'Is function'
  assert.ok not isArray {}
  assert.ok not isArray do -> &
  assert.ok isArray []

test 'ES5 Array prototype methods are functions' (assert)->
  for <[indexOf lastIndexOf every some forEach map filter reduce reduceRight]>
    assert.ok isFunction(core.Array[..]), "Array::#{..} is function"

test 'Array#slice' (assert)->
  {slice} = core.Array
  arr = <[1 2 3 4 5]>
  assert.deepEqual slice(arr), arr
  assert.deepEqual slice(arr, 1 3), <[2 3]>
  assert.deepEqual slice(arr, 1 void), <[2 3 4 5]>
  assert.deepEqual slice(arr, 1 -1), <[2 3 4]>
  assert.deepEqual slice(arr, -2 -1), <[4]>
  assert.deepEqual slice(arr, -2 -3), []
  str = \12345
  assert.deepEqual slice(str), arr
  assert.deepEqual slice(str, 1 3), <[2 3]>
  assert.deepEqual slice(str, 1 void), <[2 3 4 5]>
  assert.deepEqual slice(str, 1 -1), <[2 3 4]>
  assert.deepEqual slice(str, -2 -1), <[4]>
  assert.deepEqual slice(str, -2 -3), []
  if list = document?body?childNodes
    try assert.strictEqual typeof! slice(list), \Array
    catch => assert.ok no

test 'Array#join' (assert)->
  {join} = core.Array
  assert.strictEqual join(\123), '1,2,3'
  assert.strictEqual join(\123 \|), '1|2|3'

test 'Array#indexOf' (assert)->
  {indexOf} = core.Array
  assert.ok 0  is indexOf [1 1 1], 1
  assert.ok -1 is indexOf [1 2 3], 1 1
  assert.ok 1  is indexOf [1 2 3], 2 1
  assert.ok -1 is indexOf [NaN], NaN
  assert.ok 3  is indexOf Array(2)concat([1 2 3]), 2
  assert.ok -1 is indexOf Array(1), void

test 'Array#lastIndexOf' (assert)->
  {lastIndexOf} = core.Array
  assert.strictEqual 2,  lastIndexOf [1 1 1], 1
  assert.strictEqual -1, lastIndexOf [1 2 3], 3 1
  assert.strictEqual 1,  lastIndexOf [1 2 3], 2 1
  assert.strictEqual -1, lastIndexOf [NaN], NaN
  assert.strictEqual 1,  lastIndexOf [1 2 3]concat(Array 2), 2

test 'Array#every' (assert)->
  {every} = core.Array
  every (a = [1]), (val, key, that)->
    assert.ok val  is 1
    assert.ok key  is 0
    assert.ok that is a
    assert.ok @    is ctx
  , ctx = {}
  assert.ok every [1 2 3], -> typeof! it is \Number
  assert.ok every [1 2 3], (<4)
  assert.ok not every [1 2 3], (<3)
  assert.ok not every [1 2 3], -> typeof! it is \String
  assert.ok every [1 2 3], (-> +@ is 1 ), 1
  rez = ''
  every [1 2 3], -> rez += &1
  assert.ok rez is \012
  assert.ok every (arr = [1 2 3]), -> &2 is arr

test 'Array#some' (assert)->
  {some} = core.Array
  some (a = [1]), (val, key, that)->
    assert.ok val  is 1
    assert.ok key  is 0
    assert.ok that is a
    assert.ok @    is ctx
  , ctx = {}
  assert.ok some [1 \2 3], -> typeof! it is \Number
  assert.ok some [1 2 3], (<3)
  assert.ok not some [1 2 3], (<0)
  assert.ok not some [1 2 3], -> typeof! it is \String
  assert.ok not some [1 2 3], (-> +@ isnt 1), 1
  rez = ''
  some [1 2 3], -> rez += &1; no
  assert.ok rez is \012
  assert.ok not some (arr = [1 2 3]), -> &2 isnt arr

test 'Array#forEach' (assert)->
  {forEach} = core.Array
  forEach (a = [1]), (val, key, that)!->
    assert.ok val  is 1
    assert.ok key  is 0
    assert.ok that is a
    assert.ok @    is ctx
  , ctx = {}
  rez = ''
  forEach [1 2 3], !-> rez += it
  assert.ok rez is \123
  rez = ''
  forEach [1 2 3], !-> rez += &1
  assert.ok rez is \012
  rez = ''
  forEach [1 2 3], !-> rez += &2
  assert.ok rez is '1,2,31,2,31,2,3'
  rez=''
  forEach [1 2 3], (!->rez+=@), 1
  assert.ok rez is \111
  rez = ''
  arr = []
  arr.5 = ''
  forEach arr, (, k)!-> rez += k
  assert.ok rez is \5

test 'Array#map' (assert)->
  {map} = core.Array
  map (a = [1]), (val, key, that)->
    assert.ok val  is 1
    assert.ok key  is 0
    assert.ok that is a
    assert.ok @    is ctx
  , ctx = {}
  assert.deepEqual [2 3 4] map [1 2 3], (+ 1)
  assert.deepEqual [1 3 5] map [1 2 3], ( + )
  assert.deepEqual [2 2 2] map [1 2 3], (-> +@), 2

test 'Array#filter' (assert)->
  {filter} = core.Array
  filter (a = [1]), (val, key, that)->
    assert.ok val is 1
    assert.ok key is 0
    assert.ok that is a
    assert.ok @ is ctx
  , ctx = {}
  assert.deepEqual [1 2 3 4 5] filter [1 2 3 \q {} 4 on 5], -> typeof! it is \Number

test 'Array#reduce' (assert)->
  {reduce} = core.Array
  assert.ok -5 is reduce [5 4 3 2 1], (-)
  reduce (a = [1]), (memo, val, key, that)->
    assert.ok memo is 42
    assert.ok val  is 1
    assert.ok key  is 0
    assert.ok that is a
  , 42
  reduce [42 43], ->
    assert.ok it is 42

test 'Array#reduceRight' (assert)->
  {reduceRight} = core.Array
  assert.ok -5 is reduceRight [1 2 3 4 5], (-)
  reduceRight (a = [1]), (memo, val, key, that)->
    assert.ok memo is 42
    assert.ok val  is 1
    assert.ok key  is 0
    assert.ok that is a
  , 42
  reduceRight [42 43], ->
    assert.ok it is 43

test 'Date.now' (assert)->
  {now} = core.Date
  assert.ok isFunction(now), 'Is function'
  assert.ok +new Date - now! < 10, 'Date.now() ~ +new Date'

test 'Date#toISOString' (assert)->
  {toISOString} = core.Date
  assert.ok isFunction(toISOString), 'Is function'
  assert.strictEqual toISOString(new Date(0)), '1970-01-01T00:00:00.000Z'
  assert.strictEqual toISOString(new Date(1e12+1)), '2001-09-09T01:46:40.001Z'
  assert.strictEqual toISOString(new Date(-5e13-1)), '0385-07-25T07:06:39.999Z'
  ft = toISOString(new Date(1e15+1))
  assert.ok(ft is '+033658-09-27T01:46:40.001Z' or ft is '33658-09-27T01:46:40.001Z')
  bc = toISOString(new Date(-1e15+1))
  assert.ok(bc is '-029719-04-05T22:13:20.001Z' or bc is '-29719-04-05T22:13:20.001Z')
  assert.throws (-> toISOString new Date NaN), RangeError