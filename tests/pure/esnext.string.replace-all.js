import { STRICT } from '../helpers/constants';

import Symbol from 'core-js-pure/features/symbol';
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
  const regexp = /./;
  assert.throws(() => replaceAll('/./', regexp, 'a'), TypeError);
  regexp[Symbol.match] = false;
  assert.notThrows(() => replaceAll('/./', regexp, 'a') === 'a');
  const object = {};
  assert.notThrows(() => replaceAll('[object Object]', object, 'a') === 'a');
  object[Symbol.match] = true;
  assert.throws(() => replaceAll('[object Object]', object, 'a'), TypeError);
});
