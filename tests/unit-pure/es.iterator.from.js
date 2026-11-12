import { DESCRIPTORS } from '../helpers/constants.js';
import { createIterable, createIterator } from '../helpers/helpers.js';

import Iterator from 'core-js-pure/es/iterator';
import Symbol from 'core-js-pure/es/symbol';
import assign from 'core-js-pure/es/object/assign';
import defineProperty from 'core-js-pure/es/object/define-property';
import getOwnPropertyDescriptor from 'core-js-pure/es/object/get-own-property-descriptor';

QUnit.test('Iterator.from', assert => {
  const { from } = Iterator;

  assert.isFunction(from);
  assert.arity(from, 1);
  assert.name(from, 'from');

  assert.true(Iterator.from(createIterator([1, 2, 3])) instanceof Iterator, 'proxy, iterator');

  assert.true(Iterator.from(createIterable([1, 2, 3])) instanceof Iterator, 'proxy, iterable');

  assert.arrayEqual(Iterator.from(createIterable([1, 2, 3])).toArray(), [1, 2, 3], 'just a proxy');

  assert.throws(() => from(undefined), TypeError);
  assert.throws(() => from(null), TypeError);
  assert.throws(() => from({}).next(), TypeError);
  assert.throws(() => from(assign(new Iterator(), { next: 42 })).next(), TypeError);

  // Should not throw when an underlying iterator's `return` method is null
  // https://bugs.webkit.org/show_bug.cgi?id=288714
  const iterator = createIterator([], { return: null });
  const result = from(iterator).return('ignored');
  assert.true(result.done, 'iterator with null return #1');
  assert.strictEqual(result.value, undefined, 'iterator with null return #2');

  // Should not create observable `String` wrapper objects
  // https://github.com/tc39/test262/blob/main/test/built-ins/Iterator/from/iterable-primitives.js
  const descriptor = getOwnPropertyDescriptor(String.prototype, Symbol.iterator);
  if (DESCRIPTORS && descriptor) {
    let observedType;
    defineProperty(String.prototype, Symbol.iterator, {
      configurable: true,
      get() {
        observedType = typeof this;
        return descriptor.value;
      },
    });
    from('');
    assert.same(observedType, 'string', 'string primitive receiver');
    from(Object(''));
    assert.same(observedType, 'object', 'String object receiver');
    defineProperty(String.prototype, Symbol.iterator, descriptor);
  }
});
