QUnit.test('Symbol.toPrimitive', assert => {
  assert.ok('toPrimitive' in Symbol, 'Symbol.toPrimitive available');
  assert.nonEnumerable(Symbol, 'toPrimitive');
  assert.ok(Object(Symbol.toPrimitive) instanceof Symbol, 'Symbol.toPrimitive is symbol');
  const descriptor = Object.getOwnPropertyDescriptor(Symbol, 'toPrimitive');
  assert.ok(!descriptor.enumerble, 'non-enumerable');
  assert.ok(!descriptor.writable, 'non-writable');
  assert.ok(!descriptor.configurable, 'non-configurable');
});

QUnit.test('Symbol#@@toPrimitive', assert => {
  const symbol = Symbol();
  assert.isFunction(Symbol.prototype[Symbol.toPrimitive]);
  assert.same(symbol, symbol[Symbol.toPrimitive](), 'works');
});
