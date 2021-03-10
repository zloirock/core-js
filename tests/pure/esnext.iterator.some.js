import Iterator from 'core-js-pure/full/iterator';

import { createIterator } from '../helpers/helpers';
import { STRICT_THIS } from '../helpers/constants';

QUnit.test('Iterator#some', assert => {
  const { some } = Iterator.prototype;

  assert.isFunction(some);
  assert.arity(some, 1);
  assert.nonEnumerable(Iterator.prototype, 'some');

  assert.ok(some.call(createIterator([1, 2, 3]), it => it % 2), 'basic functionality #1');
  assert.ok(!some.call(createIterator([1, 2, 3]), it => typeof it == 'string'), 'basic functionality #2');
  some.call(createIterator([1]), function (arg) {
    assert.same(this, STRICT_THIS, 'this');
    assert.same(arguments.length, 1, 'arguments length');
    assert.same(arg, 1, 'argument');
  });

  assert.throws(() => some.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => some.call(null, () => { /* empty */ }), TypeError);
  assert.throws(() => some.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => some.call([], () => { /* empty */ }), TypeError);
  assert.throws(() => some.call(createIterator([1]), undefined), TypeError);
  assert.throws(() => some.call(createIterator([1]), null), TypeError);
  assert.throws(() => some.call(createIterator([1]), {}), TypeError);
});
