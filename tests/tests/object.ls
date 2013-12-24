{isFunction} = Object
test 'Object.has' ->
  {has} = Object
  ok isFunction has
  ok has q:1, \q
  ok !has q:1, \w
  ok has [1] 0
  ok !has [] 0
  ok !has ^^{q:1} \q
  ok !has {} \toString
test 'Object.isEnumerable' ->
  {isEnumerable} = Object
  ok isFunction isEnumerable
  ok isEnumerable q:1, \q
  ok !isEnumerable {} \toString
  ok !isEnumerable ^^{q:1}, \q
test 'Object.isPrototype' ->
  {isPrototype} = Object
  ok isFunction isPrototype
  ok isPrototype Object::, {}
  ok isPrototype Object::, []
  ok !isPrototype Array::, {}
  ok isPrototype Array::, []
  ok !isPrototype Function::, []
  ok isPrototype proto = {}, ^^proto
  ok !isPrototype {}, ^^->
test 'Object.classof' ->
  {classof} = Object
  ok isFunction classof
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
test 'Object.getPropertyDescriptor' ->
  {getPropertyDescriptor, create} = Object
  ok isFunction getPropertyDescriptor
  deepEqual getPropertyDescriptor(create(q: 1), \q), {+enumerable, +configurable, +writable, value: 1}
test 'Object.getOwnPropertyDescriptors' ->
  {getOwnPropertyDescriptors, make} = Object
  ok isFunction getOwnPropertyDescriptors
  descs = getOwnPropertyDescriptors(make({q: 1}, w:2), \q)
  ok descs.q is void
  deepEqual descs.w, {+enumerable, +configurable, +writable, value: 2}
test 'Object.getPropertyDescriptors' ->
  {getPropertyDescriptors, make} = Object
  ok isFunction getPropertyDescriptors
  descs = getPropertyDescriptors(make({q: 1}, w:2), \q)
  deepEqual descs.q, {+enumerable, +configurable, +writable, value: 1}
  deepEqual descs.w, {+enumerable, +configurable, +writable, value: 2}
test 'Object.getPropertyNames' ->
  {getPropertyNames} = Object
  ok isFunction getPropertyNames
  names = getPropertyNames {q:1}
  ok \q in names
  ok \toString in names
  ok !(\w in names)
test 'Object.make' ->
  {make, getPrototypeOf} = Object
  ok isFunction make
  object = make foo = {q:1}, {w:2}
  ok getPrototypeOf(object) is foo
  ok object.w is 2
test 'Object.plane' ->
  {plane, getPrototypeOf} = Object
  ok isFunction plane
  foo = plane q:1 w:2
  ok getPrototypeOf(foo) is null
  ok foo.q is 1
  ok foo.w is 2
