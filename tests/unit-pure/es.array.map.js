import { DESCRIPTORS, STRICT } from '../helpers/constants.js';

import Symbol from 'core-js-pure/es/symbol';
import map from 'core-js-pure/es/array/map';
import defineProperty from 'core-js-pure/es/object/define-property';
import getOwnPropertyDescriptor from 'core-js-pure/es/object/get-own-property-descriptor';

QUnit.test('Array#map', assert => {
  assert.isFunction(map);
  let array = [1];
  const context = {};
  map(array, function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  assert.deepEqual(map([1, 2, 3], it => it + 1), [2, 3, 4]);
  assert.deepEqual(map([1, 2, 3], (value, key) => value + key), [1, 3, 5]);
  assert.deepEqual(map([1, 2, 3], function () {
    return +this;
  }, 2), [2, 2, 2]);
  if (STRICT) {
    assert.throws(() => map(null, () => { /* empty */ }), TypeError);
    assert.throws(() => map(undefined, () => { /* empty */ }), TypeError);
  }
  array = [];
  // eslint-disable-next-line object-shorthand -- constructor
  array.constructor = { [Symbol.species]: function () {
    return { foo: 1 };
  } };
  assert.same(map(array, Boolean).foo, 1, '@@species');
  const descriptor = DESCRIPTORS && getOwnPropertyDescriptor(Array, Symbol.species);
  if (descriptor && descriptor.configurable) {
    defineProperty(Array, Symbol.species, { configurable: true, get: () => function () {
      return { foo: 1 };
    } });
    try {
      assert.same(map([1], Boolean).foo, 1, '@@species of `Array` of the current realm');
    } finally {
      defineProperty(Array, Symbol.species, descriptor);
    }
  }
});
