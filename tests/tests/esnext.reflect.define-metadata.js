var test = QUnit.test;

test('Reflect.defineMetadata', function (assert) {
  var defineMetadata = Reflect.defineMetadata;
  assert.isFunction(defineMetadata);
  assert.arity(defineMetadata, 4);
  assert.name(defineMetadata, 'defineMetadata');
  assert.looksNative(defineMetadata);
  assert.nonEnumerable(Reflect, 'defineMetadata');
  assert['throws'](function () {
    defineMetadata('key', 'value', undefined, undefined);
  }, TypeError);
  assert.same(defineMetadata('key', 'value', {}, undefined), undefined);
  assert.same(defineMetadata('key', 'value', {}, 'name'), undefined);
});
