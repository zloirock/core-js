{module, test} = QUnit
module 'ESNext'

{create} = core.Object

test 'Object.getOwnPropertyDescriptors' (assert)!->
  {getOwnPropertyDescriptors} = core.Object
  assert.isFunction getOwnPropertyDescriptors
  O = create {q: 1}, e: value: 3
  O.w = 2
  s = core.Symbol \s
  O[s] = 4
  descs = getOwnPropertyDescriptors O
  assert.strictEqual descs.q, void
  assert.deepEqual descs.w, {+enumerable, +configurable, +writable, value: 2}
  if DESCRIPTORS =>
    assert.deepEqual descs.e, {-enumerable, -configurable, -writable, value: 3}
  else
    assert.deepEqual descs.e, {+enumerable, +configurable, +writable, value: 3}
  assert.strictEqual descs[s].value, 4