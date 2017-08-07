{module, test} = QUnit
module 'core-js'

{Dict, Set, Symbol} = core
{keys, create, assign} = core.Object
{from} = core.Array

test 'Dict' (assert)!->
  assert.isFunction Dict
  dict1 = Dict!
  assert.ok dict1 not instanceof Object
  assert.deepEqual keys(dict1), []
  dict2 = Dict q:1 w:2
  assert.ok dict2 not instanceof Object
  assert.deepEqual keys(dict2), <[q w]>
  assert.ok dict2.q is 1
  assert.ok dict2.w is 2
  dict3 = Dict createIterable [[1 1], [2 2]]
  assert.ok dict3 not instanceof Object
  assert.deepEqual keys(dict3), <[1 2]>
  assert.ok dict3.1 is 1
  assert.ok dict3.2 is 2
  # return #throw
  done = no
  iter = createIterable [null, 1, 2], return: !-> done := on
  try => new Dict iter
  assert.ok done, '.return #throw'

test 'Dict.every' (assert)!->
  {every} = Dict
  assert.isFunction every
  every obj = {q: 1} (val, key, that)!->
    assert.ok val  is 1
    assert.ok key  is \q
    assert.ok that is obj
    assert.ok @    is ctx
  , ctx = {}
  assert.ok every {q:1 w:2 e:3} -> typeof! it is \Number
  assert.ok not every {q:1 w:\2 e:3} -> typeof! it is \Number

test 'Dict.filter' (assert)!->
  {filter} = Dict
  assert.isFunction filter
  filter obj = {q: 1}, (val, key, that)!->
    assert.ok val  is 1
    assert.ok key  is \q
    assert.ok that is obj
    assert.ok @    is ctx
  , ctx = {}
  assert.deepEqual filter({q:1 w:2 e:3} -> it % 2), Dict q: 1 e: 3

test 'Dict.find' (assert)!->
  {find} = Dict
  assert.isFunction find
  find obj = {q: 1}, (val, key, that)!->
    assert.ok val  is 1
    assert.ok key  is \q
    assert.ok that is obj
    assert.ok @    is ctx
  , ctx = {}
  assert.ok find({q:1 w:2 e:3} -> !(it % 2)) is 2

test 'Dict.findKey' (assert)!->
  {findKey} = Dict
  assert.isFunction findKey
  findKey obj = {q: 1}, (val, key, that)!->
    assert.ok val  is 1
    assert.ok key  is \q
    assert.ok that is obj
    assert.ok @    is ctx
  , ctx = {}
  assert.ok findKey({q:1 w:2 e:3} -> it is 2) is \w

test 'Dict.forEach' (assert)!->
  {forEach} = Dict
  assert.isFunction forEach
  forEach obj = {q: 1}, (val, key, that)!->
    assert.ok val  is 1
    assert.ok key  is \q
    assert.ok that is obj
    assert.ok @    is ctx
  , ctx = {}
  rez = {}
  forEach {q: 1 w: 2} (!-> rez[&1] = &0 + @), \_
  assert.deepEqual rez, q: \1_ w: \2_
  rez = on
  forEach obj = {q: 1 w: 2} !-> rez &&= (obj is &2)
  assert.ok rez
  rez = {}
  forEach assign(create({e: 3}), {q: 1 w: 2}), !-> rez[&1] = &0
  assert.ok !(\e of rez)
  rez = {}
  forEach [1 2] !-> rez[&1] = &0
  assert.ok !(\length of rez)
  rez = {}
  forEach \123 !-> rez[&1] = &0
  assert.ok \2 of rez

test 'Dict.keyOf' (assert)!->
  {keyOf} = Dict
  assert.isFunction keyOf
  assert.ok keyOf({q:1 w:2 e:3} 2)     is \w
  assert.ok keyOf({q:1 w:2 e:3} 4)     is void
  assert.ok keyOf({q:1 w:2 e:NaN} NaN) is void

test 'Dict.map' (assert)!->
  {map} = Dict
  assert.isFunction map
  map obj = {q: 1}, (val, key, that)!->
    assert.ok val  is 1
    assert.ok key  is \q
    assert.ok that is obj
    assert.ok @    is ctx
  , ctx = {}
  assert.deepEqual map({q:1 w:2 e:3} (^2)), Dict q:1 w:4 e:9

