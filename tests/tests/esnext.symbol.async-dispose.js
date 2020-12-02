QUnit.test('Symbol.asyncDispose', assert => {
  assert.ok('asyncDispose' in Symbol, 'Symbol.asyncDispose available');
  assert.nonEnumerable(Symbol, 'asyncDispose');
  assert.ok(Object(Symbol.asyncDispose) instanceof Symbol, 'Symbol.asyncDispose is symbol');
  const descriptor = Object.getOwnPropertyDescriptor(Symbol, 'asyncDispose');
  assert.ok(!descriptor.enumerble, 'non-enumerable');
  assert.ok(!descriptor.writable, 'non-writable');
  assert.ok(!descriptor.configurable, 'non-configurable');
});
