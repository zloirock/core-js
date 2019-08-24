import Iterator from 'core-js-pure/features/iterator';

import { createIterator } from '../helpers/helpers';

QUnit.test('Iterator#some', assert => {
  const { some } = Iterator.prototype;

  assert.isFunction(some);
  assert.arity(some, 1);
  assert.nonEnumerable(Iterator.prototype, 'some');

  assert.ok(some.call(createIterator([1, 2, 3]), it => it % 2), 'basic functionality #1');
  assert.ok(!some.call(createIterator([1, 2, 3]), it => typeof it == 'string'), 'basic functionality #2');

  assert.throws(() => some.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => some.call(null, () => { /* empty */ }), TypeError);
  assert.throws(() => some.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => some.call([], () => { /* empty */ }), TypeError);
});