test 'Dict.mapPairs' (assert)!->
  {mapPairs} = Dict
  assert.isFunction mapPairs
  mapPairs obj = {q: 1}, (val, key, that)!->
    assert.ok val  is 1
    assert.ok key  is \q
    assert.ok that is obj
    assert.ok @    is ctx
  , ctx = {}
  assert.deepEqual mapPairs({q:1 w:2 e:3}, (v, k)-> v != 2 && [k + k, v * v]), Dict qq:1 ee:9

test 'Dict.reduce' (assert)!->
  {reduce} = Dict
  assert.isFunction reduce
  reduce (obj = a:1), (memo, val, key, that)!->
    assert.ok memo is foo
    assert.ok val  is 1
    assert.ok key  is \a
    assert.ok that is obj
  , foo = {}
  reduce {a:1 b:2}, (memo, val, key)!->
    assert.ok memo is 1
    assert.ok val  is 2
    assert.ok key  is \b
  reduce {q:1 w:2 e:3} (that, it)->
    that[it] = it
    that
  , memo = {}
  assert.deepEqual memo, 1:1 2:2 3:3

test 'Dict.some' (assert)!->
  {some} = Dict
  assert.isFunction some
  some obj = {q: 1}, (val, key, that)!->
    assert.ok val is 1
    assert.ok key is \q
    assert.ok that is obj
    assert.ok @ is ctx
  , ctx = {}
  assert.ok not some {q:1 w:2 e:3} -> typeof! it is \String
  assert.ok some {q:1 w:\2 e:3} -> typeof! it is \String

test 'Dict.includes' (assert)!->
  {includes} = Dict
  assert.isFunction includes
  dict = {q:1, w: NaN, e: -0, r: o = {}}
  assert.ok includes dict, 1
  assert.ok includes dict, -0
  assert.ok includes dict, 0
  assert.ok includes dict, NaN
  assert.ok includes dict, o
  assert.ok !includes dict, 4
  assert.ok !includes dict, -0.5
  assert.ok !includes dict, {}

test 'Dict.has' (assert)!->
  {has} = Dict
  assert.isFunction has
  assert.ok has q:1, \q
  assert.ok not has q:1, \w
  assert.ok has [1] 0
  assert.ok not has [] 0
  assert.ok not has ^^{q:1} \q
  assert.ok not has {} \toString

test 'Dict.get' (assert)!->
  {get} = Dict
  assert.isFunction get
  assert.ok get(q:1, \q) is 1
  assert.ok get(q:1, \w) is void
  assert.ok get([1] 0) is 1
  assert.ok get([] 0) is void
  assert.ok get(^^{q:1} \q) is void
  assert.ok get({} \toString) is void

test 'Dict.values' (assert)!->
  {values} = Dict
  assert.isFunction values
  iter = values {}
  assert.ok iter[Symbol?toStringTag] is 'Dict Iterator'
  assert.isIterator iter
  assert.isIterable iter
  assert.deepEqual from(values({q:1, w:2, e:3})), [1 2 3]
  assert.deepEqual from(values(new String \qwe)), <[q w e]>
  assert.deepEqual from(values(assign create({q:1, w:2, e:3}), {a:4, s:5, d:6})), [4 5 6]

test 'Dict.keys' (assert)!->
  {keys} = Dict
  assert.isFunction keys
  iter = keys {}
  assert.ok iter[Symbol?toStringTag] is 'Dict Iterator'
  assert.isIterator iter
  assert.isIterable iter
  assert.deepEqual from(keys({q:1, w:2, e:3})), <[q w e]>
  assert.deepEqual from(keys(new String \qwe)), <[0 1 2]>
  assert.deepEqual from(keys(assign create({q:1, w:2, e:3}), {a:4, s:5, d:6})), <[a s d]>

test 'Dict.entries' (assert)!->
  {entries} = Dict
  assert.isFunction entries
  iter = entries {}
  assert.ok iter[Symbol?toStringTag] is 'Dict Iterator'
  assert.isIterator iter
  assert.isIterable iter
  assert.deepEqual from(entries({q:1, w:2, e:3})),[[\q 1] [\w 2] [\e 3]]
  assert.deepEqual from(entries(new String \qwe)), [[\0 \q] [\1 \w] [\2 \e]]
  assert.deepEqual from(entries(assign create({q:1, w:2, e:3}), {a:4, s:5, d:6})), [[\a 4] [\s 5] [\d 6]]