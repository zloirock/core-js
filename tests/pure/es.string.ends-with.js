import { STRICT } from '../helpers/constants';

import Symbol from 'core-js-pure/fn/symbol';
import endsWith from 'core-js-pure/fn/string/ends-with';

QUnit.test('String#endsWith', assert => {
  assert.isFunction(endsWith);
  assert.ok(endsWith('undefined'));
  assert.ok(!endsWith('undefined', null));
  assert.ok(endsWith('abc', ''));
  assert.ok(endsWith('abc', 'c'));
  assert.ok(endsWith('abc', 'bc'));
  assert.ok(!endsWith('abc', 'ab'));
  assert.ok(endsWith('abc', '', NaN));
  assert.ok(!endsWith('abc', 'c', -1));
  assert.ok(endsWith('abc', 'a', 1));
  assert.ok(endsWith('abc', 'c', Infinity));
  assert.ok(endsWith('abc', 'a', true));
  assert.ok(!endsWith('abc', 'c', 'x'));
  assert.ok(!endsWith('abc', 'a', 'x'));
  if (STRICT) {
    assert.throws(() => endsWith(null, '.'), TypeError);
    assert.throws(() => endsWith(undefined, '.'), TypeError);
  }
  const regexp = /./;
  assert.throws(() => endsWith('/./', regexp), TypeError);
  regexp[Symbol.match] = false;
  assert.notThrows(() => endsWith('/./', regexp));
  const object = {};
  assert.notThrows(() => endsWith('[object Object]', object));
  object[Symbol.match] = true;
  assert.throws(() => endsWith('[object Object]', object), TypeError);
});
