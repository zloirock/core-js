QUnit.test('Reflect.metadata', assert => {
  const { metadata, hasOwnMetadata } = Reflect;
  assert.isFunction(metadata);
  assert.arity(metadata, 2);
  assert.name(metadata, 'metadata');
  assert.looksNative(metadata);
  assert.isFunction(metadata('key', 'value'));
  assert.nonEnumerable(Reflect, 'metadata');
  const decorator = metadata('key', 'value');
  assert.throws(() => decorator(undefined, 'name'), TypeError);
  let target = function () { /* empty */ };
  decorator(target);
  assert.true(hasOwnMetadata('key', target, undefined));
  target = {};
  decorator(target, 'name');
  assert.true(hasOwnMetadata('key', target, 'name'));
});
