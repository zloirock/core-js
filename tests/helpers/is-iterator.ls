QUnit.assert.isIterator = !(it, message)->
  @push (typeof it is \object && typeof it.next is \function), no, on, message || 'is iterator'