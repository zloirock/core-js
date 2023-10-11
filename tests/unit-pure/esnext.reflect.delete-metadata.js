import create from '@core-js/pure/full/object/create';
import defineMetadata from '@core-js/pure/full/reflect/define-metadata';
import hasOwnMetadata from '@core-js/pure/full/reflect/has-own-metadata';
import deleteMetadata from '@core-js/pure/full/reflect/delete-metadata';

QUnit.test('Reflect.deleteMetadata', assert => {
  assert.isFunction(deleteMetadata);
  assert.arity(deleteMetadata, 2);
  assert.throws(() => deleteMetadata('key', undefined, undefined), TypeError);
  assert.false(deleteMetadata('key', {}, undefined));
  let object = {};
  defineMetadata('key', 'value', object, undefined);
  assert.true(deleteMetadata('key', object, undefined));
  const prototype = {};
  defineMetadata('key', 'value', prototype, undefined);
  assert.false(deleteMetadata('key', create(prototype), undefined));
  object = {};
  defineMetadata('key', 'value', object, undefined);
  deleteMetadata('key', object, undefined);
  assert.false(hasOwnMetadata('key', object, undefined));
});
