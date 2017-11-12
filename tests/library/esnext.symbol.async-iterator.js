QUnit.test('Symbol.asyncIterator', function (assert) {
  var Symbol = core.Symbol;
  assert.ok('asyncIterator' in Symbol, 'Symbol.asyncIterator available');
  assert.ok(Object(Symbol.asyncIterator) instanceof Symbol, 'Symbol.asyncIterator is symbol');
});
