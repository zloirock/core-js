import Symbol from 'core-js-pure/full/symbol';

QUnit.test('Symbol.metadataKey', assert => {
  assert.true('metadataKey' in Symbol, 'Symbol.metadataKey available');
  assert.true(Object(Symbol.metadataKey) instanceof Symbol, 'Symbol.metadataKey is symbol');
});
