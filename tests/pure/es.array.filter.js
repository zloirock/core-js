import { STRICT } from '../helpers/constants';

import Symbol from 'core-js-pure/features/symbol';
import filter from 'core-js-pure/features/array/filter';

QUnit.test('Array#filter', assert => {
  assert.isFunction(filter);
  let array = [1];
  const context = {};
  filter(array, function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  assert.deepEqual([1, 2, 3, 4, 5], filter([1, 2, 3, 'q', {}, 4, true, 5], it => typeof it === 'number'));
  if (STRICT) {
    assert.throws(() => filter(null, () => { /* empty */ }), TypeError);
    assert.throws(() => filter(undefined, () => { /* empty */ }), TypeError);
  }
  array = [];
  array.constructor = { [Symbol.species]: function () { // eslint-disable-line object-shorthand
    return { foo: 1 };
  } };
  assert.same(filter(array, Boolean).foo, 1, '@@species');
});
