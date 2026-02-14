import { createIterator } from '../helpers/helpers.js';
import { STRICT, STRICT_THIS } from '../helpers/constants.js';

import Iterator from 'core-js-pure/es/iterator';

QUnit.test('Iterator#every', assert => {
  const { every } = Iterator.prototype;

  assert.isFunction(every);
  assert.arity(every, 1);
  assert.nonEnumerable(Iterator.prototype, 'every');

  assert.true(every.call(createIterator([1, 2, 3]), it => typeof it == 'number'), 'basic functionality #1');
  assert.false(every.call(createIterator([1, 2, 3]), it => it % 2), 'basic functionality #2');
  every.call(createIterator([1]), function (arg, counter) {
    assert.same(this, STRICT_THIS, 'this');
    assert.same(arguments.length, 2, 'arguments length');
    assert.same(arg, 1, 'argument');
    assert.same(counter, 0, 'counter');
  });

  if (STRICT) {
    assert.throws(() => every.call(undefined, () => { /* empty */ }), TypeError);
    assert.throws(() => every.call(null, () => { /* empty */ }), TypeError);
  }

  assert.throws(() => every.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => every.call([], () => { /* empty */ }), TypeError);
  assert.throws(() => every.call(createIterator([1]), undefined), TypeError);
  assert.throws(() => every.call(createIterator([1]), null), TypeError);
  const it = createIterator([1], { return() { this.closed = true; } });
  assert.throws(() => every.call(it, {}), TypeError);
  assert.true(it.closed, "every closes iterator on validation error");
});
