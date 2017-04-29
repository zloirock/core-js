QUnit.assert.looksNative = (fn, message)!->
  @pushResult do
    result: /native code/.test Function::toString.call fn
    actual: no
    expected: on
    message: message || 'looks native'