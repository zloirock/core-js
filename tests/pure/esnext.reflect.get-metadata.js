import { defineMetadata, getMetadata } from 'core-js-pure/features/reflect';
import create from 'core-js-pure/features/object/create';

QUnit.test('Reflect.getMetadata', assert => {
  assert.isFunction(getMetadata);
  assert.arity(getMetadata, 2);
  assert.throws(() => getMetadata('key', undefined, undefined), TypeError);
  assert.same(getMetadata('key', {}, undefined), undefined);
  let object = {};
  defineMetadata('key', 'value', object, undefined);
  assert.same(getMetadata('key', object, undefined), 'value');
  let prototype = {};
  object = create(prototype);
  defineMetadata('key', 'value', prototype, undefined);
  assert.same(getMetadata('key', object, undefined), 'value');
  assert.same(getMetadata('key', {}, 'name'), undefined);
  object = {};
  defineMetadata('key', 'value', object, 'name');
  assert.same(getMetadata('key', object, 'name'), 'value');
  prototype = {};
  object = create(prototype);
  defineMetadata('key', 'value', prototype, 'name');
  assert.same(getMetadata('key', object, 'name'), 'value');
});
