import { createIterator, nativeSubclass } from '../helpers/helpers.js';

import Symbol from '@core-js/pure/es/symbol';
import Iterator from '@core-js/pure/es/iterator';

QUnit.test('Iterator', assert => {
  assert.isFunction(Iterator);
  assert.arity(Iterator, 0);

  assert.true(Iterator.from(createIterator([1, 2, 3])) instanceof Iterator, 'From Proxy');

  if (nativeSubclass) {
    const Sub = nativeSubclass(Iterator);
    assert.true(new Sub() instanceof Iterator, 'abstract constructor');
  }

  assert.throws(() => new Iterator(), 'direct constructor throws');
  // eslint-disable-next-line sonarjs/inconsistent-function-call -- required for testing
  assert.throws(() => Iterator(), 'throws w/o `new`');
});

QUnit.test('Iterator#constructor', assert => {
  assert.same(Iterator.prototype.constructor, Iterator, 'Iterator#constructor is Iterator');
});

QUnit.test('Iterator#@@toStringTag', assert => {
  assert.same(Iterator.prototype[Symbol.toStringTag], 'Iterator', 'Iterator::@@toStringTag is `Iterator`');
});
