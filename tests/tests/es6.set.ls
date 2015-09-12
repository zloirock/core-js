{module, test} = QUnit
module \ES6

isFunction = -> typeof! it is \Function
isIterator = -> typeof it is \object && isFunction it.next

same = (a, b)-> if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b
{getOwnPropertyDescriptor, freeze} = Object
{iterator} = Symbol

test 'Set' (assert)->
  assert.ok isFunction(Set), 'Is function'
  assert.ok /native code/.test(Set), 'looks like native'
  assert.strictEqual Set.name, \Set, 'name is "Set"'
  assert.strictEqual Set.length, 0, 'length is 0'
  assert.ok \add     of Set::, 'add in Set.prototype'
  assert.ok \clear   of Set::, 'clear in Set.prototype'
  assert.ok \delete  of Set::, 'delete in Set.prototype'
  assert.ok \forEach of Set::, 'forEach in Set.prototype'
  assert.ok \has     of Set::, 'has in Set.prototype'
  assert.ok new Set instanceof Set, 'new Set instanceof Set'
  assert.strictEqual new Set([1 2 3 2 1]values!).size, 3, 'Init from iterator #1'
  assert.strictEqual new Set([1 2 3 2 1]).size, 3, 'Init Set from iterator #2'
  assert.strictEqual new Set([freeze({}), 1]).size, 2, 'Support frozen objects'
  S = new Set [1 2 3 2 1]
  assert.strictEqual S.size, 3
  r = []
  S.forEach (v)-> r.push v
  assert.deepEqual r, [1 2 3]
  assert.strictEqual new Set([NaN, NaN, NaN])size, 1
  if Array.from => assert.deepEqual Array.from(new Set([3 4]).add 2 .add 1), [3 4 2 1]
  # return #throw
  done = no
  iter = [null, 1, 2]values!
  iter.return = -> done := on
  _add = Set::add
  Set::add = -> throw 42
  try => new Set iter
  Set::add = _add
  assert.ok done, '.return #throw'
  # call @@iterator in Array with custom iterator
  a = []
  done = no
  a[iterator] = ->
    done := on
    [][iterator]call @
  new Set a
  assert.ok done

test 'Set#add' (assert)->
  assert.ok isFunction(Set::add), 'Is function'
  assert.ok /native code/.test(Set::add), 'looks like native'
  a = []
  S = new Set [NaN, 2 3 2 1 a]
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
  S = new Set!add freeze f = {}
  assert.ok S.has f

test 'Set#clear' (assert)->
  assert.ok isFunction(Set::clear), 'Is function'
  assert.ok /native code/.test(Set::clear), 'looks like native'
  S = new Set
  S.clear!
  assert.strictEqual S.size, 0
  S = new Set [1 2 3 2 1]
  S.clear!
  assert.strictEqual S.size, 0
  assert.ok !S.has 1
  assert.ok !S.has 2
  assert.ok !S.has 3
  S = new Set [1 f = freeze {}]
  S.clear!
  assert.strictEqual S.size, 0, 'Support frozen objects'
  assert.ok !S.has 1
  assert.ok !S.has f

test 'Set#delete' (assert)->
  assert.ok isFunction(Set::delete), 'Is function'
  assert.ok /native code/.test(Set::delete), 'looks like native'
  a = []
  S = new Set [NaN, 2 3 2 1 a]
  assert.strictEqual S.size, 5
  assert.strictEqual S.delete(NaN), on
  assert.strictEqual S.size, 4
  assert.strictEqual S.delete(4), no
  assert.strictEqual S.size, 4
  S.delete []
  assert.strictEqual S.size, 4
  S.delete a
  assert.strictEqual S.size, 3
  S.add freeze(f = {})
  assert.strictEqual S.size, 4
  S.delete f
  assert.strictEqual S.size, 3

test 'Set#forEach' (assert)->
  assert.ok isFunction(Set::forEach), 'Is function'
  assert.ok /native code/.test(Set::forEach), 'looks like native'
  r = []
  count = 0
  S = new Set [1 2 3 2 1]
  S.forEach (value)!->
    count++
    r.push value
  assert.strictEqual count, 3
  assert.deepEqual r, [1 2 3]
  set = new Set <[0 1 2 3]>
  s = "";
  set.forEach ->
    s += it;
    if it is \2
      set.delete \2
      set.delete \3
      set.delete \1
      set.add \4
  assert.strictEqual s, \0124
  set = new Set <[0]>
  s = "";
  set.forEach ->
    set.delete \0
    if s isnt '' => throw '!!!'
    s += it
  assert.strictEqual s, \0

