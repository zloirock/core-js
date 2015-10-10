QUnit.assert.looksNative = !(fn, message)->
  @push /native code/.test(Function::toString.call fn), no, on, message || 'looks native'