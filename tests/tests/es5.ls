{isFunction} = Object
test 'Object.getOwnPropertyDescriptor' ->
  {getOwnPropertyDescriptor} = Object
  ok isFunction getOwnPropertyDescriptor
  deepEqual getOwnPropertyDescriptor(q:42, \q), {+writable, +enumerable, +configurable, value: 42}
  equal getOwnPropertyDescriptor({}, \toString), void
test 'Object.defineProperty' ->
  ok isFunction Object.defineProperty
  equal rez = Object.defineProperty(src = {}, \q, value: 42), src
  equal rez.q, 42
test 'Object.defineProperties' ->
  ok isFunction Object.defineProperties
  equal rez = Object.defineProperties(src = {}, q: {value: 42}, w: {value: 33}), src
  ok rez.q == 42 and rez.w == 33
test 'Object.getPrototypeOf' ->
  {create, getPrototypeOf} = Object
  ok isFunction getPrototypeOf
  equal getPrototypeOf({}), Object::
  equal getPrototypeOf(new class fn), fn::
  equal getPrototypeOf(create obj = q:1), obj
  equal getPrototypeOf(create null), null
  equal getPrototypeOf(getPrototypeOf {}), null
test 'Object.getOwnPropertyNames' ->
  {getOwnPropertyNames} = Object
  ok isFunction getOwnPropertyNames
  fn1 = (@w = 2)->
  fn2 = (@toString = 2)->
  fn1::q = fn2::q = 1
  deepEqual getOwnPropertyNames([1,2,3]), <[0 1 2 length]>
  deepEqual getOwnPropertyNames(new fn1 1), <[w]>
  deepEqual getOwnPropertyNames(new fn2 1), <[toString]>
  ok \toString in getOwnPropertyNames Array::
  ok \toString in getOwnPropertyNames Object::
test 'Object.create' ->
  {create, getPrototypeOf, getPropertyNames, isObject, isPrototype} = Object
  ok isFunction create
  ok isPrototype obj = q:1, create(obj)
  equal create(obj)q, 1
  fn = -> @a = 1
  ok create(new fn) instanceof fn
  equal getPrototypeOf(getPrototypeOf create new fn), fn::
  equal create(new fn).a, 1
  equal create({}, {a:value:42}).a, 42
  ok isObject obj = create null w: value:2
  ok !(\toString of obj)
  equal obj.w, 2
  deepEqual getPropertyNames(create null), []
test 'Object.keys' ->
  {keys} = Object
  ok isFunction keys
  fn1 = (@w = 2)->
  fn2 = (@toString = 2)->
  fn1::q = fn2::q = 1
  deepEqual keys([1,2,3]), <[0 1 2]>
  deepEqual keys(new fn1 1), <[w]>
  deepEqual keys(new fn2 1), <[toString]>
  ok !(\join in keys Array::)
  ok !(\toString in keys Object::)
test 'Function.prototype.bind' ->
  ok isFunction Function::bind
  equal (-> @a)bind(obj = a: 42)!, 42
  equal new ((->)bind(obj))!a, void
  equal (-> it)bind(null, 42)!, 42
test 'Array.isArray' ->
  {isArray} = Array
  ok isFunction Array.isArray
  ok !isArray {}
  ok !isArray do -> &
  ok isArray []
test 'Array::indexOf' ->
  ok isFunction Array::indexOf
  equal [1 1 1]indexOf(1), 0
  equal [1 2 3]indexOf(1 1), -1
  equal [1 2 3]indexOf(2 1), 1
  equal [NaN]indexOf(NaN), -1
  equal Array(2)concat([1 2 3])indexOf(2), 3
test 'Array::lastIndexOf' ->
  ok isFunction Array::lastIndexOf
  equal [1 1 1]lastIndexOf(1),2
  equal [1 2 3]lastIndexOf(3 1),-1
  equal [1 2 3]lastIndexOf(2 1),1
  equal [NaN]lastIndexOf(NaN),-1
  equal [1 2 3]concat(Array 2)lastIndexOf(2), 1
test 'Array::every' ->
  ok isFunction(Array::every)
  (a=[1])every ((val, key, that)->
    ok val is 1
    ok key is 0
    ok that is a
    ok @ is ctx
  ), ctx = {}
  ok [1 2 3]every Object.isNumber
  ok [1 2 3]every (<4)
  ok ![1 2 3]every (<3)
  ok ![1 2 3]every Object.isString
  ok [1 2 3]every (->+@==1), 1
  rez = ''
  [1 2 3]every -> rez += &1
  equal rez, \012
  ok (arr = [1 2 3])every(-> &2 == arr)
test 'Array::some' ->
  ok isFunction Array::some
  (a=[1])some ((val, key, that)->
    ok val is 1
    ok key is 0
    ok that is a
    ok @ is ctx
  ), ctx = {}
  ok [1 \2 3]some Object.isNumber
  ok [1 2 3]some (<3)
  ok ![1 2 3]some (<0)
  ok ![1 2 3]some Object.isString
  ok ![1 2 3]some (->+@!=1), 1
  rez = ''
  [1 2 3]some -> rez += &1; no
  equal rez, \012
  ok !(arr = [1 2 3])some -> &2 != arr
test 'Array::forEach' ->
  ok isFunction Array::forEach
  (a=[1])forEach ((val, key, that)->
    ok val is 1
    ok key is 0
    ok that is a
    ok @ is ctx
  ), ctx = {}
  rez = ''
  [1 2 3]forEach -> rez += it
  equal rez, \123
  rez=''
  [1 2 3]forEach -> rez += &1
  equal rez, \012
  rez = ''
  [1 2 3]forEach -> rez += &2
  equal rez, '1,2,31,2,31,2,3'
  rez=''
  [1 2 3]forEach (->rez+=@), 1
  equal rez, \111
  rez = ''
  arr = []
  arr[5] = ''
  arr.forEach (, k)-> rez += k
  equal rez, \5
test 'Array::map' ->
  ok isFunction Array::map
  (a=[1])map ((val, key, that)->
    ok val is 1
    ok key is 0
    ok that is a
    ok @ is ctx
  ), ctx = {}
  deepEqual [1 2 3]map((+ 1)), [2 3 4]
  deepEqual [1 2 3]map(( + )), [1 3 5]
  deepEqual [1 2 3]map(-> &2[2]), [3 3 3]
  deepEqual [1 2 3]map((-> +@), 2), [2 2 2]
test 'Array::filter' ->
  ok isFunction Array::filter
  (a=[1])filter ((val, key, that)->
    ok val is 1
    ok key is 0
    ok that is a
    ok @ is ctx
  ), ctx = {}
  deepEqual [1 2 3 \q {} 4 on 5]filter(Object.isNumber), [1 2 3 4 5]
test 'Array::reduce' ->
  ok isFunction Array::reduce
  ok [5 4 3 2 1]reduce((-)) is -5
  (a=[1])reduce ((memo, val, key, that)->
    ok memo is 42
    ok val is 1
    ok key is 0
    ok that is a
  ), 42
  [42 43]reduce ->
    ok it is 42
test 'Array::reduceRight' ->
  ok isFunction Array::reduceRight
  ok [1 2 3 4 5]reduceRight((-)) is -5
  (a=[1])reduceRight ((memo, val, key, that)->
    ok memo is 42
    ok val is 1
    ok key is 0
    ok that is a
  ), 42
  [42 43]reduceRight ->
    ok it is 43
test 'String.prototype.trim' ->
  ok \trim of String::
  equal '   q w e \n  'trim!, 'q w e'
test 'Date.now' ->
  ok isFunction Date.now
  ok +new Date - Date.now! < 10