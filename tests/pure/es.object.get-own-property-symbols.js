import { create, getOwnPropertyNames, getOwnPropertySymbols } from 'core-js-pure/es/object';
import Symbol from 'core-js-pure/es/symbol';

QUnit.test('Object.getOwnPropertySymbols', assert => {
  assert.isFunction(getOwnPropertySymbols);
  const prototype = { q: 1, w: 2, e: 3 };
  prototype[Symbol()] = 42;
  prototype[Symbol()] = 43;
  assert.deepEqual(getOwnPropertyNames(prototype).sort(), ['e', 'q', 'w']);
  assert.strictEqual(getOwnPropertySymbols(prototype).length, 2);
  const object = create(prototype);
  object.a = 1;
  object.s = 2;
  object.d = 3;
  object[Symbol()] = 44;
  assert.deepEqual(getOwnPropertyNames(object).sort(), ['a', 'd', 's']);
  assert.strictEqual(getOwnPropertySymbols(object).length, 1);
  assert.strictEqual(getOwnPropertySymbols(Object.prototype).length, 0);
  const primitives = [42, 'foo', false];
  for (const value of primitives) {
    assert.notThrows(() => getOwnPropertySymbols(value), `accept ${ typeof value }`);
  }
});
