QUnit.assert.arity = !(fn, length, message)->
  @push (fn.length is length), fn.length, length, message || "arity is #length"