QUnit.assert.nonEnumerable = !(O, key, message)->
  DESCRIPTORS and @push !O.propertyIsEnumerable(key), no, on, message || "#{String key} is non-enumerable"