import Symbol from 'core-js-pure/es/symbol';

QUnit.test('Symbol.toPrimitive', assert => {
  assert.ok('toPrimitive' in Symbol, 'Symbol.toPrimitive available');
  assert.ok(Object(Symbol.toPrimitive) instanceof Symbol, 'Symbol.toPrimitive is symbol');
});

QUnit.test('Symbol#@@toPrimitive', assert => {
  const symbol = Symbol();
  assert.isFunction(Symbol.prototype[Symbol.toPrimitive]);
  assert.same(symbol, symbol[Symbol.toPrimitive](), 'works');
});
