import Symbol from '@core-js/pure/es/symbol';
import replaceAll from '@core-js/pure/es/string/replace-all';

QUnit.test('String#replaceAll', assert => {
  assert.isFunction(replaceAll);
  assert.same(replaceAll('q=query+string+parameters', '+', ' '), 'q=query string parameters');
  assert.same(replaceAll('foo', 'o', {}), 'f[object Object][object Object]');
  assert.same(replaceAll('[object Object]x[object Object]', {}, 'y'), 'yxy');
  assert.same(replaceAll({}, 'bject', 'lolo'), '[ololo Ololo]');
  assert.same(replaceAll('aba', 'b', (search, i, string) => {
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
  assert.same(replaceAll('aba', searcher, 'c'), 'foo');
  assert.same(replaceAll('aba', 'b'), 'aundefineda');
  assert.same(replaceAll('xxx', '', '_'), '_x_x_x_');
  assert.same(replaceAll('121314', '1', '$$'), '$2$3$4', '$$');
  assert.same(replaceAll('121314', '1', '$&'), '121314', '$&');
  assert.same(replaceAll('121314', '1', '$`'), '212312134', '$`');
  assert.same(replaceAll('121314', '1', "$'"), '213142314344', "$'");

  const symbol = Symbol('replaceAll test');
  assert.throws(() => replaceAll(symbol, 'a', 'b'), 'throws on symbol context');
  assert.throws(() => replaceAll('a', symbol, 'b'), 'throws on symbol argument 1');
  assert.throws(() => replaceAll('a', 'b', symbol), 'throws on symbol argument 2');

  assert.throws(() => replaceAll(null, 'a', 'b'), TypeError);
  assert.throws(() => replaceAll(undefined, 'a', 'b'), TypeError);

  assert.throws(() => replaceAll('b.b.b.b.b', /\./, 'a'), TypeError);
  assert.same(replaceAll('b.b.b.b.b', /\./g, 'a'), 'babababab');
  const object = {};
  assert.same(replaceAll('[object Object]', object, 'a'), 'a');
});
