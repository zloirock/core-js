import { createIterator } from '../helpers/helpers';

QUnit.test('AsyncIterator#some', assert => {
  assert.expect(11);
  const async = assert.async();
  const { some } = AsyncIterator.prototype;

  assert.isFunction(some);
  assert.arity(some, 1);
  assert.name(some, 'some');
  assert.looksNative(some);
  assert.nonEnumerable(AsyncIterator.prototype, 'some');

  some.call(createIterator([1, 2, 3]), it => it === 2).then(result => {
    assert.ok(result, 'basic functionality, +');
    return some.call(createIterator([1, 2, 3]), it => it === 4);
  }).then(result => {
    assert.ok(!result, 'basic functionality, -');
    async();
  });

  assert.throws(() => some.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => some.call(null, () => { /* empty */ }), TypeError);
  assert.throws(() => some.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => some.call([], () => { /* empty */ }), TypeError);
});
