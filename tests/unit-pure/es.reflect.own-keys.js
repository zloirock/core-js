import { includes } from '../helpers/helpers.js';

import Symbol from '@core-js/pure/es/symbol';
import create from '@core-js/pure/es/object/create';
import defineProperty from '@core-js/pure/es/object/define-property';
import ownKeys from '@core-js/pure/es/reflect/own-keys';

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
  assert.same(keys.length, 3, 'ownKeys return all own keys');
  assert.true(includes(keys, 'a'), 'ownKeys return all own keys: simple');
  assert.true(includes(keys, 'b'), 'ownKeys return all own keys: hidden');
  assert.same(object[keys[2]], 3, 'ownKeys return all own keys: symbol');
  keys = ownKeys(create(object));
  assert.same(keys.length, 0, 'ownKeys return only own keys');
  assert.throws(() => ownKeys(42), TypeError, 'throws on primitive');
});
