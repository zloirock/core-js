QUnit.module 'ES6 Collections'
isFunction = -> typeof! it is \Function
same = Object.is
{getOwnPropertyDescriptor} = Object

descriptors = /\[native code\]\s*\}\s*$/.test Object.defineProperty

eq = strictEqual
deq = deepEqual

{iterator, toStringTag} = Symbol

isIterator = ->
  return typeof it is \object  && typeof it.next is \function
  
that = global? && global || window

test 'Map' !->
  ok isFunction(that.Map), 'Is function'
  ok \clear   of Map::, 'clear in Map.prototype'
  ok \delete  of Map::, 'delete in Map.prototype'
  ok \forEach of Map::, 'forEach in Map.prototype'
  ok \get     of Map::, 'get in Map.prototype'
  ok \has     of Map::, 'has in Map.prototype'
  ok \set     of Map::, 'set in Map.prototype'
  ok new Map instanceof Map, 'new Map instanceof Map'
  eq new Map([1 2 3]entries!).size, 3, 'Init from iterator #1'
  eq new Map(new Map [1 2 3]entries!).size, 3, 'Init from iterator #2'
test 'Map#clear' !->
  ok isFunction(Map::clear), 'Is function'
  M = new Map!set 1 2 .set 2 3 .set 1 4
  M.clear!
  eq M.size, 0
test 'Map#delete' !->
  ok isFunction(Map::delete), 'Is function'
  a = []
  M = new Map!set NaN, 1 .set 2 1 .set 3 1 .set 2 5 .set 1 4 .set a, {}
  eq M.size, 5
  ok M.delete(NaN)
  eq M.size, 4
  ok !M.delete(4)
  eq M.size, 4
  M.delete []
  eq M.size, 4
  M.delete a
  eq M.size, 3
test 'Map#forEach' !->
  ok isFunction(Map::forEach), 'Is function'
  r = {}
  var T
  count = 0
  M = new Map!set NaN, 1 .set 2 1 .set 3 7 .set 2 5 .set 1 4 .set a = {}, 9
  M.forEach (value, key)!->
    count++
    r[value] = key
  eq count, 5
  deq r, {1: NaN, 7: 3, 5: 2, 4: 1, 9: a}
  map = new Map [[\0 9], [\1 9], [\2 9], [\3 9]]
  s = "";
  map.forEach (value, key)->
    s += key;
    if key is \2
      map.delete \2
      map.delete \3
      map.delete \1
      map.set \4 9
  eq s, \0124
  map = new Map [[\0 1]]
  s = "";
  map.forEach ->
    map.delete \0
    if s isnt '' => throw '!!!'
    s += it
  eq s, \1
test 'Map#get' !->
  ok isFunction(Map::get), 'Is function'
  o = {}
  M = new Map!set NaN, 1 .set 2 1 .set 3 1 .set 2 5 .set 1 4 .set o, o
  eq M.get(NaN), 1
  eq M.get(4), void
  eq M.get({}), void
  eq M.get(o), o
  eq M.get(2), 5
test 'Map#has' !->
  ok isFunction(Map::has), 'Is function'
  o = {}
  M = new Map!set NaN, 1 .set 2 1 .set 3 1 .set 2 5 .set 1 4 .set o, o
  ok M.has NaN
  ok M.has o
  ok M.has 2
  ok not M.has 4
  ok not M.has {}
test 'Map#set' !->
  ok isFunction(Map::set), 'Is function'
  o = {}
  M = new Map!set NaN, 1 .set 2 1 .set 3 1 .set 2 5 .set 1 4 .set o, o
  ok M.size is 5
  chain = M.set(7 2)
  eq chain, M
  M.set 7 2
  eq M.size, 6
  eq M.get(7), 2
  eq M.get(NaN), 1
  M.set NaN, 42
  eq M.size, 6
  eq M.get(NaN), 42
  M.set {}, 11
  eq M.size, 7
  eq M.get(o), o
  M.set o, 27
  eq M.size, 7
  eq M.get(o), 27
  eq new Map!set(NaN, 2)set(NaN, 3)set(NaN, 4)size, 1
test 'Map#size' !->
  size = new Map!set 2 1 .size
  eq typeof size, \number, 'size is number'
  eq size, 1, 'size is correct'
  if descriptors
    sizeDesc = getOwnPropertyDescriptor Map::, \size
    ok sizeDesc && sizeDesc.get, 'size is getter'
    ok sizeDesc && !sizeDesc.set, 'size isnt setter'
    throws (-> Map::size), TypeError
