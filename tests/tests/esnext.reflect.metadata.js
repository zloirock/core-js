QUnit.test('Reflect.metadata', assert => {
  const { metadata, hasOwnMetadata } = Reflect;
  assert.isFunction(metadata);
  assert.arity(metadata, 2);
  assert.name(metadata, 'metadata');
  assert.looksNative(metadata);
  assert.isFunction(metadata('key', 'value'));
  assert.nonEnumerable(Reflect, 'metadata');
  const decorator = metadata('key', 'value');
  assert.throws(() => {
    return decorator(undefined, 'name');
  }, TypeError);
  assert.throws(() => {
    return decorator({}, undefined);
  }, TypeError);
  let target = function () { /* empty */ };
  decorator(target);
  assert.same(hasOwnMetadata('key', target, undefined), true);
  target = {};
  decorator(target, 'name');
  assert.same(hasOwnMetadata('key', target, 'name'), true);
});
