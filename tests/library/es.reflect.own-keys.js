var test = QUnit.test;

test('Reflect.ownKeys', function (assert) {
  var ownKeys = core.Reflect.ownKeys;
  var defineProperty = core.Object.defineProperty;
  var create = core.Object.create;
  var symbol = core.Symbol('c');
  assert.isFunction(ownKeys);
  assert.arity(ownKeys, 1);
  if ('name' in ownKeys) {
    assert.name(ownKeys, 'ownKeys');
  }
  var object = { a: 1 };
  defineProperty(object, 'b', {
    value: 2
  });
  object[symbol] = 3;
  var keys = ownKeys(object);
  assert.strictEqual(keys.length, 3, 'ownKeys return all own keys');
  assert.ok(includes(keys, 'a'), 'ownKeys return all own keys: simple');
  assert.ok(includes(keys, 'b'), 'ownKeys return all own keys: hidden');
  assert.strictEqual(object[keys[2]], 3, 'ownKeys return all own keys: symbol');
  keys = ownKeys(create(object));
  assert.strictEqual(keys.length, 0, 'ownKeys return only own keys');
  assert['throws'](function () {
    ownKeys(42);
  }, TypeError, 'throws on primitive');
});
