import Symbol from 'core-js-pure/features/symbol';

QUnit.test('Symbol.replaceAll', assert => {
  assert.ok('replaceAll' in Symbol, 'Symbol.replaceAll is available');
  assert.ok(Object(Symbol.replaceAll) instanceof Symbol, 'Symbol.replaceAll is symbol');
});
