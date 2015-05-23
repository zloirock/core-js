QUnit.module \ES5

isFunction = -> typeof! it is \Function

eq = strictEqual
deq = deepEqual

test 'Object.getOwnPropertyDescriptor' !->
  {getOwnPropertyDescriptor} = core.Object
  ok isFunction(getOwnPropertyDescriptor), 'Is function'
  deq getOwnPropertyDescriptor(q:42, \q), {+writable, +enumerable, +configurable, value: 42}
  ok getOwnPropertyDescriptor({}, \toString) is void
test 'Object.defineProperty' !->
  {defineProperty} = core.Object
  ok isFunction(defineProperty), 'Is function'
  ok (rez = defineProperty src = {}, \q, value: 42) is src
  ok rez.q is 42
test 'Object.defineProperties' !->
  {defineProperties} = core.Object
  ok isFunction(defineProperties), 'Is function'
  ok (rez = defineProperties src = {}, q: {value: 42}, w: value: 33) is src
  ok rez.q is 42 and rez.w is 33
test 'Object.getPrototypeOf' !->
  {create, getPrototypeOf} = core.Object
  ok isFunction(getPrototypeOf), 'Is function'
  ok getPrototypeOf({}) is Object::
  ok getPrototypeOf([]) is Array::
  ok getPrototypeOf(new class fn) is fn::
  ok getPrototypeOf(create obj = q:1) is obj
  ok getPrototypeOf(create null) is null
  ok getPrototypeOf(getPrototypeOf {}) is null
  
  foo = ->
  foo::foo = \foo
  bar = ->
  bar:: = create foo::
  bar::constructor = bar
  eq getPrototypeOf(bar::).foo, \foo

test 'Object.getOwnPropertyNames' !->
  {getOwnPropertyNames} = core.Object
  ok isFunction(getOwnPropertyNames), 'Is function'
  fn1 = (@w = 2)->
  fn2 = (@toString = 2)->
  fn1::q = fn2::q = 1
  deq getOwnPropertyNames([1 2 3]), <[0 1 2 length]>
  deq getOwnPropertyNames(new fn1 1), <[w]>
  deq getOwnPropertyNames(new fn2 1), <[toString]>
  ok \toString in getOwnPropertyNames Array::
  ok \toString in getOwnPropertyNames Object::
  ok \constructor in getOwnPropertyNames Object::
test 'Object.create' !->
  {create, getPrototypeOf, getOwnPropertyNames} = core.Object
  isObject = -> it is Object it
  isPrototype = (a, b)-> ({}).isPrototypeOf.call a, b
  getPropertyNames = (object)->
    result = getOwnPropertyNames object
    while object = getPrototypeOf(object)
      for getOwnPropertyNames(object)
        .. in result or result.push ..
    result
  ok isFunction(create), 'Is function'
  ok isPrototype obj = q:1, create(obj)
  ok create(obj)q is 1
  fn = -> @a = 1
  ok create(new fn) instanceof fn
  ok fn:: is getPrototypeOf getPrototypeOf create new fn
  ok create(new fn)a is 1
  ok create({}, {a:value:42})a is 42
  ok isObject obj = create null w: value:2
  ok \toString not of obj
  ok obj.w is 2
  deq getPropertyNames(create null), []
test 'Object.keys' !->
  {keys} = core.Object
  ok isFunction(keys), 'Is function'
  fn1 = (@w = 2)->
  fn2 = (@toString = 2)->
  fn1::q = fn2::q = 1
  deq keys([1,2,3]), <[0 1 2]>
  deq keys(new fn1 1), <[w]>
  deq keys(new fn2 1), <[toString]>
  ok \push not in keys Array::
test 'Object.seal' !->
  {seal} = core.Object
  ok isFunction(seal), 'Is function'
  eq seal(a = {}), a
test 'Object.freeze' !->
  {freeze} = core.Object
  ok isFunction(freeze), 'Is function'
  eq freeze(a = {}), a
