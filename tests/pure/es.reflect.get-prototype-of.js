import { CORRECT_PROTOTYPE_GETTER } from '../helpers/constants';

import getPrototypeOf from 'core-js-pure/features/reflect/get-prototype-of';

QUnit.test('Reflect.getPrototypeOf', assert => {
  assert.isFunction(getPrototypeOf);
  assert.arity(getPrototypeOf, 1);
  if ('name' in getPrototypeOf) {
    assert.name(getPrototypeOf, 'getPrototypeOf');
  }
  assert.strictEqual(getPrototypeOf([]), Array.prototype);
  assert.throws(() => getPrototypeOf(42), TypeError, 'throws on primitive');
});

QUnit.test('Reflect.getPrototypeOf.sham flag', assert => {
  assert.same(getPrototypeOf.sham, CORRECT_PROTOTYPE_GETTER ? undefined : true);
});
