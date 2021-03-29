import { STRICT } from '../helpers/constants';

import Symbol from 'core-js-pure/full/symbol';
import filterOut from 'core-js-pure/full/array/filter-out';

QUnit.test('Array#filterOut', assert => {
  assert.isFunction(filterOut);
  let array = [1];
  const context = {};
  filterOut(array, function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  assert.deepEqual([1, 2, 3, 4, 5], filterOut([1, 2, 3, 'q', {}, 4, true, 5], it => typeof it !== 'number'));
  if (STRICT) {
    assert.throws(() => filterOut(null, () => { /* empty */ }), TypeError);
    assert.throws(() => filterOut(undefined, () => { /* empty */ }), TypeError);
  }
  array = [];
  // eslint-disable-next-line object-shorthand -- constructor
  array.constructor = { [Symbol.species]: function () {
    return { foo: 1 };
  } };
  assert.same(filterOut(array, Boolean).foo, 1, '@@species');
});
