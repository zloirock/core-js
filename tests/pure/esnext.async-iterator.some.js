import AsyncIterator from 'core-js-pure/full/async-iterator';

import { createIterator } from '../helpers/helpers';
import { STRICT_THIS } from '../helpers/constants';

QUnit.test('AsyncIterator#some', assert => {
  assert.expect(16);
  const async = assert.async();
  const { some } = AsyncIterator.prototype;

  assert.isFunction(some);
  assert.arity(some, 1);
  assert.nonEnumerable(AsyncIterator.prototype, 'some');

  some.call(createIterator([1, 2, 3]), it => it === 2).then(result => {
    assert.ok(result, 'basic functionality, +');
    return some.call(createIterator([1, 2, 3]), it => it === 4);
  }).then(result => {
    assert.ok(!result, 'basic functionality, -');
    return some.call(createIterator([1]), function (arg) {
      assert.same(this, STRICT_THIS, 'this');
      assert.same(arguments.length, 1, 'arguments length');
      assert.same(arg, 1, 'argument');
    });
  }).then(() => {
    return some.call(createIterator([1]), () => { throw 42; });
  }).catch(error => {
    assert.same(error, 42, 'rejection on a callback error');
  }).then(() => async());

  assert.throws(() => some.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => some.call(null, () => { /* empty */ }), TypeError);
  assert.throws(() => some.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => some.call([], () => { /* empty */ }), TypeError);
  assert.throws(() => some.call(createIterator([1]), undefined), TypeError);
  assert.throws(() => some.call(createIterator([1]), null), TypeError);
  assert.throws(() => some.call(createIterator([1]), {}), TypeError);
});
