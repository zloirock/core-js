import Iterator from 'core-js-pure/full/iterator';

import { createIterator } from '../helpers/helpers';
import { STRICT_THIS } from '../helpers/constants';

QUnit.test('Iterator#find', assert => {
  const { find } = Iterator.prototype;

  assert.isFunction(find);
  assert.arity(find, 1);
  assert.nonEnumerable(Iterator.prototype, 'find');

  assert.same(find.call(createIterator([1, 2, 3]), it => !(it % 2)), 2, 'basic functionality');
  find.call(createIterator([1]), function (arg) {
    assert.same(this, STRICT_THIS, 'this');
    assert.same(arguments.length, 1, 'arguments length');
    assert.same(arg, 1, 'argument');
  });

  assert.throws(() => find.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => find.call(null, () => { /* empty */ }), TypeError);
  assert.throws(() => find.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => find.call([], () => { /* empty */ }), TypeError);
  assert.throws(() => find.call(createIterator([1]), undefined), TypeError);
  assert.throws(() => find.call(createIterator([1]), null), TypeError);
  assert.throws(() => find.call(createIterator([1]), {}), TypeError);
});
