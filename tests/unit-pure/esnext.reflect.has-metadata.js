import create from '@core-js/pure/full/object/create';
import defineMetadata from '@core-js/pure/full/reflect/define-metadata';
import hasMetadata from '@core-js/pure/full/reflect/has-metadata';

QUnit.test('Reflect.hasMetadata', assert => {
  assert.isFunction(hasMetadata);
  assert.arity(hasMetadata, 2);
  assert.throws(() => hasMetadata('key', undefined, undefined), TypeError);
  assert.false(hasMetadata('key', {}, undefined));
  let object = {};
  defineMetadata('key', 'value', object, undefined);
  assert.true(hasMetadata('key', object, undefined));
  let prototype = {};
  object = create(prototype);
  defineMetadata('key', 'value', prototype, undefined);
  assert.true(hasMetadata('key', object, undefined));
  assert.false(hasMetadata('key', {}, 'name'));
  object = {};
  defineMetadata('key', 'value', object, 'name');
  assert.true(hasMetadata('key', object, 'name'));
  prototype = {};
  object = create(prototype);
  defineMetadata('key', 'value', prototype, 'name');
  assert.true(hasMetadata('key', object, 'name'));
});
