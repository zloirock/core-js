import { DESCRIPTORS, FREEZING } from '../helpers/constants';

import preventExtensions from 'core-js-pure/features/reflect/prevent-extensions';
import isExtensible from 'core-js-pure/features/object/is-extensible';

QUnit.test('Reflect.preventExtensions', assert => {
  assert.isFunction(preventExtensions);
  assert.arity(preventExtensions, 1);
  if ('name' in preventExtensions) {
    assert.name(preventExtensions, 'preventExtensions');
  }
  const object = {};
  assert.ok(preventExtensions(object), true);
  if (DESCRIPTORS) {
    assert.ok(!isExtensible(object));
  }
  assert.throws(() => preventExtensions(42), TypeError, 'throws on primitive');
});

QUnit.test('Reflect.preventExtensions.sham flag', assert => {
  assert.same(preventExtensions.sham, FREEZING ? undefined : true);
});
