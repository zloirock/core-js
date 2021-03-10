import isExtensible from 'core-js-pure/full/reflect/is-extensible';
import preventExtensions from 'core-js-pure/full/object/prevent-extensions';

QUnit.test('Reflect.isExtensible', assert => {
  assert.isFunction(isExtensible);
  assert.arity(isExtensible, 1);
  if ('name' in isExtensible) {
    assert.name(isExtensible, 'isExtensible');
  }
  assert.ok(isExtensible({}));
  assert.ok(!isExtensible(preventExtensions({})));
  assert.throws(() => isExtensible(42), TypeError, 'throws on primitive');
});
