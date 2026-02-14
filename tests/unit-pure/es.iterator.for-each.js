import { createIterator } from '../helpers/helpers.js';
import { STRICT, STRICT_THIS } from '../helpers/constants.js';

import Iterator from 'core-js-pure/es/iterator';

QUnit.test('Iterator#forEach', assert => {
  const { forEach } = Iterator.prototype;

  assert.isFunction(forEach);
  assert.arity(forEach, 1);
  assert.nonEnumerable(Iterator.prototype, 'forEach');

  const array = [];

  forEach.call(createIterator([1, 2, 3]), it => array.push(it));

  assert.arrayEqual(array, [1, 2, 3], 'basic functionality');

  forEach.call(createIterator([1]), function (arg, counter) {
    assert.same(this, STRICT_THIS, 'this');
    assert.same(arguments.length, 2, 'arguments length');
    assert.same(arg, 1, 'argument');
    assert.same(counter, 0, 'counter');
  });

  if (STRICT) {
    assert.throws(() => forEach.call(undefined, () => { /* empty */ }), TypeError);
    assert.throws(() => forEach.call(null, () => { /* empty */ }), TypeError);
  }

  assert.throws(() => forEach.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => forEach.call([], () => { /* empty */ }), TypeError);
  assert.throws(() => forEach.call(createIterator([1]), undefined), TypeError);
  assert.throws(() => forEach.call(createIterator([1]), null), TypeError);
  const it = createIterator([1], { return() { this.closed = true; } });
  assert.throws(() => forEach.call(it, {}), TypeError);
  assert.true(it.closed, "forEach closes iterator on validation error");
});
