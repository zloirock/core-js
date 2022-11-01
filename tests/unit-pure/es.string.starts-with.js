import { STRICT } from '../helpers/constants';

import Symbol from 'core-js-pure/es/symbol';
import startsWith from 'core-js-pure/es/string/starts-with';

QUnit.test('String#startsWith', assert => {
  assert.isFunction(startsWith);
  assert.true(startsWith('undefined'));
  assert.false(startsWith('undefined', null));
  assert.true(startsWith('abc', ''));
  assert.true(startsWith('abc', 'a'));
  assert.true(startsWith('abc', 'ab'));
  assert.false(startsWith('abc', 'bc'));
  assert.true(startsWith('abc', '', NaN));
  assert.true(startsWith('abc', 'a', -1));
  assert.false(startsWith('abc', 'a', 1));
  assert.false(startsWith('abc', 'a', Infinity));
  assert.true(startsWith('abc', 'b', true));
  assert.true(startsWith('abc', 'a', 'x'));

  if (!Symbol.sham) {
    assert.throws(() => startsWith(Symbol(), 'b'), 'throws on symbol context');
    assert.throws(() => startsWith('a', Symbol()), 'throws on symbol argument');
  }

  if (STRICT) {
    assert.throws(() => startsWith(null, '.'), TypeError);
    assert.throws(() => startsWith(undefined, '.'), TypeError);
  }

  const regexp = /./;
  assert.throws(() => startsWith('/./', regexp), TypeError);
  regexp[Symbol.match] = false;
  assert.notThrows(() => startsWith('/./', regexp));
  const object = {};
  assert.notThrows(() => startsWith('[object Object]', object));
  object[Symbol.match] = true;
  assert.throws(() => startsWith('[object Object]', object), TypeError);
});
