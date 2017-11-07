var test = QUnit.test;

test('Reflect.metadata', function (assert) {
  var metadata = Reflect.metadata;
  var hasOwnMetadata = Reflect.hasOwnMetadata;
  assert.isFunction(metadata);
  assert.arity(metadata, 2);
  assert.name(metadata, 'metadata');
  assert.looksNative(metadata);
  assert.isFunction(metadata('key', 'value'));
  assert.nonEnumerable(Reflect, 'metadata');
  var decorator = metadata('key', 'value');
  assert['throws'](function () {
    decorator(undefined, 'name');
  }, TypeError);
  assert['throws'](function () {
    decorator({}, undefined);
  }, TypeError);
  var target = function () { /* empty */ };
  decorator(target);
  assert.same(hasOwnMetadata('key', target, undefined), true);
  target = {};
  decorator(target, 'name');
  assert.same(hasOwnMetadata('key', target, 'name'), true);
});
