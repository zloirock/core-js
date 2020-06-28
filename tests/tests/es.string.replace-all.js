import { STRICT } from '../helpers/constants';

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
  if (STRICT) {
    assert.throws(() => replaceAll.call(null, 'a', 'b'), TypeError);
    assert.throws(() => replaceAll.call(undefined, 'a', 'b'), TypeError);
  }
  assert.throws(() => 'b.b.b.b.b'.replaceAll(/\./, 'a'), TypeError);
  assert.same('b.b.b.b.b'.replaceAll(/\./g, 'a'), 'babababab');
  const object = {};
  assert.same('[object Object]'.replaceAll(object, 'a'), 'a');
});
