import Symbol from 'core-js-pure/es/symbol';
import getIterator from 'core-js-pure/es/get-iterator';
import { keys, values, entries } from 'core-js-pure/es/array';

QUnit.test('Array#@@iterator', assert => {
  assert.isFunction(values);
  const iterator = getIterator(['q', 'w', 'e']);
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.same(iterator[Symbol.toStringTag], 'Array Iterator');
  assert.same(String(iterator), '[object Array Iterator]');
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
});

QUnit.test('Array#keys', assert => {
  assert.isFunction(keys);
  const iterator = keys(['q', 'w', 'e']);
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.same(iterator[Symbol.toStringTag], 'Array Iterator');
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
  assert.deepEqual(keys({ 0: 'q' }).next(), { value: undefined, done: true }, 'uses ToLength, missing length');
  assert.deepEqual(keys({ 0: 'q', length: NaN }).next(), { value: undefined, done: true }, 'uses ToLength, NaN length');
  assert.deepEqual(keys({ 0: 'q', length: 0.5 }).next(), { value: undefined, done: true }, 'uses ToLength, fractional length');
  assert.deepEqual(keys(1).next(), { value: undefined, done: true }, 'uses ToLength, primitive without length');
});

QUnit.test('Array#values', assert => {
  assert.isFunction(values);
  assert.false(Object.prototype.hasOwnProperty.call(Array.prototype, 'name'), 'Array prototype has no own name');
  const iterator = values(['q', 'w', 'e']);
  assert.name(iterator.next, 'next');
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
  assert.deepEqual(values({ 0: 'q' }).next(), { value: undefined, done: true }, 'uses ToLength, missing length');
  assert.deepEqual(values({ 0: 'q', length: NaN }).next(), { value: undefined, done: true }, 'uses ToLength, NaN length');
  assert.deepEqual(values({ 0: 'q', length: 0.5 }).next(), { value: undefined, done: true }, 'uses ToLength, fractional length');
  assert.deepEqual(values(1).next(), { value: undefined, done: true }, 'uses ToLength, primitive without length');
  let conversions = 0;
  const throwing = values({ 0: 'q', 1: 'w', length: { valueOf() {
    if (conversions++ === 1) throw new RangeError('length');
    return 2;
  } } });
  assert.deepEqual(throwing.next(), { value: 'q', done: false }, 'before an abrupt length');
  assert.throws(() => throwing.next(), RangeError, 'abrupt length');
  assert.deepEqual(throwing.next(), { value: 'w', done: false }, 'an abrupt length does not advance the index');
});

QUnit.test('Array#entries', assert => {
  assert.isFunction(entries);
  const iterator = entries(['q', 'w', 'e']);
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
  assert.deepEqual(entries({ 0: 'q' }).next(), { value: undefined, done: true }, 'uses ToLength, missing length');
  assert.deepEqual(entries({ 0: 'q', length: NaN }).next(), { value: undefined, done: true }, 'uses ToLength, NaN length');
  assert.deepEqual(entries({ 0: 'q', length: 0.5 }).next(), { value: undefined, done: true }, 'uses ToLength, fractional length');
  assert.deepEqual(entries(1).next(), { value: undefined, done: true }, 'uses ToLength, primitive without length');
});