test 'Object.preventExtensions' !->
  {preventExtensions} = core.Object
  ok isFunction(preventExtensions), 'Is function'
  eq preventExtensions(a = {}), a
test 'Object.isSealed' !->
  {isSealed} = core.Object
  ok isFunction(isSealed), 'Is function'
  eq isSealed({}), no
test 'Object.isFrozen' !->
  {isFrozen} = core.Object
  ok isFunction(isFrozen), 'Is function'
  eq isFrozen({}), no
test 'Object.isExtensible' !->
  {isExtensible} = core.Object
  ok isFunction(isExtensible), 'Is function'
  eq isExtensible({}), on

test 'Function#bind' !->
  {bind} = core.Function
  ok isFunction(bind), 'Is function'
  obj = a: 42
  ok 42   is bind((-> @a), obj)!
  ok void is new (bind((->), obj))!a
  fn = (@a, @b)->
  inst = new (bind fn, null, 1) 2
  ok inst instanceof fn
  eq inst.a, 1
  eq inst.b, 2
  ok 42   is bind((-> it), null 42)!
  fn = bind RegExp::test, /a/
  ok fn \a
test 'Array.isArray' !->
  {isArray} = core.Array
  ok isFunction(isArray), 'Is function'
  ok not isArray {}
  ok not isArray do -> &
  ok isArray []
test 'ES5 Array prototype methods are functions' !->
  for <[indexOf lastIndexOf every some forEach map filter reduce reduceRight]>
    ok isFunction(core.Array[..]), "Array::#{..} is function"
test 'Array#slice' !->
  {slice} = core.Array
  arr = <[1 2 3 4 5]>
  deq slice(arr), arr
  deq slice(arr, 1 3), <[2 3]>
  deq slice(arr, 1 void), <[2 3 4 5]>
  deq slice(arr, 1 -1), <[2 3 4]>
  deq slice(arr, -2 -1), <[4]>
  deq slice(arr, -2 -3), []
  str = \12345
  deq slice(str), arr
  deq slice(str, 1 3), <[2 3]>
  deq slice(str, 1 void), <[2 3 4 5]>
  deq slice(str, 1 -1), <[2 3 4]>
  deq slice(str, -2 -1), <[4]>
  deq slice(str, -2 -3), []
  if list = document?body?childNodes
    try eq typeof! slice(list), \Array
    catch => ok no
test 'Array#join' !->
  {join} = core.Array
  eq join(\123), '1,2,3'
  eq join(\123 \|), '1|2|3'
test 'Array#indexOf' !->
  {indexOf} = core.Array
  ok 0  is indexOf [1 1 1], 1
  ok -1 is indexOf [1 2 3], 1 1
  ok 1  is indexOf [1 2 3], 2 1
  ok -1 is indexOf [NaN], NaN
  ok 3  is indexOf Array(2)concat([1 2 3]), 2
  ok -1 is indexOf Array(1), void
test 'Array#lastIndexOf' !->
  {lastIndexOf} = core.Array
  eq 2,  lastIndexOf [1 1 1], 1
  eq -1, lastIndexOf [1 2 3], 3 1
  eq 1,  lastIndexOf [1 2 3], 2 1
  eq -1, lastIndexOf [NaN], NaN
  eq 1,  lastIndexOf [1 2 3]concat(Array 2), 2
test 'Array#every' !->
  {every} = core.Array
  every (a = [1]), (val, key, that)->
    ok val  is 1
    ok key  is 0
    ok that is a
    ok @    is ctx
  , ctx = {}
  ok every [1 2 3], -> typeof! it is \Number
  ok every [1 2 3], (<4)
  ok not every [1 2 3], (<3)
  ok not every [1 2 3], -> typeof! it is \String
  ok every [1 2 3], (-> +@ is 1 ), 1
  rez = ''
  every [1 2 3], -> rez += &1
  ok rez is \012
  ok every (arr = [1 2 3]), -> &2 is arr
