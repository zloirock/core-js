QUnit.assert.name = !(fn, name, message)->
  @push (fn.name is name), fn.name, name, message || "name is '#name'"