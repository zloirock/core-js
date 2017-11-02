var test = QUnit.test;

test('Reflect.getOwnMetadata', function (assert) {
  var defineMetadata = core.Reflect.defineMetadata;
  var getOwnMetadata = core.Reflect.getOwnMetadata;
  var create = core.Object.create;
  assert.isFunction(getOwnMetadata);
  assert.arity(getOwnMetadata, 2);
  assert['throws'](function () {
    getOwnMetadata('key', undefined, undefined);
  }, TypeError);
  assert.same(getOwnMetadata('key', {}, undefined), undefined);
  var object = {};
  defineMetadata('key', 'value', object, undefined);
  assert.same(getOwnMetadata('key', object, undefined), 'value');
  var prototype = {};
  object = create(prototype);
  defineMetadata('key', 'value', prototype, undefined);
  assert.same(getOwnMetadata('key', object, undefined), undefined);
  assert.same(getOwnMetadata('key', {}, 'name'), undefined);
  object = {};
  defineMetadata('key', 'value', object, 'name');
  assert.same(getOwnMetadata('key', object, 'name'), 'value');
  prototype = {};
  object = create(prototype);
  defineMetadata('key', 'value', prototype, 'name');
  assert.same(getOwnMetadata('key', object, 'name'), undefined);
});
