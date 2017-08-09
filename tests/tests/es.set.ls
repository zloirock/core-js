{module, test} = QUnit
module \ES

same = (a, b)-> if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b
{getOwnPropertyDescriptor, freeze} = Object

test 'Set' (assert)!->
  assert.isFunction Set
  assert.name Set, \Set
  assert.arity Set, 0
  assert.looksNative Set
  assert.ok \add     of Set::, 'add in Set.prototype'
  assert.ok \clear   of Set::, 'clear in Set.prototype'
  assert.ok \delete  of Set::, 'delete in Set.prototype'
  assert.ok \has     of Set::, 'has in Set.prototype'
  assert.ok new Set instanceof Set, 'new Set instanceof Set'
  assert.strictEqual new Set(createIterable [1 2 3]).size, 3, 'Init from iterable'
  assert.strictEqual (new Set!
    ..add freeze({})
    ..add 1
  ).size, 2, 'Support frozen objects'
  S = new Set!
    ..add 1
    ..add 2
    ..add 3
    ..add 2
    ..add 1
  assert.strictEqual S.size, 3
  r = []
  S.forEach (v)!-> r.push v
  assert.deepEqual r, [1 2 3]
  assert.strictEqual (new Set!
    ..add NaN
    ..add NaN
    ..add NaN
  )size, 1
  if Array.from => assert.deepEqual Array.from((new Set([3 4])
    ..add 2
    ..add 1
  )), [3 4 2 1]
  # return #throw
  done = no
  iter = createIterable [null, 1, 2], return: -> done := on
  _add = Set::add
  Set::add = -> throw 42
  try => new Set iter
  Set::add = _add
  assert.ok done, '.return #throw'
  # call @@iterator in Array with custom iterator
  a = []
  done = no
  a[Symbol?iterator] = ->
    done := on
    [][Symbol?iterator]call @
  new Set a
  assert.ok done
  o = {}
  new Set!add o
  if DESCRIPTORS
    assert.arrayEqual [key for key of o], []
    assert.arrayEqual Object.keys(o), []
  assert.arrayEqual Object.getOwnPropertyNames(o), []
  Object?getOwnPropertySymbols and assert.arrayEqual Object.getOwnPropertySymbols(o), []
  Reflect?ownKeys and assert.arrayEqual Reflect.ownKeys(o), []
  if nativeSubclass
    C = nativeSubclass Set
    assert.ok new C instanceof C, 'correct subclassing with native classes #1'
    assert.ok new C instanceof Set, 'correct subclassing with native classes #2'
    assert.ok new C!add(2).has(2), 'correct subclassing with native classes #3'

test 'Set#add' (assert)!->
  assert.isFunction Set::add
  assert.name Set::add, \add
  assert.arity Set::add, 1
  assert.looksNative Set::add
  assert.nonEnumerable Set::, \add
  a = []
  S = new Set!
    ..add NaN
    ..add 2
    ..add 3
    ..add 2
    ..add 1
    ..add a
  assert.strictEqual S.size, 5
  chain = S.add NaN
  assert.strictEqual chain, S
  assert.strictEqual S.size, 5
  S.add 2
  assert.strictEqual S.size, 5
  S.add a
  assert.strictEqual S.size, 5
  S.add []
  assert.strictEqual S.size, 6
  S.add 4
  assert.strictEqual S.size, 7
  S = new Set!
    ..add freeze f = {}
  assert.ok S.has f

test 'Set#clear' (assert)!->
  assert.isFunction Set::clear
  assert.name Set::clear, \clear
  assert.arity Set::clear, 0
  assert.looksNative Set::clear
  assert.nonEnumerable Set::, \clear
  S = new Set
  S.clear!
  assert.strictEqual S.size, 0
  S = new Set!
    ..add 1
    ..add 2
    ..add 3
    ..add 2
    ..add 1
  S.clear!
  assert.strictEqual S.size, 0
  assert.ok !S.has 1
  assert.ok !S.has 2
  assert.ok !S.has 3
  S = new Set!
    ..add 1
    ..add f = freeze {}
  S.clear!
  assert.strictEqual S.size, 0, 'Support frozen objects'
  assert.ok !S.has 1
  assert.ok !S.has f

