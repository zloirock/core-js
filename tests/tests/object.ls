{isFunction, isNative} = Function
{getPrototypeOf, create, defineProperty, getOwnPropertyDescriptor} = Object
test 'Object.has' !->
  {has} = Object
  ok isFunction(has), 'Is function'
  ok has q:1, \q
  ok not has q:1, \w
  ok has [1] 0
  ok not has [] 0
  ok not has ^^{q:1} \q
  ok not has {} \toString
test 'Object.get' !->
  {get} = Object
  ok isFunction(get), 'Is function'
  ok get(q:1, \q) is 1
  ok get(q:1, \w) is void
  ok get([1] 0) is 1
  ok get([] 0) is void
  ok get(^^{q:1} \q) is void
  ok get({} \toString) is void
test 'Object.isEnumerable' !->
  {isEnumerable} = Object
  ok isFunction(isEnumerable), 'Is function'
  ok isEnumerable q:1, \q
  ok not isEnumerable {} \toString
  ok not isEnumerable ^^{q:1}, \q
test 'Object.isPrototype' !->
  {isPrototype} = Object
  ok isFunction(isPrototype), 'Is function'
  ok isPrototype Object::, {}
  ok isPrototype Object::, []
  ok not isPrototype Array::, {}
  ok isPrototype Array::, []
  ok not isPrototype Function::, []
  ok isPrototype proto = {}, ^^proto
  ok not isPrototype {}, ^^->
test 'Object.classof' !->
  {classof} = Object
  ok isFunction(classof), 'Is function'
  ok classof({}) is \Object
  ok classof(void) is \Undefined
  ok classof(null) is \Null
  ok classof(no) is \Boolean
  ok classof(new Boolean no) is \Boolean
  ok classof('') is \String
  ok classof(new String '') is \String
  ok classof(7) is \Number
  ok classof(new Number 7) is \Number
  ok classof([]) is \Array
  ok classof(->) is \Function
  ok classof(/./) is \RegExp
  ok classof(TypeError!) is \Error
test 'Object.tie' ->
  {tie} = Object
  ok isFunction(tie), 'Is function'
  array = [1 2 3]
  push = tie array, \push
  ok isFunction push
  ok push(4) is 4
  deepEqual array, [1 2 3 4]
test 'Object.make' !->
  {make} = Object
  ok isFunction(make), 'Is function'
  object = make foo = {q:1}, {w:2}
  ok getPrototypeOf(object) is foo
  ok object.w is 2
test 'Object.plane' !->
  {plane} = Object
  ok isFunction(plane), 'Is function'
  foo = plane q:1 w:2
  ok getPrototypeOf(foo) is null
  ok foo.q is 1
  ok foo.w is 2
test 'Object.mixin' !->
  {mixin} = Object
  ok isFunction(mixin), 'Is function'
  foo = q:1
  ok foo is mixin foo, w:2
  ok foo.w is 2
  if isNative getOwnPropertyDescriptor
    foo = q:1
    foo2 = defineProperty {}, \w, get: -> @q + 1
    mixin foo, foo2
    ok foo.w is 2
