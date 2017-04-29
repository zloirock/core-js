QUnit.assert.isIterator = (it, message)!->
  @pushResult do
    result: typeof it is \object && typeof it.next is \function
    actual: no
    expected: on
    message: message || 'is iterator'