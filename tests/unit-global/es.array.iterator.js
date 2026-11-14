import { GLOBAL } from '../helpers/constants.js';

const Symbol = GLOBAL.Symbol || {};

QUnit.test('Array#keys', assert => {
  const { keys } = Array.prototype;
  assert.isFunction(keys);
  assert.arity(keys, 0);
  assert.name(keys, 'keys');
  assert.looksNative(keys);
  assert.nonEnumerable(Array.prototype, 'keys');
  const iterator = ['q', 'w', 'e'].keys();
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.same(iterator[Symbol.toStringTag], 'Array Iterator');
  assert.same(String(iterator), '[object Array Iterator]');
  assert.deepEqual(iterator.next(), {
    value: 0,
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: 1,
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: 2,
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true,
  });
  /* still not fixed even in modern WebKit
  assert.deepEqual(keys.call({
    length: -1,
  }).next(), {
    value: undefined,
    done: true,
  }, 'uses ToLength');
  */
  assert.deepEqual(keys.call({ 0: 'q' }).next(), { value: undefined, done: true }, 'uses ToLength, missing length');
  assert.deepEqual(keys.call({ 0: 'q', length: NaN }).next(), { value: undefined, done: true }, 'uses ToLength, NaN length');
  assert.deepEqual(keys.call({ 0: 'q', length: 0.5 }).next(), { value: undefined, done: true }, 'uses ToLength, fractional length');
  assert.deepEqual(keys.call(1).next(), { value: undefined, done: true }, 'uses ToLength, primitive without length');
  assert.true('keys' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
});

QUnit.test('Array#values', assert => {
  const { values } = Array.prototype;
  assert.isFunction(values);
  assert.arity(values, 0);
  assert.name(values, 'values');
  assert.false(Object.hasOwn(Array.prototype, 'name'), 'Array prototype has no own name');
  assert.looksNative(values);
  assert.nonEnumerable(Array.prototype, 'values');
  const iterator = ['q', 'w', 'e'].values();
  assert.name(iterator.next, 'next');
  assert.looksNative(iterator.next);
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.same(iterator[Symbol.toStringTag], 'Array Iterator');
  assert.deepEqual(iterator.next(), {
    value: 'q',
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: 'w',
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: 'e',
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true,
  });
  /* still not fixed even in modern WebKit
  assert.deepEqual(values.call({
    length: -1,
  }).next(), {
    value: undefined,
    done: true,
  }, 'uses ToLength');
  */
  assert.deepEqual(values.call({ 0: 'q' }).next(), { value: undefined, done: true }, 'uses ToLength, missing length');
  assert.deepEqual(values.call({ 0: 'q', length: NaN }).next(), { value: undefined, done: true }, 'uses ToLength, NaN length');
  assert.deepEqual(values.call({ 0: 'q', length: 0.5 }).next(), { value: undefined, done: true }, 'uses ToLength, fractional length');
  assert.deepEqual(values.call(1).next(), { value: undefined, done: true }, 'uses ToLength, primitive without length');
  let conversions = 0;
  const throwing = values.call({ 0: 'q', 1: 'w', length: { valueOf() {
    if (conversions++ === 1) throw new RangeError('length');
    return 2;
  } } });
  assert.deepEqual(throwing.next(), { value: 'q', done: false }, 'before an abrupt length');
  assert.throws(() => throwing.next(), RangeError, 'abrupt length');
  assert.deepEqual(throwing.next(), { value: 'w', done: false }, 'an abrupt length does not advance the index');
  assert.true('values' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
});

QUnit.test('Array#entries', assert => {
  const { entries } = Array.prototype;
  assert.isFunction(entries);
  assert.arity(entries, 0);
  assert.name(entries, 'entries');
  assert.looksNative(entries);
  assert.nonEnumerable(Array.prototype, 'entries');
  const iterator = ['q', 'w', 'e'].entries();
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.same(iterator[Symbol.toStringTag], 'Array Iterator');
  assert.deepEqual(iterator.next(), {
    value: [0, 'q'],
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: [1, 'w'],
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: [2, 'e'],
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true,
  });
  /* still not fixed even in modern WebKit
  assert.deepEqual(entries.call({
    length: -1,
  }).next(), {
    value: undefined,
    done: true,
  }, 'uses ToLength');
  */
  assert.deepEqual(entries.call({ 0: 'q' }).next(), { value: undefined, done: true }, 'uses ToLength, missing length');
  assert.deepEqual(entries.call({ 0: 'q', length: NaN }).next(), { value: undefined, done: true }, 'uses ToLength, NaN length');
  assert.deepEqual(entries.call({ 0: 'q', length: 0.5 }).next(), { value: undefined, done: true }, 'uses ToLength, fractional length');
  assert.deepEqual(entries.call(1).next(), { value: undefined, done: true }, 'uses ToLength, primitive without length');
  assert.true('entries' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
});

QUnit.test('Array#@@iterator', assert => {
  assert.isIterable(Array.prototype);
  assert.arity(Array.prototype[Symbol.iterator], 0);
  assert.name(Array.prototype[Symbol.iterator], 'values');
  assert.looksNative(Array.prototype[Symbol.iterator]);
  assert.nonEnumerable(Array.prototype, Symbol.iterator);
  assert.same(Array.prototype[Symbol.iterator], Array.prototype.values);
  const iterator = ['q', 'w', 'e'][Symbol.iterator]();
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.same(iterator[Symbol.toStringTag], 'Array Iterator');
  assert.deepEqual(iterator.next(), {
    value: 'q',
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: 'w',
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: 'e',
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true,
  });
  /* still not fixed even in modern WebKit
  assert.deepEqual(Array.prototype[Symbol.iterator].call({
    length: -1,
  }).next(), {
    value: undefined,
    done: true,
  }, 'uses ToLength');
  */
  assert.deepEqual(Array.prototype[Symbol.iterator].call({ 0: 'q' }).next(), { value: undefined, done: true }, 'uses ToLength, missing length');
  assert.deepEqual(Array.prototype[Symbol.iterator].call({ 0: 'q', length: NaN }).next(), { value: undefined, done: true }, 'uses ToLength, NaN length');
  assert.deepEqual(Array.prototype[Symbol.iterator].call({ 0: 'q', length: 0.5 }).next(), { value: undefined, done: true }, 'uses ToLength, fractional length');
  assert.deepEqual(Array.prototype[Symbol.iterator].call(1).next(), { value: undefined, done: true }, 'uses ToLength, primitive without length');
});
