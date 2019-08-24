import Iterator from 'core-js-pure/features/iterator';

import { createIterator } from '../helpers/helpers';

QUnit.test('Iterator#every', assert => {
  const { every } = Iterator.prototype;

  assert.isFunction(every);
  assert.arity(every, 1);
  assert.nonEnumerable(Iterator.prototype, 'every');

  assert.ok(every.call(createIterator([1, 2, 3]), it => typeof it == 'number'), 'basic functionality #1');
  assert.ok(!every.call(createIterator([1, 2, 3]), it => it % 2), 'basic functionality #2');

  assert.throws(() => every.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => every.call(null, () => { /* empty */ }), TypeError);
  assert.throws(() => every.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => every.call([], () => { /* empty */ }), TypeError);
});
