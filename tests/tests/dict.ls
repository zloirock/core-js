{isFunction} = Function
test 'Dict' !->
  ok isFunction(global.Dict), 'Is function'
  foo = Dict q:1 w:2
  ok Object.getPrototypeOf(foo) is null
  ok foo.toString is void
  ok foo.q is 1
  ok foo.w is 2
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
test 'Dict.findIndex' !->
  {findIndex} = Dict
  ok isFunction(findIndex), 'Is function'
  findIndex obj = {q: 1}, (val, key, that)->
    ok val  is 1
    ok key  is \q
    ok that is obj
    ok @    is ctx
  , ctx = {}
  ok findIndex({q:1 w:2 e:3} -> it is 2) is \w
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
test 'Dict.indexOf' !->
  {indexOf} = Dict
  ok isFunction(indexOf), 'Is function'
  ok indexOf({q:1 w:2 e:3} 2)     is \w
  ok indexOf({q:1 w:2 e:3} 4)     is void
  ok indexOf({q:1 w:2 e:NaN} NaN) is \e
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
test 'Dict.pluck' !->
  {pluck} = Dict
  ok isFunction(pluck), 'Is function'
  deepEqual pluck({q:1 w:22 e:333} \length), Dict q:void w:void e:void
  deepEqual pluck({q:1 w:22 e:void} \length), Dict q:void w:void e:void
  deepEqual pluck({q:\1 w:\22 e:\333} \length), Dict q:1 w:2 e:3
test 'Dict.reduceTo' !->
  {reduceTo} = Dict
  ok isFunction(reduceTo), 'Is function'
  reduceTo (obj = q: 1), (memo, val, key, that)->
    deepEqual memo, Dict!
    ok val  is 1
    ok key  is \q
    ok that is obj
  reduceTo {q:1} obj = {} ->
    ok it   is obj
  deepEqual reduceTo({q:1 w:2 e:3} (memo, it)-> memo[it] = it), Dict {1:1 2:2 3:3}