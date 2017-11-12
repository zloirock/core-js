QUnit.test('Reflect.deleteMetadata', function (assert) {
  var defineMetadata = core.Reflect.defineMetadata;
  var hasOwnMetadata = core.Reflect.hasOwnMetadata;
  var deleteMetadata = core.Reflect.deleteMetadata;
  var create = core.Object.create;
  assert.isFunction(deleteMetadata);
  assert.arity(deleteMetadata, 2);
  assert['throws'](function () {
    deleteMetadata('key', undefined, undefined);
  }, TypeError);
  assert.same(deleteMetadata('key', {}, undefined), false);
  var object = {};
  defineMetadata('key', 'value', object, undefined);
  assert.same(deleteMetadata('key', object, undefined), true);
  var prototype = {};
  defineMetadata('key', 'value', prototype, undefined);
  assert.same(deleteMetadata('key', create(prototype), undefined), false);
  object = {};
  defineMetadata('key', 'value', object, undefined);
  deleteMetadata('key', object, undefined);
  assert.same(hasOwnMetadata('key', object, undefined), false);
});
