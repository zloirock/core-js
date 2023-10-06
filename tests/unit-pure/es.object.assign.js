import Symbol from 'core-js-pure/es/symbol';
import defineProperty from 'core-js-pure/es/object/define-property';
import keys from 'core-js-pure/es/object/keys';
import assign from 'core-js-pure/es/object/assign';

QUnit.test('Object.assign', assert => {
  assert.isFunction(assign);
  let object = { q: 1 };
  assert.same(object, assign(object, { bar: 2 }), 'assign return target');
  assert.same(object.bar, 2, 'assign define properties');
  assert.deepEqual(assign({}, { q: 1 }, { w: 2 }), { q: 1, w: 2 });
  assert.deepEqual(assign({}, 'qwe'), { 0: 'q', 1: 'w', 2: 'e' });
  assert.throws(() => assign(null, { q: 1 }), TypeError);
  assert.throws(() => assign(undefined, { q: 1 }), TypeError);
  let string = assign('qwe', { q: 1 });
  assert.same(typeof string, 'object');
  assert.same(String(string), 'qwe');
  assert.same(string.q, 1);
  assert.same(assign({}, { valueOf: 42 }).valueOf, 42, 'IE enum keys bug');

  object = { baz: 1 };
  assign(object, defineProperty({}, 'bar', {
    get() {
      return this.baz + 1;
    },
  }));
  assert.same(object.bar, undefined, "assign don't copy descriptors");
  object = { a: 'a' };
  const c = Symbol('c');
  const d = Symbol('d');
  object[c] = 'c';
  defineProperty(object, 'b', { value: 'b' });
  defineProperty(object, d, { value: 'd' });
  const object2 = assign({}, object);
  assert.same(object2.a, 'a', 'a');
  assert.same(object2.b, undefined, 'b');
  assert.same(object2[c], 'c', 'c');
  assert.same(object2[d], undefined, 'd');
  try {
    assert.same(Function('assign', `
      return assign({ b: 1 }, { get a() {
        delete this.b;
      }, b: 2 });
    `)(assign).b, 1);
  } catch { /* empty */ }
  try {
    assert.same(Function('assign', `
      return assign({ b: 1 }, { get a() {
        Object.defineProperty(this, "b", {
          value: 4,
          enumerable: false
        });
      }, b: 2 });
    `)(assign).b, 1);
  } catch { /* empty */ }

  string = 'abcdefghijklmnopqrst';
  const result = {};
  for (let i = 0, { length } = string; i < length; ++i) {
    const chr = string.charAt(i);
    result[chr] = chr;
  }
  assert.same(keys(assign({}, result)).join(''), string);
});
