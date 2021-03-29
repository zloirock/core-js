QUnit.test('Symbol.dispose', assert => {
  assert.ok('dispose' in Symbol, 'Symbol.dispose available');
  assert.nonEnumerable(Symbol, 'dispose');
  assert.ok(Object(Symbol.dispose) instanceof Symbol, 'Symbol.dispose is symbol');
  const descriptor = Object.getOwnPropertyDescriptor(Symbol, 'dispose');
  assert.ok(!descriptor.enumerble, 'non-enumerable');
  assert.ok(!descriptor.writable, 'non-writable');
  assert.ok(!descriptor.configurable, 'non-configurable');
});
