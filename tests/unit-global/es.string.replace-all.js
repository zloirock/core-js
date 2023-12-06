QUnit.test('String#replaceAll', assert => {
  const { replaceAll } = String.prototype;
  assert.isFunction(replaceAll);
  assert.arity(replaceAll, 2);
  assert.name(replaceAll, 'replaceAll');
  assert.looksNative(replaceAll);
  assert.nonEnumerable(String.prototype, 'replaceAll');
  assert.same('q=query+string+parameters'.replaceAll('+', ' '), 'q=query string parameters');
  assert.same('foo'.replaceAll('o', {}), 'f[object Object][object Object]');
  assert.same('[object Object]x[object Object]'.replaceAll({}, 'y'), 'yxy');
  assert.same(replaceAll.call({}, 'bject', 'lolo'), '[ololo Ololo]');
  assert.same('aba'.replaceAll('b', (search, i, string) => {
    assert.same(search, 'b', '`search` is `b`');
    assert.same(i, 1, '`i` is 1');
    assert.same(string, 'aba', '`string` is `aba`');
    return 'c';
  }), 'aca');
  const searcher = {
    [Symbol.replace](O, replaceValue) {
      assert.same(this, searcher, '`this` is `searcher`');
      assert.same(String(O), 'aba', '`O` is `aba`');
      assert.same(String(replaceValue), 'c', '`replaceValue` is `c`');
      return 'foo';
    },
  };
  assert.same('aba'.replaceAll(searcher, 'c'), 'foo');
  assert.same('aba'.replaceAll('b'), 'aundefineda');
  assert.same('xxx'.replaceAll('', '_'), '_x_x_x_');
  assert.same('121314'.replaceAll('1', '$$'), '$2$3$4', '$$');
  assert.same('121314'.replaceAll('1', '$&'), '121314', '$&');
  assert.same('121314'.replaceAll('1', '$`'), '212312134', '$`');
  assert.same('121314'.replaceAll('1', "$'"), '213142314344', "$'");

  const symbol = Symbol('replaceAll test');
  assert.throws(() => replaceAll.call(symbol, 'a', 'b'), 'throws on symbol context');
  assert.throws(() => replaceAll.call('a', symbol, 'b'), 'throws on symbol argument 1');
  assert.throws(() => replaceAll.call('a', 'b', symbol), 'throws on symbol argument 2');

  assert.throws(() => replaceAll.call(null, 'a', 'b'), TypeError);
  assert.throws(() => replaceAll.call(undefined, 'a', 'b'), TypeError);

  // eslint-disable-next-line regexp/no-missing-g-flag -- required for testing
  assert.throws(() => 'b.b.b.b.b'.replaceAll(/\./, 'a'), TypeError);
  // eslint-disable-next-line unicorn/prefer-string-replace-all -- required for testing
  assert.same('b.b.b.b.b'.replaceAll(/\./g, 'a'), 'babababab');
  const object = {};
  assert.same('[object Object]'.replaceAll(object, 'a'), 'a');
});