do ->
  # Object.clone
  {clone, create, getPrototypeOf, defineProperty, getOwnPropertyDescriptor} = Object
  test 'Object.clone(primitive)' ->
    equal clone(null), null
    equal clone(void), void
    equal clone(\qwe), \qwe
    equal clone(123), 123
    ok !clone no
  test 'Object.clone(Object(String|Number|Boolean))' ->
    i1 = new String \qwe
    i2 = clone i1
    ok i1 != i2
    equal i1.valueOf!, i2.valueOf!
    i1 = new Number 123
    i2 = clone i1
    ok i1 != i2
    equal i1.valueOf!, i2.valueOf!
    i1 = new Boolean no
    i2 = clone i1
    ok i1 != i2
    equal i2.valueOf!, no
  test 'Object.clone(Date)' ->
    i1=new Date 1350861246986
    i2=clone i1
    ok i1 != i2
    equal i2.getTime!, 1350861246986
  test 'Object.clone(RegExp)' ->
    i1 = /q/i
    i2 = clone i1
    ok i1 != i2
    equal i2.toString!, '/q/i'
    ok i2.test \Q
  #test 'Object.clone(Set)' ->
  #  set = new Set [1 2 3 2 1]
  #  copy = clone set
  #  ok copy instanceof Set
  #  ok copy.size is 3
  #  rez = {}
  #  copy.forEach (val, key)-> rez[key] = val
  #  deepEqual rez, {1: 1 2: 2 3: 3}
  test 'simple Object.clone(Array)' ->
    i1 = [1 2 3]
    i2 = clone i1
    ok i1 != i2
    equal i2[2], 3
    equal i2.length, 3
    equal i2.constructor, Array
  test 'simple Object.clone(Object)' ->
    i1 = q: 123, w: \qwe
    i2 = clone i1
    ok i1 != i2
    equal i2.q, 123
    equal i2.w, \qwe
    i1 = q: {}
    i2 = clone i1
    ok i1.q == i2.q
  test 'deep Object.clone(Object)' ->
    i1 = q: q: 1
    i2 = clone i1, 1
    ok i1.q != i2.q
    ok i1.q.q == i2.q.q
  test 'deep Object.clone(Array)' ->
    i1 = [/^qwe$/]
    i2 = clone i1, 1
    ok i1\0 != i2\0
    ok i2[0]test \qwe
    ok !i2[0]test \qwer
  test 'deep Object.clone(instance)' ->
    fn = -> @q = 1
    i1 = new fn
    i2 = clone i1
    ok i1 != i2
    equal i2.q, 1
    equal getPrototypeOf(i1), getPrototypeOf i2
    i1 = create q: 1
    i2 = clone i1
    ok i1 != i2
    equal i2.q, 1
    equal getPrototypeOf(i1), getPrototypeOf i2
  if Function.isNative Object.getOwnPropertyDescriptor
    test 'deep Object.clone without descriptors' ->
      i1 = q: defineProperty {} \q {get: (->42), +enumerable}
      i2 = clone i1, 1 0
      ok i1.q != i2.q
      ok i2.q.q == 42
      equal typeof getOwnPropertyDescriptor(i2.q, \q)get, \undefined
    test 'deep Object.clone with descriptors' ->
      i1 = q: defineProperty {} \q {get: (->52)}
      i2 = clone i1, 1 1
      ok i1.q != i2.q
      equal i2.q.q, 52
      equal typeof getOwnPropertyDescriptor(i2.q, \q)get, \function
do ->
  # Object.merge
  {merge} = Object
  class fn
    w: {q: 1, w: 2}
    q: 1
    e: 2
  obj = w: {q: 2, e: 5}, r: 1, e: 1
  test 'Object.merge' ->
    ok isFunction merge
  test 'simple Object.merge' ->
    i1 = new fn
    i2 = merge i1, obj
    ok i1 == i2
    ok i1.q == 1
    ok i1.r == 1
    ok i1.w == obj.w
    ok i1.e == 1
  test 'deep Object.merge' ->
    i1 = merge new fn, obj, 1
    ok i1.q == 1
    ok i1.r == 1
    ok i1.w != obj.w
    ok i1.w.q == 2
    ok i1.w.w == 2
  test 'reverse Object.merge' ->
    i1 = merge {w: {q: 1, w: 2}, q: 1, e: 2}, obj, 0, 1
    ok i1.q == 1
    ok i1.r == 1
    ok i1.e == 2
    ok i1.w.q == 1
    ok i1.w.w == 2
    ok i1.w.e != 5
  test 'reverse deep Object.merge' ->
    i1 = merge {w: {q: 1, w: 2}, q: 1, e: 2}, obj, 1, 1
    ok i1.q == 1
    ok i1.r == 1
    ok i1.e == 2
    ok i1.w.q == 1
    ok i1.w.w == 2
    ok i1.w.e == 5
test 'Object.defaults' ->
  {defaults} = Object
  ok isFunction defaults
  obj = defaults {q: 1 w: q: 1} q: 2, w: {w: 2} e: 3
  equal obj.q, 1
  equal obj.w.q, 1
  equal obj.w.w, 2
  equal obj.e, 3
test 'Object.values' ->
  {values} = Object
  ok isFunction values
  ok values(q: 1 w: 2 e: 3)length is 3
  ok ~values(q: 1 w: 2 e: 3)indexOf 3
test 'Object.invert' ->
  {invert} = Object
  ok isFunction invert
  deepEqual invert(q:\a w:\s e:\d), a:\q s:\w d:\e  
test 'Object.every' ->
  {every, isNumber} = Object
  ok isFunction every
  every obj = {q: 1}, ((val, key, that)->
    ok val is 1
    ok key is \q
    ok that is obj
    ok @ is ctx
  ), ctx = {}
  ok every({q:1 w:2 e:3} isNumber)
  ok !every({q:1 w:\2 e:3} isNumber)
