import { createIterable } from '../helpers/helpers';

import Set from 'core-js-pure/features/set';
import from from 'core-js-pure/features/array/from';

QUnit.test('Set#except', assert => {
  const { except } = Set.prototype;

  assert.isFunction(except);
  assert.arity(except, 1);
  if ('name' in except) assert.name(except, 'except');
  assert.nonEnumerable(Set.prototype, 'except');

  const set = new Set([1]);
  assert.ok(set.except([2]) !== set);

  assert.deepEqual(from(new Set([1, 2, 3]).except([4, 5])), [1, 2, 3]);
  assert.deepEqual(from(new Set([1, 2, 3]).except([3, 4])), [1, 2]);
  assert.deepEqual(from(new Set([1, 2, 3]).except(createIterable([3, 4]))), [1, 2]);

  assert.throws(() => new Set([1, 2, 3]).except(), TypeError);

  assert.throws(() => except.call({}, [1, 2, 3]), TypeError);
  assert.throws(() => except.call(undefined, [1, 2, 3]), TypeError);
  assert.throws(() => except.call(null, [1, 2, 3]), TypeError);
});
