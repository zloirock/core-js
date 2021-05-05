import Symbol from 'core-js-pure/features/symbol';

QUnit.test('Symbol.matcher', assert => {
  assert.ok('matcher' in Symbol, 'Symbol.matcher available');
  assert.ok(Object(Symbol.matcher) instanceof Symbol, 'Symbol.matcher is symbol');
});