test 'Object.filter' ->
  {filter} = Object
  ok isFunction filter
  filter obj = {q: 1}, ((val, key, that)->
    ok val is 1
    ok key is \q
    ok that is obj
    ok @ is ctx
  ), ctx = {}
  deepEqual filter({q:1 w:2 e:3} -> it.odd!), q:1 e:3
test 'Object.find' ->
  {find} = Object
  ok isFunction find
  find obj = {q: 1}, ((val, key, that)->
    ok val is 1
    ok key is \q
    ok that is obj
    ok @ is ctx
  ), ctx = {}
  ok find({q:1 w:2 e:3} -> it.even!) is 2
test 'Object.findIndex' ->
  {findIndex} = Object
  ok isFunction findIndex
  findIndex obj = {q: 1}, ((val, key, that)->
    ok val is 1
    ok key is \q
    ok that is obj
    ok @ is ctx
  ), ctx = {}
  ok findIndex({q:1 w:2 e:3} -> it is 2) is \w
test 'Object.forEach' ->
  {forEach, make} = Object
  ok isFunction forEach
  forEach obj = {q: 1}, ((val, key, that)->
    ok val is 1
    ok key is \q
    ok that is obj
    ok @ is ctx
  ), ctx = {}
  rez = {}
  forEach {q: 1 w: 2} (-> rez[&1] = &0 + @), \_
  deepEqual rez, q: \1_ w: \2_
  rez = on
  forEach obj = {q: 1 w: 2} -> rez &&= (obj == &2)
  ok rez
  rez = {}
  forEach make({e: 3} {q: 1 w: 2}), -> rez[&1] = &0
  ok !(\e of rez)
  rez = {}
  forEach [1 2] -> rez[&1] = &0
  ok !(\length of rez)
  rez = {}
  forEach \123 -> rez[&1] = &0
  ok \2 of rez
test 'Object.indexOf' ->
  {indexOf} = Object
  ok isFunction indexOf
  ok indexOf({q:1 w:2 e:3} 2) is \w
  ok indexOf({q:1 w:2 e:3} 4) is void
  ok indexOf({q:1 w:2 e:NaN} NaN) is \e
test 'Object.map' ->
  {map} = Object
  ok isFunction map
  map obj = {q: 1}, ((val, key, that)->
    ok val is 1
    ok key is \q
    ok that is obj
    ok @ is ctx
  ), ctx = {}
  deepEqual map({q:1 w:2 e:3} (^2)), q:1 w:4 e:9
test 'Object.reduce' ->
  {reduce} = Object
  ok isFunction reduce
  reduce (obj = a:1), ((memo, val, key, that)->
    ok memo is foo
    ok val is 1
    ok key is \a
    ok that is obj
  ), foo = {}
  reduce (a:1 b:2), ((memo, val, key)->
    ok memo is 1
    ok val is 2
    ok key is \b
  )
  reduce {q:1 w:2 e:3} ((that, it)->
    that[it] = it
    that
  ), memo = {}
  deepEqual memo, {1:1 2:2 3:3}
test 'Object.some' ->
  {some, isString} = Object
  ok isFunction some
  some obj = {q: 1}, ((val, key, that)->
    ok val is 1
    ok key is \q
    ok that is obj
    ok @ is ctx
  ), ctx = {}
  ok !some({q:1 w:2 e:3} isString)
  ok some({q:1 w:\2 e:3} isString)
test 'Object.props' ->
  {props} = Object
  ok isFunction props
  deepEqual props({q:1 w:22 e:333} \length), {q:void w:void e:void}
  deepEqual props({q:1 w:22 e:void} \length), {q:void w:void e:void}
  deepEqual props({q:\1 w:\22 e:\333} \length), {q:1 w:2 e:3}
test 'Object.reduceTo' ->
  {reduceTo} = Object
  ok isFunction reduceTo
  reduceTo (obj = q: 1), (val, key, that)->
    deepEqual {} @
    ok val is 1
    ok key is \q
    ok that is obj
  reduceTo {q:1} (->
    ok @ is obj
  ), obj = {}
  deepEqual {1:1 2:2 3:3} reduceTo {q:1 w:2 e:3} -> @[it] = it