do !->
  # Object.clone
  {clone} = Object
  test 'Object.clone' !->
    ok isFunction(clone), 'Is function'
  test 'Object.clone(primitive)' !->
    ok clone(null) is null
    ok clone(void) is void
    ok clone(\qwe) is \qwe
    ok clone(123), 123
    ok not clone no
  test 'Object.clone(Object(String|Number|Boolean))' !->
    i1 = new String \qwe
    i2 = clone i1
    ok i1 isnt i2
    ok i1.valueOf! is i2.valueOf!
    i1 = new Number 123
    i2 = clone i1
    ok i1 isnt i2
    ok i1.valueOf! is i2.valueOf!
    i1 = new Boolean no
    i2 = clone i1
    ok i1 isnt i2
    ok i2.valueOf! is no
  test 'Object.clone(Date)' !->
    i1=new Date 1350861246986
    i2=clone i1
    ok i1 isnt i2
    ok i2.getTime! is  1350861246986
  test 'Object.clone(RegExp)' !->
    i1 = /q/i
    i2 = clone i1
    ok i1 isnt i2
    ok i2.toString! is '/q/i'
    ok i2.test \Q
  #test 'Object.clone(Set)' ->
  #  set = new Set [1 2 3 2 1]
  #  copy = clone set
  #  ok copy instanceof Set
  #  ok copy.size is 3
  #  rez = {}
  #  copy.forEach (val, key)-> rez[key] = val
  #  deepEqual rez, {1: 1 2: 2 3: 3}
  test 'simple Object.clone(Array)' !->
    i1 = [1 2 3]
    i2 = clone i1
    ok i1 isnt i2
    ok i2.2      is 3
    ok i2.length is 3
    ok i2@@      is Array
    ok Array.isArray i2
  test 'simple Object.clone(Object)' !->
    i1 = q: 123, w: \qwe
    i2 = clone i1
    ok i1 isnt i2
    ok i2.q is 123
    ok i2.w is \qwe
    i1 = q: {}
    i2 = clone i1
    ok i1.q is i2.q
  test 'deep Object.clone(Object)' !->
    i1 = q: q: 1
    i2 = clone i1, 1
    ok i1.q isnt i2.q
    ok i1.q.q is i2.q.q
  test 'deep Object.clone(Array)' !->
    i1 = [/^qwe$/]
    i2 = clone i1, 1
    ok i1.0 isnt i2.0
    ok i2.0.test \qwe
    ok not i2.0.test \qwer
  test 'deep Object.clone(instance)' !->
    fn = -> @q = 1
    i1 = new fn
    i2 = clone i1
    ok i1 isnt i2
    ok i2.q is 1
    ok getPrototypeOf(i1) is getPrototypeOf i2
    i1 = create q: 1
    i2 = clone i1
    ok i1 isnt i2
    ok i2.q is 1
    ok getPrototypeOf(i1) is getPrototypeOf i2
  if Function.isNative Object.getOwnPropertyDescriptor
    test 'deep Object.clone without descriptors' !->
      i1 = q: defineProperty {} \q {get: (->42), +enumerable}
      i2 = clone i1, 1 0
      ok i1.q isnt i2.q
      ok i2.q.q is 42
      ok getOwnPropertyDescriptor(i2.q, \q)get is void
    test 'deep Object.clone with descriptors' !->
      i1 = q: defineProperty {} \q {get: (->52)}
      i2 = clone i1, 1 1
      ok i1.q isnt i2.q
      ok i2.q.q is 52
      ok typeof getOwnPropertyDescriptor(i2.q, \q)get is \function
do ->
  # Object.merge
  {merge} = Object
  class fn
    w: {q: 1, w: 2}
    q: 1
    e: 2
  obj = w: {q: 2, e: 5}, r: 1, e: 1
  test 'Object.merge' !->
    ok isFunction(merge), 'Is function'
  test 'simple Object.merge' !->
    i1 = new fn
    i2 = merge i1, obj
    ok i1   is i2
    ok i1.q is 1
    ok i1.r is 1
    ok i1.w is obj.w
    ok i1.e is 1
  test 'deep Object.merge' !->
    i1 = merge new fn, obj, 1
    ok i1.q   is 1
    ok i1.r   is 1
    ok i1.w   isnt obj.w
    ok i1.w.q is 2
    ok i1.w.w is 2
  test 'reverse Object.merge' !->
    i1 = merge {w: {q: 1, w: 2}, q: 1, e: 2}, obj, 0, 1
    ok i1.q   is 1
    ok i1.r   is 1
    ok i1.e   is 2
    ok i1.w.q is 1
    ok i1.w.w is 2
    ok i1.w.e isnt 5
  test 'reverse deep Object.merge' !->
    i1 = merge {w: {q: 1, w: 2}, q: 1, e: 2}, obj, 1, 1
    ok i1.q   is 1
    ok i1.r   is 1
    ok i1.e   is 2
    ok i1.w.q is 1
    ok i1.w.w is 2
    ok i1.w.e is 5
