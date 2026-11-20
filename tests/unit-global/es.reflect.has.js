import { PROTO } from '../helpers/constants.js';

import setPrototypeOf from 'core-js-pure/es/object/set-prototype-of';

QUnit.test('Reflect.has', assert => {
  const { has } = Reflect;
  assert.isFunction(has);
  assert.arity(has, 2);
  assert.name(has, 'has');
  assert.looksNative(has);
  assert.nonEnumerable(Reflect, 'has');
  const object = { qux: 987 };
  assert.true(has(object, 'qux'));
  assert.false(has(object, 'qwe'));
  assert.true(has(object, 'toString'));
  assert.true(has([1], 0), 'own array index');
  if (PROTO) assert.true(has(setPrototypeOf([], [1]), 0), 'inherited index beyond the array length');
  assert.throws(() => has(42, 'constructor'), TypeError, 'throws on primitive');
  assert.throws(() => has(42, { toString() { throw new Error(); } }), TypeError, 'checks the target before converting the key');
});
