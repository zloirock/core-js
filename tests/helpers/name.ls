QUnit.assert.name = (fn, name, message)!->
  @pushResult do
    result: fn.name is name
    actual: fn.name
    expected: name
    message: message || "name is '#name'"