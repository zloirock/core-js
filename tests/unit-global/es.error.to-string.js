QUnit.test('Error#toString', assert => {
  const { toString } = Error.prototype;
  assert.isFunction(toString);
  assert.arity(toString, 0);
  assert.name(toString, 'toString');
  assert.looksNative(toString);
  assert.nonEnumerable(Error.prototype, 'toString');
  assert.same(String(new Error('something')), 'Error: something');
  assert.same(String(new TypeError('something')), 'TypeError: something');
  assert.same(String(new Error()), 'Error');
  assert.same(toString.call({}), 'Error');
  assert.same(toString.call({ name: 'foo' }), 'foo');
  assert.same(toString.call({ message: 'bar' }), 'Error: bar');
  assert.same(toString.call({ name: '', message: 'bar' }), 'bar');
  assert.same(toString.call({ name: 'foo', message: 'bar' }), 'foo: bar');
  assert.same(toString.call({ name: 1, message: 2 }), '1: 2');

  assert.throws(() => toString.call(7));
  assert.throws(() => toString.call('a'));
  assert.throws(() => toString.call(false));
  assert.throws(() => toString.call(null));
  assert.throws(() => toString.call(undefined));

  // assert.throws(() => toString.call({ name: Symbol() }), 'throws on symbol #1');
  // assert.throws(() => toString.call({ name: Symbol() }), 'throws on symbol #2');
});
