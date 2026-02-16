import { DESCRIPTORS, NATIVE } from '../helpers/constants.js';
import { createConversionChecker } from '../helpers/helpers.js';

QUnit.test('Reflect.get', assert => {
  const { defineProperty, create } = Object;
  const { get } = Reflect;
  assert.isFunction(get);
  if (NATIVE) assert.arity(get, 2);
  assert.name(get, 'get');
  assert.looksNative(get);
  assert.nonEnumerable(Reflect, 'get');
  assert.same(get({ qux: 987 }, 'qux'), 987);
  if (DESCRIPTORS) {
    const target = create(defineProperty({ z: 3 }, 'w', {
      get() {
        return this;
      },
    }), {
      x: {
        value: 1,
      },
      y: {
        get() {
          return this;
        },
      },
    });
    const receiver = {};
    assert.same(get(target, 'x', receiver), 1, 'get x');
    assert.same(get(target, 'y', receiver), receiver, 'get y');
    assert.same(get(target, 'z', receiver), 3, 'get z');
    assert.same(get(target, 'w', receiver), receiver, 'get w');
    assert.same(get(target, 'u', receiver), undefined, 'get u');

    // ToPropertyKey should be called exactly once even with prototype chain traversal
    const keyObj = createConversionChecker(1, 'x');
    get(create({ x: 42 }), keyObj, {});
    assert.same(keyObj.$valueOf, 0, 'ToPropertyKey called once in Reflect.get, #1');
    assert.same(keyObj.$toString, 1, 'ToPropertyKey called once in Reflect.get, #2');
  }
  assert.throws(() => get(42, 'constructor'), TypeError, 'throws on primitive');

  // argument order: target should be validated before ToPropertyKey
  const orderChecker = createConversionChecker(1, 'qux');
  assert.throws(() => get(42, orderChecker), TypeError, 'throws on primitive before ToPropertyKey');
  assert.same(orderChecker.$toString, 0, 'ToPropertyKey not called before target validation in Reflect.get');
});

