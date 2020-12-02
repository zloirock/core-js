QUnit.test('Symbol.observable', assert => {
  assert.ok('observable' in Symbol, 'Symbol.observable available');
  assert.nonEnumerable(Symbol, 'observable');
  assert.ok(Object(Symbol.observable) instanceof Symbol, 'Symbol.observable is symbol');
  const descriptor = Object.getOwnPropertyDescriptor(Symbol, 'observable');
  assert.ok(!descriptor.enumerble, 'non-enumerable');
  assert.ok(!descriptor.writable, 'non-writable');
  assert.ok(!descriptor.configurable, 'non-configurable');
});
