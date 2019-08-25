import { createIterator } from '../helpers/helpers';

QUnit.test('AsyncIterator#reduce', assert => {
  assert.expect(10);
  const async = assert.async();
  const { reduce } = AsyncIterator.prototype;

  assert.isFunction(reduce);
  assert.arity(reduce, 1);
  assert.name(reduce, 'reduce');
  assert.looksNative(reduce);
  assert.nonEnumerable(AsyncIterator.prototype, 'reduce');

  reduce.call(createIterator([1, 2, 3]), (a, b) => a + b, 1).then(it => {
    assert.same(it, 7, 'basic functionality');
    async();
  });

  assert.throws(() => reduce.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => reduce.call(null, () => { /* empty */ }), TypeError);
  assert.throws(() => reduce.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => reduce.call([], () => { /* empty */ }), TypeError);
});