test 'Map & -0' !->
  map = new Map
  map.set -0, 1
  eq map.size, 1
  ok map.has 0
  ok map.has -0
  eq map.get(0), 1
  eq map.get(-0), 1
  map.forEach (val, key)->
    ok !same key, -0
  map.delete -0
  eq map.size, 0
  map = new Map [[-0 1]]
  map.forEach (val, key)->
    ok !same key, -0
test 'Map#@@toStringTag' !->
  eq Map::[Symbol.toStringTag], \Map, 'Map::@@toStringTag is `Map`'

test 'Map Iterator' !->
  map = new Map [[\a 1], [\b 2], [\c 3], [\d 4]]
  keys = []
  iterator = map.keys!
  keys.push iterator.next!value
  ok map.delete \a
  ok map.delete \b
  ok map.delete \c
  map.set \e
  keys.push iterator.next!value
  keys.push iterator.next!value
  ok iterator.next!done
  map.set \f
  ok iterator.next!done
  deq keys, <[a d e]>
test 'Map#keys' !->
  ok typeof Map::keys is \function, 'Is function'
  iter = new Map([[\a \q],[\s \w],[\d \e]])keys!
  ok isIterator(iter), 'Return iterator'
  eq iter[toStringTag], 'Map Iterator'
  deq iter.next!, {value: \a, done: no}
  deq iter.next!, {value: \s, done: no}
  deq iter.next!, {value: \d, done: no}
  deq iter.next!, {value: void, done: on}
test 'Map#values' !->
  ok typeof Map::values is \function, 'Is function'
  iter = new Map([[\a \q],[\s \w],[\d \e]])values!
  ok isIterator(iter), 'Return iterator'
  eq iter[toStringTag], 'Map Iterator'
  deq iter.next!, {value: \q, done: no}
  deq iter.next!, {value: \w, done: no}
  deq iter.next!, {value: \e, done: no}
  deq iter.next!, {value: void, done: on}
test 'Map#entries' !->
  ok typeof Map::entries is \function, 'Is function'
  iter = new Map([[\a \q],[\s \w],[\d \e]])entries!
  ok isIterator(iter), 'Return iterator'
  eq iter[toStringTag], 'Map Iterator'
  deq iter.next!, {value: [\a \q], done: no}
  deq iter.next!, {value: [\s \w], done: no}
  deq iter.next!, {value: [\d \e], done: no}
  deq iter.next!, {value: void, done: on}
test 'Map#@@iterator' !->
  ok typeof Map::[iterator] is \function, 'Is function'
  eq Map::[iterator], Map::entries
  iter = new Map([[\a \q],[\s \w],[\d \e]])[iterator]!
  ok isIterator(iter), 'Return iterator'
  eq iter[toStringTag], 'Map Iterator'
  deq iter.next!, {value: [\a \q], done: no}
  deq iter.next!, {value: [\s \w], done: no}
  deq iter.next!, {value: [\d \e], done: no}
  deq iter.next!, {value: void, done: on}

test 'Set' !->
  ok isFunction(that.Set), 'Is function'
  ok \add     of Set::, 'add in Set.prototype'
  ok \clear   of Set::, 'clear in Set.prototype'
  ok \delete  of Set::, 'delete in Set.prototype'
  ok \forEach of Set::, 'forEach in Set.prototype'
  ok \has     of Set::, 'has in Set.prototype'
  ok new Set instanceof Set, 'new Set instanceof Set'
  eq new Set([1 2 3 2 1]values!).size, 3, 'Init from iterator #1'
  eq new Set([1 2 3 2 1]).size, 3, 'Init Set from iterator #2'
  S = new Set [1 2 3 2 1]
  eq S.size, 3
  r = []
  S.forEach (v)-> r.push v
  deq r, [1 2 3]
  eq new Set([NaN, NaN, NaN])size, 1
  if Array.from => deq Array.from(new Set([3 4]).add 2 .add 1), [3 4 2 1]
test 'Set#add' !->
  ok isFunction(Set::add), 'Is function'
  a = []
  S = new Set [NaN, 2 3 2 1 a]
  eq S.size, 5
  chain = S.add NaN
  eq chain, S
  eq S.size, 5
  S.add 2
  eq S.size, 5
  S.add a
  eq S.size, 5
  S.add []
  eq S.size, 6
  S.add 4
  eq S.size, 7
