import preventExtensions from 'core-js-pure/full/reflect/prevent-extensions';
import isExtensible from 'core-js-pure/full/object/is-extensible';

QUnit.test('Reflect.preventExtensions', assert => {
  assert.isFunction(preventExtensions);
  assert.arity(preventExtensions, 1);
  if ('name' in preventExtensions) {
    assert.name(preventExtensions, 'preventExtensions');
  }
  const object = {};
  assert.ok(preventExtensions(object), true);
  assert.ok(!isExtensible(object));
  assert.throws(() => preventExtensions(42), TypeError, 'throws on primitive');
});
