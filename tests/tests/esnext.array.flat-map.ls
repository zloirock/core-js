{module, test} = QUnit
module \ESNext

test 'Array#flatMap' (assert)!->
  assert.isFunction Array::flatMap
  assert.name Array::flatMap, \flatMap
  assert.arity Array::flatMap, 1
  assert.looksNative Array::flatMap
  assert.nonEnumerable Array::, \flatMap
  assert.deepEqual []flatMap(-> it), []
  assert.deepEqual [1 2 3]flatMap(-> it), [1 2 3]
  assert.deepEqual [1 2 3]flatMap(-> [it, it]), [1 1 2 2 3 3]
  assert.deepEqual [1 2 3]flatMap(-> [[it], [it]]), [[1], [1], [2], [2], [3], [3]]
  assert.deepEqual [1, [2 3]]flatMap(-> 1), [1 1]
  element = void
  index = void
  context = void
  target = void
  array = [1]
  array.flatMap ($element, $index, $target)!->
    element := $element
    index := $index
    target := $target
    context := @
    return element
  , $context = {}
  assert.same element, 1
  assert.same index, 0
  assert.same target, array
  assert.same context, $context
  if STRICT
    assert.throws (!-> Array::flatMap.call null, -> it), TypeError
    assert.throws (!-> Array::flatMap.call void, -> it), TypeError
  if NATIVE and DESCRIPTORS
    assert.ok (try no is Array::flatMap.call Object.defineProperty({length: -1}, 0, get: -> throw Error!), -> it), 'uses ToLength'
  assert.ok \flatMap of Array::[Symbol.unscopables], 'In Array#@@unscopables'