test 'Set#has' (assert)->
  assert.ok isFunction(Set::has), 'Is function'
  assert.ok /native code/.test(Set::has), 'looks like native'
  a = []
  f = freeze {}
  S = new Set [NaN, 2 3 2 1 f, a]
  assert.ok S.has NaN
  assert.ok S.has a
  assert.ok S.has f
  assert.ok S.has 2
  assert.ok not S.has 4
  assert.ok not S.has []

test 'Set#size' (assert)->
  size = new Set([1]).size
  assert.strictEqual typeof size, \number, 'size is number'
  assert.strictEqual size, 1, 'size is correct'
  if (-> try 2 == Object.defineProperty({}, \a, get: -> 2)a)!
    sizeDesc = getOwnPropertyDescriptor Set::, \size
    assert.ok sizeDesc && sizeDesc.get, 'size is getter'
    assert.ok sizeDesc && !sizeDesc.set, 'size isnt setter'
    assert.throws (-> Set::size), TypeError

test 'Set & -0' (assert)->
  set = new Set
  set.add -0
  assert.strictEqual set.size, 1
  assert.ok set.has 0
  assert.ok set.has -0
  set.forEach (it)->
    assert.ok !same it, -0
  set.delete -0
  assert.strictEqual set.size, 0
  set = new Set [-0]
  set.forEach (key)->
    assert.ok !same key, -0

test 'Set#@@toStringTag' (assert)->
  assert.strictEqual Set::[Symbol?toStringTag], \Set, 'Set::@@toStringTag is `Set`'

test 'Set Iterator' (assert)->
  set = new Set <[a b c d]>
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

test 'Set#keys' (assert)->
  assert.ok typeof Set::keys is \function, 'Is function'
  assert.ok /native code/.test(Set::keys), 'looks like native'
  assert.strictEqual Set::keys, Set::values
  iter = new Set(<[q w e]>)keys!
  assert.ok isIterator(iter), 'Return iterator'
  assert.strictEqual iter[Symbol?toStringTag], 'Set Iterator'
  assert.deepEqual iter.next!, {value: \q, done: no}
  assert.deepEqual iter.next!, {value: \w, done: no}
  assert.deepEqual iter.next!, {value: \e, done: no}
  assert.deepEqual iter.next!, {value: void, done: on}

test 'Set#values' (assert)->
  assert.ok typeof Set::values is \function, 'Is function'
  assert.ok /native code/.test(Set::values), 'looks like native'
  iter = new Set(<[q w e]>)values!
  assert.ok isIterator(iter), 'Return iterator'
  assert.strictEqual iter[Symbol?toStringTag], 'Set Iterator'
  assert.deepEqual iter.next!, {value: \q, done: no}
  assert.deepEqual iter.next!, {value: \w, done: no}
  assert.deepEqual iter.next!, {value: \e, done: no}
  assert.deepEqual iter.next!, {value: void, done: on}

test 'Set#entries' (assert)->
  assert.ok typeof Set::entries is \function, 'Is function'
  assert.ok /native code/.test(Set::entries), 'looks like native'
  iter = new Set(<[q w e]>)entries!
  assert.ok isIterator(iter), 'Return iterator'
  assert.strictEqual iter[Symbol?toStringTag], 'Set Iterator'
  assert.deepEqual iter.next!, {value: [\q \q], done: no}
  assert.deepEqual iter.next!, {value: [\w \w], done: no}
  assert.deepEqual iter.next!, {value: [\e \e], done: no}
  assert.deepEqual iter.next!, {value: void, done: on}

test 'Set#@@iterator' (assert)->
  assert.ok typeof Set::[Symbol?iterator] is \function, 'Is function'
  assert.ok /native code/.test(Set::[Symbol?iterator]), 'looks like native'
  assert.strictEqual Set::[Symbol?iterator], Set::values
  iter = new Set(<[q w e]>)[Symbol?iterator]!
  assert.ok isIterator(iter), 'Return iterator'
  assert.strictEqual iter[Symbol?toStringTag], 'Set Iterator'
  assert.deepEqual iter.next!, {value: \q, done: no}
  assert.deepEqual iter.next!, {value: \w, done: no}
  assert.deepEqual iter.next!, {value: \e, done: no}
  assert.deepEqual iter.next!, {value: void, done: on}