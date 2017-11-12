QUnit.test('Reflect.hasMetadata', function (assert) {
  var defineMetadata = Reflect.defineMetadata;
  var hasMetadata = Reflect.hasMetadata;
  var create = Object.create;
  assert.isFunction(hasMetadata);
  assert.arity(hasMetadata, 2);
  assert.name(hasMetadata, 'hasMetadata');
  assert.looksNative(hasMetadata);
  assert.nonEnumerable(Reflect, 'hasMetadata');
  assert['throws'](function () {
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
