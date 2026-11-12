import { DESCRIPTORS, GLOBAL } from '../helpers/constants.js';
import { createIterable, createIterator } from '../helpers/helpers.js';

const { assign } = Object;

const FIREFOX_VERSION = +(/Firefox\/(\d+)/.exec(GLOBAL.navigator?.userAgent)?.[1] || 0);
// Firefox 45- passes a wrapper as `this` to accessors of the prototypes of primitives; fixed in Firefox 46.
// https://bugzilla.mozilla.org/show_bug.cgi?id=603201
const BOXED_ACCESSOR_RECEIVER = FIREFOX_VERSION > 0 && FIREFOX_VERSION < 46;

QUnit.test('Iterator.from', assert => {
  const { from } = Iterator;

  assert.isFunction(from);
  assert.arity(from, 1);
  assert.name(from, 'from');
  assert.looksNative(from);
  assert.nonEnumerable(Iterator, 'from');

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
  const descriptor = Object.getOwnPropertyDescriptor(String.prototype, Symbol.iterator);
  if (DESCRIPTORS && descriptor) {
    let observedType;
    // eslint-disable-next-line no-extend-native -- required for testing
    Object.defineProperty(String.prototype, Symbol.iterator, {
      configurable: true,
      get() {
        observedType = typeof this;
        return descriptor.value;
      },
    });
    from('');
    if (!BOXED_ACCESSOR_RECEIVER) assert.same(observedType, 'string', 'string primitive receiver');
    from(Object(''));
    assert.same(observedType, 'object', 'String object receiver');
    // eslint-disable-next-line no-extend-native -- required for testing
    Object.defineProperty(String.prototype, Symbol.iterator, descriptor);
  }
});
