import AsyncIterator from 'core-js-pure/full/async-iterator';

import { createIterator } from '../helpers/helpers';
import { STRICT_THIS } from '../helpers/constants';

QUnit.test('AsyncIterator#forEach', assert => {
  assert.expect(15);
  const async = assert.async();
  const { forEach } = AsyncIterator.prototype;

  assert.isFunction(forEach);
  assert.arity(forEach, 1);
  assert.nonEnumerable(AsyncIterator.prototype, 'forEach');

  const array = [];

  forEach.call(createIterator([1, 2, 3]), it => array.push(it)).then(() => {
    assert.arrayEqual(array, [1, 2, 3], 'basic functionality');
    return forEach.call(createIterator([1]), function (arg) {
      assert.same(this, STRICT_THIS, 'this');
      assert.same(arguments.length, 1, 'arguments length');
      assert.same(arg, 1, 'argument');
    });
  }).then(() => {
    return forEach.call(createIterator([1]), () => { throw 42; });
  }).catch(error => {
    assert.same(error, 42, 'rejection on a callback error');
  }).then(() => async());

  assert.throws(() => forEach.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => forEach.call(null, () => { /* empty */ }), TypeError);
  assert.throws(() => forEach.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => forEach.call([], () => { /* empty */ }), TypeError);
  assert.throws(() => forEach.call(createIterator([1]), undefined), TypeError);
  assert.throws(() => forEach.call(createIterator([1]), null), TypeError);
  assert.throws(() => forEach.call(createIterator([1]), {}), TypeError);
});
