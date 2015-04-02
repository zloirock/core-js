QUnit.module 'core-js Dict'
isFunction = -> typeof! it is \Function
{Dict, Set, Symbol} = core
{keys, create, assign, make} = core.Object
{from, values} = core.Array
test 'Dict' !->
  ok isFunction(Dict), 'Is function'
  dict1 = Dict!
  ok dict1 not instanceof Object
  deepEqual keys(dict1), []
  dict2 = Dict q:1 w:2
  ok dict2 not instanceof Object
  deepEqual keys(dict2), <[q w]>
  ok dict2.q is 1
  ok dict2.w is 2
  dict3 = Dict new Set([1 2])entries!
  ok dict3 not instanceof Object
  deepEqual keys(dict3), <[1 2]>
  ok dict3.1 is 1
  ok dict3.2 is 2
  # return #throw
  done = no
  iter = values [null, 1, 2]
  iter.return = -> done := on
  try => new Dict iter
  ok done, '.return #throw'
test '.every' !->
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
test '.filter' !->
  {filter} = Dict
  ok isFunction(filter), 'Is function'
  filter obj = {q: 1}, (val, key, that)->
    ok val  is 1
    ok key  is \q
    ok that is obj
    ok @    is ctx
  , ctx = {}
  deepEqual filter({q:1 w:2 e:3} -> it % 2), Dict q: 1 e: 3
test '.find' !->
  {find} = Dict
  ok isFunction(find), 'Is function'
  find obj = {q: 1}, (val, key, that)->
    ok val  is 1
    ok key  is \q
    ok that is obj
    ok @    is ctx
  , ctx = {}
  ok find({q:1 w:2 e:3} -> !(it % 2)) is 2
test '.findKey' !->
  {findKey} = Dict
  ok isFunction(findKey), 'Is function'
  findKey obj = {q: 1}, (val, key, that)->
    ok val  is 1
    ok key  is \q
    ok that is obj
    ok @    is ctx
  , ctx = {}
  ok findKey({q:1 w:2 e:3} -> it is 2) is \w
test '.forEach' !->
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
  forEach make({e: 3} {q: 1 w: 2}), !-> rez[&1] = &0
  ok !(\e of rez)
  rez = {}
  forEach [1 2] !-> rez[&1] = &0
  ok !(\length of rez)
  rez = {}
  forEach \123 !-> rez[&1] = &0
  ok \2 of rez
test '.keyOf' !->
  {keyOf} = Dict
  ok isFunction(keyOf), 'Is function'
  ok keyOf({q:1 w:2 e:3} 2)     is \w
  ok keyOf({q:1 w:2 e:3} 4)     is void
  ok keyOf({q:1 w:2 e:NaN} NaN) is void
test '.map' !->
  {map} = Dict
  ok isFunction(map), 'Is function'
  map obj = {q: 1}, (val, key, that)->
    ok val  is 1
    ok key  is \q
    ok that is obj
    ok @    is ctx
  , ctx = {}
  deepEqual map({q:1 w:2 e:3} (^2)), Dict q:1 w:4 e:9
test '.mapPairs' !->
  {mapPairs} = Dict
  ok isFunction(mapPairs), 'Is function'
  mapPairs obj = {q: 1}, (val, key, that)->
    ok val  is 1
    ok key  is \q
    ok that is obj
    ok @    is ctx
  , ctx = {}
  deepEqual mapPairs({q:1 w:2 e:3}, (v, k)-> v != 2 && [k + k, v * v]), Dict qq:1 ee:9
test '.reduce' !->
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
test '.some' !->
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
test '.turn' !->
  {turn} = Dict
  ok isFunction(turn), 'Is function'
  turn (obj = q: 1), (memo, val, key, that)->
    deepEqual memo, Dict!
    ok val  is 1
    ok key  is \q
    ok that is obj
  turn {q:1} ->
    ok it   is obj
  , obj = {}
  deepEqual turn({q:1 w:2 e:3} (memo, it)-> memo[it] = it), Dict {1:1 2:2 3:3}
test '.includes' !->
  {includes} = Dict
  ok isFunction(includes), 'Is function'
  dict = {q:1, w: NaN, e: -0, r: o = {}}
  ok includes dict, 1
  ok includes dict, -0
  ok includes dict, 0
  ok includes dict, NaN
  ok includes dict, o
  ok !includes dict, 4
  ok !includes dict, -0.5
  ok !includes dict, {}
test '.has' !->
  {has} = Dict
  ok isFunction(has), 'Is function'
  ok has q:1, \q
  ok not has q:1, \w
  ok has [1] 0
  ok not has [] 0
  ok not has ^^{q:1} \q
  ok not has {} \toString
test '.get' !->
  {get} = Dict
  ok isFunction(get), 'Is function'
  ok get(q:1, \q) is 1
  ok get(q:1, \w) is void
  ok get([1] 0) is 1
  ok get([] 0) is void
  ok get(^^{q:1} \q) is void
  ok get({} \toString) is void
test '.values' !->
  {values} = Dict
  ok isFunction(values), 'Is function'
  iter = values {}
  ok iter[Symbol?toStringTag] is 'Dict Iterator'
  ok \next of iter
  deepEqual from(values({q:1, w:2, e:3})), [1 2 3]
  deepEqual from(values(new String \qwe)), <[q w e]>
  deepEqual from(values(assign create({q:1, w:2, e:3}), {a:4, s:5, d:6})), [4 5 6]
test '.keys' !->
  {keys} = Dict
  ok isFunction(keys), 'Is function'
  iter = keys {}
  ok iter[Symbol?toStringTag] is 'Dict Iterator'
  ok \next of iter
  deepEqual from(keys({q:1, w:2, e:3})), <[q w e]>
  deepEqual from(keys(new String \qwe)), <[0 1 2]>
  deepEqual from(keys(assign create({q:1, w:2, e:3}), {a:4, s:5, d:6})), <[a s d]>
test '.entries' !->
  {entries} = Dict
  ok isFunction(entries), 'Is function'
  iter = entries {}
  ok iter[Symbol?toStringTag] is 'Dict Iterator'
  ok \next of iter
  deepEqual from(entries({q:1, w:2, e:3})),[[\q 1] [\w 2] [\e 3]]
  deepEqual from(entries(new String \qwe)), [[\0 \q] [\1 \w] [\2 \e]]
  deepEqual from(entries(assign create({q:1, w:2, e:3}), {a:4, s:5, d:6})), [[\a 4] [\s 5] [\d 6]]