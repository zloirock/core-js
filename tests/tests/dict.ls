isFunction = -> typeof! it is \Function
{keys} = Object
test 'Dict' !->
  ok isFunction(global.Dict), 'Is function'
  dict1 = Dict!
  ok Object.getPrototypeOf(dict1) is null
  deepEqual keys(dict1), []
  dict2 = Dict q:1 w:2
  ok Object.getPrototypeOf(dict2) is null
  deepEqual keys(dict2), [\q, \w]
  ok dict2.q is 1
  ok dict2.w is 2
  dict3 = Dict new Set([1 2])entries!
  ok Object.getPrototypeOf(dict3) is null
  deepEqual keys(dict3), [\1, \2]
  ok dict3.1 is 1
  ok dict3.2 is 2
test 'Dict.keys' !->
  ok typeof Dict.keys is \function, 'Is function'
  iter = Dict.keys {a: \q, s: \w, d: \e}
  ok typeof iter is \object, 'Iterator is object'
  ok typeof iter.next is \function, 'Iterator has .next method'
  deepEqual iter.next!, {value: \a, done: no}
  deepEqual iter.next!, {value: \s, done: no}
  deepEqual iter.next!, {value: \d, done: no}
  deepEqual iter.next!, {value: void, done: on}
  ok iter[Symbol.toStringTag] is 'Object Iterator'
test 'Dict.values' !->
  ok typeof Dict.values is \function, 'Is function'
  iter = Dict.values {a: \q, s: \w, d: \e}
  ok typeof iter is \object, 'Iterator is object'
  ok typeof iter.next is \function, 'Iterator has .next method'
  deepEqual iter.next!, {value: \q, done: no}
  deepEqual iter.next!, {value: \w, done: no}
  deepEqual iter.next!, {value: \e, done: no}
  deepEqual iter.next!, {value: void, done: on}
  ok iter[Symbol.toStringTag] is 'Object Iterator'
test 'Dict.entries' !->
  ok typeof Dict.entries is \function, 'Is function'
  iter = Dict.entries {a: \q, s: \w, d: \e}
  ok typeof iter is \object, 'Iterator is object'
  ok typeof iter.next is \function, 'Iterator has .next method'
  deepEqual iter.next!, {value: [\a \q], done: no}
  deepEqual iter.next!, {value: [\s \w], done: no}
  deepEqual iter.next!, {value: [\d \e], done: no}
  deepEqual iter.next!, {value: void, done: on}
  ok iter[Symbol.toStringTag] is 'Object Iterator'
test 'Dict.every' !->
  {every} = Dict
  ok isFunction(every), 'Is function'
  every obj = {q: 1} (val, key, that)->
    ok val  is 1
    ok key  is \q
    ok that is obj
    ok @    is ctx
  , ctx = {}
  ok every {q:1 w:2 e:3} -> typeof! it is \Number
  ok not every {q:1 w:\2 e:3} -> typeof! it is \Number
test 'Dict.filter' !->
  {filter} = Dict
  ok isFunction(filter), 'Is function'
  filter obj = {q: 1}, (val, key, that)->
    ok val  is 1
    ok key  is \q
    ok that is obj
    ok @    is ctx
  , ctx = {}
  deepEqual filter({q:1 w:2 e:3} -> it % 2), Dict q:1 e:3
test 'Dict.find' !->
  {find} = Dict
  ok isFunction(find), 'Is function'
  find obj = {q: 1}, (val, key, that)->
    ok val  is 1
    ok key  is \q
    ok that is obj
    ok @    is ctx
  , ctx = {}
  ok find({q:1 w:2 e:3} -> !(it % 2)) is 2
test 'Dict.findKey' !->
  {findKey} = Dict
  ok isFunction(findKey), 'Is function'
  findKey obj = {q: 1}, (val, key, that)->
    ok val  is 1
    ok key  is \q
    ok that is obj
    ok @    is ctx
  , ctx = {}
  ok findKey({q:1 w:2 e:3} -> it is 2) is \w
test 'Dict.forEach' !->
  {forEach} = Dict
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
  forEach Object.make({e: 3} {q: 1 w: 2}), !-> rez[&1] = &0
  ok !(\e of rez)
  rez = {}
  forEach [1 2] !-> rez[&1] = &0
  ok !(\length of rez)
  rez = {}
  forEach \123 !-> rez[&1] = &0
  ok \2 of rez
test 'Dict.keyOf' !->
  {keyOf} = Dict
  ok isFunction(keyOf), 'Is function'
  ok keyOf({q:1 w:2 e:3} 2)     is \w
  ok keyOf({q:1 w:2 e:3} 4)     is void
  ok keyOf({q:1 w:2 e:NaN} NaN) is \e
test 'Dict.map' !->
  {map} = Dict
  ok isFunction(map), 'Is function'
  map obj = {q: 1}, (val, key, that)->
    ok val  is 1
    ok key  is \q
    ok that is obj
    ok @    is ctx
  , ctx = {}
  deepEqual map({q:1 w:2 e:3} (^2)), Dict q:1 w:4 e:9
test 'Dict.reduce' !->
  {reduce} = Dict
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
test 'Dict.some' !->
  {some} = Dict
  ok isFunction(some), 'Is function'
  some obj = {q: 1}, (val, key, that)->
    ok val is 1
    ok key is \q
    ok that is obj
    ok @ is ctx
  , ctx = {}
  ok not some {q:1 w:2 e:3} -> typeof! it is \String
  ok some {q:1 w:\2 e:3} -> typeof! it is \String
test 'Dict.transform' !->
  {transform} = Dict
  ok isFunction(transform), 'Is function'
  transform (obj = q: 1), (memo, val, key, that)->
    deepEqual memo, Dict!
    ok val  is 1
    ok key  is \q
    ok that is obj
  transform {q:1} ->
    ok it   is obj
  , obj = {}
  deepEqual transform({q:1 w:2 e:3} (memo, it)-> memo[it] = it), Dict {1:1 2:2 3:3}
test 'Dict.contains' !->
  {contains} = Dict
  ok isFunction(contains), 'Is function'
  dict = {q:1, w: NaN, e: -0, r: o = {}}
  ok contains dict, 1
  ok contains dict, -0
  ok contains dict, 0
  ok contains dict, NaN
  ok contains dict, o
  ok !contains dict, 4
  ok !contains dict, -0.5
  ok !contains dict, {}
test 'Dict.has' !->
  {has} = Dict
  ok isFunction(has), 'Is function'
  ok has q:1, \q
  ok not has q:1, \w
  ok has [1] 0
  ok not has [] 0
  ok not has ^^{q:1} \q
  ok not has {} \toString
test 'Dict.get' !->
  {get} = Dict
  ok isFunction(get), 'Is function'
  ok get(q:1, \q) is 1
  ok get(q:1, \w) is void
  ok get([1] 0) is 1
  ok get([] 0) is void
  ok get(^^{q:1} \q) is void
  ok get({} \toString) is void