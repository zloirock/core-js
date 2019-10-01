import { createIterator } from '../helpers/helpers';

QUnit.test('Iterator#asIndexedPairs', assert => {
  const { asIndexedPairs } = Iterator.prototype;

  assert.isFunction(asIndexedPairs);
  assert.arity(asIndexedPairs, 0);
  assert.name(asIndexedPairs, 'asIndexedPairs');
  assert.looksNative(asIndexedPairs);
  assert.nonEnumerable(Iterator.prototype, 'asIndexedPairs');

  assert.arrayEqual(asIndexedPairs.call(createIterator(['a', 'b', 'c'])).toArray().toString(), '0,a,1,b,2,c', 'basic functionality');

  assert.throws(() => asIndexedPairs.call(undefined, TypeError));
  assert.throws(() => asIndexedPairs.call(null, TypeError));
  assert.throws(() => asIndexedPairs.call({}, TypeError));
  assert.throws(() => asIndexedPairs.call([], TypeError));
});
