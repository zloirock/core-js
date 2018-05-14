import { STRICT } from '../helpers/constants';

import forEach from 'core-js-pure/features/array/for-each';

QUnit.test('Array#forEach', assert => {
  assert.isFunction(forEach);
  let array = [1];
  const context = {};
  forEach(array, function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  let result = '';
  forEach([1, 2, 3], it => {
    result += it;
  });
  assert.ok(result === '123');
  result = '';
  forEach([1, 2, 3], (value, key) => {
    result += key;
  });
  assert.ok(result === '012');
  result = '';
  forEach([1, 2, 3], (value, key, that) => {
    result += that;
  });
  assert.ok(result === '1,2,31,2,31,2,3');
  result = '';
  forEach([1, 2, 3], function () {
    result += this;
  }, 1);
  assert.ok(result === '111');
  result = '';
  array = [];
  array[5] = '';
  forEach(array, (value, key) => {
    result += key;
  });
  assert.ok(result === '5');
  if (STRICT) {
    assert.throws(() => forEach(null, () => { /* empty */ }), TypeError);
    assert.throws(() => forEach(undefined, () => { /* empty */ }), TypeError);
  }
});