test 'Array#some' !->
  {some} = core.Array
  some (a = [1]), (val, key, that)->
    ok val  is 1
    ok key  is 0
    ok that is a
    ok @    is ctx
  , ctx = {}
  ok some [1 \2 3], -> typeof! it is \Number
  ok some [1 2 3], (<3)
  ok not some [1 2 3], (<0)
  ok not some [1 2 3], -> typeof! it is \String
  ok not some [1 2 3], (-> +@ isnt 1), 1
  rez = ''
  some [1 2 3], -> rez += &1; no
  ok rez is \012
  ok not some (arr = [1 2 3]), -> &2 isnt arr
test 'Array#forEach' !->
  {forEach} = core.Array
  forEach (a = [1]), (val, key, that)!->
    ok val  is 1
    ok key  is 0
    ok that is a
    ok @    is ctx
  , ctx = {}
  rez = ''
  forEach [1 2 3], !-> rez += it
  ok rez is \123
  rez = ''
  forEach [1 2 3], !-> rez += &1
  ok rez is \012
  rez = ''
  forEach [1 2 3], !-> rez += &2
  ok rez is '1,2,31,2,31,2,3'
  rez=''
  forEach [1 2 3], (!->rez+=@), 1
  ok rez is \111
  rez = ''
  arr = []
  arr.5 = ''
  forEach arr, (, k)!-> rez += k
  ok rez is \5
test 'Array#map' !->
  {map} = core.Array
  map (a = [1]), (val, key, that)->
    ok val  is 1
    ok key  is 0
    ok that is a
    ok @    is ctx
  , ctx = {}
  deq [2 3 4] map [1 2 3], (+ 1)
  deq [1 3 5] map [1 2 3], ( + )
  deq [2 2 2] map [1 2 3], (-> +@), 2 
test 'Array#filter' !->
  {filter} = core.Array
  filter (a = [1]), (val, key, that)->
    ok val is 1
    ok key is 0
    ok that is a
    ok @ is ctx
  , ctx = {}
  deq [1 2 3 4 5] filter [1 2 3 \q {} 4 on 5], -> typeof! it is \Number
test 'Array#reduce' !->
  {reduce} = core.Array
  ok -5 is reduce [5 4 3 2 1], (-)
  reduce (a = [1]), (memo, val, key, that)->
    ok memo is 42
    ok val  is 1
    ok key  is 0
    ok that is a
  , 42
  reduce [42 43], ->
    ok it is 42
test 'Array#reduceRight' !->
  {reduceRight} = core.Array
  ok -5 is reduceRight [1 2 3 4 5], (-)
  reduceRight (a = [1]), (memo, val, key, that)->
    ok memo is 42
    ok val  is 1
    ok key  is 0
    ok that is a
  , 42
  reduceRight [42 43], ->
    ok it is 43
test 'String#trim' !->
  {trim} = core.String
  ok isFunction(trim), 'Is function'
  ok trim('   q w e \n  ') is 'q w e', 'Remove whitespaces at left & right side of string'
test 'Date.now' !->
  {now} = core.Date
  ok isFunction(now), 'Is function'
  ok +new Date - now! < 10, 'Date.now() ~ +new Date'
test 'Date#toISOString' !->
  {toISOString} = core.Date
  ok isFunction(toISOString), 'Is function'
  eq toISOString(new Date(0)), '1970-01-01T00:00:00.000Z'
  eq toISOString(new Date(1e12+1)), '2001-09-09T01:46:40.001Z'
  eq toISOString(new Date(-5e13-1)), '0385-07-25T07:06:39.999Z'
  ft =  toISOString(new Date(1e15+1))
  ok(ft is '+033658-09-27T01:46:40.001Z' or ft is '33658-09-27T01:46:40.001Z')
  bc =  toISOString(new Date(-1e15+1))
  ok(bc is '-029719-04-05T22:13:20.001Z' or bc is '-29719-04-05T22:13:20.001Z')
  throws (-> toISOString new Date NaN), RangeError