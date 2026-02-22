import { DESCRIPTORS, FREEZING } from '../helpers/constants.js';
import { createConversionChecker } from '../helpers/helpers.js';

import create from 'core-js-pure/es/object/create';
import defineProperty from 'core-js-pure/es/object/define-property';
import getOwnPropertyDescriptor from 'core-js-pure/es/object/get-own-property-descriptor';
import getPrototypeOf from 'core-js-pure/es/object/get-prototype-of';
import freeze from 'core-js-pure/es/object/freeze';
import preventExtensions from 'core-js-pure/es/object/prevent-extensions';
import seal from 'core-js-pure/es/object/seal';
import set from 'core-js-pure/es/reflect/set';

QUnit.test('Reflect.set', assert => {
  assert.isFunction(set);
  if ('name' in set) {
    assert.name(set, 'set');
  }
  const object = {};
  assert.true(set(object, 'quux', 654));
  assert.same(object.quux, 654);
  let target = {};
  const receiver = {};
  set(target, 'foo', 1, receiver);
  assert.same(target.foo, undefined, 'target.foo === undefined');
  assert.same(receiver.foo, 1, 'receiver.foo === 1');
  if (DESCRIPTORS) {
    defineProperty(receiver, 'bar', {
      value: 0,
      writable: true,
      enumerable: false,
      configurable: true,
    });
    set(target, 'bar', 1, receiver);
    assert.same(receiver.bar, 1, 'receiver.bar === 1');
    assert.false(getOwnPropertyDescriptor(receiver, 'bar').enumerable, 'enumerability not overridden');
    let out;
    target = create(defineProperty({ z: 3 }, 'w', {
      set() {
        out = this;
      },
    }), {
      x: {
        value: 1,
        writable: true,
        configurable: true,
      },
      y: {
        set() {
          out = this;
        },
      },
      c: {
        value: 1,
        writable: false,
        configurable: false,
      },
    });
    assert.true(set(target, 'x', 2, target), 'set x');
    assert.same(target.x, 2, 'set x');
    out = null;
    assert.true(set(target, 'y', 2, target), 'set y');
    assert.same(out, target, 'set y');
    assert.true(set(target, 'z', 4, target));
    assert.same(target.z, 4, 'set z');
    out = null;
    assert.true(set(target, 'w', 1, target), 'set w');
    assert.same(out, target, 'set w');
    assert.true(set(target, 'u', 0, target), 'set u');
    assert.same(target.u, 0, 'set u');
    assert.false(set(target, 'c', 2, target), 'set c');
    assert.same(target.c, 1, 'set c');

    // https://github.com/zloirock/core-js/issues/392
    let o = defineProperty({}, 'test', {
      writable: false,
      configurable: true,
    });
    assert.false(set(getPrototypeOf(o), 'test', 1, o));

    // https://github.com/zloirock/core-js/issues/393
    o = defineProperty({}, 'test', {
      get() { /* empty */ },
    });
    assert.notThrows(() => !set(getPrototypeOf(o), 'test', 1, o));
    o = defineProperty({}, 'test', {
      // eslint-disable-next-line no-unused-vars -- required for testing
      set(v) { /* empty */ },
    });
    assert.notThrows(() => !set(getPrototypeOf(o), 'test', 1, o));

    // accessor descriptor with get: undefined, set: undefined on receiver should return false
    const accessorReceiver = {};
    defineProperty(accessorReceiver, 'prop', { get: undefined, set: undefined, configurable: true });
    const accessorTarget = defineProperty({}, 'prop', { value: 1, writable: true, configurable: true });
    assert.false(set(accessorTarget, 'prop', 2, accessorReceiver), 'accessor descriptor on receiver with undefined get/set');

    // ToPropertyKey should be called exactly once
    const keyObj = createConversionChecker(1, 'x');
    set(create({ x: 42 }), keyObj, 1);
    assert.same(keyObj.$valueOf, 0, 'ToPropertyKey called once in Reflect.set, #1');
    assert.same(keyObj.$toString, 1, 'ToPropertyKey called once in Reflect.set, #2');
  }

  assert.throws(() => set(42, 'q', 42), TypeError, 'throws on primitive');

  // Reflect.set should pass only { value: V } to [[DefineOwnProperty]] when updating existing data property
  if (DESCRIPTORS) {
    const obj = defineProperty({}, 'x', { value: 1, writable: true, enumerable: true, configurable: true });
    assert.true(set(obj, 'x', 42), 'set existing writable property');
    const desc = getOwnPropertyDescriptor(obj, 'x');
    assert.same(desc.value, 42, 'value updated');
    assert.true(desc.writable, 'writable preserved');
    assert.true(desc.enumerable, 'enumerable preserved');
    assert.true(desc.configurable, 'configurable preserved');
  }

  // argument order: target should be validated before ToPropertyKey
  const orderChecker = createConversionChecker(1, 'qux');
  assert.throws(() => set(42, orderChecker, 1), TypeError, 'throws on primitive before ToPropertyKey');

  // non-extensible receiver should return false, not throw
  if (FREEZING) {
    assert.false(set({}, 'x', 42, freeze({})), 'frozen empty receiver returns false');
    assert.false(set({}, 'x', 42, preventExtensions({})), 'non-extensible receiver returns false');
    assert.false(set({}, 'x', 42, seal({})), 'sealed empty receiver returns false');
  }

  assert.same(orderChecker.$toString, 0, 'ToPropertyKey not called before target validation in Reflect.set');
});
