import { NATIVE } from '../helpers/constants.js';

QUnit.test('Reflect.setPrototypeOf', assert => {
  const { setPrototypeOf } = Reflect;
  assert.isFunction(setPrototypeOf);
  if (NATIVE) assert.arity(setPrototypeOf, 2);
  assert.name(setPrototypeOf, 'setPrototypeOf');
  assert.looksNative(setPrototypeOf);
  assert.nonEnumerable(Reflect, 'setPrototypeOf');
  let object = {};
  assert.true(setPrototypeOf(object, Array.prototype));
  assert.true(object instanceof Array);
  assert.throws(() => setPrototypeOf({}, 42), TypeError);
  assert.throws(() => setPrototypeOf(42, {}), TypeError, 'throws on primitive');
  object = {};
  assert.false(setPrototypeOf(object, object), 'false on recursive __proto__');
});
