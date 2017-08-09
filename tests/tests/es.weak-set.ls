{module, test} = QUnit
module \ES

{freeze} = Object

test 'WeakSet' (assert)!->
  assert.isFunction WeakSet
  assert.name WeakSet, \WeakSet
  assert.arity WeakSet, 0
  assert.looksNative WeakSet
  assert.ok \add    of WeakSet::, 'add in WeakSet.prototype'
  assert.ok \delete of WeakSet::, 'delete in WeakSet.prototype'
  assert.ok \has    of WeakSet::, 'has in WeakSet.prototype'
  assert.ok new WeakSet instanceof WeakSet, 'new WeakSet instanceof WeakSet'
  assert.ok new WeakSet(createIterable [a = {}]).has(a), 'Init from iterable'
  assert.ok (new WeakSet!
    ..add freeze f = {}
  ).has(f), 'Support frozen objects'
  S = new WeakSet
  S.add freeze f = {}
  assert.strictEqual S.has(f), on
  S.delete f
  assert.strictEqual S.has(f), no
  # return #throw
  done = no
  iter = createIterable [null, 1, 2], return: -> done := on
  try => new WeakSet iter
  assert.ok done, '.return #throw'
  assert.ok !(\clear of WeakSet::), 'should not contains `.clear` method'
  # call @@iterator in Array with custom iterator
  a = []
  done = no
  a[Symbol?iterator] = ->
    done := on
    [][Symbol?iterator]call @
  new WeakSet a
  assert.ok done
  o = {}
  new WeakSet!add o
  if DESCRIPTORS
    assert.arrayEqual [key for key of o], []
    assert.arrayEqual Object.keys(o), []
  assert.arrayEqual Object.getOwnPropertyNames(o), []
  Object?getOwnPropertySymbols and assert.arrayEqual Object.getOwnPropertySymbols(o), []
  Reflect?ownKeys and assert.arrayEqual Reflect.ownKeys(o), []
  if nativeSubclass
    C = nativeSubclass WeakSet
    assert.ok new C instanceof C, 'correct subclassing with native classes #1'
    assert.ok new C instanceof WeakSet, 'correct subclassing with native classes #2'
    assert.ok new C!add(O = {}).has(O), 'correct subclassing with native classes #3'

test 'WeakSet#add' (assert)!->
  assert.isFunction WeakSet::add
  assert.name WeakSet::add, \add
  assert.arity WeakSet::add, 1
  assert.looksNative WeakSet::add
  assert.nonEnumerable WeakSet::, \add
  assert.ok new WeakSet!add(a = {}), 'works with object as keys'
  assert.ok (try new WeakSet!add(42); no; catch => on), 'throws with primitive keys'
  wset = new WeakSet!
  assert.same wset.add({}), wset, 'return this'

test 'WeakSet#delete' (assert)!->
  assert.isFunction WeakSet::delete
  NATIVE and #assert.name WeakSet::delete, \delete # can't be polyfilled in some environments
  assert.arity WeakSet::delete, 1
  assert.looksNative WeakSet::delete
  assert.nonEnumerable WeakSet::, \delete
  S = new WeakSet!
    ..add a = {}
    ..add b = {}
  assert.ok S.has(a) && S.has(b), 'WeakSet has values before .delete()'
  S.delete a
  assert.ok !S.has(a) && S.has(b), 'WeakSet hasn`t value after .delete()'
  assert.ok (try !S.delete 1), 'return false on primitive'

test 'WeakSet#has' (assert)!->
  assert.isFunction WeakSet::has
  assert.name WeakSet::has, \has
  assert.arity WeakSet::has, 1
  assert.looksNative WeakSet::has
  assert.nonEnumerable WeakSet::, \has
  M = new WeakSet!
  assert.ok not M.has({}), 'WeakSet has`nt value'
  M.add a = {}
  assert.ok M.has(a), 'WeakSet has value after .add()'
  M.delete a
  assert.ok not M.has(a), 'WeakSet has`nt value after .delete()'
  assert.ok (try !M.has 1), 'return false on primitive'

test 'WeakSet::@@toStringTag' (assert)!->
  assert.strictEqual WeakSet::[Symbol?toStringTag], \WeakSet, 'WeakSet::@@toStringTag is `WeakSet`'