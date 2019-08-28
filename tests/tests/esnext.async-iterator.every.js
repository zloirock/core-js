import { createIterator } from '../helpers/helpers';
import { STRICT_THIS } from '../helpers/constants';

QUnit.test('AsyncIterator#every', assert => {
  assert.expect(14);
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
    return every.call(createIterator([1]), function (arg) {
      assert.same(this, STRICT_THIS, 'this');
      assert.same(arguments.length, 1, 'arguments length');
      assert.same(arg, 1, 'argument');
    });
  }).then(() => async());

  assert.throws(() => every.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => every.call(null, () => { /* empty */ }), TypeError);
  assert.throws(() => every.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => every.call([], () => { /* empty */ }), TypeError);
});
