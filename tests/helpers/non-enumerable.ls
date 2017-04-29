QUnit.assert.nonEnumerable = (O, key, message)!->
  DESCRIPTORS and @pushResult do
    result: !O.propertyIsEnumerable(key)
    actual: no
    expected: on
    message: message || "#{if typeof key is 'symbol' => \method else key} is non-enumerable"