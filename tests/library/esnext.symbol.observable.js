QUnit.test('Symbol.observable', assert => {
  const { Symbol } = core;
  assert.ok('observable' in Symbol, 'Symbol.observable available');
  assert.ok(Object(Symbol.observable) instanceof Symbol, 'Symbol.observable is symbol');
});
