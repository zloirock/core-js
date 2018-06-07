import { metadata, hasOwnMetadata } from 'core-js-pure/features/reflect';

QUnit.test('Reflect.metadata', assert => {
  assert.isFunction(metadata);
  assert.arity(metadata, 2);
  assert.isFunction(metadata('key', 'value'));
  const decorator = metadata('key', 'value');
  assert.throws(() => decorator(undefined, 'name'), TypeError);
  assert.throws(() => decorator({}, undefined), TypeError);
  let target = function () { /* empty */ };
  decorator(target);
  assert.same(hasOwnMetadata('key', target, undefined), true);
  target = {};
  decorator(target, 'name');
  assert.same(hasOwnMetadata('key', target, 'name'), true);
});
