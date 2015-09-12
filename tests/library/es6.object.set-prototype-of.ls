if Object.setPrototypeOf or '__proto__' of Object::
  {module, test} = QUnit
  module \ES6
  
  test 'Object.setPrototypeOf' (assert)->
    {setPrototypeOf} = core.Object
    assert.ok typeof! setPrototypeOf is \Function, 'Is function'
    assert.ok \apply of setPrototypeOf({} Function::), 'Parent properties in target'
    assert.strictEqual setPrototypeOf(a:2, {b: -> @a^2})b!, 4, 'Child and parent properties in target'
    assert.strictEqual setPrototypeOf(tmp = {}, {a: 1}), tmp, 'setPrototypeOf return target'
    assert.ok !(\toString of setPrototypeOf {} null), 'Can set null as prototype'