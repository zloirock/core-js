QUnit.test('Symbol.observable', function (assert) {
  var Symbol = core.Symbol;
  assert.ok('observable' in Symbol, 'Symbol.observable available');
  assert.ok(Object(Symbol.observable) instanceof Symbol, 'Symbol.observable is symbol');
});
