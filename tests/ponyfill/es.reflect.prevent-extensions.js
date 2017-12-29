import { DESCRIPTORS } from '../helpers/constants';

import preventExtensions from '../../ponyfill/fn/reflect/prevent-extensions';
import isExtensible from '../../ponyfill/fn/object/is-extensible';

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
