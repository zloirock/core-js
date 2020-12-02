QUnit.test('Symbol#description', assert => {
  assert.same(Symbol('foo').description, 'foo');
  assert.same(Symbol('').description, '');
  assert.same(Symbol(')').description, ')');
  assert.same(Symbol({}).description, '[object Object]');
  assert.same(Symbol(null).description, 'null');
  assert.same(Symbol(undefined).description, undefined);
  assert.same(Symbol().description, undefined);
  assert.same(Object(Symbol('foo')).description, 'foo');
  assert.same(Object(Symbol()).description, undefined);
  assert.ok(!Object.prototype.hasOwnProperty.call(Symbol('foo'), 'description'));
  const descriptor = Object.getOwnPropertyDescriptor(Symbol.prototype, 'description');
  assert.same(descriptor.enumerable, false);
  assert.same(descriptor.configurable, true);
  assert.same(typeof descriptor.get, 'function');
  if (typeof Symbol() == 'symbol') {
    assert.same(Symbol('foo').toString(), 'Symbol(foo)');
    assert.same(String(Symbol('foo')), 'Symbol(foo)');
    assert.same(Symbol('').toString(), 'Symbol()');
    assert.same(String(Symbol('')), 'Symbol()');
    assert.same(Symbol().toString(), 'Symbol()');
    assert.same(String(Symbol()), 'Symbol()');
  }
});
