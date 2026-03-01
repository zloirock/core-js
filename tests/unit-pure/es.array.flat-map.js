import { STRICT } from '../helpers/constants.js';

import flatMap from 'core-js-pure/es/array/flat-map';

QUnit.test('Array#flatMap', assert => {
  assert.isFunction(flatMap);
  assert.deepEqual(flatMap([], it => it), []);
  assert.deepEqual(flatMap([1, 2, 3], it => it), [1, 2, 3]);
  assert.deepEqual(flatMap([1, 2, 3], it => [it, it]), [1, 1, 2, 2, 3, 3]);
  assert.deepEqual(flatMap([1, 2, 3], it => [[it], [it]]), [[1], [1], [2], [2], [3], [3]]);
  assert.deepEqual(flatMap([1, [2, 3]], () => 1), [1, 1]);
  const array = [1];
  const context = {};
  flatMap(array, function (value, index, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(index, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
    return value;
  }, context);
  if (STRICT) {
    assert.throws(() => flatMap(null, it => it), TypeError);
    assert.throws(() => flatMap(undefined, it => it), TypeError);
  }
  assert.notThrows(() => flatMap({ length: -1 }, () => {
    throw new Error();
  }).length === 0, 'uses ToLength');
});