test 'Set#clear' !->
  ok isFunction(Set::clear), 'Is function'
  S = new Set [1 2 3 2 1]
  S.clear!
  eq S.size, 0
test 'Set#delete' !->
  ok isFunction(Set::delete), 'Is function'
  a = []
  S = new Set [NaN, 2 3 2 1 a]
  eq S.size, 5
  eq S.delete(NaN), on
  eq S.size, 4
  eq S.delete(4), no
  eq S.size, 4
  S.delete []
  eq S.size, 4
  S.delete a
  eq S.size, 3
test 'Set#forEach' !->
  ok isFunction(Set::forEach), 'Is function'
  r = []
  count = 0
  S = new Set [1 2 3 2 1]
  S.forEach (value)!->
    count++
    r.push value
  eq count, 3
  deq r, [1 2 3]
  set = new Set <[0 1 2 3]>
  s = "";
  set.forEach ->
    s += it;
    if it is \2
      set.delete \2
      set.delete \3
      set.delete \1
      set.add \4
  eq s, \0124
  set = new Set <[0]>
  s = "";
  set.forEach ->
    set.delete \0
    if s isnt '' => throw '!!!'
    s += it
  eq s, \0
test 'Set#has' !->
  ok isFunction(Set::has), 'Is function'
  a = []
  S = new Set [NaN, 2 3 2 1 a]
  ok S.has NaN
  ok S.has a
  ok S.has 2
  ok not S.has 4
  ok not S.has []
test 'Set#size' !->
  size = new Set([1]).size
  eq typeof size, \number, 'size is number'
  eq size, 1, 'size is correct'
  if descriptors
    sizeDesc = getOwnPropertyDescriptor Set::, \size
    ok sizeDesc && sizeDesc.get, 'size is getter'
    ok sizeDesc && !sizeDesc.set, 'size isnt setter'
    throws (-> Set::size), TypeError
test 'Set & -0' !->
  set = new Set
  set.add -0
  eq set.size, 1
  ok set.has 0
  ok set.has -0
  set.forEach (it)->
    ok !same it, -0
  set.delete -0
  eq set.size, 0
  set = new Set [-0]
  set.forEach (key)->
    ok !same key, -0
test 'Set#@@toStringTag' !->
  eq Set::[Symbol.toStringTag], \Set, 'Set::@@toStringTag is `Set`'

test 'Set Iterator' !->
  set = new Set <[a b c d]>
  keys = []
  iterator = set.keys!
  keys.push iterator.next!value
  ok set.delete \a
  ok set.delete \b
  ok set.delete \c
  set.add \e
  keys.push iterator.next!value
  keys.push iterator.next!value
  ok iterator.next!done
  set.add \f
  ok iterator.next!done
  deq keys, <[a d e]>
test 'Set#keys' !->
  ok typeof Set::keys is \function, 'Is function'
  eq Set::keys, Set::values
  iter = new Set(<[q w e]>)keys!
  ok isIterator(iter), 'Return iterator'
  eq iter[toStringTag], 'Set Iterator'
  deq iter.next!, {value: \q, done: no}
  deq iter.next!, {value: \w, done: no}
  deq iter.next!, {value: \e, done: no}
  deq iter.next!, {value: void, done: on}
test 'Set#values' !->
  ok typeof Set::values is \function, 'Is function'
  iter = new Set(<[q w e]>)values!
  ok isIterator(iter), 'Return iterator'
  eq iter[toStringTag], 'Set Iterator'
  deq iter.next!, {value: \q, done: no}
  deq iter.next!, {value: \w, done: no}
  deq iter.next!, {value: \e, done: no}
  deq iter.next!, {value: void, done: on}
test 'Set#entries' !->
  ok typeof Set::entries is \function, 'Is function'
  iter = new Set(<[q w e]>)entries!
  ok isIterator(iter), 'Return iterator'
  eq iter[toStringTag], 'Set Iterator'
  deq iter.next!, {value: [\q \q], done: no}
  deq iter.next!, {value: [\w \w], done: no}
  deq iter.next!, {value: [\e \e], done: no}
  deq iter.next!, {value: void, done: on}
