import { createIterator, createIterable } from '../helpers/helpers';

QUnit.test('AsyncIterator#flatMap', assert => {
  assert.expect(10);
  const async = assert.async();
  const { flatMap } = AsyncIterator.prototype;

  assert.isFunction(flatMap);
  assert.arity(flatMap, 1);
  assert.name(flatMap, 'flatMap');
  assert.looksNative(flatMap);
  assert.nonEnumerable(AsyncIterator.prototype, 'flatMap');

  flatMap.call(createIterator([1, [], 2, createIterable([3, 4]), [5, 6], 'ab']), it => typeof it == 'number' ? -it : it).toArray().then(it => {
    assert.arrayEqual(it, [-1, -2, 3, 4, 5, 6, 'ab'], 'basic functionality');
    async();
  });

  assert.throws(() => flatMap.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => flatMap.call(null, () => { /* empty */ }), TypeError);
  assert.throws(() => flatMap.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => flatMap.call([], () => { /* empty */ }), TypeError);
});
