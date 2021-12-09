import Promise from 'core-js-pure/es/promise';
import Set from 'core-js-pure/es/set';
import Iterator from 'core-js-pure/features/iterator';
import 'core-js-pure/features/async-iterator';

QUnit.test('Iterator#toAsync', assert => {
  assert.expect(6);
  const async = assert.async();

  const { toAsync } = Iterator.prototype;

  assert.isFunction(toAsync);
  assert.arity(toAsync, 0);

  assert.throws(() => toAsync.call(undefined), TypeError);
  assert.throws(() => toAsync.call(null), TypeError);

  Iterator.from([1, 2, 3]).toAsync().map(it => Promise.resolve(it)).toArray().then(it => {
    assert.arrayEqual(it, [1, 2, 3]);
  }).then(() => {
    return Iterator.from(new Set([1, 2, 3])).toAsync().map(it => Promise.resolve(it)).toArray();
  }).then(it => {
    assert.arrayEqual(it, [1, 2, 3]);
    async();
  });
});
