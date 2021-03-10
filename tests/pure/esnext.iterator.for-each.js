import Iterator from 'core-js-pure/full/iterator';

import { createIterator } from '../helpers/helpers';
import { STRICT_THIS } from '../helpers/constants';

QUnit.test('Iterator#forEach', assert => {
  const { forEach } = Iterator.prototype;

  assert.isFunction(forEach);
  assert.arity(forEach, 1);
  assert.nonEnumerable(Iterator.prototype, 'forEach');

  const array = [];

  forEach.call(createIterator([1, 2, 3]), it => array.push(it));

  assert.arrayEqual(array, [1, 2, 3], 'basic functionality');

  forEach.call(createIterator([1]), function (arg) {
    assert.same(this, STRICT_THIS, 'this');
    assert.same(arguments.length, 1, 'arguments length');
    assert.same(arg, 1, 'argument');
  });

  assert.throws(() => forEach.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => forEach.call(null, () => { /* empty */ }), TypeError);
  assert.throws(() => forEach.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => forEach.call([], () => { /* empty */ }), TypeError);
  assert.throws(() => forEach.call(createIterator([1]), undefined), TypeError);
  assert.throws(() => forEach.call(createIterator([1]), null), TypeError);
  assert.throws(() => forEach.call(createIterator([1]), {}), TypeError);
});
