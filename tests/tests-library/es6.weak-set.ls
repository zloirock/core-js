QUnit.module 'ES6 WeakSet'

isFunction = -> typeof! it is \Function

{WeakSet} = core
{freeze} = core.Object
{values} = core.Array

eq = strictEqual

test 'WeakSet' !->
  ok isFunction(WeakSet), 'Is function'
  ok \add    of WeakSet::, 'add in WeakSet.prototype'
  ok \delete of WeakSet::, 'delete in WeakSet.prototype'
  ok \has    of WeakSet::, 'has in WeakSet.prototype'
  ok new WeakSet instanceof WeakSet, 'new WeakSet instanceof WeakSet'
  ok new WeakSet(values [a = {}]).has(a), 'Init WeakSet from iterator #1'
  ok new WeakSet([a = {}]).has(a), 'Init WeakSet from iterator #2'
  ok new WeakSet([freeze f = {}]).has(f), 'Support frozen objects'
  S = new WeakSet
  S.add freeze f = {}
  eq S.has(f), on
  S.delete f
  eq S.has(f), no
  # return #throw
  done = no
  iter = values [null, 1, 2]
  iter.return = -> done := on
  try => new WeakSet iter
  ok done, '.return #throw'
test 'WeakSet#add' !->
  ok isFunction(WeakSet::add), 'Is function'
  ok new WeakSet!add(a = {}), 'WeakSet.prototype.add works with object as keys'
  ok (try new WeakSet!add(42); no; catch => on), 'WeakSet.prototype.add throw with primitive keys'
test 'WeakSet#delete' !->
  ok isFunction(WeakSet::delete), 'Is function'
  S = new WeakSet!
    .add a = {}
    .add b = {}
  ok S.has(a) && S.has(b), 'WeakSet has values before .delete()'
  S.delete a
  ok !S.has(a) && S.has(b), 'WeakSet has`nt value after .delete()'
test 'WeakSet#has' !->
  ok isFunction(WeakSet::has), 'Is function'
  M = new WeakSet!
  ok not M.has({}), 'WeakSet has`nt value'
  M.add a = {}
  ok M.has(a), 'WeakSet has value after .add()'
  M.delete a
  ok not M.has(a), 'WeakSet has`nt value after .delete()'
test 'WeakSet::@@toStringTag' !->
  eq WeakSet::[core.Symbol?toStringTag], \WeakSet, 'WeakSet::@@toStringTag is `WeakSet`'