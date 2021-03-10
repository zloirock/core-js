import Iterator from 'core-js-pure/full/iterator';

import { createIterator } from '../helpers/helpers';
import { STRICT_THIS } from '../helpers/constants';

QUnit.test('Iterator#every', assert => {
  const { every } = Iterator.prototype;

  assert.isFunction(every);
  assert.arity(every, 1);
  assert.nonEnumerable(Iterator.prototype, 'every');

  assert.ok(every.call(createIterator([1, 2, 3]), it => typeof it == 'number'), 'basic functionality #1');
  assert.ok(!every.call(createIterator([1, 2, 3]), it => it % 2), 'basic functionality #2');
  every.call(createIterator([1]), function (arg) {
    assert.same(this, STRICT_THIS, 'this');
    assert.same(arguments.length, 1, 'arguments length');
    assert.same(arg, 1, 'argument');
  });

  assert.throws(() => every.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => every.call(null, () => { /* empty */ }), TypeError);
  assert.throws(() => every.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => every.call([], () => { /* empty */ }), TypeError);
  assert.throws(() => every.call(createIterator([1]), undefined), TypeError);
  assert.throws(() => every.call(createIterator([1]), null), TypeError);
  assert.throws(() => every.call(createIterator([1]), {}), TypeError);
});
