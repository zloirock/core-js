QUnit.test('Symbol.keyFor', assert => {
  assert.isFunction(Symbol.keyFor, 'Symbol.keyFor is function');
  assert.nonEnumerable(Symbol, 'keyFor');
  assert.arity(Symbol.keyFor, 1, 'Symbol.keyFor arity is 1');
  assert.name(Symbol.keyFor, 'keyFor', 'Symbol.keyFor.name is "keyFor"');
  assert.looksNative(Symbol.keyFor, 'Symbol.keyFor looks like native');
  assert.same(Symbol.keyFor(Symbol.for('foo')), 'foo');
  assert.same(Symbol.keyFor(Symbol('foo')), undefined);
  assert.throws(() => Symbol.keyFor('foo'), 'throws on non-symbol');
});
