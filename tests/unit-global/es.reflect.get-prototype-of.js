import { CORRECT_PROTOTYPE_GETTER } from '../helpers/constants.js';

QUnit.test('Reflect.getPrototypeOf', assert => {
  const { getPrototypeOf } = Reflect;
  assert.isFunction(getPrototypeOf);
  assert.arity(getPrototypeOf, 1);
  assert.name(getPrototypeOf, 'getPrototypeOf');
  assert.looksNative(getPrototypeOf);
  assert.nonEnumerable(Reflect, 'getPrototypeOf');
  assert.same(getPrototypeOf([]), Array.prototype);
  assert.throws(() => getPrototypeOf(42), TypeError, 'throws on primitive');
});

QUnit.test('Reflect.getPrototypeOf.sham flag', assert => {
  assert.same(Reflect.getPrototypeOf.sham, CORRECT_PROTOTYPE_GETTER ? undefined : true);
});
