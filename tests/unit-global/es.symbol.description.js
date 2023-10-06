/* eslint-disable symbol-description -- required for testing */
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

  assert.false(Object.hasOwn(Symbol('foo'), 'description'));
  const descriptor = Object.getOwnPropertyDescriptor(Symbol.prototype, 'description');
  assert.false(descriptor.enumerable);
  assert.true(descriptor.configurable);
  assert.same(typeof descriptor.get, 'function');

  if (typeof Symbol() == 'symbol') {
    assert.same(Symbol('foo').toString(), 'Symbol(foo)');
    assert.same(String(Symbol('foo')), 'Symbol(foo)');
    assert.same(Symbol('').toString(), 'Symbol()');
    assert.same(String(Symbol('')), 'Symbol()');
    assert.same(Symbol().toString(), 'Symbol()');
    assert.same(String(Symbol()), 'Symbol()');
  }
  // Symbol.for with empty string key should have '' description
  assert.same(Symbol.for('').description, '', 'Symbol.for("").description');
  assert.same(Symbol.for('foo').description, 'foo', 'Symbol.for("foo").description');
});
