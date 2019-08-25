import { createIterator } from '../helpers/helpers';

QUnit.test('AsyncIterator#every', assert => {
  assert.expect(11);
  const async = assert.async();
  const { every } = AsyncIterator.prototype;

  assert.isFunction(every);
  assert.arity(every, 1);
  assert.name(every, 'every');
  assert.looksNative(every);
  assert.nonEnumerable(AsyncIterator.prototype, 'every');

  every.call(createIterator([1, 2, 3]), it => typeof it === 'number').then(result => {
    assert.ok(result, 'basic functionality, +');
    return every.call(createIterator([1, 2, 3]), it => it === 2);
  }).then(result => {
    assert.ok(!result, 'basic functionality, -');
    async();
  });

  assert.throws(() => every.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => every.call(null, () => { /* empty */ }), TypeError);
  assert.throws(() => every.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => every.call([], () => { /* empty */ }), TypeError);
});
