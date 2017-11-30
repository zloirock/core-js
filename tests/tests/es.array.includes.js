import { DESCRIPTORS, NATIVE, STRICT } from '../helpers/constants';

QUnit.test('Array#includes', assert => {
  const { includes } = Array.prototype;
  assert.isFunction(includes);
  assert.name(includes, 'includes');
  assert.arity(includes, 1);
  assert.looksNative(includes);
  assert.nonEnumerable(Array.prototype, 'includes');
  const object = {};
  const array = [1, 2, 3, -0, object];
  assert.ok(array.includes(1));
  assert.ok(array.includes(-0));
  assert.ok(array.includes(0));
  assert.ok(array.includes(object));
  assert.ok(!array.includes(4));
  assert.ok(!array.includes(-0.5));
  assert.ok(!array.includes({}));
  assert.ok(Array(1).includes(undefined));
  assert.ok([NaN].includes(NaN));
  if (STRICT) {
    assert.throws(() => {
      return includes.call(null, 0);
    }, TypeError);
    assert.throws(() => {
      return includes.call(undefined, 0);
    }, TypeError);
  }
  if (NATIVE && DESCRIPTORS) {
    assert.ok((() => {
      try {
        return includes.call(Object.defineProperty({
          length: -1,
        }, 0, {
          get() {
            throw new Error();
          },
        }), 1) === false;
      } catch (e) { /* empty */ }
    })(), 'uses ToLength');
  }
  assert.ok('includes' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
});
