QUnit.test('Reflect.metadata', function (assert) {
  var metadata = core.Reflect.metadata;
  var hasOwnMetadata = core.Reflect.hasOwnMetadata;
  assert.isFunction(metadata);
  assert.arity(metadata, 2);
  assert.isFunction(metadata('key', 'value'));
  var decorator = metadata('key', 'value');
  assert.throws(function () {
    decorator(undefined, 'name');
  }, TypeError);
  assert.throws(function () {
    decorator({}, undefined);
  }, TypeError);
  var target = function () { /* empty */ };
  decorator(target);
  assert.same(hasOwnMetadata('key', target, undefined), true);
  target = {};
  decorator(target, 'name');
  assert.same(hasOwnMetadata('key', target, 'name'), true);
});
