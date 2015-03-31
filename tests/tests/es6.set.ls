QUnit.module 'ES6 Set'

isFunction = -> typeof! it is \Function
isIterator = -> typeof it is \object && isFunction it.next

same = (a, b)-> if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b
{getOwnPropertyDescriptor, freeze} = Object

eq = strictEqual
deq = deepEqual

test 'Set' !->
  ok isFunction(Set), 'Is function'
  ok \add     of Set::, 'add in Set.prototype'
  ok \clear   of Set::, 'clear in Set.prototype'
  ok \delete  of Set::, 'delete in Set.prototype'
  ok \forEach of Set::, 'forEach in Set.prototype'
  ok \has     of Set::, 'has in Set.prototype'
  ok new Set instanceof Set, 'new Set instanceof Set'
  eq new Set([1 2 3 2 1]values!).size, 3, 'Init from iterator #1'
  eq new Set([1 2 3 2 1]).size, 3, 'Init Set from iterator #2'
  eq new Set([freeze({}), 1]).size, 2, 'Support frozen objects'
  S = new Set [1 2 3 2 1]
  eq S.size, 3
  r = []
  S.forEach (v)-> r.push v
  deq r, [1 2 3]
  eq new Set([NaN, NaN, NaN])size, 1
  if Array.from => deq Array.from(new Set([3 4]).add 2 .add 1), [3 4 2 1]
  # return #throw
  done = no
  iter = [null, 1, 2]values!
  iter.return = -> done := on
  _add = Set::add
  Set::add = -> throw 42
  try => new Set iter
  Set::add = _add
  ok done, '.return #throw'
test 'Set#add' !->
  ok isFunction(Set::add), 'Is function'
  a = []
  S = new Set [NaN, 2 3 2 1 a]
  eq S.size, 5
  chain = S.add NaN
  eq chain, S
  eq S.size, 5
  S.add 2
  eq S.size, 5
  S.add a
  eq S.size, 5
  S.add []
  eq S.size, 6
  S.add 4
  eq S.size, 7
  S = new Set!add freeze f = {}
  ok S.has f
test 'Set#clear' !->
  ok isFunction(Set::clear), 'Is function'
  S = new Set
  S.clear!
  eq S.size, 0
  S = new Set [1 2 3 2 1]
  S.clear!
  eq S.size, 0
  ok !S.has 1
  ok !S.has 2
  ok !S.has 3
  S = new Set [1 f = freeze {}]
  S.clear!
  eq S.size, 0, 'Support frozen objects'
  ok !S.has 1
  ok !S.has f
test 'Set#delete' !->
  ok isFunction(Set::delete), 'Is function'
  a = []
  S = new Set [NaN, 2 3 2 1 a]
  eq S.size, 5
  eq S.delete(NaN), on
  eq S.size, 4
  eq S.delete(4), no
  eq S.size, 4
  S.delete []
  eq S.size, 4
  S.delete a
  eq S.size, 3
  S.add freeze(f = {})
  eq S.size, 4
  S.delete f
  eq S.size, 3
test 'Set#forEach' !->
  ok isFunction(Set::forEach), 'Is function'
  r = []
  count = 0
  S = new Set [1 2 3 2 1]
  S.forEach (value)!->
    count++
    r.push value
  eq count, 3
  deq r, [1 2 3]
  set = new Set <[0 1 2 3]>
  s = "";
  set.forEach ->
    s += it;
    if it is \2
      set.delete \2
      set.delete \3
      set.delete \1
      set.add \4
  eq s, \0124
  set = new Set <[0]>
  s = "";
  set.forEach ->
    set.delete \0
    if s isnt '' => throw '!!!'
    s += it
  eq s, \0
test 'Set#has' !->
  ok isFunction(Set::has), 'Is function'
  a = []
  f = freeze {}
  S = new Set [NaN, 2 3 2 1 f, a]
  ok S.has NaN
  ok S.has a
  ok S.has f
  ok S.has 2
  ok not S.has 4
  ok not S.has []
test 'Set#size' !->
  size = new Set([1]).size
  eq typeof size, \number, 'size is number'
  eq size, 1, 'size is correct'
  if /\[native code\]\s*\}\s*$/.test Object.defineProperty
    sizeDesc = getOwnPropertyDescriptor Set::, \size
    ok sizeDesc && sizeDesc.get, 'size is getter'
    ok sizeDesc && !sizeDesc.set, 'size isnt setter'
    throws (-> Set::size), TypeError
test 'Set & -0' !->
  set = new Set
  set.add -0
  eq set.size, 1
  ok set.has 0
  ok set.has -0
  set.forEach (it)->
    ok !same it, -0
  set.delete -0
  eq set.size, 0
  set = new Set [-0]
  set.forEach (key)->
    ok !same key, -0
test 'Set#@@toStringTag' !->
  eq Set::[Symbol?toStringTag], \Set, 'Set::@@toStringTag is `Set`'

test 'Set Iterator' !->
  set = new Set <[a b c d]>
  keys = []
  iterator = set.keys!
  keys.push iterator.next!value
  ok set.delete \a
  ok set.delete \b
  ok set.delete \c
  set.add \e
  keys.push iterator.next!value
  keys.push iterator.next!value
  ok iterator.next!done
  set.add \f
  ok iterator.next!done
  deq keys, <[a d e]>
test 'Set#keys' !->
  ok typeof Set::keys is \function, 'Is function'
  eq Set::keys, Set::values
  iter = new Set(<[q w e]>)keys!
  ok isIterator(iter), 'Return iterator'
  eq iter[Symbol?toStringTag], 'Set Iterator'
  deq iter.next!, {value: \q, done: no}
  deq iter.next!, {value: \w, done: no}
  deq iter.next!, {value: \e, done: no}
  deq iter.next!, {value: void, done: on}
test 'Set#values' !->
  ok typeof Set::values is \function, 'Is function'
  iter = new Set(<[q w e]>)values!
  ok isIterator(iter), 'Return iterator'
  eq iter[Symbol?toStringTag], 'Set Iterator'
  deq iter.next!, {value: \q, done: no}
  deq iter.next!, {value: \w, done: no}
  deq iter.next!, {value: \e, done: no}
  deq iter.next!, {value: void, done: on}
test 'Set#entries' !->
  ok typeof Set::entries is \function, 'Is function'
  iter = new Set(<[q w e]>)entries!
  ok isIterator(iter), 'Return iterator'
  eq iter[Symbol?toStringTag], 'Set Iterator'
  deq iter.next!, {value: [\q \q], done: no}
  deq iter.next!, {value: [\w \w], done: no}
  deq iter.next!, {value: [\e \e], done: no}
  deq iter.next!, {value: void, done: on}
test 'Set#@@iterator' !->
  ok typeof Set::[Symbol?iterator] is \function, 'Is function'
  eq Set::[Symbol?iterator], Set::values
  iter = new Set(<[q w e]>)[Symbol?iterator]!
  ok isIterator(iter), 'Return iterator'
  eq iter[Symbol?toStringTag], 'Set Iterator'
  deq iter.next!, {value: \q, done: no}
  deq iter.next!, {value: \w, done: no}
  deq iter.next!, {value: \e, done: no}
  deq iter.next!, {value: void, done: on}