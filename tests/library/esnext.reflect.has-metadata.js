QUnit.test('Reflect.hasMetadata', function (assert) {
  var defineMetadata = core.Reflect.defineMetadata;
  var hasMetadata = core.Reflect.hasMetadata;
  var create = core.Object.create;
  assert.isFunction(hasMetadata);
  assert.arity(hasMetadata, 2);
  assert.throws(function () {
    hasMetadata('key', undefined, undefined);
  }, TypeError);
  assert.same(hasMetadata('key', {}, undefined), false);
  var object = {};
  defineMetadata('key', 'value', object, undefined);
  assert.same(hasMetadata('key', object, undefined), true);
  var prototype = {};
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
