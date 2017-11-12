QUnit.test('Reflect.defineMetadata', function (assert) {
  var defineMetadata = core.Reflect.defineMetadata;
  assert.isFunction(defineMetadata);
  assert.arity(defineMetadata, 4);
  assert['throws'](function () {
    defineMetadata('key', 'value', undefined, undefined);
  }, TypeError);
  assert.same(defineMetadata('key', 'value', {}, undefined), undefined);
  assert.same(defineMetadata('key', 'value', {}, 'name'), undefined);
});
