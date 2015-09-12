{module, test} = QUnit
module \ES6

isFunction = -> typeof! it is \Function

{freeze} = Object
{iterator} = Symbol

test 'WeakMap' (assert)->
  assert.ok isFunction(WeakMap), 'is function'
  assert.ok /native code/.test(WeakMap), 'looks like native'
  assert.strictEqual WeakMap.name, \WeakMap, 'name is "WeakMap"'
  assert.strictEqual WeakMap.length, 0, 'arity is 0'
  assert.ok \delete of WeakMap::, 'delete in WeakMap.prototype'
  assert.ok \get    of WeakMap::, 'get in WeakMap.prototype'
  assert.ok \has    of WeakMap::, 'has in WeakMap.prototype'
  assert.ok \set    of WeakMap::, 'set in WeakMap.prototype'
  assert.ok new WeakMap instanceof WeakMap, 'new WeakMap instanceof WeakMap'
  assert.strictEqual new WeakMap([[a = {}, b = {}]].values!).get(a), b, 'Init WeakMap from iterator #1'
  assert.strictEqual new WeakMap(new Map([[a = {}, b = {}]])).get(a), b, 'Init WeakMap from iterator #2'
  assert.strictEqual new WeakMap([[f = freeze({}), 42]]).get(f), 42, 'Support frozen objects'
  M = new WeakMap
  M.set freeze(f = {}), 42
  assert.strictEqual M.has(f), on
  assert.strictEqual M.get(f), 42
  M.delete f
  assert.strictEqual M.has(f), no
  assert.strictEqual M.get(f), void
  # return #throw
  done = no
  iter = [null, 1, 2]values!
  iter.return = -> done := on
  try => new WeakMap iter
  assert.ok done, '.return #throw'
  assert.ok !(\clear of WeakMap::), 'should not contains `.clear` method'
  # call @@iterator in Array with custom iterator
  a = []
  done = no
  a[iterator] = ->
    done := on
    [][iterator]call @
  new WeakMap a
  assert.ok done

test 'WeakMap#delete' (assert)->
  assert.ok isFunction(WeakMap::delete), 'is function'
  #assert.strictEqual WeakMap::delete.name, \delete, 'name is "delete"' # can't be polyfilled in some environments
  #assert.strictEqual WeakMap::delete.length, 1, 'arity is 1'
  assert.ok /native code/.test(WeakMap::delete), 'looks like native'
  M = new WeakMap!
    .set a = {}, 42
    .set b = {}, 21
  assert.ok M.has(a) && M.has(b), 'WeakMap has values before .delete()'
  M.delete a
  assert.ok !M.has(a) && M.has(b), 'WeakMap hasn`t value after .delete()'

test 'WeakMap#get' (assert)->
  assert.ok isFunction(WeakMap::get), 'is function'
  assert.strictEqual WeakMap::get.name, \get, 'name is "get"'
  #assert.strictEqual WeakMap::get.length, 1, 'arity is 1'
  assert.ok /native code/.test(WeakMap::get), 'looks like native'
  M = new WeakMap!
  assert.strictEqual M.get({}), void, 'WeakMap .get() before .set() return undefined'
  M.set a = {}, 42
  assert.strictEqual M.get(a), 42, 'WeakMap .get() return value'
  M.delete a
  assert.strictEqual M.get(a), void, 'WeakMap .get() after .delete() return undefined'

test 'WeakMap#has' (assert)->
  assert.ok isFunction(WeakMap::has), 'is function'
  assert.strictEqual WeakMap::has.name, \has, 'name is "has"'
  #assert.strictEqual WeakMap::has.length, 1, 'arity is 1'
  assert.ok /native code/.test(WeakMap::has), 'looks like native'
  M = new WeakMap!
  assert.ok !M.has({}), 'WeakMap .has() before .set() return false'
  M.set a = {}, 42
  assert.ok M.has(a), 'WeakMap .has() return true'
  M.delete a
  assert.ok !M.has(a), 'WeakMap .has() after .delete() return false'

test 'WeakMap#set' (assert)->
  assert.ok isFunction(WeakMap::set), 'is function'
  assert.strictEqual WeakMap::set.name, \set, 'name is "set"'
  assert.strictEqual WeakMap::set.length, 2, 'arity is 2'
  assert.ok /native code/.test(WeakMap::set), 'looks like native'
  assert.ok new WeakMap!set(a = {}, 42), 'WeakMap.prototype.set works with object as keys'
  assert.ok (try new WeakMap!set(42, 42); no; catch => on), 'WeakMap.prototype.set throw with primitive keys'

test 'WeakMap#@@toStringTag' (assert)->
  assert.strictEqual WeakMap::[Symbol?toStringTag], \WeakMap, 'WeakMap::@@toStringTag is `WeakMap`'