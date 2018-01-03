import { DESCRIPTORS } from '../helpers/constants';

import Symbol from '../../packages/core-js-pure/fn/symbol';
import { assign, keys, defineProperty } from '../../packages/core-js-pure/fn/object';

QUnit.test('Object.assign', assert => {
  assert.isFunction(assign);
  let object = { q: 1 };
  assert.strictEqual(object, assign(object, { bar: 2 }), 'assign return target');
  assert.strictEqual(object.bar, 2, 'assign define properties');
  assert.deepEqual(assign({}, { q: 1 }, { w: 2 }), { q: 1, w: 2 });
  assert.deepEqual(assign({}, 'qwe'), { 0: 'q', 1: 'w', 2: 'e' });
  assert.throws(() => assign(null, { q: 1 }), TypeError);
  assert.throws(() => assign(undefined, { q: 1 }), TypeError);
  let string = assign('qwe', { q: 1 });
  assert.strictEqual(typeof string, 'object');
  assert.strictEqual(String(string), 'qwe');
  assert.strictEqual(string.q, 1);
  if (DESCRIPTORS) {
    object = { baz: 1 };
    assign(object, defineProperty({}, 'bar', {
      get() {
        return this.baz + 1;
      },
    }));
    assert.ok(object.bar === undefined, "assign don't copy descriptors");
    object = { a: 'a' };
    const c = Symbol('c');
    const d = Symbol('d');
    object[c] = 'c';
    defineProperty(object, 'b', { value: 'b' });
    defineProperty(object, d, { value: 'd' });
    const object2 = assign({}, object);
    assert.strictEqual(object2.a, 'a', 'a');
    assert.strictEqual(object2.b, undefined, 'b');
    assert.strictEqual(object2[c], 'c', 'c');
    assert.strictEqual(object2[d], undefined, 'd');
    try {
      assert.strictEqual(Function('assign', `
        return assign({ b: 1 }, { get a() {
          delete this.b;
        }, b: 2 });
      `)(assign).b, 1);
    } catch (e) { /* empty */ }
    try {
      assert.strictEqual(Function('assign', `
        return assign({ b: 1 }, { get a() {
          Object.defineProperty(this, "b", {
            value: 4,
            enumerable: false
          });
        }, b: 2 });
      `)(assign).b, 1);
    } catch (e) { /* empty */ }
  }
  string = 'abcdefghijklmnopqrst';
  const result = {};
  for (let i = 0, { length } = string; i < length; ++i) {
    const char = string.charAt(i);
    result[char] = char;
  }
  assert.strictEqual(keys(assign({}, result)).join(''), string);
});
