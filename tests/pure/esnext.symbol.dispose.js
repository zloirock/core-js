import Symbol from 'core-js-pure/features/symbol';

QUnit.test('Symbol.dispose', assert => {
  assert.ok('dispose' in Symbol, 'Symbol.dispose available');
  assert.ok(Object(Symbol.dispose) instanceof Symbol, 'Symbol.dispose is symbol');
});
