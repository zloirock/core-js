import AsyncIterator from 'core-js-pure/full/async-iterator';

import { createIterator } from '../helpers/helpers';
import { STRICT_THIS } from '../helpers/constants';

QUnit.test('AsyncIterator#every', assert => {
  assert.expect(16);
  const async = assert.async();
  const { every } = AsyncIterator.prototype;

  assert.isFunction(every);
  assert.arity(every, 1);
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
  }).then(() => {
    return every.call(createIterator([1]), () => { throw 42; });
  }).catch(error => {
    assert.same(error, 42, 'rejection on a callback error');
  }).then(() => async());

  assert.throws(() => every.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => every.call(null, () => { /* empty */ }), TypeError);
  assert.throws(() => every.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => every.call([], () => { /* empty */ }), TypeError);
  assert.throws(() => every.call(createIterator([1]), undefined), TypeError);
  assert.throws(() => every.call(createIterator([1]), null), TypeError);
  assert.throws(() => every.call(createIterator([1]), {}), TypeError);
});
