import { includes } from '../helpers/helpers';

import keys from 'core-js-pure/full/object/keys';

QUnit.test('Object.keys', assert => {
  assert.isFunction(keys);
  assert.arity(keys, 1);
  function F1() {
    this.w = 1;
  }
  function F2() {
    this.toString = 1;
  }
  F1.prototype.q = F2.prototype.q = 1;
  assert.deepEqual(keys([1, 2, 3]), ['0', '1', '2']);
  assert.deepEqual(keys(new F1()), ['w']);
  assert.deepEqual(keys(new F2()), ['toString']);
  assert.ok(!includes(keys(Array.prototype), 'push'));
  const primitives = [42, 'foo', false];
  for (const value of primitives) {
    assert.notThrows(() => keys(value), `accept ${ typeof value }`);
  }
  assert.throws(() => keys(null), TypeError, 'throws on null');
  assert.throws(() => keys(undefined), TypeError, 'throws on undefined');
});
