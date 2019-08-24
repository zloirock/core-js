import { createIterator } from '../helpers/helpers';

QUnit.test('AsyncIterator#drop', assert => {
  assert.expect(10);
  const async = assert.async();
  const { drop } = AsyncIterator.prototype;

  assert.isFunction(drop);
  assert.arity(drop, 1);
  assert.name(drop, 'drop');
  assert.looksNative(drop);
  assert.nonEnumerable(AsyncIterator.prototype, 'drop');

  drop.call(createIterator([1, 2, 3]), 1).toArray().then(it => {
    assert.arrayEqual(it, [2, 3], 'basic functionality');
    async();
  });

  assert.throws(() => drop.call(undefined, 1), TypeError);
  assert.throws(() => drop.call(null, 1), TypeError);
  assert.throws(() => drop.call({}, 1), TypeError);
  assert.throws(() => drop.call([], 1), TypeError);
});
