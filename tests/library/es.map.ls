{module, test} = QUnit
module \ES

same = (a, b)-> if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b
{Map, Set, Symbol} = core
{getOwnPropertyDescriptor, freeze} = core.Object
{iterator} = core.Symbol

test 'Map' (assert)!->
  assert.isFunction Map
  assert.ok \clear   of Map::, 'clear in Map.prototype'
  assert.ok \delete  of Map::, 'delete in Map.prototype'
  assert.ok \forEach of Map::, 'forEach in Map.prototype'
  assert.ok \get     of Map::, 'get in Map.prototype'
  assert.ok \has     of Map::, 'has in Map.prototype'
  assert.ok \set     of Map::, 'set in Map.prototype'
  assert.ok new Map instanceof Map, 'new Map instanceof Map'
  assert.strictEqual new Map(createIterable [[1 1], [2 2], [3 3]]).size, 3, 'Init from iterable'
  assert.strictEqual new Map([[freeze({}), 1], [2 3]]).size, 2, 'Support frozen objects'
  # return #throw
  done = no
  iter = createIterable [null, 1, 2], return: -> done := on
  try => new Map iter
  assert.ok done, '.return #throw'
  # call @@iterator in Array with custom iterator
  a = []
  done = no
  a['@@iterator'] = void
  a[iterator] = ->
    done := on
    core.getIteratorMethod([])call @
  new Map a
  assert.ok done
  o = {}
  new Map!set o, 1
  if DESCRIPTORS
    assert.arrayEqual [key for key of o], []
    assert.arrayEqual core.Object.keys(o), []
  assert.arrayEqual core.Object.getOwnPropertyNames(o), []
  assert.arrayEqual core.Object.getOwnPropertySymbols(o), []
  assert.arrayEqual core.Reflect.ownKeys(o), []
  if nativeSubclass
    C = nativeSubclass Map
    assert.ok new C instanceof C, 'correct subclassing with native classes #1'
    assert.ok new C instanceof Map, 'correct subclassing with native classes #2'
    assert.same new C!set(1 2).get(1), 2, 'correct subclassing with native classes #3'

test 'Map#clear' (assert)!->
  assert.isFunction Map::clear
  M = new Map
  M.clear!
  assert.strictEqual M.size, 0
  M = new Map!set 1 2 .set 2 3 .set 1 4
  M.clear!
  assert.strictEqual M.size, 0
  assert.ok !M.has 1
  assert.ok !M.has 2
  M = new Map!set 1 2 .set f = freeze({}), 3
  M.clear!
  assert.strictEqual M.size, 0, 'Support frozen objects'
  assert.ok !M.has 1
  assert.ok !M.has f

test 'Map#delete' (assert)!->
  assert.isFunction Map::delete
  a = []
  M = new Map!set NaN, 1 .set 2 1 .set 3 1 .set 2 5 .set 1 4 .set a, {}
  assert.strictEqual M.size, 5
  assert.ok M.delete(NaN)
  assert.strictEqual M.size, 4
  assert.ok !M.delete(4)
  assert.strictEqual M.size, 4
  M.delete []
  assert.strictEqual M.size, 4
  M.delete a
  assert.strictEqual M.size, 3
  M.set freeze(f = {}), 42
  assert.strictEqual M.size, 4
  M.delete f
  assert.strictEqual M.size, 3

test 'Map#forEach' (assert)!->
  assert.isFunction Map::forEach
  r = {}
  var T
  count = 0
  M = new Map!set NaN, 1 .set 2 1 .set 3 7 .set 2 5 .set 1 4 .set a = {}, 9
  M.forEach (value, key)!->
    count++
    r[value] = key
  assert.strictEqual count, 5
  assert.deepEqual r, {1: NaN, 7: 3, 5: 2, 4: 1, 9: a}
  map = new Map [[\0 9], [\1 9], [\2 9], [\3 9]]
  s = "";
  map.forEach (value, key)!->
    s += key;
    if key is \2
      map.delete \2
      map.delete \3
      map.delete \1
      map.set \4 9
  assert.strictEqual s, \0124
  map = new Map [[\0 1]]
  s = "";
  map.forEach !->
    map.delete \0
    if s isnt '' => throw '!!!'
    s += it
  assert.strictEqual s, \1
  assert.throws (!-> Map::forEach.call new Set, !->), 'non-generic'

test 'Map#get' (assert)!->
  assert.isFunction Map::get
  o = {}
  f = freeze {}
  M = new Map  [[NaN, 1], [2 1], [3 1], [2 5], [1 4], [f, 42], [o, o]]
  assert.strictEqual M.get(NaN), 1
  assert.strictEqual M.get(4), void
  assert.strictEqual M.get({}), void
  assert.strictEqual M.get(o), o
  assert.strictEqual M.get(f), 42
  assert.strictEqual M.get(2), 5

test 'Map#has' (assert)!->
  assert.isFunction Map::has
  o = {}
  f = freeze {}
  M = new Map  [[NaN, 1], [2 1], [3 1], [2 5], [1 4], [f, 42], [o, o]]
  assert.ok M.has NaN
  assert.ok M.has o
  assert.ok M.has 2
  assert.ok M.has f
  assert.ok not M.has 4
  assert.ok not M.has {}

