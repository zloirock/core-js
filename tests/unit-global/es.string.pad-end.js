QUnit.test('String#padEnd', assert => {
  const { padEnd } = String.prototype;
  assert.isFunction(padEnd);
  assert.arity(padEnd, 1);
  assert.name(padEnd, 'padEnd');
  assert.looksNative(padEnd);
  assert.nonEnumerable(String.prototype, 'padEnd');
  assert.same('abc'.padEnd(5), 'abc  ');
  assert.same('abc'.padEnd(4, 'de'), 'abcd');
  assert.same('abc'.padEnd(), 'abc');
  assert.same('abc'.padEnd(5, '_'), 'abc__');
  assert.same(''.padEnd(0), '');
  assert.same('foo'.padEnd(1), 'foo');
  assert.same('foo'.padEnd(5, ''), 'foo');

  const symbol = Symbol('padEnd test');
  assert.throws(() => padEnd.call(symbol, 10, 'a'), 'throws on symbol context');
  assert.throws(() => padEnd.call('a', 10, symbol), 'throws on symbol argument');

  assert.throws(() => padEnd.call(null, 0), TypeError);
  assert.throws(() => padEnd.call(undefined, 0), TypeError);
});
