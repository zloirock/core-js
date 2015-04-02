QUnit.module 'ES6 Map'

isFunction = -> typeof! it is \Function
isIterator = -> typeof it is \object && isFunction it.next

same = (a, b)-> if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b

{Map, Symbol} = core
{getOwnPropertyDescriptor, freeze} = core.Object
{entries, values} = core.Array

eq = strictEqual
deq = deepEqual

test 'Map' !->
  ok isFunction(Map), 'Is function'
  ok \clear   of Map::, 'clear in Map.prototype'
  ok \delete  of Map::, 'delete in Map.prototype'
  ok \forEach of Map::, 'forEach in Map.prototype'
  ok \get     of Map::, 'get in Map.prototype'
  ok \has     of Map::, 'has in Map.prototype'
  ok \set     of Map::, 'set in Map.prototype'
  ok new Map instanceof Map, 'new Map instanceof Map'
  eq new Map(entries [1 2 3]).size, 3, 'Init from iterator #1'
  eq new Map(new Map entries [1 2 3]).size, 3, 'Init from iterator #2'
  eq new Map([[freeze({}), 1], [2 3]]).size, 2, 'Support frozen objects'
  # return #throw
  done = no
  iter = values [null, 1, 2]
  iter.return = -> done := on
  try => new Map iter
  ok done, '.return #throw'
test 'Map#clear' !->
  ok isFunction(Map::clear), 'Is function'
  M = new Map
  M.clear!
  eq M.size, 0
  M = new Map!set 1 2 .set 2 3 .set 1 4
  M.clear!
  eq M.size, 0
  ok !M.has 1
  ok !M.has 2
  M = new Map!set 1 2 .set f = freeze({}), 3
  M.clear!
  eq M.size, 0, 'Support frozen objects'
  ok !M.has 1
  ok !M.has f
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
  M.set freeze(f = {}), 42
  eq M.size, 4
  M.delete f
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
  f = freeze {}
  M = new Map  [[NaN, 1], [2 1], [3 1], [2 5], [1 4], [f, 42], [o, o]]
  eq M.get(NaN), 1
  eq M.get(4), void
  eq M.get({}), void
  eq M.get(o), o
  eq M.get(f), 42
  eq M.get(2), 5
test 'Map#has' !->
  ok isFunction(Map::has), 'Is function'
  o = {}
  f = freeze {}
  M = new Map  [[NaN, 1], [2 1], [3 1], [2 5], [1 4], [f, 42], [o, o]]
  ok M.has NaN
  ok M.has o
  ok M.has 2
  ok M.has f
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
  M = new Map!set freeze(f = {}), 42
  eq M.get(f), 42
test 'Map#size' !->
  size = new Map!set 2 1 .size
  eq typeof size, \number, 'size is number'
  eq size, 1, 'size is correct'
  if /\[native code\]\s*\}\s*$/.test core.Object.defineProperty
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
  eq Map::[Symbol?toStringTag], \Map, 'Map::@@toStringTag is `Map`'

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
  eq iter[Symbol?toStringTag], 'Map Iterator'
  deq iter.next!, {value: \a, done: no}
  deq iter.next!, {value: \s, done: no}
  deq iter.next!, {value: \d, done: no}
  deq iter.next!, {value: void, done: on}
test 'Map#values' !->
  ok typeof Map::values is \function, 'Is function'
  iter = new Map([[\a \q],[\s \w],[\d \e]])values!
  ok isIterator(iter), 'Return iterator'
  eq iter[Symbol?toStringTag], 'Map Iterator'
  deq iter.next!, {value: \q, done: no}
  deq iter.next!, {value: \w, done: no}
  deq iter.next!, {value: \e, done: no}
  deq iter.next!, {value: void, done: on}
test 'Map#entries' !->
  ok typeof Map::entries is \function, 'Is function'
  iter = new Map([[\a \q],[\s \w],[\d \e]])entries!
  ok isIterator(iter), 'Return iterator'
  eq iter[Symbol?toStringTag], 'Map Iterator'
  deq iter.next!, {value: [\a \q], done: no}
  deq iter.next!, {value: [\s \w], done: no}
  deq iter.next!, {value: [\d \e], done: no}
  deq iter.next!, {value: void, done: on}
test 'Map#@@iterator' !->
  iter = core.getIterator new Map [[\a \q],[\s \w],[\d \e]]
  ok isIterator(iter), 'Return iterator'
  eq iter[Symbol?toStringTag], 'Map Iterator'
  deq iter.next!, {value: [\a \q], done: no}
  deq iter.next!, {value: [\s \w], done: no}
  deq iter.next!, {value: [\d \e], done: no}
  deq iter.next!, {value: void, done: on}