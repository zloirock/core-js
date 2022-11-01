import { createIterator } from '../helpers/helpers';

QUnit.test('AsyncIterator#indexed', assert => {
  assert.expect(10);
  const async = assert.async();
  const { indexed } = AsyncIterator.prototype;

  assert.isFunction(indexed);
  assert.arity(indexed, 0);
  assert.name(indexed, 'indexed');
  assert.looksNative(indexed);
  assert.nonEnumerable(AsyncIterator.prototype, 'indexed');

  indexed.call(createIterator(['a', 'b', 'c'])).toArray().then(it => {
    assert.same(it.toString(), '0,a,1,b,2,c', 'basic functionality');
    async();
  });

  assert.throws(() => indexed.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => indexed.call(null, () => { /* empty */ }), TypeError);
  assert.throws(() => indexed.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => indexed.call([], () => { /* empty */ }), TypeError);
});
