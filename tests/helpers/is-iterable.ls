QUnit.assert.isIterable = (it, message)!->
  @pushResult do
    result: if core?isIterable => core.isIterable(it) else !!it[Symbol?iterator]
    actual: no
    expected: on
    message: message || 'is iterable'