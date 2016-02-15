{module, test} = QUnit
module 'core-js'

test 'Object.define' (assert)!->
  {define, defineProperty} = core.Object
  assert.isFunction define
  foo = q:1
  assert.ok foo is define foo, w:2
  assert.ok foo.w is 2
  if DESCRIPTORS
    foo = q:1
    foo2 = defineProperty {}, \w, get: -> @q + 1
    define foo, foo2
    assert.ok foo.w is 2