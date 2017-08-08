{module, test} = QUnit
module 'ESNext'

test 'Array#flatMap' (assert)!->
  {flatMap} = core.Array
  assert.isFunction flatMap
  assert.deepEqual flatMap([], -> it), []
  assert.deepEqual flatMap([1 2 3], -> it), [1 2 3]
  assert.deepEqual flatMap([1 2 3], -> [it, it]), [1 1 2 2 3 3]
  assert.deepEqual flatMap([1 2 3], -> [[it], [it]]), [[1], [1], [2], [2], [3], [3]]
  assert.deepEqual flatMap([1, [2 3]], -> 1), [1 1]
  element = void
  index = void
  context = void
  target = void
  array = [1]
  flatMap array, ($element, $index, $target)!->
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
    assert.throws (!-> flatMap null, -> it), TypeError
    assert.throws (!-> flatMap void, -> it), TypeError
  if NATIVE and DESCRIPTORS
    assert.ok (try no is flatMap core.Object.defineProperty({length: -1}, 0, get: -> throw Error!), -> it), 'uses ToLength'
