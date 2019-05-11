import { STRICT } from '../helpers/constants';

import replaceAll from 'core-js-pure/features/string/replace-all';
import Symbol from 'core-js-pure/features/symbol';

QUnit.test('String#replaceAll', assert => {
  assert.isFunction(replaceAll);
  assert.same(replaceAll('q=query+string+parameters', '+', ' '), 'q=query string parameters');
  assert.same(replaceAll('foo', 'o', {}), 'f[object Object][object Object]');
  assert.same(replaceAll('[object Object]x[object Object]', {}, 'y'), 'yxy');
  assert.same(replaceAll({}, 'bject', 'lolo'), '[ololo Ololo]');
  assert.same(replaceAll('aba', 'b', (search, i, string) => {
    assert.same(search, 'b', '`search` is `b`');
    assert.same(i, 0, '`i` is 0');
    assert.same(string, 'aba', '`string` is `aba`');
    return 'c';
  }), 'aca');
  const searcher = {
    [Symbol.replaceAll](O, replaceValue) {
      assert.same(this, searcher, '`this` is `searcher`');
      assert.same(String(O), 'aba', '`O` is `aba`');
      assert.same(String(replaceValue), 'c', '`replaceValue` is `c`');
      return 'foo';
    },
  };
  assert.same(replaceAll('aba', searcher, 'c'), 'foo');
  assert.same(replaceAll('aba', 'b'), 'aundefineda');
  if (STRICT) {
    assert.throws(() => replaceAll(null, 'a', 'b'), TypeError);
    assert.throws(() => replaceAll(undefined, 'a', 'b'), TypeError);
  }
  assert.same(replaceAll('b.b.b.b.b', /\./, 'a'), 'babababab');
  assert.same(replaceAll('b.b.b.b.b', /\./g, 'a'), 'babababab');
  const object = {};
  assert.same(replaceAll('[object Object]', object, 'a'), 'a');
});