test 'Object.defaults' !->
  {defaults} = Object
  ok isFunction(defaults), 'Is function'
  obj = defaults {q: 1 w: q: 1} q: 2, w: {w: 2} e: 3
  ok obj.q   is 1
  ok obj.w.q is 1
  ok obj.w.w is 2
  ok obj.e   is 3
test 'Object.values' !->
  {values} = Object
  ok isFunction(values), 'Is function'
  ok values(q: 1 w: 2 e: 3)length is 3
  ok ~values(q: 1 w: 2 e: 3)indexOf 3
test 'Object.invert' !->
  {invert} = Object
  ok isFunction(invert), 'Is function'
  deepEqual invert(q:\a w:\s e:\d), a:\q s:\w d:\e  
test 'Object.every' !->
  {every} = Object
  ok isFunction(every), 'Is function'
  every obj = {q: 1} (val, key, that)->
    ok val  is 1
    ok key  is \q
    ok that is obj
    ok @    is ctx
  , ctx = {}
  ok every {q:1 w:2 e:3} -> typeof! it is \Number
  ok not every {q:1 w:\2 e:3} -> typeof! it is \Number
test 'Object.filter' !->
  {filter, plane} = Object
  ok isFunction(filter), 'Is function'
  filter obj = {q: 1}, (val, key, that)->
    ok val  is 1
    ok key  is \q
    ok that is obj
    ok @    is ctx
  , ctx = {}
  deepEqual filter({q:1 w:2 e:3} -> it % 2), plane q:1 e:3
test 'Object.find' !->
  {find} = Object
  ok isFunction(find), 'Is function'
  find obj = {q: 1}, (val, key, that)->
    ok val  is 1
    ok key  is \q
    ok that is obj
    ok @    is ctx
  , ctx = {}
  ok find({q:1 w:2 e:3} -> !(it % 2)) is 2
test 'Object.findIndex' !->
  {findIndex} = Object
  ok isFunction(findIndex), 'Is function'
  findIndex obj = {q: 1}, (val, key, that)->
    ok val  is 1
    ok key  is \q
    ok that is obj
    ok @    is ctx
  , ctx = {}
  ok findIndex({q:1 w:2 e:3} -> it is 2) is \w
test 'Object.forEach' !->
  {forEach, make} = Object
  ok isFunction(forEach), 'Is function'
  forEach obj = {q: 1}, (val, key, that)!->
    ok val  is 1
    ok key  is \q
    ok that is obj
    ok @    is ctx
  , ctx = {}
  rez = {}
  forEach {q: 1 w: 2} (!-> rez[&1] = &0 + @), \_
  deepEqual rez, q: \1_ w: \2_
  rez = on
  forEach obj = {q: 1 w: 2} !-> rez &&= (obj is &2)
  ok rez
  rez = {}
  forEach make({e: 3} {q: 1 w: 2}), !-> rez[&1] = &0
  ok !(\e of rez)
  rez = {}
  forEach [1 2] !-> rez[&1] = &0
  ok !(\length of rez)
  rez = {}
  forEach \123 !-> rez[&1] = &0
  ok \2 of rez
test 'Object.indexOf' !->
  {indexOf} = Object
  ok isFunction(indexOf), 'Is function'
  ok indexOf({q:1 w:2 e:3} 2)     is \w
  ok indexOf({q:1 w:2 e:3} 4)     is void
  ok indexOf({q:1 w:2 e:NaN} NaN) is \e
test 'Object.map' !->
  {map, plane} = Object
  ok isFunction(map), 'Is function'
  map obj = {q: 1}, (val, key, that)->
    ok val  is 1
    ok key  is \q
    ok that is obj
    ok @    is ctx
  , ctx = {}
  deepEqual map({q:1 w:2 e:3} (^2)), plane q:1 w:4 e:9
