import Symbol from 'core-js-pure/full/symbol';

QUnit.test('Symbol.matcher', assert => {
  assert.true('matcher' in Symbol, 'Symbol.matcher available');
  assert.true(Object(Symbol.matcher) instanceof Symbol, 'Symbol.matcher is symbol');
});
