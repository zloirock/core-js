{module, test} = QUnit
module \ES6

isFunction = -> typeof! it is \Function
{WeakSet} = core
{freeze} = core.Object
{values} = core.Array
{iterator} = core.Symbol

test 'WeakSet' (assert)->
  assert.ok isFunction(WeakSet), 'Is function'
  assert.ok \add    of WeakSet::, 'add in WeakSet.prototype'
  assert.ok \delete of WeakSet::, 'delete in WeakSet.prototype'
  assert.ok \has    of WeakSet::, 'has in WeakSet.prototype'
  assert.ok new WeakSet instanceof WeakSet, 'new WeakSet instanceof WeakSet'
  assert.ok new WeakSet(values [a = {}]).has(a), 'Init WeakSet from iterator #1'
  assert.ok new WeakSet([a = {}]).has(a), 'Init WeakSet from iterator #2'
  assert.ok new WeakSet([freeze f = {}]).has(f), 'Support frozen objects'
  S = new WeakSet
  S.add freeze f = {}
  assert.strictEqual S.has(f), on, 'works with frozen objects, #1'
  S.delete f
  assert.strictEqual S.has(f), no, 'works with frozen objects, #2'
  # return #throw
  done = no
  iter = values [null, 1, 2]
  iter.return = -> done := on
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

test 'WeakSet#add' (assert)->
  assert.ok isFunction(WeakSet::add), 'Is function'
  assert.ok (w = new WeakSet)add({}) is w, 'chaining'
  assert.ok (try new WeakSet!add(42); no; catch => on), 'throws with primitive keys'

test 'WeakSet#delete' (assert)->
  assert.ok isFunction(WeakSet::delete), 'Is function'
  S = new WeakSet!
    .add a = {}
    .add b = {}
  assert.ok S.has(a) && S.has(b), 'WeakSet has values before .delete()'
  S.delete a
  assert.ok !S.has(a) && S.has(b), 'WeakSet has`nt value after .delete()'

test 'WeakSet#has' (assert)->
  assert.ok isFunction(WeakSet::has), 'Is function'
  M = new WeakSet!
  assert.ok not M.has({}), 'WeakSet has`nt value'
  M.add a = {}
  assert.ok M.has(a), 'WeakSet has value after .add()'
  M.delete a
  assert.ok not M.has(a), 'WeakSet has`nt value after .delete()'

test 'WeakSet::@@toStringTag' (assert)->
  assert.strictEqual WeakSet::[core.Symbol?toStringTag], \WeakSet, 'WeakSet::@@toStringTag is `WeakSet`'