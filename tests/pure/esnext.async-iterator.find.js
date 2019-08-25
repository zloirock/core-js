import AsyncIterator from 'core-js-pure/features/async-iterator';

import { createIterator } from '../helpers/helpers';

QUnit.test('AsyncIterator#find', assert => {
  assert.expect(9);
  const async = assert.async();
  const { find } = AsyncIterator.prototype;

  assert.isFunction(find);
  assert.arity(find, 1);
  assert.nonEnumerable(AsyncIterator.prototype, 'find');

  find.call(createIterator([2, 3, 4]), it => it % 2).then(result => {
    assert.same(result, 3, 'basic functionality, +');
    return find.call(createIterator([1, 2, 3]), it => it === 4);
  }).then(result => {
    assert.same(result, undefined, 'basic functionality, -');
    async();
  });

  assert.throws(() => find.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => find.call(null, () => { /* empty */ }), TypeError);
  assert.throws(() => find.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => find.call([], () => { /* empty */ }), TypeError);
});
