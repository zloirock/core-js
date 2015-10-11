{module, test} = QUnit
module \ES6

test 'Array.from' (assert)->
  {from} = core.Array
  {iterator} = core.Symbol
  assert.isFunction from
  assert.arity from, 1
  assert.deepEqual from(\123), <[1 2 3]>
  assert.deepEqual from({length: 3, 0: 1, 1: 2, 2: 3}), [1 2 3]
  from al = (-> &)(1), (val, key)->
    assert.strictEqual @, ctx
    assert.strictEqual val, 1
    assert.strictEqual key, 0
  , ctx = {}
  from [1], (val, key)->
    assert.strictEqual @, ctx
    assert.strictEqual val, 1
    assert.strictEqual key, 0
  , ctx = {}
  assert.deepEqual from({length: 3, 0: 1, 1: 2, 2: 3}, (^2)), [1 4 9]
  assert.deepEqual from(createIterable [1 2 3]), [1 2 3], 'Works with iterables'
  assert.throws (-> from null), TypeError
  assert.throws (-> from void), TypeError
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
  inst = from.call F, createIterable [1, 2]
  assert.ok inst instanceof F
  assert.strictEqual inst.0, 1
  assert.strictEqual inst.1, 2
  assert.strictEqual inst.length, 2
  # generic, array-like case
  inst = from.call F, {0: 1, 1: 2, length: 2}
  assert.ok inst instanceof F
  assert.strictEqual inst.0, 1
  assert.strictEqual inst.1, 2
  assert.strictEqual inst.length, 2
  # call @@iterator in Array with custom iterator
  a = [1 2 3]
  done = no
  a['@@iterator'] = void
  a[iterator] = ->
    done := on
    core.getIteratorMethod([])call @
  assert.deepEqual from(a), [1 2 3]
  assert.ok done