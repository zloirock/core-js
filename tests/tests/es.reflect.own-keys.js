import { includes } from '../helpers/helpers';

QUnit.test('Reflect.ownKeys', function (assert) {
  var ownKeys = Reflect.ownKeys;
  var defineProperty = Object.defineProperty;
  var create = Object.create;
  var symbol = Symbol('c');
  assert.isFunction(ownKeys);
  assert.arity(ownKeys, 1);
  assert.name(ownKeys, 'ownKeys');
  assert.looksNative(ownKeys);
  assert.nonEnumerable(Reflect, 'ownKeys');
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
  assert.throws(function () {
    ownKeys(42);
  }, TypeError, 'throws on primitive');
});
