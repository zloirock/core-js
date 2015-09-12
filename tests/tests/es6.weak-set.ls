{module, test} = QUnit
module \ES6

isFunction = -> typeof! it is \Function

{freeze} = Object
{iterator} = Symbol

test 'WeakSet' (assert)->
  assert.ok isFunction(WeakSet), 'Is function'
  assert.ok /native code/.test(WeakSet), 'looks like native'
  assert.strictEqual WeakSet.name, \WeakSet, 'name is "WeakSet"'
  assert.strictEqual WeakSet.length, 0, 'length is 0'
  assert.ok \add    of WeakSet::, 'add in WeakSet.prototype'
  assert.ok \delete of WeakSet::, 'delete in WeakSet.prototype'
  assert.ok \has    of WeakSet::, 'has in WeakSet.prototype'
  assert.ok new WeakSet instanceof WeakSet, 'new WeakSet instanceof WeakSet'
  assert.ok new WeakSet([a = {}].values!).has(a), 'Init WeakSet from iterator #1'
  assert.ok new WeakSet([a = {}]).has(a), 'Init WeakSet from iterator #2'
  assert.ok new WeakSet([freeze f = {}]).has(f), 'Support frozen objects'
  S = new WeakSet
  S.add freeze f = {}
  assert.strictEqual S.has(f), on
  S.delete f
  assert.strictEqual S.has(f), no
  # return #throw
  done = no
  iter = [null, 1, 2]values!
  iter.return = -> done := on
  try => new WeakSet iter
  assert.ok done, '.return #throw'
  assert.ok !(\clear of WeakSet::), 'should not contains `.clear` method'
  # call @@iterator in Array with custom iterator
  a = []
  done = no
  a[iterator] = ->
    done := on
    [][iterator]call @
  new WeakSet a
  assert.ok done

test 'WeakSet#add' (assert)->
  assert.ok isFunction(WeakSet::add), 'Is function'
  assert.ok /native code/.test(WeakSet::add), 'looks like native'
  assert.ok new WeakSet!add(a = {}), 'WeakSet.prototype.add works with object as keys'
  assert.ok (try new WeakSet!add(42); no; catch => on), 'WeakSet.prototype.add throw with primitive keys'

test 'WeakSet#delete' (assert)->
  assert.ok isFunction(WeakSet::delete), 'Is function'
  assert.ok /native code/.test(WeakSet::delete), 'looks like native'
  S = new WeakSet!
    .add a = {}
    .add b = {}
  assert.ok S.has(a) && S.has(b), 'WeakSet has values before .delete()'
  S.delete a
  assert.ok !S.has(a) && S.has(b), 'WeakSet has`nt value after .delete()'

test 'WeakSet#has' (assert)->
  assert.ok isFunction(WeakSet::has), 'Is function'
  assert.ok /native code/.test(WeakSet::has), 'looks like native'
  M = new WeakSet!
  assert.ok not M.has({}), 'WeakSet has`nt value'
  M.add a = {}
  assert.ok M.has(a), 'WeakSet has value after .add()'
  M.delete a
  assert.ok not M.has(a), 'WeakSet has`nt value after .delete()'

test 'WeakSet::@@toStringTag' (assert)->
  assert.strictEqual WeakSet::[Symbol?toStringTag], \WeakSet, 'WeakSet::@@toStringTag is `WeakSet`'