var test = QUnit.test;

test('Reflect.getMetadata', function (assert) {
  var defineMetadata = core.Reflect.defineMetadata;
  var getMetadata = core.Reflect.getMetadata;
  var create = core.Object.create;
  assert.isFunction(getMetadata);
  assert.arity(getMetadata, 2);
  assert['throws'](function () {
    getMetadata('key', undefined, undefined);
  }, TypeError);
  assert.same(getMetadata('key', {}, undefined), undefined);
  var object = {};
  defineMetadata('key', 'value', object, undefined);
  assert.same(getMetadata('key', object, undefined), 'value');
  var prototype = {};
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
