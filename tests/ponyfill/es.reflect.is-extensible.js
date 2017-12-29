import { DESCRIPTORS } from '../helpers/constants';

import isExtensible from '../../ponyfill/fn/reflect/is-extensible';
import preventExtensions from '../../ponyfill/fn/object/prevent-extensions';

QUnit.test('Reflect.isExtensible', assert => {
  assert.isFunction(isExtensible);
  assert.arity(isExtensible, 1);
  if ('name' in isExtensible) {
    assert.name(isExtensible, 'isExtensible');
  }
  assert.ok(isExtensible({}));
  if (DESCRIPTORS) {
    assert.ok(!isExtensible(preventExtensions({})));
  }
  assert.throws(() => isExtensible(42), TypeError, 'throws on primitive');
});
