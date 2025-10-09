import { createIterable } from '../helpers/helpers.js';

import groupBy from '@core-js/pure/es/object/group-by';
import entries from '@core-js/pure/es/object/entries';
import Symbol from '@core-js/pure/full/symbol';

const { getPrototypeOf } = Object;

QUnit.test('Object.groupBy', assert => {
  assert.isFunction(groupBy);
  assert.arity(groupBy, 2);
  assert.name(groupBy, 'groupBy');

  assert.same(getPrototypeOf(groupBy([], it => it)), null);

  assert.deepEqual(entries(groupBy([], it => it)), []);
  assert.deepEqual(entries(groupBy([1, 2], it => it ** 2)), [['1', [1]], ['4', [2]]]);
  assert.deepEqual(entries(groupBy([1, 2, 1], it => it ** 2)), [['1', [1, 1]], ['4', [2]]]);
  assert.deepEqual(entries(groupBy(createIterable([1, 2]), it => it ** 2)), [['1', [1]], ['4', [2]]]);
  assert.deepEqual(entries(groupBy('qwe', it => it)), [['q', ['q']], ['w', ['w']], ['e', ['e']]], 'iterable string');

  const element = {};
  groupBy([element], function (it, i) {
    assert.same(arguments.length, 2);
    assert.same(it, element);
    assert.same(i, 0);
  });

  const even = Symbol('even');
  const odd = Symbol('odd');
  const grouped = groupBy([1, 2, 3, 4, 5, 6], num => {
    if (num % 2 === 0) return even;
    return odd;
  });
  assert.deepEqual(grouped[even], [2, 4, 6]);
  assert.deepEqual(grouped[odd], [1, 3, 5]);
});
