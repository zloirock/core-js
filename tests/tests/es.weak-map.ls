{module, test} = QUnit
module \ES

{freeze} = Object

test 'WeakMap' (assert)!->
  assert.isFunction WeakMap
  assert.name WeakMap, \WeakMap
  assert.arity WeakMap, 0
  assert.looksNative WeakMap
  assert.ok \delete of WeakMap::, 'delete in WeakMap.prototype'
  assert.ok \get    of WeakMap::, 'get in WeakMap.prototype'
  assert.ok \has    of WeakMap::, 'has in WeakMap.prototype'
  assert.ok \set    of WeakMap::, 'set in WeakMap.prototype'
  assert.ok new WeakMap instanceof WeakMap, 'new WeakMap instanceof WeakMap'
  assert.strictEqual new WeakMap(createIterable [[a = {}, 42]]).get(a), 42, 'Init from iterable'
  assert.strictEqual (new WeakMap!
    ..set f = freeze({}), 42
  )get(f), 42, 'Support frozen objects'
  M = new WeakMap
  M.set freeze(f = {}), 42
  assert.strictEqual M.has(f), on
  assert.strictEqual M.get(f), 42
  M.delete f
  assert.strictEqual M.has(f), no
  assert.strictEqual M.get(f), void
  # return #throw
  done = no
  iter = createIterable [null, 1, 2], return: -> done := on
  try => new WeakMap iter
  assert.ok done, '.return #throw'
  assert.ok !(\clear of WeakMap::), 'should not contains `.clear` method'
  # call @@iterator in Array with custom iterator
  a = []
  done = no
  a[Symbol?iterator] = ->
    done := on
    [][Symbol?iterator]call @
  new WeakMap a
  assert.ok done
  o = {}
  new WeakMap!set o, 1
  if DESCRIPTORS
    assert.arrayEqual [key for key of o], []
    assert.arrayEqual Object.keys(o), []
  assert.arrayEqual Object.getOwnPropertyNames(o), []
  Object?getOwnPropertySymbols and assert.arrayEqual Object.getOwnPropertySymbols(o), []
  Reflect?ownKeys and assert.arrayEqual Reflect.ownKeys(o), []
  if nativeSubclass
    C = nativeSubclass WeakMap
    assert.ok new C instanceof C, 'correct subclassing with native classes #1'
    assert.ok new C instanceof WeakMap, 'correct subclassing with native classes #2'
    assert.same new C!set(O = {}, 2).get(O), 2, 'correct subclassing with native classes #3'

test 'WeakMap#delete' (assert)!->
  assert.isFunction WeakMap::delete
  NATIVE and assert.name WeakMap::delete, \delete # can't be polyfilled in some environments
  NATIVE and assert.arity WeakMap::delete, 1
  assert.looksNative WeakMap::delete
  assert.nonEnumerable WeakMap::, \delete
  M = new WeakMap!
    ..set a = {}, 42
    ..set b = {}, 21
  assert.ok M.has(a) && M.has(b), 'WeakMap has values before .delete()'
  M.delete a
  assert.ok !M.has(a) && M.has(b), 'WeakMap hasn`t value after .delete()'
  assert.ok (try !M.delete 1), 'return false on primitive'

test 'WeakMap#get' (assert)!->
  assert.isFunction WeakMap::get
  assert.name WeakMap::get, \get
  NATIVE and assert.arity WeakMap::get, 1
  assert.looksNative WeakMap::get
  assert.nonEnumerable WeakMap::, \get
  M = new WeakMap!
  assert.strictEqual M.get({}), void, 'WeakMap .get() before .set() return undefined'
  M.set a = {}, 42
  assert.strictEqual M.get(a), 42, 'WeakMap .get() return value'
  M.delete a
  assert.strictEqual M.get(a), void, 'WeakMap .get() after .delete() return undefined'
  assert.ok (try void is M.get 1), 'return undefined on primitive'

test 'WeakMap#has' (assert)!->
  assert.isFunction WeakMap::has
  assert.name WeakMap::has, \has
  NATIVE and assert.arity WeakMap::has, 1
  assert.looksNative WeakMap::has
  assert.nonEnumerable WeakMap::, \has
  M = new WeakMap!
  assert.ok !M.has({}), 'WeakMap .has() before .set() return false'
  M.set a = {}, 42
  assert.ok M.has(a), 'WeakMap .has() return true'
  M.delete a
  assert.ok !M.has(a), 'WeakMap .has() after .delete() return false'
  assert.ok (try !M.has 1), 'return false on primitive'

test 'WeakMap#set' (assert)!->
  assert.isFunction WeakMap::set
  assert.name WeakMap::set, \set
  assert.arity WeakMap::set, 2
  assert.looksNative WeakMap::set
  assert.nonEnumerable WeakMap::, \set
  assert.same (new WeakMap!
    ..set a = {}, 42
  )get(a), 42, 'works with object as keys'
  assert.ok (try new WeakMap!set(42, 42); no; catch => on), 'throws with primitive keys'
  wmap = new WeakMap!
  assert.same wmap.set({}, 1), wmap, 'return this'

test 'WeakMap#@@toStringTag' (assert)!->
  assert.strictEqual WeakMap::[Symbol?toStringTag], \WeakMap, 'WeakMap::@@toStringTag is `WeakMap`'