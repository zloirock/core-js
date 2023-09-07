import { includes } from '../helpers/helpers.js';

QUnit.test('Reflect.ownKeys', assert => {
  const { ownKeys } = Reflect;
  const { defineProperty, create } = Object;
  const symbol = Symbol('c');
  assert.isFunction(ownKeys);
  assert.arity(ownKeys, 1);
  assert.name(ownKeys, 'ownKeys');
  assert.looksNative(ownKeys);
  assert.nonEnumerable(Reflect, 'ownKeys');
  const object = { a: 1 };
  defineProperty(object, 'b', {
    value: 2,
  });
  object[symbol] = 3;
  let keys = ownKeys(object);
  assert.same(keys.length, 3, 'ownKeys return all own keys');
  assert.true(includes(keys, 'a'), 'ownKeys return all own keys: simple');
  assert.true(includes(keys, 'b'), 'ownKeys return all own keys: hidden');
  assert.same(object[keys[2]], 3, 'ownKeys return all own keys: symbol');
  keys = ownKeys(create(object));
  assert.same(keys.length, 0, 'ownKeys return only own keys');
  assert.throws(() => ownKeys(42), TypeError, 'throws on primitive');
});
