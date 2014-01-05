{isFunction} = Object
test 'Map' !->
  ok isFunction global.Map
  ok \clear   of Map::
  ok \delete  of Map::
  ok \forEach of Map::
  ok \get     of Map::
  ok \has     of Map::
  ok \set     of Map::
  ok new Map instanceof Map
  ok Map! instanceof Map
  ok new Map([[1 2] [2 3] [1 4]])size is 2
  ok new Map([[1 2] [2 3] [1 4]])size is 2
  ok new Map([[NaN, 2] [NaN, 3] [NaN, 4]])size is 1
  #ok new Map(new Set([[1 2] [2 3] [1 4]]))size is 2
  #ok new Map(new Map([[1 2] [2 3] [1 4]]))size is 2
test 'Map::clear' !->
  ok isFunction Map::clear
  M = new Map([[1 2] [2 3] [1 4]])
  M.clear!
  ok M.size is 0
test 'Map::delete' !->
  ok isFunction Map::delete
  a = []
  M = new Map [[NaN, 1] [2 1] [3 1] [2 5] [1 4] [a, {}]]
  ok M.size is 5
  M.delete NaN
  ok M.size is 4
  M.delete 4
  ok M.size is 4
  M.delete []
  ok M.size is 4
  M.delete a
  ok M.size is 3
test 'Map::forEach' !->
  ok isFunction Map::forEach
  r = {}
  var T
  count = 0
  M = new Map [[NaN, 1] [2 1] [3 7] [2 5] [1 4] [{}, 9]]
  M.forEach (value, key, ctx)!->
    T := ctx
    count := count + 1
    r[value] = key
  ok T is M
  ok count is 5
  deepEqual r, {1: NaN, 7: 3, 5: 2, 4: 1, 9: {}}
test 'Map::get' !->
  ok isFunction Map::get
  o = {}
  M = new Map [[NaN, 1] [2 1] [3 1] [2 5] [1 4] [o, o]]
  ok M.get(NaN) is 1
  ok M.get(4)   is void
  ok M.get({})  is void
  ok M.get(o)   is o
  ok M.get(2)   is 5
test 'Map::has' !->
  ok isFunction Map::has
  o = {}
  M = new Map [[NaN, 1] [2 1] [3 1] [2 5] [1 4] [o, o]]
  ok M.has NaN
  ok M.has o
  ok M.has 2
  ok not M.has 4
  ok not M.has {}
test 'Map::set' !->
  ok isFunction Map::set
  o = {}
  M = new Map [[NaN, 1] [2 1] [3 1] [2 5] [1 4] [o, o]]
  ok M.size is 5
  M.set 7 2
  ok M.size is 6
  ok M.get(7) is 2
  ok M.get(NaN) is 1
  M.set NaN, 42
  ok M.size is 6
  ok M.get(NaN) is 42
  M.set {}, 11
  ok M.size is 7
  ok M.get(o) is o
  M.set o, 27
  ok M.size is 7
  ok M.get(o) is 27
test 'Set' !->
  ok isFunction global.Set
  ok \add     of Set::
  ok \clear   of Set::
  ok \delete  of Set::
  ok \forEach of Set::
  ok \has     of Set::
  ok new Set instanceof Set
  ok Set! instanceof Set
  ok new Set([1 2 3 2 1])size is 3
  S = new Set [1 2 3 2 1]
  ok S.size is 3
  r = {}
  S.forEach (v, k)-> r[k] = v
  deepEqual r, {1:1,2:2,3:3}
  ok new Set([NaN, NaN, NaN])size is 1
  #S = new Set new Set [1 2 3 2 1]
  #ok S.size is 3
  #r = {}
  #S.forEach (v, k)-> r[k] = v
  #deepEqual r, {1: 1, 2: 2, 3: 3}
  #S = new Set new Map [[1 2] [2 3] [1 4]]
  #ok S.size is 2
  #r = {}
  #S.forEach (v, k)-> r[k] = v
  #deepEqual r, {'2,3': [2, 3], '1,4': [1, 4]}
test 'Set::add' !->
  ok isFunction Set::add
  a = []
  S = new Set [NaN, 2 3 2 1 a]
  ok S.size is 5
  S.add NaN
  ok S.size is 5
  S.add 2
  ok S.size is 5
  S.add a
  ok S.size is 5
  S.add []
  ok S.size is 6
  S.add 4
  ok S.size is 7
test 'Set::clear' !->
  ok isFunction Set::clear
  S = new Set [1 2 3 2 1]
  S.clear!
  ok S.size is 0
test 'Set::delete' !->
  ok isFunction Set::delete
  a = []
  S = new Set [NaN, 2 3 2 1 a]
  ok S.size is 5
  S.delete NaN
  ok S.size is 4
  S.delete 4
  ok S.size is 4
  S.delete []
  ok S.size is 4
  S.delete a
  ok S.size is 3
test 'Set::forEach' !->
  ok isFunction Set::forEach
  r = {}
  var T
  count = 0
  S = new Set [1 2 3 2 1]
  S.forEach (value, key, ctx)!->
    T := ctx
    count := count + 1
    r[key] = value
  ok T is S
  ok count is 3
  deepEqual r, {1: 1, 2: 2, 3: 3}
test 'Set::has' !->
  ok isFunction Set::has
  a = []
  S = new Set [NaN, 2 3 2 1 a]
  ok S.has NaN
  ok S.has a
  ok S.has 2
  ok not S.has 4
  ok not S.has []