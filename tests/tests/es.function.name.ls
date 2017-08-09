if DESCRIPTORS
  {module, test} = QUnit
  module \ES

  test 'Function#name' (assert)!->
    assert.ok \name of Function::
    assert.nonEnumerable Function::, \name
    assert.same (function foo => it).name, \foo
    assert.same (->).name, ''
    if Object.freeze
      assert.same Object.freeze(->).name, ''
    fn = ->
    fn.toString = -> throw 42
    assert.ok try
      fn.name
      on
    fn = Object ->
    fn.toString = -> ''
    assert.same fn.name, ''