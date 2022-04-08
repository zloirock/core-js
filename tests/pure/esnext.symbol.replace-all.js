import Symbol from 'core-js-pure/full/symbol';

QUnit.test('Symbol.replaceAll', assert => {
  assert.true('replaceAll' in Symbol, 'Symbol.replaceAll is available');
  assert.true(Object(Symbol.replaceAll) instanceof Symbol, 'Symbol.replaceAll is symbol');
});
