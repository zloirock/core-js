if DESCRIPTORS
  {module, test} = QUnit
  module \ES6

  test 'Function#name' (assert)!->
    assert.ok \name of Function::
    assert.nonEnumerable Function::, \name
    assert.strictEqual (function foo => it).name, \foo
    assert.strictEqual (->).name, ''