test 'Object.deepEqual' ->
  {deepEqual} = Object
  ok isFunction deepEqual
  ok deepEqual  1 1
  ok !deepEqual 1 2
  ok !deepEqual 0 -0
  ok deepEqual  {} {}
  ok deepEqual  {q: 1} {q: 1}
  ok !deepEqual {q: 1} {}
  ok !deepEqual {} []
  ok deepEqual  {q: 1 w: q: 1} q: 1 w: q: 1
  ok !deepEqual {q: 1 w: q: 1} q: 1 w: q: 1, w: 2
  a = {y:1}
  a.x = a
  b = {y:1}
  b.x = b
  ok deepEqual a, b
test 'Object.isObject' ->
  {isObject} = Object
  ok isFunction isObject
  ok !isObject void
  ok !isObject null
  ok !isObject 1
  ok isObject new Number 1
  ok !isObject ''
  ok isObject new String 1
  ok !isObject no
  ok isObject new Boolean no
  ok isObject {}
  ok isObject []
  ok isObject /./
  ok isObject new ->
test 'Object.isUndefined' ->
  {isUndefined} = Object
  ok isFunction isUndefined
  ok isUndefined void
  ok !isUndefined null
  ok !isUndefined 1
  ok !isUndefined ''
  ok !isUndefined no
  ok !isUndefined {}
test 'Object.isNull' ->
  {isNull} = Object
  ok isFunction isNull
  ok !isNull void
  ok isNull null
  ok !isNull 1
  ok !isNull ''
  ok !isNull no
  ok !isNull {}
test 'Object.isNumber' ->
  {isNumber} = Object
  ok isFunction isNumber
  ok !isNumber void
  ok !isNumber null
  ok isNumber 1
  ok isNumber new Number 1
  ok !isNumber ''
  ok !isNumber no
  ok !isNumber {}
test 'Object.isString' ->
  {isString} = Object
  ok isFunction isString
  ok !isString void
  ok !isString null
  ok !isString 1
  ok isString ''
  ok isString new String ''
  ok !isString no
  ok !isString {}
test 'Object.isBoolean' ->
  {isBoolean} = Object
  ok isFunction isBoolean
  ok !isBoolean void
  ok !isBoolean null
  ok !isBoolean 1
  ok !isBoolean ''
  ok isBoolean no
  ok isBoolean new Boolean no
  ok !isBoolean {}
test 'Object.isArray' ->
  {isArray} = Object
  ok isFunction isArray
  ok !isArray void
  ok !isArray null
  ok !isArray 1
  ok !isArray ''
  ok !isArray no
  ok !isArray {}
  ok !isArray do -> &
  ok isArray [1]
test 'Object.isFunction' ->
  {isFunction} = Object
  ok typeof isFunction is \function
  ok !isFunction void
  ok !isFunction null
  ok !isFunction 1
  ok !isFunction ''
  ok !isFunction no
  ok !isFunction {}
  ok !isFunction do->&
  ok !isFunction [1]
  ok !isFunction /./
  ok isFunction ->
test 'Object.isRegExp' ->
  {isRegExp} = Object
  ok isFunction isRegExp
  ok !isRegExp void
  ok !isRegExp null
  ok !isRegExp 1
  ok !isRegExp ''
  ok !isRegExp no
  ok !isRegExp {}
  ok !isRegExp do -> &
  ok !isRegExp [1]
  ok isRegExp /./
  ok !isRegExp ->
test 'Object.isDate' ->
  {isDate} = Object
  ok isFunction isDate
  ok !isDate void
  ok !isDate null
  ok !isDate 1
  ok !isDate ''
  ok !isDate no
  ok !isDate {}
  ok !isDate do -> &
  ok !isDate [1]
  ok !isDate /./
  ok !isDate -> 
  ok isDate new Date
test 'Object.isError' ->
  {isError} = Object
  ok isFunction isError
  ok !isError void
  ok !isError null
  ok !isError 1
  ok !isError ''
  ok !isError no
  ok !isError {}
  ok !isError do -> &
  ok !isError [1]
  ok !isError /./
  ok !isError ->
  ok isError Error!
  ok isError TypeError!
test 'Object.isArguments' ->
  {isArguments} = Object
  ok isFunction isArguments
  ok !isArguments void 
  ok !isArguments null
  ok !isArguments 1
  ok !isArguments ''
  ok !isArguments no
  ok !isArguments {}
  ok isArguments do -> &
  ok !isArguments [1]
  ok !isArguments /./
  ok !isArguments ->