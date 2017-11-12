QUnit.test('Reflect.deleteMetadata', function (assert) {
  var defineMetadata = Reflect.defineMetadata;
  var hasOwnMetadata = Reflect.hasOwnMetadata;
  var deleteMetadata = Reflect.deleteMetadata;
  var create = Object.create;
  assert.isFunction(deleteMetadata);
  assert.arity(deleteMetadata, 2);
  assert.name(deleteMetadata, 'deleteMetadata');
  assert.looksNative(deleteMetadata);
  assert.nonEnumerable(Reflect, 'deleteMetadata');
  assert.throws(function () {
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
