import AsyncIterator from 'core-js-pure/full/async-iterator';

import { createIterator } from '../helpers/helpers';

QUnit.test('AsyncIterator#asIndexedPairs', assert => {
  assert.expect(8);
  const async = assert.async();
  const { asIndexedPairs } = AsyncIterator.prototype;

  assert.isFunction(asIndexedPairs);
  assert.arity(asIndexedPairs, 0);
  assert.nonEnumerable(AsyncIterator.prototype, 'asIndexedPairs');

  asIndexedPairs.call(createIterator(['a', 'b', 'c'])).toArray().then(it => {
    assert.same(it.toString(), '0,a,1,b,2,c', 'basic functionality');
    async();
  });

  assert.throws(() => asIndexedPairs.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => asIndexedPairs.call(null, () => { /* empty */ }), TypeError);
  assert.throws(() => asIndexedPairs.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => asIndexedPairs.call([], () => { /* empty */ }), TypeError);
});
