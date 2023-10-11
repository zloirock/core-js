import hasOwnMetadata from '@core-js/pure/full/reflect/has-own-metadata';
import metadata from '@core-js/pure/full/reflect/metadata';

QUnit.test('Reflect.metadata', assert => {
  assert.isFunction(metadata);
  assert.arity(metadata, 2);
  assert.isFunction(metadata('key', 'value'));
  const decorator = metadata('key', 'value');
  assert.throws(() => decorator(undefined, 'name'), TypeError);
  let target = function () { /* empty */ };
  decorator(target);
  assert.true(hasOwnMetadata('key', target, undefined));
  target = {};
  decorator(target, 'name');
  assert.true(hasOwnMetadata('key', target, 'name'));
});
