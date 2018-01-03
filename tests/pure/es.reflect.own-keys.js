import { includes } from '../helpers/helpers';

import Symbol from '../../packages/core-js-pure/fn/symbol';
import ownKeys from '../../packages/core-js-pure/fn/reflect/own-keys';
import { defineProperty, create } from '../../packages/core-js-pure/fn/object';

QUnit.test('Reflect.ownKeys', assert => {
  assert.isFunction(ownKeys);
  assert.arity(ownKeys, 1);
  if ('name' in ownKeys) {
    assert.name(ownKeys, 'ownKeys');
  }
  const object = { a: 1 };
  defineProperty(object, 'b', {
    value: 2,
  });
  object[Symbol('c')] = 3;
  let keys = ownKeys(object);
  assert.strictEqual(keys.length, 3, 'ownKeys return all own keys');
  assert.ok(includes(keys, 'a'), 'ownKeys return all own keys: simple');
  assert.ok(includes(keys, 'b'), 'ownKeys return all own keys: hidden');
  assert.strictEqual(object[keys[2]], 3, 'ownKeys return all own keys: symbol');
  keys = ownKeys(create(object));
  assert.strictEqual(keys.length, 0, 'ownKeys return only own keys');
  assert.throws(() => ownKeys(42), TypeError, 'throws on primitive');
});
