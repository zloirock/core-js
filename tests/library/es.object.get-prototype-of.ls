{module, test} = QUnit
module \ES

test 'Object.getPrototypeOf' (assert)!->
  {create, getPrototypeOf} = core.Object
  assert.isFunction getPrototypeOf
  assert.arity getPrototypeOf, 1
  assert.ok getPrototypeOf({}) is Object::
  assert.ok getPrototypeOf([]) is Array::
  assert.ok getPrototypeOf(new class fn) is fn::
  assert.ok getPrototypeOf(create obj = q:1) is obj
  assert.ok getPrototypeOf(create null) is null
  assert.ok getPrototypeOf(getPrototypeOf {}) is null
  foo = ->
  foo::foo = \foo
  bar = ->
  bar:: = create foo::
  bar::constructor = bar
  assert.strictEqual getPrototypeOf(bar::).foo, \foo
  for value in [42 \foo no]
    assert.ok (try => getPrototypeOf value; on), "accept #{typeof! value}"
  for value in [null void]
    assert.throws (!-> getPrototypeOf value), TypeError, "throws on #value"
  assert.strictEqual getPrototypeOf(\foo), String::