test 'Set#delete' (assert)!->
  assert.isFunction Set::delete
  NATIVE and assert.name Set::delete, \delete # can't be polyfilled in some environments
  assert.arity Set::delete, 1
  assert.looksNative Set::delete
  assert.nonEnumerable Set::, \delete
  a = []
  S = new Set!
    ..add NaN
    ..add 2
    ..add 3
    ..add 2
    ..add 1
    ..add a
  assert.strictEqual S.size, 5
  assert.strictEqual S.delete(NaN), on
  assert.strictEqual S.size, 4
  assert.strictEqual S.delete(4), no
  assert.strictEqual S.size, 4
  S.delete []
  assert.strictEqual S.size, 4
  S.delete a
  assert.strictEqual S.size, 3
  S.add freeze f = {}
  assert.strictEqual S.size, 4
  S.delete f
  assert.strictEqual S.size, 3

test 'Set#forEach' (assert)!->
  assert.isFunction Set::forEach
  assert.name Set::forEach, \forEach
  assert.arity Set::forEach, 1
  assert.looksNative Set::forEach
  assert.nonEnumerable Set::, \forEach
  r = []
  count = 0
  S = new Set!
    ..add 1
    ..add 2
    ..add 3
    ..add 2
    ..add 1
  S.forEach (value)!->
    count++
    r.push value
  assert.strictEqual count, 3
  assert.deepEqual r, [1 2 3]
  set = new Set!
    ..add \0
    ..add \1
    ..add \2
    ..add \3
  s = "";
  set.forEach ->
    s += it;
    if it is \2
      set.delete \2
      set.delete \3
      set.delete \1
      set.add \4
  assert.strictEqual s, \0124
  set = new Set!
    ..add \0
  s = "";
  set.forEach ->
    set.delete \0
    if s isnt '' => throw '!!!'
    s += it
  assert.strictEqual s, \0
  assert.throws (!-> Set::forEach.call new Map, !->), 'non-generic'

test 'Set#has' (assert)!->
  assert.isFunction Set::has
  assert.name Set::has, \has
  assert.arity Set::has, 1
  assert.looksNative Set::has
  assert.nonEnumerable Set::, \has
  a = []
  f = freeze {}
  S = new Set!
    ..add NaN
    ..add 2
    ..add 3
    ..add 2
    ..add 1
    ..add f
    ..add a
  assert.ok S.has NaN
  assert.ok S.has a
  assert.ok S.has f
  assert.ok S.has 2
  assert.ok not S.has 4
  assert.ok not S.has []

test 'Set#size' (assert)!->
  assert.nonEnumerable Set::, \size
  size = (new Set!
    ..add 1
  )size
  assert.strictEqual typeof size, \number, 'size is number'
  assert.strictEqual size, 1, 'size is correct'
  if DESCRIPTORS
    sizeDesc = getOwnPropertyDescriptor Set::, \size
    assert.ok sizeDesc && sizeDesc.get, 'size is getter'
    assert.ok sizeDesc && !sizeDesc.set, 'size isnt setter'
    assert.throws (-> Set::size), TypeError

test 'Set & -0' (assert)!->
  set = new Set
  set.add -0
  assert.strictEqual set.size, 1
  assert.ok set.has 0
  assert.ok set.has -0
  set.forEach (it)->
    assert.ok !same it, -0
  set.delete -0
  assert.strictEqual set.size, 0
  set = new Set!
    ..add -0
  set.forEach (key)->
    assert.ok !same key, -0
  set = new Set!
    ..add 4
    ..add 3
    ..add 2
    ..add 1
    ..add 0
  assert.ok set.has -0

