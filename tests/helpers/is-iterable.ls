QUnit.assert.isIterable = !(it, message)->
  @push core.isIterable(it), no, on, message || 'is iterable'