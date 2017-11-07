var test = QUnit.test;

test('Reflect.hasOwnMetadata', function (assert) {
  var defineMetadata = Reflect.defineMetadata;
  var hasOwnMetadata = Reflect.hasOwnMetadata;
  var create = Object.create;
  assert.isFunction(hasOwnMetadata);
  assert.arity(hasOwnMetadata, 2);
  assert.name(hasOwnMetadata, 'hasOwnMetadata');
  assert.looksNative(hasOwnMetadata);
  assert.nonEnumerable(Reflect, 'hasOwnMetadata');
  assert['throws'](function () {
    hasOwnMetadata('key', undefined, undefined);
  }, TypeError);
  assert.same(hasOwnMetadata('key', {}, undefined), false);
  var object = {};
  defineMetadata('key', 'value', object, undefined);
  assert.same(hasOwnMetadata('key', object, undefined), true);
  var prototype = {};
  object = create(prototype);
  defineMetadata('key', 'value', prototype, undefined);
  assert.same(hasOwnMetadata('key', object, undefined), false);
  assert.same(hasOwnMetadata('key', {}, 'name'), false);
  object = {};
  defineMetadata('key', 'value', object, 'name');
  assert.same(hasOwnMetadata('key', object, 'name'), true);
  prototype = {};
  object = create(prototype);
  defineMetadata('key', 'value', prototype, 'name');
  assert.same(hasOwnMetadata('key', object, 'name'), false);
});
