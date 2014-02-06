{isFunction, isNative} = Function
{getOwnPropertyDescriptor} = Object
test 'Map' !->
  ok isFunction(global.Map), 'Map is function'
  ok \clear   of Map::, 'Map::clear is function'
  ok \delete  of Map::, 'Map::delete is function'
  ok \forEach of Map::, 'Map::forEach is function'
  ok \get     of Map::, 'Map::get is function'
  ok \has     of Map::, 'Map::has is function'
  ok \set     of Map::, 'Map::set is function'
  ok new Map instanceof Map, 'new Map instanceof Map'
test 'Map::clear' !->
  ok isFunction Map::clear
  M = new Map!set 1 2 .set 2 3 .set 1 4
  M.clear!
  ok M.size is 0
test 'Map::delete' !->
  ok isFunction Map::delete
  a = []
  M = new Map!set NaN, 1 .set 2 1 .set 3 1 .set 2 5 .set 1 4 .set a, {}
  ok M.size is 5
  ok M.delete(NaN) is on
  ok M.size is 4
  ok M.delete(4) is no
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
  M = new Map!set NaN, 1 .set 2 1 .set 3 7 .set 2 5 .set 1 4 .set a = {}, 9
  M.forEach (value, key, ctx)!->
    T := ctx
    count := count + 1
    r[value] = key
  ok T is M
  ok count is 5
  deepEqual r, {1: NaN, 7: 3, 5: 2, 4: 1, 9: a}
test 'Map::get' !->
  ok isFunction Map::get
  o = {}
  M = new Map!set NaN, 1 .set 2 1 .set 3 1 .set 2 5 .set 1 4 .set o, o
  ok M.get(NaN) is 1
  ok M.get(4)   is void
  ok M.get({})  is void
  ok M.get(o)   is o
  ok M.get(2)   is 5
test 'Map::has' !->
  ok isFunction Map::has
  o = {}
  M = new Map!set NaN, 1 .set 2 1 .set 3 1 .set 2 5 .set 1 4 .set o, o
  ok M.has NaN
  ok M.has o
  ok M.has 2
  ok not M.has 4
  ok not M.has {}
test 'Map::set' !->
  ok isFunction Map::set
  o = {}
  M = new Map!set NaN, 1 .set 2 1 .set 3 1 .set 2 5 .set 1 4 .set o, o
  ok M.size is 5
  chain = M.set(7 2)
  ok chain is M # firefox / ie11 problems
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
  ok new Map!set(NaN, 2)set(NaN, 3)set(NaN, 4)size is 1
test 'Map::size' !->
  size = new Map!set 2 1 .size
  ok typeof size is \number, 'size is number'
  ok size is 1, 'size is correct'
  if isNative getOwnPropertyDescriptor
    sizeDesc = getOwnPropertyDescriptor Map::, \size
    ok sizeDesc && sizeDesc.get, 'size is getter'
    ok sizeDesc && !sizeDesc.set, 'size isnt setter'
test 'Set' !->
  ok isFunction(global.Set), 'Set is function'
  ok \add     of Set::, 'Set::add is function'
  ok \clear   of Set::, 'Set::clear is function'
  ok \delete  of Set::, 'Set::delete is function'
  ok \forEach of Set::, 'Set::forEach is function'
  ok \has     of Set::, 'Set::has is function'
  ok new Set instanceof Set, 'new Set instanceof Set'
  ok new Set([1 2 3 2 1])size is 3, 'Init Set from array'
  S = new Set [1 2 3 2 1]
  ok S.size is 3
  r = {}
  S.forEach (v, k)-> r[k] = v
  deepEqual r, {1:1,2:2,3:3}
  ok new Set([NaN, NaN, NaN])size is 1
test 'Set::add' !->
  ok isFunction Set::add
  a = []
  S = new Set [NaN, 2 3 2 1 a]
  ok S.size is 5
  chain = S.add NaN
  ok chain is S # firefox / ie11 problems
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
  ok S.delete(NaN) is on
  ok S.size is 4
  ok S.delete(4) is no
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
test 'Set::size' !->
  size = new Set([1]).size
  ok typeof size is \number, 'size is number'
  ok size is 1, 'size is correct'
  if isNative getOwnPropertyDescriptor
    sizeDesc = getOwnPropertyDescriptor Set::, \size
    ok sizeDesc && sizeDesc.get, 'size is getter'
    ok sizeDesc && !sizeDesc.set, 'size isnt setter'