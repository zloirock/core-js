QUnit.test('String#isWellFormed', assert => {
  const { isWellFormed } = String.prototype;
  assert.isFunction(isWellFormed);
  assert.arity(isWellFormed, 0);
  assert.name(isWellFormed, 'isWellFormed');
  assert.looksNative(isWellFormed);
  assert.nonEnumerable(String.prototype, 'isWellFormed');

  assert.true(isWellFormed.call('a'), 'a');
  assert.true(isWellFormed.call('abc'), 'abc');
  assert.true(isWellFormed.call('💩'), '💩');
  assert.true(isWellFormed.call('💩b'), '💩b');
  assert.true(isWellFormed.call('a💩'), 'a💩');
  assert.true(isWellFormed.call('a💩b'), 'a💩b');
  assert.true(isWellFormed.call('💩a💩'), '💩a💩');
  assert.true(!isWellFormed.call('\uD83D'), '\uD83D');
  assert.true(!isWellFormed.call('\uDCA9'), '\uDCA9');
  assert.true(!isWellFormed.call('\uDCA9\uD83D'), '\uDCA9\uD83D');
  assert.true(!isWellFormed.call('a\uD83D'), 'a\uD83D');
  assert.true(!isWellFormed.call('\uDCA9a'), '\uDCA9a');
  assert.true(!isWellFormed.call('a\uD83Da'), 'a\uD83Da');
  assert.true(!isWellFormed.call('a\uDCA9a'), 'a\uDCA9a');

  assert.true(isWellFormed.call({
    toString() {
      return 'abc';
    },
  }), 'conversion #1');

  assert.true(!isWellFormed.call({
    toString() {
      return '\uD83D';
    },
  }), 'conversion #2');

  assert.throws(() => isWellFormed.call(null), TypeError, 'coercible #1');
  assert.throws(() => isWellFormed.call(undefined), TypeError, 'coercible #2');

  assert.throws(() => isWellFormed.call(Symbol('isWellFormed test')), 'throws on symbol context');
});
