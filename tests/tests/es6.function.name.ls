if (-> try 2 == Object.defineProperty({}, \a, get: -> 2)a)!
  {module, test} = QUnit
  module \ES6

  test 'Function#name' (assert)->
    assert.ok \name of Function::
    assert.strictEqual (function foo => it).name, \foo
    assert.strictEqual (->).name, ''