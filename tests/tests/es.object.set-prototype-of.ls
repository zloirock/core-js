if PROTO
  {module, test} = QUnit
  module \ES
  
  test 'Object.setPrototypeOf' (assert)->
    {setPrototypeOf} = Object
    assert.isFunction setPrototypeOf
    assert.arity setPrototypeOf, 2
    assert.name setPrototypeOf, \setPrototypeOf
    assert.looksNative setPrototypeOf
    assert.nonEnumerable Object, \setPrototypeOf
    assert.ok \apply of setPrototypeOf({} Function::), 'Parent properties in target'
    assert.strictEqual setPrototypeOf(a:2, {b: -> @a^2})b!, 4, 'Child and parent properties in target'
    assert.strictEqual setPrototypeOf(tmp = {}, {a: 1}), tmp, 'setPrototypeOf return target'
    assert.ok !(\toString of setPrototypeOf {} null), 'Can set null as prototype'