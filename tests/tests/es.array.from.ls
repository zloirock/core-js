{module, test} = QUnit
module \ES

test 'Array.from' (assert)!->
  {from, isArray} = Array
  {defineProperty} = Object
  iterator = Symbol?iterator
  assert.isFunction from
  assert.arity from, 1
  assert.name from, \from
  assert.looksNative from
  assert.nonEnumerable Array, \from
  for type, col of {'array-like': {length: \3, 0: \1, 1: \2, 2: \3}, arguments: (-> &)(\1 \2 \3), array: <[1 2 3]>, iterable: createIterable(<[1 2 3]>), string: \123}
    assert.arrayEqual from(col), <[1 2 3]>, "Works with #type"
    assert.arrayEqual from(col, (^2)), [1 4 9], "Works with #type  + mapFn"
  for type, col of {'array-like': {length: 1, 0: 1}, arguments: (-> &)(1), array: [1], iterable: createIterable([1]), string: \1}
    assert.arrayEqual (from col, (val, key)->
      assert.same @, ctx, "Works with #type, correct callback context"
      assert.same val, if type is \string => \1 else 1, "Works with #type, correct callback key"
      assert.same key, 0, "Works with #type, correct callback value"
      assert.same &length, 2, "Works with #type, correct callback arguments number"
      42
    , ctx = {}), [42], "Works with #type, correct result"
  for [no on 0]
    assert.arrayEqual from(..), [], "Works with #{..}"
  for [null void]
    assert.throws (!-> from ..), TypeError, "Throws on #{..}"
  assert.arrayEqual from('𠮷𠮷𠮷'), <[𠮷 𠮷 𠮷]>, 'Uses correct string iterator'
  # return #default
  done = on
  iter = createIterable [1 2 3], return: -> done := no
  from iter, -> return no
  assert.ok done, '.return #default'
  # return #throw
  done = no
  iter = createIterable [1 2 3], return: -> done := on
  try => from iter, -> throw 42
  assert.ok done, '.return #throw'
  # generic, iterable case
  F = !->
  inst = from.call F, createIterable [1 2]
  assert.ok inst instanceof F, 'generic, iterable case, instanceof'
  assert.arrayEqual inst, [1 2], 'generic, iterable case, elements'
  # generic, array-like case
  inst = from.call F, {0: 1, 1: 2, length: 2}
  assert.ok inst instanceof F, 'generic, array-like case, instanceof'
  assert.arrayEqual inst, [1 2], 'generic, array-like case, elements'
  # call @@iterator in Array with custom iterator
  a = [1 2 3]
  done = no
  a['@@iterator'] = void
  a[iterator] = ->
    done := on
    [][iterator]call @
  assert.arrayEqual from(a), [1 2 3], 'Array with custom iterator, elements'
  assert.ok done, 'call @@iterator in Array with custom iterator'
  array = [1 2 3]
  delete array.1
  assert.arrayEqual from(array, String), <[1 undefined 3]>, 'Ignores holes'
  assert.ok (try from {length: -1, 0: 1}, !-> throw 42), 'Uses ToLength'
  assert.arrayEqual from([], undefined), [], "Works with undefined as second argument"
  assert.throws (!-> from [], null), TypeError, "Throws with null as second argument"
  assert.throws (!-> from [], 0), TypeError, "Throws with 0 as second argument"
  assert.throws (!-> from [], ''), TypeError, "Throws with '' as second argument"
  assert.throws (!-> from [], no), TypeError, "Throws with false as second argument"
  assert.throws (!-> from [], {}), TypeError, "Throws with {} as second argument"
  if DESCRIPTORS
    called = no
    F = !->
    defineProperty F::, 0, set: !-> called = on
    from.call F, [1 2 3]
    assert.ok !called, 'Should not call prototype accessors'