test 'Set#@@iterator' !->
  ok typeof Set::[iterator] is \function, 'Is function'
  eq Set::[iterator], Set::values
  iter = new Set(<[q w e]>)[iterator]!
  ok isIterator(iter), 'Return iterator'
  eq iter[toStringTag], 'Set Iterator'
  deq iter.next!, {value: \q, done: no}
  deq iter.next!, {value: \w, done: no}
  deq iter.next!, {value: \e, done: no}
  deq iter.next!, {value: void, done: on}

test 'WeakMap' !->
  ok isFunction(that.WeakMap), 'Is function'
  ok \delete of WeakMap::, 'delete in WeakMap.prototype'
  ok \get    of WeakMap::, 'get in WeakMap.prototype'
  ok \has    of WeakMap::, 'has in WeakMap.prototype'
  ok \set    of WeakMap::, 'set in WeakMap.prototype'
  ok new WeakMap instanceof WeakMap, 'new WeakMap instanceof WeakMap'
  eq new WeakMap([[a = {}, b = {}]].values!).get(a), b, 'Init WeakMap from iterator #1'
  eq new WeakMap(new Map([[a = {}, b = {}]])).get(a), b, 'Init WeakMap from iterator #2'
test 'WeakMap#delete' !->
  ok isFunction(WeakMap::delete), 'Is function'
  M = new WeakMap!
    .set a = {}, 42
    .set b = {}, 21
  ok M.has(a) && M.has(b), 'WeakMap has values before .delete()'
  M.delete a
  ok !M.has(a) && M.has(b), 'WeakMap has`nt value after .delete()'
test 'WeakMap#get' !->
  ok isFunction(WeakMap::get), 'Is function'
  M = new WeakMap!
  eq M.get({}), void, 'WeakMap .get() before .set() return undefined'
  M.set a = {}, 42
  eq M.get(a), 42, 'WeakMap .get() return value'
  M.delete a
  eq M.get(a), void, 'WeakMap .get() after .delete() return undefined'
test 'WeakMap#has' !->
  ok isFunction(WeakMap::has), 'Is function'
  M = new WeakMap!
  ok !M.has({}), 'WeakMap .has() before .set() return false'
  M.set a = {}, 42
  ok M.has(a), 'WeakMap .has() return true'
  M.delete a
  ok !M.has(a), 'WeakMap .has() after .delete() return false'
test 'WeakMap#set' !->
  ok isFunction(WeakMap::set), 'Is function'
  ok new WeakMap!set(a = {}, 42), 'WeakMap.prototype.set works with object as keys'
  ok (try new WeakMap!set(42, 42); no; catch => on), 'WeakMap.prototype.set throw with primitive keys'
test 'WeakMap#@@toStringTag' !->
  eq WeakMap::[Symbol.toStringTag], \WeakMap, 'WeakMap::@@toStringTag is `WeakMap`'

test 'WeakSet' !->
  ok isFunction(that.WeakSet), 'Is function'
  ok \add    of WeakSet::, 'add in WeakSet.prototype'
  ok \delete of WeakSet::, 'delete in WeakSet.prototype'
  ok \has    of WeakSet::, 'has in WeakSet.prototype'
  ok new WeakSet instanceof WeakSet, 'new WeakSet instanceof WeakSet'
  ok new WeakSet([a = {}].values!).has(a), 'Init WeakSet from iterator #1'
  ok new WeakSet([a = {}]).has(a), 'Init WeakSet from iterator #2'
test 'WeakSet#add' !->
  ok isFunction(WeakSet::add), 'Is function'
  ok new WeakSet!add(a = {}), 'WeakSet.prototype.add works with object as keys'
  ok (try new WeakSet!add(42); no; catch => on), 'WeakSet.prototype.add throw with primitive keys'
test 'WeakSet#delete' !->
  ok isFunction(WeakSet::delete), 'Is function'
  M = new WeakSet!
    .add a = {}
    .add b = {}
  ok M.has(a) && M.has(b), 'WeakSet has values before .delete()'
  M.delete a
  ok !M.has(a) && M.has(b), 'WeakSet has`nt value after .delete()'
test 'WeakSet#has' !->
  ok isFunction(WeakSet::has), 'Is function'
  M = new WeakSet!
  ok not M.has({}), 'WeakSet has`nt value'
  M.add a = {}
  ok M.has(a), 'WeakSet has value after .add()'
  M.delete a
  ok not M.has(a), 'WeakSet has`nt value after .delete()'
test 'WeakSet::@@toStringTag' !->
  eq WeakSet::[Symbol.toStringTag], \WeakSet, 'WeakSet::@@toStringTag is `WeakSet`'