import { STRICT } from '../helpers/constants';

import replaceAll from 'core-js-pure/features/string/replace-all';

QUnit.test('String#replaceAll', assert => {
  assert.isFunction(replaceAll);
  assert.same(replaceAll('q=query+string+parameters', '+', ' '), 'q=query string parameters');
  assert.same(replaceAll('foo', 'o', {}), 'f[object Object][object Object]');
  assert.same(replaceAll('[object Object]x[object Object]', {}, 'y'), 'yxy');
  assert.same(replaceAll({}, 'bject', 'lolo'), '[ololo Ololo]');
  if (STRICT) {
    assert.throws(() => replaceAll(null, 'a', 'b'), TypeError);
    assert.throws(() => replaceAll(undefined, 'a', 'b'), TypeError);
  }
  assert.same(replaceAll('b.b.b.b.b', /\./, 'a'), 'babababab');
  assert.same(replaceAll('b.b.b.b.b', /\./g, 'a'), 'babababab');
  const object = {};
  assert.same(replaceAll('[object Object]', object, 'a'), 'a');
});
