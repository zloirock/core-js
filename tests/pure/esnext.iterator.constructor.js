import Iterator from 'core-js-pure/full/iterator';
import Symbol from 'core-js-pure/full/symbol';

import { createIterator } from '../helpers/helpers';

QUnit.test('Iterator', assert => {
  assert.isFunction(Iterator);
  assert.arity(Iterator, 0);

  assert.ok(Iterator.from(createIterator([1, 2, 3])) instanceof Iterator, 'From Proxy');

  assert.ok(new Iterator() instanceof Iterator, 'constructor');
  assert.throws(() => Iterator(), 'throws w/o `new`');
});

QUnit.test('Iterator#constructor', assert => {
  assert.strictEqual(Iterator.prototype.constructor, Iterator, 'Iterator#constructor is Iterator');
});

QUnit.test('Iterator#@@toStringTag', assert => {
  assert.strictEqual(Iterator.prototype[Symbol.toStringTag], 'Iterator', 'Iterator::@@toStringTag is `Iterator`');
});
