{module, test} = QUnit
module \core-js

isFunction = -> typeof! it is \Function
{keys, create, assign} = Object
{from} = Array
global = @

test 'Dict' (assert)->
  assert.ok isFunction(global.Dict), 'Is function'
  assert.strictEqual Dict.length, 1, 'length is 1'
  assert.strictEqual Dict.name, \Dict, 'name is "Dict"'
  assert.ok /native code/.test(Dict), 'looks like native'
  dict1 = Dict!
  assert.ok dict1 not instanceof Object
  assert.deepEqual keys(dict1), []
  dict2 = Dict q:1 w:2
  assert.ok dict2 not instanceof Object
  assert.deepEqual keys(dict2), <[q w]>
  assert.ok dict2.q is 1
  assert.ok dict2.w is 2
  dict3 = Dict new Set([1 2])entries!
  assert.ok dict3 not instanceof Object
  assert.deepEqual keys(dict3), <[1 2]>
  assert.ok dict3.1 is 1
  assert.ok dict3.2 is 2
  # return #throw
  done = no
  iter = [null, 1, 2]values!
  iter.return = -> done := on
  try => new Dict iter
  assert.ok done, '.return #throw'

test 'Dict.every' (assert)->
  {every} = Dict
  assert.ok isFunction(every), 'Is function'
  every obj = {q: 1} (val, key, that)->
    assert.ok val  is 1
    assert.ok key  is \q
    assert.ok that is obj
    assert.ok @    is ctx
  , ctx = {}
  assert.ok every {q:1 w:2 e:3} -> typeof! it is \Number
  assert.ok not every {q:1 w:\2 e:3} -> typeof! it is \Number

test 'Dict.filter' (assert)->
  {filter} = Dict
  assert.ok isFunction(filter), 'Is function'
  filter obj = {q: 1}, (val, key, that)->
    assert.ok val  is 1
    assert.ok key  is \q
    assert.ok that is obj
    assert.ok @    is ctx
  , ctx = {}
  assert.deepEqual filter({q:1 w:2 e:3} -> it % 2), Dict q: 1 e: 3

test 'Dict.find' (assert)->
  {find} = Dict
  assert.ok isFunction(find), 'Is function'
  find obj = {q: 1}, (val, key, that)->
    assert.ok val  is 1
    assert.ok key  is \q
    assert.ok that is obj
    assert.ok @    is ctx
  , ctx = {}
  assert.ok find({q:1 w:2 e:3} -> !(it % 2)) is 2

test 'Dict.findKey' (assert)->
  {findKey} = Dict
  assert.ok isFunction(findKey), 'Is function'
  findKey obj = {q: 1}, (val, key, that)->
    assert.ok val  is 1
    assert.ok key  is \q
    assert.ok that is obj
    assert.ok @    is ctx
  , ctx = {}
  assert.ok findKey({q:1 w:2 e:3} -> it is 2) is \w

test 'Dict.forEach' (assert)->
  {forEach} = Dict
  assert.ok isFunction(forEach), 'Is function'
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
  forEach Object.make({e: 3} {q: 1 w: 2}), !-> rez[&1] = &0
  assert.ok !(\e of rez)
  rez = {}
  forEach [1 2] !-> rez[&1] = &0
  assert.ok !(\length of rez)
  rez = {}
  forEach \123 !-> rez[&1] = &0
  assert.ok \2 of rez

test 'Dict.keyOf' (assert)->
  {keyOf} = Dict
  assert.ok isFunction(keyOf), 'Is function'
  assert.ok keyOf({q:1 w:2 e:3} 2)     is \w
  assert.ok keyOf({q:1 w:2 e:3} 4)     is void
  assert.ok keyOf({q:1 w:2 e:NaN} NaN) is void

test 'Dict.map' (assert)->
  {map} = Dict
  assert.ok isFunction(map), 'Is function'
  map obj = {q: 1}, (val, key, that)->
    assert.ok val  is 1
    assert.ok key  is \q
    assert.ok that is obj
    assert.ok @    is ctx
  , ctx = {}
  assert.deepEqual map({q:1 w:2 e:3} (^2)), Dict q:1 w:4 e:9

