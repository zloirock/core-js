import { STRICT } from '../helpers/constants';

import Symbol from 'core-js-pure/full/symbol';
import startsWith from 'core-js-pure/full/string/starts-with';

QUnit.test('String#startsWith', assert => {
  assert.isFunction(startsWith);
  assert.ok(startsWith('undefined'));
  assert.ok(!startsWith('undefined', null));
  assert.ok(startsWith('abc', ''));
  assert.ok(startsWith('abc', 'a'));
  assert.ok(startsWith('abc', 'ab'));
  assert.ok(!startsWith('abc', 'bc'));
  assert.ok(startsWith('abc', '', NaN));
  assert.ok(startsWith('abc', 'a', -1));
  assert.ok(!startsWith('abc', 'a', 1));
  assert.ok(!startsWith('abc', 'a', Infinity));
  assert.ok(startsWith('abc', 'b', true));
  assert.ok(startsWith('abc', 'a', 'x'));
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
