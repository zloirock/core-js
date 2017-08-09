{module, test} = QUnit
module \ES

same = (a, b)-> if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b
{getOwnPropertyDescriptor, freeze} = Object

test 'Map' (assert)!->
  assert.isFunction Map
  assert.arity Map, 0
  assert.name Map, \Map
  assert.looksNative Map
  assert.ok \clear  of Map::, 'clear in Map.prototype'
  assert.ok \delete of Map::, 'delete in Map.prototype'
  assert.ok \get    of Map::, 'get in Map.prototype'
  assert.ok \has    of Map::, 'has in Map.prototype'
  assert.ok \set    of Map::, 'set in Map.prototype'
  assert.ok new Map instanceof Map, 'new Map instanceof Map'
  assert.strictEqual new Map(createIterable [[1 1], [2 2], [3 3]]).size, 3, 'Init from iterable'
  assert.strictEqual (new Map!
    ..set freeze({}), 1
    ..set 2 3    
  ).size, 2, 'Support frozen objects'
  # return #throw
  done = no
  iter = createIterable [null 1 2], return: -> done := on
  try => new Map iter
  assert.ok done, '.return #throw'
  # call @@iterator in Array with custom iterator
  a = []
  done = no
  a[Symbol?iterator] = ->
    done := on
    [][Symbol?iterator]call @
  new Map a
  assert.ok done
  o = {}
  new Map!set o, 1
  if DESCRIPTORS
    assert.arrayEqual [key for key of o], []
    assert.arrayEqual Object.keys(o), []
  assert.arrayEqual Object.getOwnPropertyNames(o), []
  Object?getOwnPropertySymbols and assert.arrayEqual Object.getOwnPropertySymbols(o), []
  Reflect?ownKeys and assert.arrayEqual Reflect.ownKeys(o), []
  if nativeSubclass
    C = nativeSubclass Map
    assert.ok new C instanceof C, 'correct subclassing with native classes #1'
    assert.ok new C instanceof Map, 'correct subclassing with native classes #2'
    assert.same new C!set(1 2).get(1), 2, 'correct subclassing with native classes #3'

test 'Map#clear' (assert)!->
  assert.isFunction Map::clear
  assert.arity Map::clear, 0
  assert.name Map::clear, \clear
  assert.looksNative Map::clear
  assert.nonEnumerable Map::, \clear
  M = new Map
  M.clear!
  assert.strictEqual M.size, 0
  M = new Map!
    ..set 1 2
    ..set 2 3
    ..set 1 4
  M.clear!
  assert.strictEqual M.size, 0
  assert.ok !M.has 1
  assert.ok !M.has 2
  M = new Map!
    ..set 1 2
    ..set f = freeze({}), 3
  M.clear!
  assert.strictEqual M.size, 0, 'Support frozen objects'
  assert.ok !M.has 1
  assert.ok !M.has f

test 'Map#delete' (assert)!->
  assert.isFunction Map::delete
  assert.arity Map::delete, 1
  NATIVE and assert.name Map::delete, \delete # can't be polyfilled in some environments
  assert.looksNative Map::delete
  assert.nonEnumerable Map::, \delete
  a = []
  M = new Map!
    ..set NaN, 1
    ..set 2 1
    ..set 3 1
    ..set 2 5
    ..set 1 4
    ..set a, {}
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
  assert.arity Map::forEach, 1
  assert.name Map::forEach, \forEach
  assert.looksNative Map::forEach
  assert.nonEnumerable Map::, \forEach
  r = {}
  var T
  count = 0
  M = new Map!
    ..set NaN, 1
    ..set 2 1
    ..set 3 7
    ..set 2 5
    ..set 1 4
    ..set a = {}, 9
  M.forEach (value, key)!->
    count++
    r[value] = key
  assert.strictEqual count, 5
  assert.deepEqual r, {1: NaN, 7: 3, 5: 2, 4: 1, 9: a}
  map = new Map!
    ..set \0 9
    ..set \1 9
    ..set \2 9
    ..set \3 9
  s = "";
  map.forEach (value, key)->
    s += key;
    if key is \2
      map.delete \2
      map.delete \3
      map.delete \1
      map.set \4 9
  assert.strictEqual s, \0124
  map = new Map!
    ..set \0 1
  s = "";
  map.forEach ->
    map.delete \0
    if s isnt '' => throw '!!!'
    s += it
  assert.strictEqual s, \1
  assert.throws (!-> Map::forEach.call new Set, !->), 'non-generic'

test 'Map#get' (assert)!->
  assert.isFunction Map::get
  assert.name Map::get, \get
  assert.arity Map::get, 1
  assert.looksNative Map::get
  assert.nonEnumerable Map::, \get
  o = {}
  f = freeze {}
  M = new Map!
    ..set NaN, 1
    ..set 2 1
    ..set 3 1
    ..set 2 5
    ..set 1 4
    ..set f, 42
    ..set o, o
  assert.strictEqual M.get(NaN), 1
  assert.strictEqual M.get(4), void
  assert.strictEqual M.get({}), void
  assert.strictEqual M.get(o), o
  assert.strictEqual M.get(f), 42
  assert.strictEqual M.get(2), 5

