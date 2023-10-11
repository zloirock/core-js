import create from '@core-js/pure/full/object/create';
import defineMetadata from '@core-js/pure/full/reflect/define-metadata';
import hasOwnMetadata from '@core-js/pure/full/reflect/has-own-metadata';

QUnit.test('Reflect.hasOwnMetadata', assert => {
  assert.isFunction(hasOwnMetadata);
  assert.arity(hasOwnMetadata, 2);
  assert.throws(() => hasOwnMetadata('key', undefined, undefined), TypeError);
  assert.false(hasOwnMetadata('key', {}, undefined));
  let object = {};
  defineMetadata('key', 'value', object, undefined);
  assert.true(hasOwnMetadata('key', object, undefined));
  let prototype = {};
  object = create(prototype);
  defineMetadata('key', 'value', prototype, undefined);
  assert.false(hasOwnMetadata('key', object, undefined));
  assert.false(hasOwnMetadata('key', {}, 'name'));
  object = {};
  defineMetadata('key', 'value', object, 'name');
  assert.true(hasOwnMetadata('key', object, 'name'));
  prototype = {};
  object = create(prototype);
  defineMetadata('key', 'value', prototype, 'name');
  assert.false(hasOwnMetadata('key', object, 'name'));
});
