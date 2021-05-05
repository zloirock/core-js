import Symbol from 'core-js-pure/features/symbol';

QUnit.test('Symbol.metadata', assert => {
  assert.ok('metadata' in Symbol, 'Symbol.metadata available');
  assert.ok(Object(Symbol.metadata) instanceof Symbol, 'Symbol.metadata is symbol');
});
