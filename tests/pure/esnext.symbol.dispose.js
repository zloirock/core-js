import Symbol from 'core-js-pure/features/symbol';

QUnit.test('Symbol.dispose', assert => {
  assert.true('dispose' in Symbol, 'Symbol.dispose available');
  assert.true(Object(Symbol.dispose) instanceof Symbol, 'Symbol.dispose is symbol');
});
