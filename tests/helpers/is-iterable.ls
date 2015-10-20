QUnit.assert.isIterable = !(it, message)->
  @push (typeof it[Symbol?iterator || core?Symbol?iterator] is \function), no, on, message || 'is iterable'