test 'Dict.mapPairs' (assert)->
  {mapPairs} = Dict
  assert.ok isFunction(mapPairs), 'Is function'
  mapPairs obj = {q: 1}, (val, key, that)->
    assert.ok val  is 1
    assert.ok key  is \q
    assert.ok that is obj
    assert.ok @    is ctx
  , ctx = {}
  assert.deepEqual mapPairs({q:1 w:2 e:3}, (v, k)-> v != 2 && [k + k, v * v]), Dict qq:1 ee:9

test 'Dict.reduce' (assert)->
  {reduce} = Dict
  assert.ok isFunction(reduce), 'Is function'
  reduce (obj = a:1), (memo, val, key, that)->
    assert.ok memo is foo
    assert.ok val  is 1
    assert.ok key  is \a
    assert.ok that is obj
  , foo = {}
  reduce {a:1 b:2}, (memo, val, key)->
    assert.ok memo is 1
    assert.ok val  is 2
    assert.ok key  is \b
  reduce {q:1 w:2 e:3} (that, it)->
    that[it] = it
    that
  , memo = {}
  assert.deepEqual memo, 1:1 2:2 3:3

test 'Dict.some' (assert)->
  {some} = Dict
  assert.ok isFunction(some), 'Is function'
  some obj = {q: 1}, (val, key, that)->
    assert.ok val is 1
    assert.ok key is \q
    assert.ok that is obj
    assert.ok @ is ctx
  , ctx = {}
  assert.ok not some {q:1 w:2 e:3} -> typeof! it is \String
  assert.ok some {q:1 w:\2 e:3} -> typeof! it is \String

test 'Dict.includes' (assert)->
  {includes} = Dict
  assert.ok isFunction(includes), 'Is function'
  dict = {q:1, w: NaN, e: -0, r: o = {}}
  assert.ok includes dict, 1
  assert.ok includes dict, -0
  assert.ok includes dict, 0
  assert.ok includes dict, NaN
  assert.ok includes dict, o
  assert.ok !includes dict, 4
  assert.ok !includes dict, -0.5
  assert.ok !includes dict, {}

test 'Dict.has' (assert)->
  {has} = Dict
  assert.ok isFunction(has), 'Is function'
  assert.ok has q:1, \q
  assert.ok not has q:1, \w
  assert.ok has [1] 0
  assert.ok not has [] 0
  assert.ok not has ^^{q:1} \q
  assert.ok not has {} \toString

test 'Dict.get' (assert)->
  {get} = Dict
  assert.ok isFunction(get), 'Is function'
  assert.ok get(q:1, \q) is 1
  assert.ok get(q:1, \w) is void
  assert.ok get([1] 0) is 1
  assert.ok get([] 0) is void
  assert.ok get(^^{q:1} \q) is void
  assert.ok get({} \toString) is void

test 'Dict.values' (assert)->
  {values} = Dict
  assert.ok isFunction(values), 'Is function'
  iter = values {}
  assert.ok iter[Symbol?toStringTag] is 'Dict Iterator'
  assert.ok \next of iter
  assert.deepEqual from(values({q:1, w:2, e:3})), [1 2 3]
  assert.deepEqual from(values(new String \qwe)), <[q w e]>
  assert.deepEqual from(values(assign create({q:1, w:2, e:3}), {a:4, s:5, d:6})), [4 5 6]

test 'Dict.keys' (assert)->
  {keys} = Dict
  assert.ok isFunction(keys), 'Is function'
  iter = keys {}
  assert.ok iter[Symbol?toStringTag] is 'Dict Iterator'
  assert.ok \next of iter
  assert.deepEqual from(keys({q:1, w:2, e:3})), <[q w e]>
  assert.deepEqual from(keys(new String \qwe)), <[0 1 2]>
  assert.deepEqual from(keys(assign create({q:1, w:2, e:3}), {a:4, s:5, d:6})), <[a s d]>

test 'Dict.entries' (assert)->
  {entries} = Dict
  assert.ok isFunction(entries), 'Is function'
  iter = entries {}
  assert.ok iter[Symbol?toStringTag] is 'Dict Iterator'
  assert.ok \next of iter
  assert.deepEqual from(entries({q:1, w:2, e:3})),[[\q 1] [\w 2] [\e 3]]
  assert.deepEqual from(entries(new String \qwe)), [[\0 \q] [\1 \w] [\2 \e]]
  assert.deepEqual from(entries(assign create({q:1, w:2, e:3}), {a:4, s:5, d:6})), [[\a 4] [\s 5] [\d 6]]