test 'Object.reduce' !->
  {reduce} = Object
  ok isFunction(reduce), 'Is function'
  reduce (obj = a:1), (memo, val, key, that)->
    ok memo is foo
    ok val  is 1
    ok key  is \a
    ok that is obj
  , foo = {}
  reduce {a:1 b:2}, (memo, val, key)->
    ok memo is 1
    ok val  is 2
    ok key  is \b
  reduce {q:1 w:2 e:3} (that, it)->
    that[it] = it
    that
  , memo = {}
  deepEqual memo, 1:1 2:2 3:3
test 'Object.some' !->
  {some} = Object
  ok isFunction(some), 'Is function'
  some obj = {q: 1}, (val, key, that)->
    ok val is 1
    ok key is \q
    ok that is obj
    ok @ is ctx
  , ctx = {}
  ok not some {q:1 w:2 e:3} -> typeof! it is \String
  ok some {q:1 w:\2 e:3} -> typeof! it is \String
test 'Object.pluck' !->
  {pluck, plane} = Object
  ok isFunction(pluck), 'Is function'
  deepEqual pluck({q:1 w:22 e:333} \length), plane q:void w:void e:void
  deepEqual pluck({q:1 w:22 e:void} \length), plane q:void w:void e:void
  deepEqual pluck({q:\1 w:\22 e:\333} \length), plane q:1 w:2 e:3
test 'Object.reduceTo' !->
  {reduceTo, plane} = Object
  ok isFunction(reduceTo), 'Is function'
  reduceTo (obj = q: 1), (val, key, that)->
    deepEqual @, plane!
    ok val  is 1
    ok key  is \q
    ok that is obj
  reduceTo {q:1} obj = {} ->
    ok @    is obj
  deepEqual reduceTo({q:1 w:2 e:3} -> @[it] = it), plane {1:1 2:2 3:3}
test 'Object.isObject' !->
  {isObject} = Object
  ok isFunction(isObject), 'Is function'
  ok not isObject void
  ok not isObject null
  ok not isObject 1
  ok not isObject no
  ok not isObject ''
  ok isObject new Number 1
  ok isObject new Boolean no
  ok isObject new String 1
  ok isObject {}
  ok isObject []
  ok isObject /./
  ok isObject new ->
test 'Object.isEqual' !->
  {isEqual} = Object
  ok isFunction(isEqual), 'Is function'
  ok isEqual  1 1
  ok not isEqual 1 2
  ok not isEqual 0 -0
  ok isEqual  {} {}
  ok isEqual  {q: 1} {q: 1}
  ok not isEqual {q: 1} {}
  ok not isEqual {} []
  ok isEqual  {q: 1 w: q: 1} q: 1 w: q: 1
  ok not isEqual {q: 1 w: q: 1} q: 1 w: q: 1, w: 2
  a = {y:1}
  a.x = a
  b = {y:1}
  b.x = b
  ok isEqual a, b
test 'Object.symbol' !->
  {symbol} = Object
  ok isFunction(symbol), 'Is function'
  ok typeof symbol('foo') is 'string', "symbol('foo') return string"
  ok symbol('foo') isnt symbol('foo'), "symbol('foo') !== symbol('foo')"
  ok symbol('foo')slice(0 6) is '@@foo_', "symbol('foo') begin from @@foo_"
  ok symbol('foo')length > 15, "symbol('foo')length > 15"
test 'Object.hidden' !->
  {hidden} = Object
  ok isFunction(hidden), 'Is function'
  o = {}
  ok hidden(o, \key 42) is o, 'return target'
  ok o.key is 42, 'hidden define property'
  if isNative getOwnPropertyDescriptor
    desc = getOwnPropertyDescriptor o, \key
    ok not desc.enumerable, 'hidden define not enumerable property'
    ok desc.writable, 'hidden define writable property'
    ok desc.configurable, 'hidden define configurable property'