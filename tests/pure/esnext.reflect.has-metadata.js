import { defineMetadata, hasMetadata } from 'core-js-pure/fn/reflect';
import create from 'core-js-pure/fn/object/create';

QUnit.test('Reflect.hasMetadata', assert => {
  assert.isFunction(hasMetadata);
  assert.arity(hasMetadata, 2);
  assert.throws(() => hasMetadata('key', undefined, undefined), TypeError);
  assert.same(hasMetadata('key', {}, undefined), false);
  let object = {};
  defineMetadata('key', 'value', object, undefined);
  assert.same(hasMetadata('key', object, undefined), true);
  let prototype = {};
  object = create(prototype);
  defineMetadata('key', 'value', prototype, undefined);
  assert.same(hasMetadata('key', object, undefined), true);
  assert.same(hasMetadata('key', {}, 'name'), false);
  object = {};
  defineMetadata('key', 'value', object, 'name');
  assert.same(hasMetadata('key', object, 'name'), true);
  prototype = {};
  object = create(prototype);
  defineMetadata('key', 'value', prototype, 'name');
  assert.same(hasMetadata('key', object, 'name'), true);
});
