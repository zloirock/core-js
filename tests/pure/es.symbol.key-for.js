import Symbol from 'core-js-pure/full/symbol';

QUnit.test('Symbol.keyFor', assert => {
  assert.isFunction(Symbol.keyFor, 'Symbol.keyFor is function');
  assert.strictEqual(Symbol.keyFor(Symbol.for('foo')), 'foo');
  assert.strictEqual(Symbol.keyFor(Symbol('foo')), undefined);
  assert.throws(() => Symbol.keyFor('foo'), 'throws on non-symbol');
});
