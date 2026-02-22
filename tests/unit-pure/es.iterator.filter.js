import { createIterator } from '../helpers/helpers.js';
import { STRICT, STRICT_THIS } from '../helpers/constants.js';

import Iterator from 'core-js-pure/es/iterator';
import from from 'core-js-pure/es/array/from';

QUnit.test('Iterator#filter', assert => {
  const { filter } = Iterator.prototype;

  assert.isFunction(filter);
  assert.arity(filter, 1);
  assert.nonEnumerable(Iterator.prototype, 'filter');

  assert.arrayEqual(filter.call(createIterator([1, 2, 3]), it => it % 2).toArray(), [1, 3], 'basic functionality');

  from(filter.call(createIterator([1]), function (arg, counter) {
    assert.same(this, STRICT_THIS, 'this');
    assert.same(arguments.length, 2, 'arguments length');
    assert.same(arg, 1, 'argument');
    assert.same(counter, 0, 'counter');
  }));

  if (STRICT) {
    assert.throws(() => filter.call(undefined, () => { /* empty */ }), TypeError);
    assert.throws(() => filter.call(null, () => { /* empty */ }), TypeError);
  }

  assert.throws(() => filter.call({}, () => { /* empty */ }).next(), TypeError);
  assert.throws(() => filter.call([], () => { /* empty */ }).next(), TypeError);
  assert.throws(() => filter.call(createIterator([1]), undefined), TypeError);
  assert.throws(() => filter.call(createIterator([1]), null), TypeError);
  const it = createIterator([1], { return() { this.closed = true; } });
  assert.throws(() => filter.call(it, {}), TypeError);
  assert.true(it.closed, 'filter closes iterator on validation error');
  // https://issues.chromium.org/issues/336839115
  assert.throws(() => filter.call({ next: null }, () => { /* empty */ }).next(), TypeError);
});
