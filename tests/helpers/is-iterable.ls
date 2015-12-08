QUnit.assert.isIterable = !(it, message)->
  @push (if core? => core.isIterable(it) else !!it[Symbol?iterator]), no, on, message || 'is iterable'