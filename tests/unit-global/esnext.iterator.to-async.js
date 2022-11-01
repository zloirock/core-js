import { STRICT } from '../helpers/constants';

QUnit.test('Iterator#toAsync', assert => {
  assert.expect(STRICT ? 9 : 7);
  const async = assert.async();

  const { toAsync } = Iterator.prototype;

  assert.isFunction(toAsync);
  assert.arity(toAsync, 0);
  assert.name(toAsync, 'toAsync');
  assert.looksNative(toAsync);
  assert.nonEnumerable(Iterator.prototype, 'toAsync');

  if (STRICT) {
    assert.throws(() => toAsync.call(undefined), TypeError);
    assert.throws(() => toAsync.call(null), TypeError);
  }

  [1, 2, 3].values().toAsync().map(it => Promise.resolve(it)).toArray().then(it => {
    assert.arrayEqual(it, [1, 2, 3]);
    return new Set([1, 2, 3]).values().toAsync().map(el => Promise.resolve(el)).toArray();
  }).then(it => {
    assert.arrayEqual(it, [1, 2, 3]);
    async();
  });
});
