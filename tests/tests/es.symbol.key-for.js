QUnit.test('Symbol.keyFor', assert => {
  assert.isFunction(Symbol.keyFor, 'Symbol.keyFor is function');
  assert.nonEnumerable(Symbol, 'keyFor');
  assert.strictEqual(Symbol.keyFor.length, 1, 'Symbol.keyFor arity is 1');
  assert.strictEqual(Symbol.keyFor.name, 'keyFor', 'Symbol.keyFor.name is "keyFor"');
  assert.looksNative(Symbol.keyFor, 'Symbol.keyFor looks like native');
  assert.strictEqual(Symbol.keyFor(Symbol.for('foo')), 'foo');
  assert.strictEqual(Symbol.keyFor(Symbol('foo')), undefined);
  assert.throws(() => Symbol.keyFor('foo'), 'throws on non-symbol');
});
