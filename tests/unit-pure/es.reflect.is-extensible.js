import preventExtensions from 'core-js-pure/es/object/prevent-extensions';
import isExtensible from 'core-js-pure/es/reflect/is-extensible';

QUnit.test('Reflect.isExtensible', assert => {
  assert.isFunction(isExtensible);
  assert.arity(isExtensible, 1);
  if ('name' in isExtensible) {
    assert.name(isExtensible, 'isExtensible');
  }
  assert.true(isExtensible({}));
  assert.false(isExtensible(preventExtensions({})));
  assert.throws(() => isExtensible(42), TypeError, 'throws on primitive');
});
