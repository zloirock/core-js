{module, test} = QUnit
module \ES

{WeakSet} = core
{freeze} = core.Object
{iterator} = core.Symbol

test 'WeakSet' (assert)!->
  assert.isFunction WeakSet
  assert.ok \add    of WeakSet::, 'add in WeakSet.prototype'
  assert.ok \delete of WeakSet::, 'delete in WeakSet.prototype'
  assert.ok \has    of WeakSet::, 'has in WeakSet.prototype'
  assert.ok new WeakSet instanceof WeakSet, 'new WeakSet instanceof WeakSet'
  assert.ok new WeakSet(createIterable [a = {}]).has(a), 'Init from iterable'
  assert.ok new WeakSet([freeze f = {}]).has(f), 'Support frozen objects'
  S = new WeakSet
  S.add freeze f = {}
  assert.strictEqual S.has(f), on, 'works with frozen objects, #1'
  S.delete f
  assert.strictEqual S.has(f), no, 'works with frozen objects, #2'
  # return #throw
  done = no
  iter = createIterable [null, 1, 2], return: -> done := on
  try => new WeakSet iter
  assert.ok done, '.return #throw'
  assert.ok !(\clear of WeakSet::), 'should not contains `.clear` method'
  # call @@iterator in Array with custom iterator
  a = []
  done = no
  a['@@iterator'] = void
  a[iterator] = ->
    done := on
    core.getIteratorMethod([])call @
  new WeakSet a
  assert.ok done
  o = {}
  new WeakSet!add o
  if DESCRIPTORS
    assert.arrayEqual [key for key of o], []
    assert.arrayEqual core.Object.keys(o), []
  assert.arrayEqual core.Object.getOwnPropertyNames(o), []
  assert.arrayEqual core.Object.getOwnPropertySymbols(o), []
  assert.arrayEqual core.Reflect.ownKeys(o), []
  if nativeSubclass
    C = nativeSubclass WeakSet
    assert.ok new C instanceof C, 'correct subclassing with native classes #1'
    assert.ok new C instanceof WeakSet, 'correct subclassing with native classes #2'
    assert.ok new C!add(O = {}).has(O), 'correct subclassing with native classes #3'

test 'WeakSet#add' (assert)!->
  assert.isFunction WeakSet::add
  assert.ok (w = new WeakSet)add({}) is w, 'chaining'
  assert.ok (try new WeakSet!add(42); no; catch => on), 'throws with primitive keys'

test 'WeakSet#delete' (assert)!->
  assert.isFunction WeakSet::delete
  S = new WeakSet!
    .add a = {}
    .add b = {}
  assert.ok S.has(a) && S.has(b), 'WeakSet has values before .delete()'
  S.delete a
  assert.ok !S.has(a) && S.has(b), 'WeakSet has`nt value after .delete()'
  assert.ok (try !S.delete 1), 'return false on primitive'

test 'WeakSet#has' (assert)!->
  assert.isFunction WeakSet::has
  M = new WeakSet!
  assert.ok not M.has({}), 'WeakSet has`nt value'
  M.add a = {}
  assert.ok M.has(a), 'WeakSet has value after .add()'
  M.delete a
  assert.ok not M.has(a), 'WeakSet hasn`t value after .delete()'
  assert.ok (try !M.has 1), 'return false on primitive'

test 'WeakSet::@@toStringTag' (assert)!->
  assert.strictEqual WeakSet::[core.Symbol?toStringTag], \WeakSet, 'WeakSet::@@toStringTag is `WeakSet`'