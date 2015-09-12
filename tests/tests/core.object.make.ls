{module, test} = QUnit
module \core-js

test 'Object.make' (assert)->
  {make} = Object
  assert.ok typeof! make is \Function, 'Is function'
  object = make foo = {q:1}, {w:2}
  assert.ok Object.getPrototypeOf(object) is foo
  assert.ok object.w is 2