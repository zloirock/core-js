{isFunction, isNative} = Function
{getOwnPropertyDescriptor} = Object
test 'Map' !->
  ok isFunction(global.Map), 'Is function'
  ok \clear   of Map::, 'clear in Map.prototype'
  ok \delete  of Map::, 'delete in Map.prototype'
  ok \forEach of Map::, 'forEach in Map.prototype'
  ok \get     of Map::, 'get in Map.prototype'
  ok \has     of Map::, 'has in Map.prototype'
  ok \set     of Map::, 'set in Map.prototype'
  ok new Map instanceof Map, 'new Map instanceof Map'
test 'Map::clear' !->
  ok isFunction(Map::clear), 'Is function'
  M = new Map!set 1 2 .set 2 3 .set 1 4
  M.clear!
  ok M.size is 0
test 'Map::delete' !->
  ok isFunction(Map::delete), 'Is function'
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
  ok isFunction(Map::forEach), 'Is function'
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
  ok isFunction(Map::get), 'Is function'
  o = {}
  M = new Map!set NaN, 1 .set 2 1 .set 3 1 .set 2 5 .set 1 4 .set o, o
  ok M.get(NaN) is 1
  ok M.get(4)   is void
  ok M.get({})  is void
  ok M.get(o)   is o
  ok M.get(2)   is 5
test 'Map::has' !->
  ok isFunction(Map::has), 'Is function'
  o = {}
  M = new Map!set NaN, 1 .set 2 1 .set 3 1 .set 2 5 .set 1 4 .set o, o
  ok M.has NaN
  ok M.has o
  ok M.has 2
  ok not M.has 4
  ok not M.has {}
test 'Map::set' !->
  ok isFunction(Map::set), 'Is function'
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
  ok isFunction(global.Set), 'Is function'
  ok \add     of Set::, 'add in Set.prototype'
  ok \clear   of Set::, 'clear in Set.prototype'
  ok \delete  of Set::, 'delete in Set.prototype'
  ok \forEach of Set::, 'forEach in Set.prototype'
  ok \has     of Set::, 'has in Set.prototype'
  ok new Set instanceof Set, 'new Set instanceof Set'
  ok new Set([1 2 3 2 1])size is 3, 'Init Set from array'
  S = new Set [1 2 3 2 1]
  ok S.size is 3
  r = {}
  S.forEach (v, k)-> r[k] = v
  deepEqual r, {1:1,2:2,3:3}
  ok new Set([NaN, NaN, NaN])size is 1
test 'Set::add' !->
  ok isFunction(Set::add), 'Is function'
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
  ok isFunction(Set::clear), 'Is function'
  S = new Set [1 2 3 2 1]
  S.clear!
  ok S.size is 0
test 'Set::delete' !->
  ok isFunction(Set::delete), 'Is function'
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
  ok isFunction(Set::forEach), 'Is function'
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
  ok isFunction(Set::has), 'Is function'
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

test 'WeakMap' !->
  ok isFunction(global.WeakMap), 'Is function'
  ok \clear   of WeakMap::, 'clear in WeakMap.prototype'
  ok \delete  of WeakMap::, 'delete in WeakMap.prototype'
  ok \get     of WeakMap::, 'get in WeakMap.prototype'
  ok \has     of WeakMap::, 'has in WeakMap.prototype'
  ok \set     of WeakMap::, 'set in WeakMap.prototype'
  ok new WeakMap instanceof WeakMap, 'new WeakMap instanceof WeakMap'
test 'WeakMap::clear' !->
  ok isFunction(WeakMap::clear), 'Is function'
  M = new WeakMap!
    .set a = {}, 42
    .set b = {}, 21
  ok M.has(a) && M.has(b), 'WeakMap has values before .delete()'
  M.clear!
  ok !M.has(a) && !M.has(b), 'WeakMap has`nt values after .clear()'
test 'WeakMap::delete' !->
  ok isFunction(WeakMap::delete), 'Is function'
  M = new WeakMap!
    .set a = {}, 42
    .set b = {}, 21
  ok M.has(a) && M.has(b), 'WeakMap has values before .delete()'
  M.delete a
  ok !M.has(a) && M.has(b), 'WeakMap has`nt value after .delete()'
test 'WeakMap::get' !->
  ok isFunction(WeakMap::get), 'Is function'
  M = new WeakMap!
  #ok M.get(42) is void, 'WeakMap .get(primitive) return undefined' !!!!!!!!!!!!!!!!!
  ok M.get({}) is void, 'WeakMap .get() before .set() return undefined'
  M.set a = {}, 42
  ok M.get(a) is 42, 'WeakMap .get() return value'
  M.delete a
  ok M.get(a) is void, 'WeakMap .get() after .delete() return undefined'
test 'WeakMap::has' !->
  ok isFunction(WeakMap::has), 'Is function'
  M = new WeakMap!
  #ok M.has(42) is no, 'WeakMap .has(primitive) return false' !!!!!!!!!!!!!!!!!
  ok M.has({}) is no, 'WeakMap .has() before .set() return false'
  M.set a = {}, 42
  ok M.has(a), 'WeakMap .has() return true'
  M.delete a
  ok M.has(a) is no, 'WeakMap .has() after .delete() return false'
test 'WeakMap::set' !->
  ok isFunction(WeakMap::set), 'Is function'
  ok new WeakMap!set(a = {}, 42), 'WeakMap.prototype.set works with object as keys'
  ok (try new WeakMap!set(42, 42); no; catch => on), 'WeakMap.prototype.set throw with primitive keys'

test 'WeakSet' !->
  ok isFunction(global.WeakSet), 'Is function'
  ok \add     of WeakSet::, 'add in WeakSet.prototype'
  ok \clear   of WeakSet::, 'clear in WeakSet.prototype'
  ok \delete  of WeakSet::, 'delete in WeakSet.prototype'
  ok \has     of WeakSet::, 'has in WeakSet.prototype'
  ok new WeakSet instanceof WeakSet, 'new WeakSet instanceof WeakSet'
  ok new WeakSet([a = {}]).has(a), 'Init WeakSet from array'
test 'WeakSet::add' !->
  ok isFunction(WeakSet::add), 'Is function'
  ok new WeakSet!add(a = {}), 'WeakSet.prototype.add works with object as keys'
  ok (try new WeakSet!add(42); no; catch => on), 'WeakSet.prototype.add throw with primitive keys'
test 'WeakSet::clear' !->
  ok isFunction(WeakSet::clear), 'Is function'
  M = new WeakSet!
    .add a = {}
    .add b = {}
  ok M.has(a) && M.has(b), 'WeakSet has values before .clear()'
  M.clear!
  ok !M.has(a) && !M.has(b), 'WeakSet has`nt values after .clear()'
test 'WeakSet::delete' !->
  ok isFunction(WeakSet::delete), 'Is function'
  M = new WeakSet!
    .add a = {}
    .add b = {}
  ok M.has(a) && M.has(b), 'WeakSet has values before .delete()'
  M.delete a
  ok !M.has(a) && M.has(b), 'WeakSet has`nt value after .delete()'
test 'WeakSet::has' !->
  ok isFunction(WeakSet::has), 'Is function'
  M = new WeakSet!
  ok not M.has({}), 'WeakSet has`nt value'
  M.add a = {}
  ok M.has(a), 'WeakSet has value after .add()'
  M.delete a
  ok not M.has(a), 'WeakSet has`nt value after .delete()'