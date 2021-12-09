import { STRICT } from '../helpers/constants';

import Symbol from 'core-js-pure/features/symbol';
import groupBy from 'core-js-pure/features/array/group-by';
import getPrototypeOf from 'core-js-pure/features/object/get-prototype-of';

QUnit.test('Array#groupBy', assert => {
  assert.isFunction(groupBy);
  let array = [1];
  const context = {};
  groupBy(array, function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  assert.same(getPrototypeOf(groupBy([], it => it)), null, 'null proto');
  assert.deepEqual(groupBy([1, 2, 3], it => it % 2), { 1: [1, 3], 0: [2] }, '#1');
  assert.deepEqual(
    groupBy([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], it => `i${ it % 5 }`),
    { i1: [1, 6, 11], i2: [2, 7, 12], i3: [3, 8], i4: [4, 9], i0: [5, 10] },
    '#2',
  );
  assert.deepEqual(groupBy(Array(3), it => it), { undefined: [undefined, undefined, undefined] }, '#3');
  if (STRICT) {
    assert.throws(() => groupBy(null, () => { /* empty */ }), TypeError);
    assert.throws(() => groupBy(undefined, () => { /* empty */ }), TypeError);
  }
  array = [1];
  // eslint-disable-next-line object-shorthand -- constructor
  array.constructor = { [Symbol.species]: function () {
    return { foo: 1 };
  } };
  assert.same(groupBy(array, Boolean).true.foo, undefined, 'no @@species');
});
