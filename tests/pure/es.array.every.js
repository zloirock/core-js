import { STRICT } from '../helpers/constants';

import every from '../../packages/core-js-pure/fn/array/every';

QUnit.test('Array#every', assert => {
  assert.isFunction(every);
  const array = [1];
  const context = {};
  every(array, function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  assert.ok(every([1, 2, 3], it => typeof it === 'number'));
  assert.ok(every([1, 2, 3], it => it < 4));
  assert.ok(!every([1, 2, 3], it => it < 3));
  assert.ok(!every([1, 2, 3], it => typeof it === 'string'));
  assert.ok(every([1, 2, 3], function () {
    return +this === 1;
  }, 1));
  let rez = '';
  every([1, 2, 3], (value, key) => rez += key);
  assert.ok(rez === '012');
  const arr = [1, 2, 3];
  assert.ok(every(arr, (value, key, that) => that === arr));
  if (STRICT) {
    assert.throws(() => every(null, () => { /* empty */ }), TypeError);
    assert.throws(() => every(undefined, () => { /* empty */ }), TypeError);
  }
});
