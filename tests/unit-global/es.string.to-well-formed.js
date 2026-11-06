QUnit.test('String#toWellFormed', assert => {
  const { toWellFormed } = String.prototype;
  assert.isFunction(toWellFormed);
  assert.arity(toWellFormed, 0);
  assert.name(toWellFormed, 'toWellFormed');
  assert.looksNative(toWellFormed);
  assert.nonEnumerable(String.prototype, 'toWellFormed');

  assert.same(toWellFormed.call('a'), 'a', 'a');
  assert.same(toWellFormed.call('abc'), 'abc', 'abc');
  assert.same(toWellFormed.call('💩'), '💩', '💩');
  assert.same(toWellFormed.call('💩b'), '💩b', '💩b');
  assert.same(toWellFormed.call('a💩'), 'a💩', 'a💩');
  assert.same(toWellFormed.call('a💩b'), 'a💩b', 'a💩b');
  assert.same(toWellFormed.call('💩a💩'), '💩a💩');
  assert.same(toWellFormed.call('\uD83D'), '\uFFFD', '\uD83D');
  assert.same(toWellFormed.call('\uDCA9'), '\uFFFD', '\uDCA9');
  assert.same(toWellFormed.call('\uDCA9\uD83D'), '\uFFFD\uFFFD', '\uDCA9\uD83D');
  assert.same(toWellFormed.call('a\uD83D'), 'a\uFFFD', 'a\uD83D');
  assert.same(toWellFormed.call('\uDCA9a'), '\uFFFDa', '\uDCA9a');
  assert.same(toWellFormed.call('a\uD83Da'), 'a\uFFFDa', 'a\uD83Da');
  assert.same(toWellFormed.call('a\uDCA9a'), 'a\uFFFDa', 'a\uDCA9a');

  assert.same(toWellFormed.call({
    toString() {
      return 'abc';
    },
  }), 'abc', 'conversion #1');

  assert.same(toWellFormed.call(1), '1', 'conversion #2');

  assert.throws(() => toWellFormed.call(null), TypeError, 'coercible #1');
  assert.throws(() => toWellFormed.call(undefined), TypeError, 'coercible #2');

  assert.throws(() => toWellFormed.call(Symbol('toWellFormed test')), 'throws on symbol context');
});