test 'Set#@@toStringTag' (assert)!->
  assert.strictEqual Set::[Symbol?toStringTag], \Set, 'Set::@@toStringTag is `Set`'

test 'Set Iterator' (assert)!->
  set = new Set!
    ..add \a
    ..add \b
    ..add \c
    ..add \d
  keys = []
  iterator = set.keys!
  keys.push iterator.next!value
  assert.ok set.delete \a
  assert.ok set.delete \b
  assert.ok set.delete \c
  set.add \e
  keys.push iterator.next!value
  keys.push iterator.next!value
  assert.ok iterator.next!done
  set.add \f
  assert.ok iterator.next!done
  assert.deepEqual keys, <[a d e]>

test 'Set#keys' (assert)!->
  assert.ok typeof Set::keys is \function, 'is function'
  assert.name Set::keys, \values
  assert.arity Set::keys, 0
  assert.looksNative Set::keys
  assert.strictEqual Set::keys, Set::values
  assert.nonEnumerable Set::, \keys
  iter = (new Set!
    ..add \q
    ..add \w
    ..add \e
  )keys!
  assert.isIterator iter
  assert.isIterable iter
  assert.strictEqual iter[Symbol?toStringTag], 'Set Iterator'
  assert.deepEqual iter.next!, {value: \q, done: no}
  assert.deepEqual iter.next!, {value: \w, done: no}
  assert.deepEqual iter.next!, {value: \e, done: no}
  assert.deepEqual iter.next!, {value: void, done: on}

test 'Set#values' (assert)!->
  assert.ok typeof Set::values is \function, 'is function'
  assert.name Set::values, \values
  assert.arity Set::values, 0
  assert.looksNative Set::values
  assert.nonEnumerable Set::, \values
  iter = (new Set!
    ..add \q
    ..add \w
    ..add \e
  )values!
  assert.isIterator iter
  assert.isIterable iter
  assert.strictEqual iter[Symbol?toStringTag], 'Set Iterator'
  assert.deepEqual iter.next!, {value: \q, done: no}
  assert.deepEqual iter.next!, {value: \w, done: no}
  assert.deepEqual iter.next!, {value: \e, done: no}
  assert.deepEqual iter.next!, {value: void, done: on}

test 'Set#entries' (assert)!->
  assert.ok typeof Set::entries is \function, 'is function'
  assert.name Set::entries, \entries
  assert.arity Set::entries, 0
  assert.looksNative Set::entries
  assert.nonEnumerable Set::, \entries
  iter = (new Set!
    ..add \q
    ..add \w
    ..add \e
  )entries!
  assert.isIterator iter
  assert.isIterable iter
  assert.strictEqual iter[Symbol?toStringTag], 'Set Iterator'
  assert.deepEqual iter.next!, {value: [\q \q], done: no}
  assert.deepEqual iter.next!, {value: [\w \w], done: no}
  assert.deepEqual iter.next!, {value: [\e \e], done: no}
  assert.deepEqual iter.next!, {value: void, done: on}

test 'Set#@@iterator' (assert)!->
  assert.isIterable Set::
  assert.name Set::[Symbol?iterator], \values
  assert.arity Set::[Symbol?iterator], 0
  assert.looksNative Set::[Symbol?iterator]
  assert.strictEqual Set::[Symbol?iterator], Set::values
  assert.nonEnumerable Set::, \values
  iter = (new Set!
    ..add \q
    ..add \w
    ..add \e
  )[Symbol?iterator]!
  assert.isIterator iter
  assert.isIterable iter
  assert.strictEqual iter[Symbol?toStringTag], 'Set Iterator'
  assert.deepEqual iter.next!, {value: \q, done: no}
  assert.deepEqual iter.next!, {value: \w, done: no}
  assert.deepEqual iter.next!, {value: \e, done: no}
  assert.deepEqual iter.next!, {value: void, done: on}