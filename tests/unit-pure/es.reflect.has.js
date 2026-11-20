import { PROTO } from '../helpers/constants.js';

import setPrototypeOf from 'core-js-pure/es/object/set-prototype-of';
import has from 'core-js-pure/es/reflect/has';

QUnit.test('Reflect.has', assert => {
  assert.isFunction(has);
  assert.arity(has, 2);
  if ('name' in has) {
    assert.name(has, 'has');
  }
  const object = { qux: 987 };
  assert.true(has(object, 'qux'));
  assert.false(has(object, 'qwe'));
  assert.true(has(object, 'toString'));
  assert.true(has([1], 0), 'own array index');
  if (PROTO) assert.true(has(setPrototypeOf([], [1]), 0), 'inherited index beyond the array length');
  assert.throws(() => has(42, 'constructor'), TypeError, 'throws on primitive');
  assert.throws(() => has(42, { toString() { throw new Error(); } }), TypeError, 'checks the target before converting the key');
});
