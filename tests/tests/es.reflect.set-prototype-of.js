import { NATIVE, PROTO } from '../helpers/constants';

if (PROTO) QUnit.test('Reflect.setPrototypeOf', assert => {
  const { setPrototypeOf } = Reflect;
  assert.isFunction(setPrototypeOf);
  if (NATIVE) assert.arity(setPrototypeOf, 2);
  assert.name(setPrototypeOf, 'setPrototypeOf');
  assert.looksNative(setPrototypeOf);
  assert.nonEnumerable(Reflect, 'setPrototypeOf');
  let object = {};
  assert.ok(setPrototypeOf(object, Array.prototype), true);
  assert.ok(object instanceof Array);
  assert.throws(() => {
    return setPrototypeOf({}, 42);
  }, TypeError);
  assert.throws(() => {
    return setPrototypeOf(42, {});
  }, TypeError, 'throws on primitive');
  object = {};
  assert.ok(setPrototypeOf(object, object) === false, 'false on recursive __proto__');
});
