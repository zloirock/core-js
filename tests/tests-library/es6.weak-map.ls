QUnit.module 'ES6 WeakMap'

isFunction = -> typeof! it is \Function

{WeakMap, Map} = core
{freeze} = core.Object
{values} = core.Array

eq = strictEqual

test 'WeakMap' !->
  ok isFunction(WeakMap), 'Is function'
  ok \delete of WeakMap::, 'delete in WeakMap.prototype'
  ok \get    of WeakMap::, 'get in WeakMap.prototype'
  ok \has    of WeakMap::, 'has in WeakMap.prototype'
  ok \set    of WeakMap::, 'set in WeakMap.prototype'
  ok new WeakMap instanceof WeakMap, 'new WeakMap instanceof WeakMap'
  eq new WeakMap(values [[a = {}, b = {}]]).get(a), b, 'Init WeakMap from iterator #1'
  eq new WeakMap(new Map([[a = {}, b = {}]])).get(a), b, 'Init WeakMap from iterator #2'
  eq new WeakMap([[f = freeze({}), 42]]).get(f), 42, 'Support frozen objects'
  M = new WeakMap
  M.set freeze(f = {}), 42
  eq M.has(f), on, 'works with frozen objects, #1'
  eq M.get(f), 42, 'works with frozen objects, #2'
  M.delete f
  eq M.has(f), no, 'works with frozen objects, #3'
  eq M.get(f), void, 'works with frozen objects, #4'
  # return #throw
  done = no
  iter = values [null, 1, 2]
  iter.return = -> done := on
  try => new WeakMap iter
  ok done, '.return #throw'
  ok !(\clear of WeakMap::), 'should not contains `.clear` method'
test 'WeakMap#delete' !->
  ok isFunction(WeakMap::delete), 'Is function'
  M = new WeakMap [[a = {}, 42], [b = {}, 21]]
  ok M.has(a) && M.has(b), 'WeakMap has values before .delete()'
  M.delete a
  ok !M.has(a) && M.has(b), 'WeakMap hasn`t value after .delete()'
test 'WeakMap#get' !->
  ok isFunction(WeakMap::get), 'Is function'
  M = new WeakMap!
  eq M.get({}), void, 'WeakMap .get() before .set() return undefined'
  M.set a = {}, 42
  eq M.get(a), 42, 'WeakMap .get() return value'
  M.delete a
  eq M.get(a), void, 'WeakMap .get() after .delete() return undefined'
test 'WeakMap#has' !->
  ok isFunction(WeakMap::has), 'Is function'
  M = new WeakMap!
  ok !M.has({}), 'WeakMap .has() before .set() return false'
  M.set a = {}, 42
  ok M.has(a), 'WeakMap .has() return true'
  M.delete a
  ok !M.has(a), 'WeakMap .has() after .delete() return false'
test 'WeakMap#set' !->
  ok isFunction(WeakMap::set), 'Is function'
  ok (w = new WeakMap)set(a = {}, 42) is w, 'chaining'
  ok (try new WeakMap!set(42, 42); no; catch => on), 'throws with primitive keys'
test 'WeakMap#@@toStringTag' !->
  eq WeakMap::[core.Symbol?toStringTag], \WeakMap, 'WeakMap::@@toStringTag is `WeakMap`'