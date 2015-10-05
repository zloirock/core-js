QUnit.assert.isFunction = !(fn, message)->
  @push (typeof fn is \function or typeof! fn is \Function), no, on, message || 'is function'