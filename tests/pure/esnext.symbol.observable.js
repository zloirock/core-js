import Symbol from 'core-js-pure/fn/symbol';

QUnit.test('Symbol.observable', assert => {
  assert.ok('observable' in Symbol, 'Symbol.observable available');
  assert.ok(Object(Symbol.observable) instanceof Symbol, 'Symbol.observable is symbol');
});