test 'Map#set' (assert)!->
  assert.isFunction Map::set
  o = {}
  M = new Map!set NaN, 1 .set 2 1 .set 3 1 .set 2 5 .set 1 4 .set o, o
  assert.ok M.size is 5
  chain = M.set(7 2)
  assert.strictEqual chain, M
  M.set 7 2
  assert.strictEqual M.size, 6
  assert.strictEqual M.get(7), 2
  assert.strictEqual M.get(NaN), 1
  M.set NaN, 42
  assert.strictEqual M.size, 6
  assert.strictEqual M.get(NaN), 42
  M.set {}, 11
  assert.strictEqual M.size, 7
  assert.strictEqual M.get(o), o
  M.set o, 27
  assert.strictEqual M.size, 7
  assert.strictEqual M.get(o), 27
  assert.strictEqual new Map!set(NaN, 2)set(NaN, 3)set(NaN, 4)size, 1
  M = new Map!set freeze(f = {}), 42
  assert.strictEqual M.get(f), 42

test 'Map#size' (assert)!->
  size = new Map!set 2 1 .size
  assert.strictEqual typeof size, \number, 'size is number'
  assert.strictEqual size, 1, 'size is correct'
  if DESCRIPTORS
    sizeDesc = getOwnPropertyDescriptor Map::, \size
    assert.ok sizeDesc && sizeDesc.get, 'size is getter'
    assert.ok sizeDesc && !sizeDesc.set, 'size isnt setter'
    assert.throws (!-> Map::size), TypeError

test 'Map & -0' (assert)!->
  map = new Map
  map.set -0, 1
  assert.strictEqual map.size, 1
  assert.ok map.has 0
  assert.ok map.has -0
  assert.strictEqual map.get(0), 1
  assert.strictEqual map.get(-0), 1
  map.forEach (val, key)->
    assert.ok !same key, -0
  map.delete -0
  assert.strictEqual map.size, 0
  map = new Map [[-0 1]]
  map.forEach (val, key)->
    assert.ok !same key, -0
  map = new Map!
    ..set 4, 4
    ..set 3, 3
    ..set 2, 2
    ..set 1, 1
    ..set 0, 0
  assert.ok map.has -0

test 'Map#@@toStringTag' (assert)!->
  assert.strictEqual Map::[Symbol?toStringTag], \Map, 'Map::@@toStringTag is `Map`'

test 'Map Iterator' (assert)!->
  map = new Map [[\a 1], [\b 2], [\c 3], [\d 4]]
  keys = []
  iterator = map.keys!
  keys.push iterator.next!value
  assert.ok map.delete \a
  assert.ok map.delete \b
  assert.ok map.delete \c
  map.set \e
  keys.push iterator.next!value
  keys.push iterator.next!value
  assert.ok iterator.next!done
  map.set \f
  assert.ok iterator.next!done
  assert.deepEqual keys, <[a d e]>

test 'Map#keys' (assert)!->
  assert.isFunction Map::keys
  iter = new Map([[\a \q],[\s \w],[\d \e]])keys!
  assert.isIterator iter
  assert.isIterable iter
  assert.strictEqual iter[Symbol?toStringTag], 'Map Iterator'
  assert.deepEqual iter.next!, {value: \a, done: no}
  assert.deepEqual iter.next!, {value: \s, done: no}
  assert.deepEqual iter.next!, {value: \d, done: no}
  assert.deepEqual iter.next!, {value: void, done: on}

test 'Map#values' (assert)!->
  assert.isFunction Map::values
  iter = new Map([[\a \q],[\s \w],[\d \e]])values!
  assert.isIterator iter
  assert.isIterable iter
  assert.strictEqual iter[Symbol?toStringTag], 'Map Iterator'
  assert.deepEqual iter.next!, {value: \q, done: no}
  assert.deepEqual iter.next!, {value: \w, done: no}
  assert.deepEqual iter.next!, {value: \e, done: no}
  assert.deepEqual iter.next!, {value: void, done: on}

test 'Map#entries' (assert)!->
  assert.isFunction Map::entries
  iter = new Map([[\a \q],[\s \w],[\d \e]])entries!
  assert.isIterator iter
  assert.isIterable iter
  assert.strictEqual iter[Symbol?toStringTag], 'Map Iterator'
  assert.deepEqual iter.next!, {value: [\a \q], done: no}
  assert.deepEqual iter.next!, {value: [\s \w], done: no}
  assert.deepEqual iter.next!, {value: [\d \e], done: no}
  assert.deepEqual iter.next!, {value: void, done: on}

test 'Map#@@iterator' (assert)!->
  iter = core.getIterator new Map [[\a \q],[\s \w],[\d \e]]
  assert.isIterator iter
  assert.isIterable iter
  assert.strictEqual iter[Symbol?toStringTag], 'Map Iterator'
  assert.deepEqual iter.next!, {value: [\a \q], done: no}
  assert.deepEqual iter.next!, {value: [\s \w], done: no}
  assert.deepEqual iter.next!, {value: [\d \e], done: no}
  assert.deepEqual iter.next!, {value: void, done: on}