test 'Map#has' (assert)!->
  assert.isFunction Map::has
  assert.name Map::has, \has
  assert.arity Map::has, 1
  assert.looksNative Map::has
  assert.nonEnumerable Map::, \has
  o = {}
  f = freeze {}
  M = new Map!
    ..set NaN, 1
    ..set 2 1
    ..set 3 1
    ..set 2 5
    ..set 1 4
    ..set f, 42
    ..set o, o
  assert.ok M.has NaN
  assert.ok M.has o
  assert.ok M.has 2
  assert.ok M.has f
  assert.ok not M.has 4
  assert.ok not M.has {}

test 'Map#set' (assert)!->
  assert.isFunction Map::set
  assert.name Map::set, \set
  assert.arity Map::set, 2
  assert.looksNative Map::set
  assert.nonEnumerable Map::, \set
  o = {}
  M = new Map!
    ..set NaN, 1
    ..set 2 1
    ..set 3 1
    ..set 2 5
    ..set 1 4
    ..set o, o
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
  assert.strictEqual (new Map!
    ..set NaN, 2
    ..set NaN, 3
    ..set NaN, 4
  )size, 1
  M = new Map!set freeze(f = {}), 42
  assert.strictEqual M.get(f), 42

test 'Map#size' (assert)!->
  assert.nonEnumerable Map::, \size
  size = (new Map!
    ..set 2 1)size
  assert.strictEqual typeof size, \number, 'size is number'
  assert.strictEqual size, 1, 'size is correct'
  if DESCRIPTORS
    sizeDesc = getOwnPropertyDescriptor Map::, \size
    assert.ok sizeDesc && sizeDesc.get, 'size is getter'
    assert.ok sizeDesc && !sizeDesc.set, 'size isnt setter'
    assert.throws (-> Map::size), TypeError

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
  map = new Map!
    ..set -0 1
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
  #assert.nonEnumerable Map::, Symbol?toStringTag
  assert.strictEqual Map::[Symbol?toStringTag], \Map, 'Map::@@toStringTag is `Map`'

test 'Map Iterator' (assert)!->
  map = new Map!
    ..set \a 1
    ..set \b 2
    ..set \c 3
    ..set \d 4
  keys = []
  iterator = map.keys!
  assert.isIterator iterator
  assert.isIterable iterator
  assert.nonEnumerable iterator, \next
  assert.nonEnumerable iterator, Symbol?iterator
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
  assert.name Map::keys, \keys
  assert.arity Map::keys, 0
  assert.looksNative Map::keys
  assert.nonEnumerable Map::, \keys
  iter = (new Map!
    ..set \a \q
    ..set \s \w
    ..set \d \e
  )keys!
  assert.isIterator iter
  assert.isIterable iter
  assert.strictEqual iter[Symbol?toStringTag], 'Map Iterator'
  assert.deepEqual iter.next!, {value: \a, done: no}
  assert.deepEqual iter.next!, {value: \s, done: no}
  assert.deepEqual iter.next!, {value: \d, done: no}
  assert.deepEqual iter.next!, {value: void, done: on}

test 'Map#values' (assert)!->
  assert.isFunction Map::values
  assert.name Map::values, \values
  assert.arity Map::values, 0
  assert.looksNative Map::values
  assert.nonEnumerable Map::, \values
  iter = (new Map!
    ..set \a \q
    ..set \s \w
    ..set \d \e
  )values!
  assert.isIterator iter
  assert.isIterable iter
  assert.strictEqual iter[Symbol?toStringTag], 'Map Iterator'
  assert.deepEqual iter.next!, {value: \q, done: no}
  assert.deepEqual iter.next!, {value: \w, done: no}
  assert.deepEqual iter.next!, {value: \e, done: no}
  assert.deepEqual iter.next!, {value: void, done: on}

test 'Map#entries' (assert)!->
  assert.isFunction Map::entries
  assert.name Map::entries, \entries
  assert.arity Map::entries, 0
  assert.looksNative Map::entries
  assert.nonEnumerable Map::, \entries
  iter = (new Map!
    ..set \a \q
    ..set \s \w
    ..set \d \e
  )entries!
  assert.isIterator iter
  assert.isIterable iter
  assert.strictEqual iter[Symbol?toStringTag], 'Map Iterator'
  assert.deepEqual iter.next!, {value: [\a \q], done: no}
  assert.deepEqual iter.next!, {value: [\s \w], done: no}
  assert.deepEqual iter.next!, {value: [\d \e], done: no}
  assert.deepEqual iter.next!, {value: void, done: on}

test 'Map#@@iterator' (assert)!->
  assert.isIterable Map::
  assert.name Map::entries, \entries
  assert.arity Map::entries, 0
  assert.looksNative Map::[Symbol?iterator]
  assert.strictEqual Map::[Symbol?iterator], Map::entries
  assert.nonEnumerable Map::, Symbol?iterator
  iter = (new Map!
    ..set \a \q
    ..set \s \w
    ..set \d \e
  )[Symbol?iterator]!
  assert.isIterator iter
  assert.isIterable iter
  assert.strictEqual iter[Symbol?toStringTag], 'Map Iterator'
  assert.deepEqual iter.next!, {value: [\a \q], done: no}
  assert.deepEqual iter.next!, {value: [\s \w], done: no}
  assert.deepEqual iter.next!, {value: [\d \e], done: no}
  assert.deepEqual iter.next!, {value: void, done: on}